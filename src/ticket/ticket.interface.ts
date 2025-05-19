import { TicketEntity } from './ticket.entity';

export interface TicketDto {
  idTicket?: string;
  servicio?: number;
  subservicio?: number;
  preferencia?: number;
  tiempoRequerimiento?: string;
  tiempoServicio?: string;
  tiempoAtencion?: string;
  fecha?: Date;
  estado?: number;
  marca?: number;
  nroCaja?: number;
  usuario?: string;
  plaza?: number;
  agencia?: number;
  etiqueta?: string;
  prioridad?: number;
  posicion?: number;
}

export interface nuevoTicketDto {
  servicio: number;
  subservicio: number;
  preferencia: number;
}

export interface nuevoTicketResponseDto {
  etiqueta?: string;
  idTicket?: string;
  prioridad?: number;
  corr?: number;
}

export interface llamadaTicketDto {
  perfil?: number;
  usuario?: string;
  nrocaja?: number;
  tipo?: number; // 1 llamada 2 atendido
  idticket: string;
  sala?: number;
}

export interface llamadaTicketResponseDto {
  etiqueta?: string;
  idticket?: string;
  tiempoInicio?: string;
  codigo?: number;
  message?: string;
}
/**
 * Reportes
 */
export interface reporteResumenColasParamDto {
  sucursales: string;
  agencias: string;
  fechaIni: string;
  fechaFin: string;
  horaIni: string;
  horaFin: string;
}
export interface reporteResumenColasResponseDto {
  codigo: number;
  agencia: string;
  fecha: string;
  tickets_emitidos: number;
  tickets_atendidos: number;
  tickets_noatendidos: number;
  tiempo_promedio_espera: string;
  tiempo_promedio_atencion: string;
  cantidad_t30_dentro: number;
  cantidad_t30_fuera: number;
  porcentaje_t30: string;
  max_tiempo_espera: string;
}

export function mapToTicketEntity(dto: TicketDto): Partial<TicketEntity> {
  return {
    ticket_idtk: dto.idTicket,
    ticket_serv: dto.servicio,
    ticket_sbsr: dto.subservicio,
    ticket_pref: dto.preferencia,
    ticket_rqst: dto.tiempoRequerimiento,
    ticket_srvs: dto.tiempoServicio,
    ticket_sqos: dto.tiempoAtencion,
    ticket_fech: dto.fecha,
    ticket_stat: dto.estado,
    ticket_mrcb: dto.marca,
    ticket_nrcj: dto.nroCaja,
    ticket_usrn: dto.usuario,
    ticket_plza: dto.plaza,
    ticket_agen: dto.agencia,
    ticket_etqt: dto.etiqueta,
    ticket_prio: dto.prioridad,
    ticket_posi: dto.posicion,
  };
}

export function mapToTicketDto(entity: TicketEntity): TicketDto {
  return {
    idTicket: entity.ticket_idtk,
    servicio: entity.ticket_serv,
    subservicio: entity.ticket_sbsr,
    preferencia: entity.ticket_pref,
    tiempoRequerimiento: entity.ticket_rqst,
    tiempoServicio: entity.ticket_srvs,
    tiempoAtencion: entity.ticket_sqos,
    fecha: entity.ticket_fech,
    estado: entity.ticket_stat,
    marca: entity.ticket_mrcb,
    nroCaja: entity.ticket_nrcj,
    usuario: entity.ticket_usrn,
    plaza: entity.ticket_plza,
    agencia: entity.ticket_agen,
    etiqueta: entity.ticket_etqt,
    prioridad: entity.ticket_prio,
    posicion: entity.ticket_posi,
  };
}

export function mapToTicketEntityB(dto: TicketDto): TicketEntity {
  const ticket = new TicketEntity(); // Crea una nueva instancia de TicketEntity

  // Asigna los valores del DTO a la entidad
  ticket.ticket_idtk = dto.idTicket;
  ticket.ticket_serv = dto.servicio;
  ticket.ticket_sbsr = dto.subservicio;
  ticket.ticket_pref = dto.preferencia;
  ticket.ticket_rqst = dto.tiempoRequerimiento;
  ticket.ticket_srvs = dto.tiempoServicio;
  ticket.ticket_sqos = dto.tiempoAtencion;
  ticket.ticket_fech = dto.fecha;
  ticket.ticket_stat = dto.estado;
  ticket.ticket_mrcb = dto.marca;
  ticket.ticket_nrcj = dto.nroCaja;
  ticket.ticket_usrn = dto.usuario;
  ticket.ticket_plza = dto.plaza;
  ticket.ticket_agen = dto.agencia;
  ticket.ticket_etqt = dto.etiqueta;
  ticket.ticket_prio = dto.prioridad;
  ticket.ticket_posi = dto.posicion;

  return ticket; // Devuelve la instancia de TicketEntity
}
