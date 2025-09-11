import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesembolsoService } from './desembolso.service';
import { DesembolsoController } from './desembolso.controller';
import { Dpdes } from './desembolso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dpdes])],
  providers: [DesembolsoService],
  controllers: [DesembolsoController],
  exports: [DesembolsoService], // Para que pueda usarse desde otros módulos
})
export class DesembolsoModule {}
