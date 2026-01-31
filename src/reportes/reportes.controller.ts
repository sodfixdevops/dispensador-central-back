import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import {
  FiltroReporteTransacciones,
  ReporteTransaccionesResponseDto,
  ReporteDineroAcumuladoResponseDto,
} from './reportes.interface';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Genera reporte de transacciones para un usuario específico
   * POST /reportes/transacciones-por-usuario
   * Body: { usuario: string, fechaInicio: string, fechaFin: string }
   */
  @Post('transacciones-por-usuario')
  @ApiOperation({
    summary: 'Reporte de transacciones por usuario',
    description:
      'Genera un reporte de todas las transacciones de un usuario en un rango de fechas',
  })
  @ApiBody({ type: FiltroReporteTransacciones })
  async reporteTransaccionesPorUsuario(
    @Body() filtros: FiltroReporteTransacciones,
  ): Promise<ReporteTransaccionesResponseDto> {
    console.log(filtros);
    return await this.reportesService.generarReporteTransaccionesPorUsuario(
      filtros,
    );
  }

  /**
   * Genera reporte de transacciones global en un rango de fechas
   * GET /reportes/transacciones-global?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
   */
  @Get('transacciones-global')
  @ApiOperation({
    summary: 'Reporte de transacciones global',
    description:
      'Genera un reporte de todas las transacciones en un rango de fechas',
  })
  @ApiQuery({
    name: 'fechaInicio',
    example: '2026-01-01',
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaFin',
    example: '2026-01-31',
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  async reporteTransaccionesGlobal(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<ReporteTransaccionesResponseDto> {
    return await this.reportesService.generarReporteTransaccionesGlobal(
      fechaInicio,
      fechaFin,
    );
  }

  /**
   * Genera reporte de dinero acumulado por dispositivo
   * Filtra transacciones con estado = 1 (no recolectadas)
   * GET /reportes/dinero-acumulado
   */
  @Get('dinero-acumulado')
  @ApiOperation({
    summary: 'Reporte de dinero acumulado por dispositivo',
    description:
      'Muestra el dinero acumulado en cada dispositivo (transacciones no recolectadas)',
  })
  async reporteDineroAcumulado(): Promise<ReporteDineroAcumuladoResponseDto> {
    return await this.reportesService.generarReporteDineroAcumulado();
  }

  /**
   * Genera reporte de dinero acumulado por dispositivo (alternativa con POST)
   * POST /reportes/dinero-acumulado
   */
  @Post('dinero-acumulado')
  @ApiOperation({
    summary: 'Reporte de dinero acumulado por dispositivo (POST)',
    description:
      'Muestra el dinero acumulado en cada dispositivo (transacciones no recolectadas)',
  })
  async reporteDineroAcumuladoPost(): Promise<ReporteDineroAcumuladoResponseDto> {
    return await this.reportesService.generarReporteDineroAcumulado();
  }
}
