import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PageController } from './page.controller';
import { PageService }    from './page.service';
import { PrismaService }  from '@/../prisma/prisma.service';
import { multerConfig } from '../config/multer.config';
import { StorageModule } from '@/infrastructure/storage/storage.module';
import { PageImageInterceptor } from './interceptors/page-image.interceptor';

@Module({
  imports: [
    MulterModule.register(multerConfig),
    StorageModule,
  ],
  controllers: [PageController],
  providers:   [PageService, PrismaService, PageImageInterceptor],
})
export class PageModule {}
