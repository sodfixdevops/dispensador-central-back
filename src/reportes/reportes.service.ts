import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  FiltroReporteTransacciones,
  TransaccionReporteDto,
  ReporteTransaccionesResponseDto,
  DineroAcumuladoDispositivoDto,
  ReporteDineroAcumuladoResponseDto,
  DetalleCorteDto,
  TransaccionDetalleDto,
  ReporteTransaccionDetalleResponseDto,
  ReporteTotalesGeneralesResponseDto,
  TotalesGeneralesDto,
} from './reportes.interface';

@Injectable()
export class ReportesService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private toIsoDateString(input: string): string {
    // Acepta 'YYYY-MM-DD' o 'DD/MM/YYYY' o cualquier formato que Date pueda parsear
    if (!input) return '';
    // DD/MM/YYYY
    const ddmmyyyy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, dd, mm, yyyy] = ddmmyyyy;
      return `${yyyy}-${mm}-${dd}`;
    }
    // YYYY-MM-DD
    const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) return input;

    // Fallback: try Date parsing and format as YYYY-MM-DD in local timezone
    const d = new Date(input);
    if (isNaN(d.getTime())) return input; // return original if invalid
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

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

    const startStr = this.toIsoDateString(fechaInicio);
    const endStr = this.toIsoDateString(fechaFin);
    const fechaInicioDate = new Date(startStr);
    const fechaFinDate = new Date(endStr);
    // Usar límites datetime para compatibilidad entre MySQL y MSSQL
    const startDateTime = new Date(`${startStr}T00:00:00`);
    const endDateExclusive = new Date(`${endStr}T00:00:00`);
    endDateExclusive.setDate(endDateExclusive.getDate() + 1);
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
        .andWhere('dptrn.dptrnmrcb = 0')
        .andWhere('dptrn.dptrnftra >= :start AND dptrn.dptrnftra < :end', {
          start: startDateTime,
          end: endDateExclusive,
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
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: msg || 'Error al generar reporte',
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

    const startStr = this.toIsoDateString(fechaInicio);
    const endStr = this.toIsoDateString(fechaFin);
    const fechaInicioDate = new Date(startStr);
    const fechaFinDate = new Date(endStr);
    // Usar límites datetime para compatibilidad entre MySQL y MSSQL
    const startDateTime = new Date(`${startStr}T00:00:00`);
    const endDateExclusive = new Date(`${endStr}T00:00:00`);
    endDateExclusive.setDate(endDateExclusive.getDate() + 1);
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
        .where('dptrn.dptrnmrcb = 0')
        .andWhere('dptrn.dptrnftra >= :start AND dptrn.dptrnftra < :end', {
          start: startDateTime,
          end: endDateExclusive,
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
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: msg || 'Error al generar reporte global',
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
        .andWhere('dptrn.dptrnmrcb = 0')
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
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: msg || 'Error al generar reporte de dinero acumulado',
      };
    }
  }

  /**
   * Genera reporte detallado de transacciones por rango de fechas.
   * Incluye encabezado por transacción y filas de detalle (cortes) por transacción.
   */
  async reporteTransaccionDetalle(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ReporteTransaccionDetalleResponseDto> {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Se requieren los campos: fechaInicio, fechaFin',
      );
    }

    const startStr = this.toIsoDateString(fechaInicio);
    const endStr = this.toIsoDateString(fechaFin);
    const fechaInicioDate = new Date(startStr);
    const fechaFinDate = new Date(endStr);
    // Usar límites datetime para compatibilidad entre MySQL y MSSQL
    const startDateTime = new Date(`${startStr}T00:00:00`);
    const endDateExclusive = new Date(`${endStr}T00:00:00`);
    endDateExclusive.setDate(endDateExclusive.getDate() + 1);
    if (fechaInicioDate > fechaFinDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha fin',
      );
    }

    try {
      // Traer transacciones con usuario, dispositivo, nombre dispositivo y cuenta destino
      const query = this.dataSource
        .createQueryBuilder()
        .select('dptrn.dptrnntra', 'dptrnntra')
        .addSelect('dptrn.dptrnftra', 'dptrnftra')
        .addSelect('dptrn.dptrnimpo', 'dptrnimpo')
        .addSelect('dptrn.dptrnusrn', 'dptrnusrn')
        .addSelect('adusr.adusrnick', 'adusrnick')
        .addSelect('dptrn.dptrndisp', 'dptrndisp')
        .addSelect('addisp.addispnomb', 'addispnomb')
        .addSelect('adbank.adbankncta', 'adbankncta')
        .from('dptrn', 'dptrn')
        .leftJoin('aduser', 'adusr', 'dptrn.dptrnusrn = adusr.adusrusrn')
        .leftJoin('addisp', 'addisp', 'dptrn.dptrndisp = addisp.addispcode')
        .leftJoin('adbank', 'adbank', 'dptrn.dptrnusrn = adbank.adbankusrn')
        .where('dptrn.dptrnmrcb = 0')
        .andWhere('dptrn.dptrnftra >= :start AND dptrn.dptrnftra < :end', {
          start: startDateTime,
          end: endDateExclusive,
        })
        .orderBy('dptrn.dptrnftra', 'DESC');

      const filas: any[] = await query.getRawMany();

      const transIds = filas.map((f) => f.dptrnntra).filter(Boolean);

      // Obtener detalles de cortes para las transacciones encontradas
      let detalles: any[] = [];
      if (transIds.length > 0) {
        detalles = await this.dataSource
          .createQueryBuilder()
          .select('dptrd.dptrdntra', 'dptrdntra')
          .addSelect('dptrd.dptrdvlor', 'dptrdvlor')
          .addSelect('dptrd.dptrdcant', 'dptrdcant')
          .addSelect('dptrd.dptrdimpo', 'dptrdimpo')
          .from('dptrd', 'dptrd')
          .where('dptrd.dptrdntra IN (:...ids)', { ids: transIds })
          .orderBy('dptrd.dptrdntra', 'ASC')
          .getRawMany();
      }

      // Mapear detalles por transacción
      const detallesPorTrans: Record<number, DetalleCorteDto[]> = {};
      detalles.forEach((d) => {
        const id = Number(d.dptrdntra);
        if (!detallesPorTrans[id]) detallesPorTrans[id] = [];
        detallesPorTrans[id].push({
          dptrdvlor: Number(d.dptrdvlor),
          dptrdcant: Number(d.dptrdcant),
          dptrdimpo: Number(d.dptrdimpo),
        });
      });

      // Construir resultado final
      const transacciones: TransaccionDetalleDto[] = filas.map((f) => {
        const fechaObj = new Date(f.dptrnftra);
        const fecha = fechaObj.toISOString().split('T')[0];
        const hora = fechaObj.toISOString().split('T')[1]?.split('Z')[0] || '';

        return {
          usuario: f.dptrnusrn,
          usuario_nombre: f.adusrnick || null,
          dptrndisp: Number(f.dptrndisp),
          addispnomb: f.addispnomb || null,
          dptrnntra: Number(f.dptrnntra),
          adbankncta: f.adbankncta || null,
          dptrnimpo: Number(f.dptrnimpo) || 0,
          fecha,
          hora,
          detalles: detallesPorTrans[Number(f.dptrnntra)] || [],
        };
      });

      const total = transacciones.length;
      const sumaMonto = transacciones.reduce(
        (acc, t) => acc + (t.dptrnimpo || 0),
        0,
      );

      return {
        success: true,
        data: {
          transacciones,
          total,
          sumaMonto,
          filtros: {
            fechaInicio,
            fechaFin,
          },
        },
        message: `Se encontraron ${total} transacciones en el rango de fechas`,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: msg || 'Error al generar reporte detallado',
      };
    }
  }

  /**
   * Genera un reporte con totales generales de deposito.
   * Parámetros: fechaInicio, fechaFin, estado ('TODOS' o número)
   */
  async reporteTotalesGenerales(
    fechaInicio: string,
    fechaFin: string,
    estado: string,
  ): Promise<ReporteTotalesGeneralesResponseDto> {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Se requieren los campos: fechaInicio, fechaFin',
      );
    }

    const startStr = this.toIsoDateString(fechaInicio);
    const endStr = this.toIsoDateString(fechaFin);
    const fechaInicioDate = new Date(startStr);
    const fechaFinDate = new Date(endStr);
    if (fechaInicioDate > fechaFinDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha fin',
      );
    }

    try {
      // Construir cláusula de estado
      // Usar parámetros datetime (inicio 00:00:00, fin exclusivo 00:00:00 del día siguiente)
      const whereParams: any = {
        start: new Date(`${startStr}T00:00:00`),
        end: (() => {
          const d = new Date(`${endStr}T00:00:00`);
          d.setDate(d.getDate() + 1);
          return d;
        })(),
      };
      let estadoCond = '';
      if (estado && String(estado).toUpperCase() !== 'TODOS') {
        estadoCond = 'AND dptrn.dptrnstat = :stat';
        whereParams.stat = Number(estado);
      }

      // Query: totales desde detalle dptrd (cantidad e importe de cortes)
      const raw = await this.dataSource
        .createQueryBuilder()
        .select('1', 'moneda')
        .addSelect('COUNT(DISTINCT dptrn.dptrnntra)', 'totalTransacciones')
        .addSelect('COALESCE(SUM(dptrd.dptrdcant),0)', 'cantidadBilletes')
        .addSelect('COALESCE(SUM(dptrd.dptrdimpo),0)', 'importe')
        .from('dptrn', 'dptrn')
        .innerJoin('dptrd', 'dptrd', 'dptrd.dptrdntra = dptrn.dptrnntra')
        .where(
          `dptrn.dptrnmrcb = 0 AND dptrn.dptrnftra >= :start AND dptrn.dptrnftra < :end ${estadoCond}`,
          whereParams,
        )
        .getRawOne();

      const totalDeposito: TotalesGeneralesDto = {
        moneda: 1,
        totalTransacciones: Number(raw?.totalTransacciones) || 0,
        cantidadBilletes: Number(raw?.cantidadBilletes) || 0,
        importe: Number(raw?.importe) || 0,
      };
      const totales: TotalesGeneralesDto[] = [totalDeposito];
      const totalMonedas = 1;
      const sumaImporte = totalDeposito.importe;

      return {
        success: true,
        data: {
          totales,
          totalMonedas,
          sumaImporte,
          filtros: {
            fechaInicio,
            fechaFin,
            estado,
          },
        },
        message: 'Se obtuvieron los totales generales de deposito',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: msg || 'Error al generar reporte de totales generales',
      };
    }
  }
}
