import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, HotelsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
