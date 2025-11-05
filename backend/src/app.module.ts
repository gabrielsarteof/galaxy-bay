import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { NftModule } from './nft/nft.module';
import { PrismaModule } from '../prisma/prisma.module';
import { validationSchema } from './config/validation';
import { PageModule } from './pages/page.module';
import { CollectionModule } from './collections/collection.module';
import { ActivityModule } from './activities/activity.module';
import { BlockchainModule } from './utils/blockchain.module';
import { BlockchainIndexerModule } from './blockchain/blockchain-indexer.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: ['.env.development.local', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    NftModule,
    PageModule,
    UsersModule,
    CollectionModule,
    ActivityModule,
    BlockchainModule,
    BlockchainIndexerModule,
    MarketplaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
