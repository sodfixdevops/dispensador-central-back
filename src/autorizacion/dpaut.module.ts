import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dpaut } from './dpaut.entity';
import { DpautService } from './dpaut.service';
import { DpautController } from './dpaut.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dpaut])],
  providers: [DpautService],
  controllers: [DpautController],
  exports: [DpautService],
})
export class DpautModule {}
