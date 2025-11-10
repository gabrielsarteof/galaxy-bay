import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

@ApiTags('activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar nova atividade' })
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Listar atividades recentes da plataforma' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findRecent(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.activityService.findRecent(limit);
  }

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Listar atividades de uma página' })
  @ApiQuery({ name: 'type', required: false, enum: ['mint', 'list', 'sale', 'transfer', 'offer', 'cancel'] })
  @ApiQuery({ name: 'nftId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findByPage(
    @Param('pageId') pageId: string,
    @Query('type') type?: ActivityType,
    @Query('nftId') nftId?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.activityService.findByPage(pageId, {
      type,
      nftId,
      limit,
      offset,
    });
  }

  @Get('nft/:nftId')
  @ApiOperation({ summary: 'Listar atividades de uma NFT' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findByNft(
    @Param('nftId') nftId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.activityService.findByNft(nftId, limit, offset);
  }
}
