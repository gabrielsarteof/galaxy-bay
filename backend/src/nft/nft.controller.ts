import { Controller, Post, Body, UseGuards, Request, Get, Param, Query, Put, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { NftService }                                from './nft.service';
import { JwtAuthGuard }                              from '../auth/jwt-auth.guard';
import { CreateMetadataDto }                         from './dto/create-metadata.dto';
import { RegisterNftDto }                            from './dto/register-nft.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NftStatus } from '@prisma/client';

@ApiTags('nfts')                          
@ApiBearerAuth('access-token')            
@Controller('nfts')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-metadata')
  @ApiOperation({ summary: 'Gerar metadata e armazenar no IPFS' })
  @ApiBody({ type: CreateMetadataDto })
  @ApiResponse({
    status: 201,
    description: 'Metadata gerado com sucesso.',
    schema: {
      example: { metadataUrl: 'https://ipfs.io/ipfs/abc123def456/metadata.json' },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async generateMetadata(
    @Body() dto: CreateMetadataDto,
  ): Promise<{ metadataUrl: string }> {
    const metadataUrl = await this.nftService.generateMetadata(dto);
    return { metadataUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  @ApiOperation({ summary: 'Registrar NFT na blockchain' })
  @ApiBody({ type: RegisterNftDto })
  @ApiResponse({ status: 201, description: 'NFT registrada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async registerNft(
    @Body() dto: RegisterNftDto,
    @Request() req: any,
  ) {
    const ownerId = req.user.userId;
    return this.nftService.register(dto, ownerId);
  }

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Buscar NFTs de uma página com filtros' })
  @ApiQuery({ name: 'status', required: false, enum: ['minted', 'listed', 'sold', 'transferred'] })
  @ApiQuery({ name: 'collectionId', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getPageNFTs(
    @Param('pageId') pageId: string,
    @Query('status') status?: NftStatus,
    @Query('collectionId') collectionId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.nftService.findByPage(pageId, {
      status,
      collectionId,
      sortBy,
      limit,
      offset,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar NFT por ID' })
  async getNFTById(@Param('id') id: string) {
    return this.nftService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar NFT (preço, status)' })
  async updateNFT(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: { price?: number; status?: NftStatus },
  ) {
    return this.nftService.update(id, req.user.userId, updateDto);
  }
}
