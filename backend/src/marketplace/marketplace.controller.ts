import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ListItemDto } from './dto/list-item.dto';
import { BuyItemDto } from './dto/buy-item.dto';
import { CancelListingDto } from './dto/cancel-listing.dto';
import { GetListingsDto } from './dto/get-listings.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('list')
  @UseGuards(JwtAuthGuard)
  async listItem(@GetUser('sub') userId: string, @Body() dto: ListItemDto) {
    return this.marketplaceService.listItem(userId, dto);
  }

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  async buyItem(@GetUser('sub') userId: string, @Body() dto: BuyItemDto) {
    return this.marketplaceService.buyItem(userId, dto);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelListing(@GetUser('sub') userId: string, @Body() dto: CancelListingDto) {
    return this.marketplaceService.cancelListing(userId, dto);
  }

  @Get('listings')
  async getListings(@Query() dto: GetListingsDto) {
    return this.marketplaceService.getListings(dto);
  }
}
