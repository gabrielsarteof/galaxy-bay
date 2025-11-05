import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { userId: string };
}

@ApiTags('collections')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('page/:pageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova coleção em uma página' })
  create(
    @Param('pageId') pageId: string,
    @Req() req: RequestWithUser,
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.collectionService.create(pageId, req.user.userId, createCollectionDto);
  }

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Listar coleções de uma página' })
  findAllByPage(@Param('pageId') pageId: string) {
    return this.collectionService.findAllByPage(pageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar coleção por ID' })
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estatísticas da coleção' })
  getStats(@Param('id') id: string) {
    return this.collectionService.getStats(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar coleção' })
  update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionService.update(id, req.user.userId, updateCollectionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar coleção (apenas se vazia)' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.collectionService.remove(id, req.user.userId);
  }
}
