// src/transaccion/transaccion.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import {
  FiltroTransaccion,
  RegistrarTransaccionDto,
} from './transaccion.interface';
import { Dptrn } from './dptrn.entity';

@Controller('transaccion')
export class TransaccionController {
  constructor(private readonly service: TransaccionService) {}

  @Post('registrar')
  registrar(@Body() dto: RegistrarTransaccionDto) {
    return this.service.registrarTransaccion(dto);
  }

  @Get('transacciones')
  async listar(): Promise<Dptrn[]> {
    return this.service.listarTransaccionesActivas();
  }

  @Post('solicitar-desembolso')
  solicitar(
    @Body('usuario') usuario: string,
    @Body('dispositivo') dispositivo: number,
  ) {
    return this.service.solicitudDesembolso(usuario, dispositivo);
  }

  @Post('autorizar-o-rechazar')
  async actualizarAutorizacion(
    @Body('numeroDesembolso') numeroDesembolso: number,
    @Body('usuario') usuario: string,
    @Body('estado') estado: number,
  ) {
    return this.service.actualizarEstadoAutorizacion(
      numeroDesembolso,
      usuario,
      estado,
    );
  }

  @Post('recolectar')
  async realizarRecoleccion(
    @Body('numeroDesembolso') numeroDesembolso: number,
  ) {
    return this.service.realizarRecoleccion(numeroDesembolso);
  }

  @Get('estado/:stat')
  async listarPorEstado(@Param('stat') stat: number) {
    return this.service.listarPorEstado(stat);
  }

  @Post('reporte-transacciones')
  async reporteTransacciones(@Body() filtros: FiltroTransaccion) {
    const { fechaInicio, fechaFinal, estado } = filtros;
    return this.service.listarPorFiltros(
      new Date(fechaInicio),
      new Date(fechaFinal),
      estado,
    );
  }
}
