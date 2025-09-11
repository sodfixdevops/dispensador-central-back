import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaccionService } from './transaccion.service';
import { TransaccionController } from './transaccion.controller';
import { Dptrn } from './dptrn.entity';
import { Dptrd } from './dptrd.entity';
import { Dpsrl } from 'src/serial/dpsrl.entity';
import { DpsrlService } from 'src/serial/dpsrl.service';
import { Dpaut } from 'src/autorizacion/dpaut.entity';
import { DesembolsoService } from 'src/desembolso/desembolso.service';
import { Dpdes } from 'src/desembolso/desembolso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dptrn, Dptrd, Dpsrl, Dpaut, Dpdes])],
  controllers: [TransaccionController],
  providers: [TransaccionService, DpsrlService, DesembolsoService],
})
export class TransaccionModule {}
