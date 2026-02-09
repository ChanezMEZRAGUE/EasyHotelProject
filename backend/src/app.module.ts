import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { AuthModule } from './modules/auth/auth.module';
import { SearchModule } from './modules/search/search.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [PrismaModule, HotelsModule, AuthModule, SearchModule, ReservationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
