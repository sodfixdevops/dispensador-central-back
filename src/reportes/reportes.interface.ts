import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para filtros de reporte de transacciones
 */
export class FiltroReporteTransacciones {
  @ApiProperty({
    description: 'Código del usuario (usrn)',
    example: 'USR001',
  })
  usuario: string;

  @ApiProperty({
    description: 'Fecha de inicio del reporte',
    example: '2026-01-01',
  })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin del reporte',
    example: '2026-01-31',
  })
  fechaFin: string;
}

/**
 * DTO para respuesta de transacción en reporte
 */
export interface TransaccionReporteDto {
  dptrnntra: number; // Número de transacción
  dptrnftra: Date; // Fecha de transacción
  dptrnimpo: number; // Monto de la transacción
  dptrncmon: number; // Código de moneda
  dptrnstat: number; // Estado de la transacción
  dptrnusrn: string; // Código del usuario
  adusrnick: string; // Nickname del usuario
  dptrndisp: number; // Código del dispositivo
  dptrnmrcb: number; // Marca de cambio
}

/**
 * DTO para respuesta del reporte
 */
export interface ReporteTransaccionesResponseDto {
  success: boolean;
  data?: {
    transacciones: TransaccionReporteDto[];
    total: number;
    sumaMonto: number;
    filtros: {
      usuario: string;
      fechaInicio: string;
      fechaFin: string;
    };
  };
  error?: string;
  message?: string;
}

/**
 * DTO para dinero acumulado por dispositivo
 */
export interface DineroAcumuladoDispositivoDto {
  dptrndisp: number; // Código del dispositivo
  totalTransacciones: number; // Cantidad de transacciones pendientes
  montoAcumulado: number; // Monto total acumulado
}

/**
 * DTO para respuesta del reporte de dinero acumulado
 */
export interface ReporteDineroAcumuladoResponseDto {
  success: boolean;
  data?: {
    dispositivos: DineroAcumuladoDispositivoDto[];
    totalDispositivosConDinero: number;
    montoTotalAcumulado: number;
    generadoEn: Date;
  };
  error?: string;
  message?: string;
}
