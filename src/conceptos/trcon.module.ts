import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrconService } from './trcon.service';
import { TrconController } from './trcon.controller';
import { TrconEntity } from './trcon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrconEntity])],
  controllers: [TrconController],
  providers: [TrconService],
  exports: [TrconService],
})
export class TrconModule {}
