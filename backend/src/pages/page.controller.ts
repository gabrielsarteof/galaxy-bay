import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Put,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { PageResponseDto } from './dto/page-response.dto';
import { DiscoverQueryDto } from './dto/discover-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import type { Page as PageModel } from '@prisma/client';
import { UpdatePageDto } from './dto/update-page.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PageImageInterceptor } from './interceptors/page-image.interceptor';

@ApiTags('page')
@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  private toDto(page: PageModel): PageResponseDto {
    const {
      ownerId,
      tagline,
      description,
      avatarUrl,
      bannerUrl,
      category,
      ...rest
    } = page;

    return {
      ...rest,
      tagline: tagline ?? undefined,
      description: description ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
      category: category ?? undefined,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova página de criador' })
  @ApiResponse({
    status: 201,
    description: 'Página criada com sucesso.',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito: name ou slug já existe.',
  })
  async createPage(
    @Req() req: ExpressRequest & { user: { userId: string } },
    @Body() dto: CreatePageDto,
  ): Promise<PageResponseDto> {
    const page = await this.pageService.create(req.user.userId, dto);
    return this.toDto(page);
  }


  @Get('discover')
  @ApiOperation({ summary: 'Descobrir páginas publicadas com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de páginas descobertas' })
  async discover(@Query() query: DiscoverQueryDto) {
    return this.pageService.discover(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Obter páginas em destaque' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Páginas em destaque' })
  async trending(@Query('limit') limit?: string) {
    return this.pageService.getTrending(limit ? parseInt(limit, 10) : 5);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async categories() {
    return this.pageService.getCategories();
  }

  @UseGuards(JwtAuthGuard)
  // @UseInterceptors(PageImageInterceptor) // TEMPORARIAMENTE DESABILITADO
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter a única página do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Página retornada com sucesso.',
    type: PageResponseDto,
  })
  async getMyPage(
    @Req() req: ExpressRequest & { user: { userId: string } },
  ): Promise<PageResponseDto> {
    const page = await this.pageService.findOneByOwner(req.user.userId);
    return this.toDto(page);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes de uma página por ID' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da página.',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Página não encontrada.',
  })

  async findOneById(
    @Req() req: ExpressRequest & { user: { userId: string } },
    @Param('id') id: string,
  ): Promise<PageResponseDto> {
    const page = await this.pageService.findOneById(req.user.userId, id);
    return this.toDto(page);
  }

  // @UseInterceptors(PageImageInterceptor) // TEMPORARIAMENTE DESABILITADO
  @Get('by-slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter detalhes públicos de uma página por slug' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da página.',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Página não encontrada.',
  })
  async findOneBySlug(
    @Param('slug') slug: string,
  ): Promise<PageResponseDto> {
    const page = await this.pageService.findOneBySlug(slug);
    return this.toDto(page);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar página' })
  @ApiResponse({
    status: 200,
    description: 'Página atualizada com sucesso.',
    type: PageResponseDto,
  })
  async updatePage(
    @Req() req: ExpressRequest & { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ): Promise<PageResponseDto> {
    const page = await this.pageService.update(req.user.userId, id, dto);
    return this.toDto(page);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/upload-images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload de avatar e/ou banner da página' })
  @ApiResponse({
    status: 200,
    description: 'Imagens enviadas com sucesso.',
    type: PageResponseDto,
  })
  async uploadImages(
    @Req() req: ExpressRequest & { user: { userId: string } },
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ): Promise<PageResponseDto> {
    const page = await this.pageService.uploadImages(
      req.user.userId,
      id,
      files,
    );
    return this.toDto(page);
  }

  @Get('slug/:slug/stats')
  @ApiOperation({ summary: 'Obter estatísticas da página' })
  async getStats(@Param('slug') slug: string) {
    return this.pageService.getStats(slug);
  }

  @Get('slug/:slug/community')
  @ApiOperation({ summary: 'Obter estatísticas da comunidade' })
  async getCommunityStats(@Param('slug') slug: string) {
    return this.pageService.getCommunityStats(slug);
  }
}
