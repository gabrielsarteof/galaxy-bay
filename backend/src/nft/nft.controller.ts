import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  Put,
  ParseIntPipe,
  DefaultValuePipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { NftService }                                from './nft.service';
import { JwtAuthGuard }                              from '../auth/guards/jwt-auth.guard';
import { CreateMetadataDto }                         from './dto/create-metadata.dto';
import { RegisterNftDto }                            from './dto/register-nft.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiConsumes,
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

  /**
   * Endpoint para preparar NFT (upload completo para IPFS via Pinata)
   *
   * Autenticação: JWT obrigatório
   * Rate limit: 10 uploads por minuto por usuário
   * Validação: Arquivo max 50MB, apenas imagens (JPEG/PNG/WebP)
   *
   * Fluxo:
   * 1. Upload imagem → otimização (Sharp) → IPFS → imageCID
   * 2. Criar metadata OpenSea-compatible com imageCID
   * 3. Upload metadata → IPFS → metadataCID
   * 4. Retornar tokenURI = ipfs://{metadataCID}
   *
   * Rationale: Separar upload IPFS do mint on-chain permite retry
   * de uploads sem gastar gas e melhor controle de erros.
   */
  @Post('prepare-mint')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads/minuto
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Preparar NFT para mint (upload imagem + metadata para IPFS)',
    description: 'Faz upload da imagem e metadata para IPFS via Pinata. Retorna tokenURI para uso no mint on-chain.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image', 'name', 'description'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPEG/PNG/WebP, max 50MB)',
        },
        name: {
          type: 'string',
          description: 'Nome do NFT',
          example: 'Sunset at Galaxy Bay #42',
        },
        description: {
          type: 'string',
          description: 'Descrição do NFT',
          example: 'A stunning photograph captured at golden hour',
        },
        attributes: {
          type: 'string',
          description: 'Attributes JSON (array de traits OpenSea-compatible)',
          example: '[{"trait_type":"Artist","value":"0x123..."},{"trait_type":"Location","value":"Galaxy Bay"}]',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'NFT preparado com sucesso. Use tokenURI no mint on-chain.',
    schema: {
      example: {
        success: true,
        data: {
          imageCID: 'QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng',
          metadataCID: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          tokenURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          imageUrl: 'https://gateway.pinata.cloud/ipfs/QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng',
          metadataUrl: 'https://gateway.pinata.cloud/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        },
        message: 'NFT preparado com sucesso. Use tokenURI no mint on-chain.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou campos obrigatórios faltando' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 429, description: 'Rate limit excedido (10 uploads/minuto)' })
  @ApiResponse({ status: 503, description: 'Falha ao comunicar com IPFS após retries' })
  async prepareMint(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('attributes') attributesJson?: string,
  ) {
    if (!name || !description) {
      throw new BadRequestException('Campos "name" e "description" são obrigatórios');
    }

    let attributes = [];
    if (attributesJson) {
      try {
        attributes = JSON.parse(attributesJson);
        if (!Array.isArray(attributes)) {
          throw new Error('Attributes deve ser um array');
        }
      } catch {
        throw new BadRequestException(
          'Campo "attributes" deve ser JSON válido (array de traits)'
        );
      }
    }

    const result = await this.nftService.prepareNFTForMinting(
      file.buffer,
      name,
      description,
      attributes,
    );

    return {
      success: true,
      data: result,
      message: 'NFT preparado com sucesso. Use tokenURI no mint on-chain.',
    };
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

  @Get('featured')
  @ApiOperation({ summary: 'Buscar NFTs em destaque' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedNFTs(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit?: number,
  ) {
    return this.nftService.findFeatured(limit);
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
