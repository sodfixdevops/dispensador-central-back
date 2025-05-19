import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgenService } from './agen.service';
import { AgenController } from './agen.controller';
import { AgenEntity } from './agen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgenEntity])],
  controllers: [AgenController],
  providers: [AgenService],
  exports: [AgenService],
})
export class AgenModule {}
