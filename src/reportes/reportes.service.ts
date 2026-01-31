import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  FiltroReporteTransacciones,
  TransaccionReporteDto,
  ReporteTransaccionesResponseDto,
  DineroAcumuladoDispositivoDto,
  ReporteDineroAcumuladoResponseDto,
} from './reportes.interface';

@Injectable()
export class ReportesService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Genera reporte de transacciones por usuario con rango de fechas
   * @param filtros - Usuario, fecha inicio y fin
   * @returns ReporteTransaccionesResponseDto con transacciones y estadísticas
   */
  async generarReporteTransaccionesPorUsuario(
    filtros: FiltroReporteTransacciones,
  ): Promise<ReporteTransaccionesResponseDto> {
    const { usuario, fechaInicio, fechaFin } = filtros;

    // Validación básica
    if (!usuario || !fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Se requieren los campos: usuario, fechaInicio, fechaFin',
      );
    }

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (fechaInicioDate > fechaFinDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha fin',
      );
    }

    try {
      // Query que trae transacciones con información del usuario
      const query = this.dataSource
        .createQueryBuilder()
        .select('dptrn.dptrnntra', 'dptrnntra')
        .addSelect('dptrn.dptrnftra', 'dptrnftra')
        .addSelect('dptrn.dptrnimpo', 'dptrnimpo')
        .addSelect('dptrn.dptrncmon', 'dptrncmon')
        .addSelect('dptrn.dptrnstat', 'dptrnstat')
        .addSelect('dptrn.dptrnusrn', 'dptrnusrn')
        .addSelect('adusr.adusrnick', 'adusrnick')
        .addSelect('dptrn.dptrndisp', 'dptrndisp')
        .addSelect('dptrn.dptrnmrcb', 'dptrnmrcb')
        .from('dptrn', 'dptrn')
        .innerJoin('aduser', 'adusr', 'dptrn.dptrnusrn = adusr.adusrusrn')
        .where('dptrn.dptrnusrn = :usuario', { usuario })
        .andWhere('dptrn.dptrnftra BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate,
        })
        .orderBy('dptrn.dptrnftra', 'DESC');

      const transacciones: TransaccionReporteDto[] = await query.getRawMany();

      // Calcular estadísticas
      const total = transacciones.length;
      const sumaMonto = transacciones.reduce((acc, t) => acc + t.dptrnimpo, 0);

      return {
        success: true,
        data: {
          transacciones,
          total,
          sumaMonto,
          filtros: {
            usuario,
            fechaInicio,
            fechaFin,
          },
        },
        message: `Se encontraron ${total} transacciones para el usuario ${usuario}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al generar reporte',
      };
    }
  }

  /**
   * Genera reporte de transacciones para todos los usuarios en un rango de fechas
   * @param fechaInicio - Fecha de inicio
   * @param fechaFin - Fecha de fin
   * @returns ReporteTransaccionesResponseDto con transacciones agrupadas
   */
  async generarReporteTransaccionesGlobal(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ReporteTransaccionesResponseDto> {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Se requieren los campos: fechaInicio, fechaFin',
      );
    }

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (fechaInicioDate > fechaFinDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha fin',
      );
    }

    try {
      const query = this.dataSource
        .createQueryBuilder()
        .select('dptrn.dptrnntra', 'dptrnntra')
        .addSelect('dptrn.dptrnftra', 'dptrnftra')
        .addSelect('dptrn.dptrnimpo', 'dptrnimpo')
        .addSelect('dptrn.dptrncmon', 'dptrncmon')
        .addSelect('dptrn.dptrnstat', 'dptrnstat')
        .addSelect('dptrn.dptrnusrn', 'dptrnusrn')
        .addSelect('adusr.adusrnick', 'adusrnick')
        .addSelect('dptrn.dptrndisp', 'dptrndisp')
        .addSelect('dptrn.dptrnmrcb', 'dptrnmrcb')
        .from('dptrn', 'dptrn')
        .innerJoin('aduser', 'adusr', 'dptrn.dptrnusrn = adusr.adusrusrn')
        .where('dptrn.dptrnftra BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate,
        })
        .orderBy('dptrn.dptrnftra', 'DESC');

      const transacciones: TransaccionReporteDto[] = await query.getRawMany();

      const total = transacciones.length;
      const sumaMonto = transacciones.reduce((acc, t) => acc + t.dptrnimpo, 0);

      return {
        success: true,
        data: {
          transacciones,
          total,
          sumaMonto,
          filtros: {
            usuario: 'TODOS',
            fechaInicio,
            fechaFin,
          },
        },
        message: `Se encontraron ${total} transacciones en el rango de fechas`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al generar reporte global',
      };
    }
  }

  /**
   * Genera reporte de dinero acumulado por dispositivo
   * Filtra transacciones con estado = 1 (no recolectadas)
   * @returns ReporteDineroAcumuladoResponseDto agrupado por dispositivo
   */
  async generarReporteDineroAcumulado(): Promise<ReporteDineroAcumuladoResponseDto> {
    try {
      // Query que agrupa por dispositivo y suma los montos
      // WHERE dptrnstat = 1 (transacciones no recolectadas)
      const query = this.dataSource
        .createQueryBuilder()
        .select('dptrn.dptrndisp', 'dptrndisp')
        .addSelect('COUNT(dptrn.dptrnntra)', 'totalTransacciones')
        .addSelect('SUM(dptrn.dptrnimpo)', 'montoAcumulado')
        .from('dptrn', 'dptrn')
        .where('dptrn.dptrnstat = :stat', { stat: 1 })
        .groupBy('dptrn.dptrndisp')
        .orderBy('dptrn.dptrndisp', 'ASC');

      const dispositivos: DineroAcumuladoDispositivoDto[] =
        await query.getRawMany();

      // Calcular totales
      const totalDispositivosConDinero = dispositivos.length;
      const montoTotalAcumulado = dispositivos.reduce(
        (acc, d) => acc + (d.montoAcumulado || 0),
        0,
      );

      return {
        success: true,
        data: {
          dispositivos,
          totalDispositivosConDinero,
          montoTotalAcumulado,
          generadoEn: new Date(),
        },
        message: `Se encontraron ${totalDispositivosConDinero} dispositivo(s) con dinero acumulado. Total: ${montoTotalAcumulado}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al generar reporte de dinero acumulado',
      };
    }
  }
}
