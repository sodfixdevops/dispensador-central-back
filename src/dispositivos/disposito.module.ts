import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoEntity } from './dispositivo.entity';
import { DispositivosController } from './dispositivo.controller';
import { DispositivosService } from './dispositivo.service';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoEntity])],
  controllers: [DispositivosController],
  providers: [DispositivosService],
})
export class DispositivosModule {}
