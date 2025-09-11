import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GbconEntity } from './gbcon.entity';
import { GbconController } from './gbcon.controller';
import { GbconService } from './gbcon.service';

@Module({
  imports: [TypeOrmModule.forFeature([GbconEntity])],
  controllers: [GbconController],
  providers: [GbconService],
  exports: [GbconService],
})
export class GbconModule {}
