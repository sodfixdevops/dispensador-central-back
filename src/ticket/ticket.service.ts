import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { TicketEntity } from './ticket.entity';
import {
  TicketDto,
  mapToTicketEntity,
  mapToTicketDto,
  nuevoTicketDto,
  nuevoTicketResponseDto,
  llamadaTicketResponseDto,
  llamadaTicketDto,
  reporteResumenColasParamDto,
  reporteResumenColasResponseDto,
  mapToTicketEntityB,
} from './ticket.interface';
import { ServService } from 'src/servicios/serv.service';
import { DperfService } from 'src/detalleperfil/dperf.service';
import { ServicioFiltro } from 'src/servicios/serv.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
    private readonly datasource: DataSource,
    private readonly servService: ServService,
    private readonly dperfService: DperfService,
  ) {}

  async create(
    ticketDto: TicketDto,
    queryRunner?: QueryRunner,
  ): Promise<TicketDto> {
    const ticketRepo = queryRunner
      ? queryRunner.manager.getRepository(TicketEntity)
      : this.ticketRepo;

    const ticketEntity = ticketRepo.create(mapToTicketEntity(ticketDto));
    const savedEntity = await ticketRepo.save(ticketEntity);
    return mapToTicketDto(savedEntity);
  }

  async getTicketStatsForUser(codigoUsuario: string, fecha: string) {
    const result = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select([
        'ticket.ticket_usrn',
        'COUNT(*) AS cantidad_tickets_atendidos',
        'SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, ticket.ticket_srvs, ticket.ticket_sqos))) AS tiempo_total_atencion',
      ])
      .where('ticket.ticket_usrn = :codigoUsuario', { codigoUsuario })
      .andWhere('ticket.ticket_stat IN (:...statuses)', { statuses: [2, 3] })
      .andWhere('ticket.ticket_fech = :fecha', { fecha })
      .groupBy('ticket.ticket_usrn')
      .getRawOne();

    // Si no existe el resultado, devolvemos los valores por defecto
    if (result) {
      const cantidadTickets = result.cantidad_tickets_atendidos;
      const tiempoTotalAtencion = result.tiempo_total_atencion;

      // Calculamos la media de atención (si no hay tickets atendidos, la media es '00:00:00')
      let mediaAtencion = '00:00:00';
      if (cantidadTickets > 0) {
        // Convertimos el tiempo total a segundos
        const [hours, minutes, seconds] = tiempoTotalAtencion
          .split(':')
          .map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        // Calculamos la media
        const mediaSeconds = totalSeconds / cantidadTickets;

        // Convertimos los segundos de la media a formato HH:MM:SS
        const mediaHours = Math.floor(mediaSeconds / 3600);
        const mediaMinutes = Math.floor((mediaSeconds % 3600) / 60);
        const mediaSec = Math.floor(mediaSeconds % 60);

        mediaAtencion = `${String(mediaHours).padStart(2, '0')}:${String(mediaMinutes).padStart(2, '0')}:${String(mediaSec).padStart(2, '0')}`;
      }

      return {
        cantidad_tickets_atendidos: cantidadTickets,
        tiempo_total_atencion: tiempoTotalAtencion,
        media_atencion: mediaAtencion,
      };
    }

    return {
      cantidad_tickets_atendidos: 0,
      tiempo_total_atencion: '00:00:00',
      media_atencion: '00:00:00',
    };
  }

  async findTicketsByUserAndCurrentDate(
    ticketUsrn: string, // El usuario que estamos buscando
    queryRunner: QueryRunner, // El queryRunner para ejecutar la transacción
  ): Promise<TicketDto> {
    const result = await queryRunner.manager
      .createQueryBuilder(TicketEntity, 'ticket')
      .where('ticket.ticket_usrn = :ticketUsrn', { ticketUsrn }) // Filtrar por usuario
      .andWhere('ticket.ticket_fech = CURRENT_DATE') // Filtrar por fecha actual
      .orderBy('ticket.ticket_prio', 'DESC') // Ordenar por ticket_prio en orden descendente
      .addOrderBy('ticket.ticket_posi', 'ASC') // Ordenar por ticket_posi en orden ascendente
      .limit(1)
      .getOne(); // Obtener los tickets que coinciden con las condiciones

    return mapToTicketDto(result);
  }

  async findAll(): Promise<TicketDto[]> {
    const tickets = await this.ticketRepo.find();
    return tickets.map(mapToTicketDto);
  }

  async findOne(id: string): Promise<TicketDto> {
    const ticket = await this.ticketRepo.findOneBy({ ticket_idtk: id });
    return mapToTicketDto(ticket);
  }

  async update(
    id: string,
    ticketDto: TicketDto,
    queryRunner?: QueryRunner,
  ): Promise<TicketDto> {
    const ticketRepo = queryRunner
      ? queryRunner.manager.getRepository(TicketEntity)
      : this.ticketRepo;

    await ticketRepo.update({ ticket_idtk: id }, mapToTicketEntity(ticketDto));
    const updatedEntity = await ticketRepo.findOneBy({ ticket_idtk: id });
    return mapToTicketDto(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.ticketRepo.delete({ ticket_idtk: id });
  }
  /**
   * Reportes
   */

  async reporte_ResumenColas(param: reporteResumenColasParamDto) {
    const result = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select([
        'ticket.ticket_agen AS agencia',
        'DATE_FORMAT(ticket.ticket_fech, "%d/%m/%Y") as fecha',
        'COUNT(CASE WHEN ticket.ticket_stat = 2 THEN 1 END) AS total_atendidos',
        'COUNT(CASE WHEN ticket.ticket_stat = 3 THEN 1 END) AS total_noatendidos',
        'COUNT(*) AS cantidad_emitidos',
        'SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, ticket.ticket_rqst, ticket.ticket_srvs))) AS tiempo_total_espera',
        'SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, ticket.ticket_srvs, ticket.ticket_sqos))) AS tiempo_total_atencion',
        'MAX(TIMESTAMPDIFF(SECOND, ticket.ticket_rqst, ticket.ticket_srvs)) AS max_tiempo_espera',
        'COUNT(CASE WHEN TIMESTAMPDIFF(SECOND, ticket.ticket_rqst, ticket.ticket_srvs) <= 1800 THEN 1 END) AS cantidad_t30_dentro',
      ])
      .where('ticket.ticket_stat IN (:...statuses)', {
        statuses: [2, 3],
      })
      .andWhere('ticket.ticket_fech BETWEEN :fechaIni AND :fechaFin', {
        fechaIni: param.fechaIni,
        fechaFin: param.fechaFin,
      })
      .andWhere('ticket.ticket_rqst BETWEEN :horaIni AND :horaFin', {
        horaIni: param.horaIni,
        horaFin: param.horaFin,
      })
      .groupBy('ticket.ticket_agen,ticket.ticket_fech');
    //console.log('Consulta SQL:', result.getQuery());
    const rawData = await result.getRawMany();
    let tiempo_promedio_espera = '00:00:00';
    let tiempo_promedio_atencion = '00:00:00';
    let resultado: reporteResumenColasResponseDto[] = [];
    let nro = 1;
    rawData.forEach((data) => {
      const total_atendidos = data.total_atendidos;
      const total_noatendidos = data.total_noatendidos;
      const cantidad_tickets =
        parseInt(total_atendidos) + parseInt(total_noatendidos);
      const tiempo_total_espera = data.tiempo_total_espera;
      const tiempo_total_atencion = data.tiempo_total_atencion;
      const max_tiempo_espera = data.max_tiempo_espera; // Maximo tiempo de espera en segundos
      const cantidad_t30_dentro = data.cantidad_t30_dentro;

      let maxTiempoEsperaFormateado = '00:00:00';
      if (max_tiempo_espera > 0) {
        const hours = Math.floor(max_tiempo_espera / 3600);
        const minutes = Math.floor((max_tiempo_espera % 3600) / 60);
        const seconds = Math.floor(max_tiempo_espera % 60);
        maxTiempoEsperaFormateado = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      if (cantidad_tickets > 0) {
        let [hours, minutes, seconds] = tiempo_total_espera
          .split(':')
          .map(Number);
        const totalSecondsEspera = hours * 3600 + minutes * 60 + seconds;

        [hours, minutes, seconds] = tiempo_total_atencion
          .split(':')
          .map(Number);
        const totalSecondsatencion = hours * 3600 + minutes * 60 + seconds;
        //calculo de media
        const mediaSecondsEspera = totalSecondsEspera / cantidad_tickets;
        const mediaSecondsAtencion = totalSecondsatencion / cantidad_tickets;

        const mediaHoursEspera = Math.floor(mediaSecondsEspera / 3600);
        const mediaMinutesEspera = Math.floor((mediaSecondsEspera % 3600) / 60);
        const mediaSecEspera = Math.floor(mediaSecondsEspera % 60);

        const mediaHoursAtencion = Math.floor(mediaSecondsAtencion / 3600);
        const mediaMinutesAtencion = Math.floor(
          (mediaSecondsAtencion % 3600) / 60,
        );
        const mediaSecAtencion = Math.floor(mediaSecondsAtencion % 60);

        tiempo_promedio_espera = `${String(mediaHoursEspera).padStart(2, '0')}:${String(mediaMinutesEspera).padStart(2, '0')}:${String(mediaSecEspera).padStart(2, '0')}`;
        tiempo_promedio_atencion = `${String(mediaHoursAtencion).padStart(2, '0')}:${String(mediaMinutesAtencion).padStart(2, '0')}:${String(mediaSecAtencion).padStart(2, '0')}`;
      }

      const porcentaje_t30 =
        total_atendidos > 0
          ? ((cantidad_t30_dentro / cantidad_tickets) * 100).toFixed(2)
          : '0.00';
      //console.log(`${cantidad_t30_dentro} / ${total_atendidos}`);

      const raw: reporteResumenColasResponseDto = {
        codigo: nro,
        agencia: data.agencia,
        fecha: data.fecha,
        tickets_emitidos: cantidad_tickets,
        tickets_atendidos: total_atendidos,
        tickets_noatendidos: total_noatendidos,
        tiempo_promedio_espera: tiempo_promedio_espera,
        tiempo_promedio_atencion: tiempo_promedio_atencion,
        cantidad_t30_dentro: cantidad_t30_dentro,
        cantidad_t30_fuera: cantidad_tickets - cantidad_t30_dentro,
        porcentaje_t30: porcentaje_t30,
        max_tiempo_espera: maxTiempoEsperaFormateado,
      };
      nro++;
      resultado.push(raw);
    });

    return resultado;
  }

  async reporteAsfi(param: reporteResumenColasParamDto) {
    const result = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select([
        'ticket.ticket_agen AS agencia',
        'DATE_FORMAT(ticket.ticket_fech, "%d/%m/%Y") as fecha',
        'COUNT(CASE WHEN ticket.ticket_stat = 2 THEN 1 END) AS total_atendidos',
        'COUNT(CASE WHEN ticket.ticket_stat = 3 THEN 1 END) AS total_noatendidos',
        'COUNT(*) AS cantidad_emitidos',
        'SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, ticket.ticket_rqst, ticket.ticket_srvs))) AS tiempo_total_espera',
        'SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, ticket.ticket_srvs, ticket.ticket_sqos))) AS tiempo_total_atencion',
        'MAX(TIMESTAMPDIFF(SECOND, ticket.ticket_rqst, ticket.ticket_srvs)) AS max_tiempo_espera',
        'COUNT(CASE WHEN TIMESTAMPDIFF(SECOND, ticket.ticket_rqst, ticket.ticket_srvs) <= 1800 THEN 1 END) AS cantidad_t30_dentro',
      ])
      .where('ticket.ticket_stat IN (:...statuses)', {
        statuses: [2, 3],
      })
      .andWhere('ticket.ticket_fech BETWEEN :fechaIni AND :fechaFin', {
        fechaIni: param.fechaIni,
        fechaFin: param.fechaFin,
      })
      .andWhere('ticket.ticket_rqst BETWEEN :horaIni AND :horaFin', {
        horaIni: param.horaIni,
        horaFin: param.horaFin,
      })
      .groupBy('ticket.ticket_agen,ticket.ticket_fech');

    const rawData = await result.getRawMany();

    let tiempo_promedio_espera = '00:00:00';
    let tiempo_promedio_atencion = '00:00:00';
    let nro = 1;

    const fileContent: string[] = []; // Almacenamos las filas del archivo aquí

    // Escribir encabezados (si lo deseas)
    /*fileContent.push(
      'Codigo|Agencia|Fecha|Tickets Emitidos|Tickets Atendidos|Tickets No Atendidos|Tiempo Promedio Espera|Tiempo Promedio Atencion|Cantidad T30 Dentro|Cantidad T30 Fuera|Porcentaje T30|Max Tiempo Espera',
    );*/

    rawData.forEach((data) => {
      const total_atendidos = data.total_atendidos;
      const total_noatendidos = data.total_noatendidos;
      const cantidad_tickets =
        parseInt(total_atendidos) + parseInt(total_noatendidos);
      const tiempo_total_espera = data.tiempo_total_espera;
      const tiempo_total_atencion = data.tiempo_total_atencion;
      const max_tiempo_espera = data.max_tiempo_espera;
      const cantidad_t30_dentro = data.cantidad_t30_dentro;

      let maxTiempoEsperaFormateado = '00:00:00';
      if (max_tiempo_espera > 0) {
        const hours = Math.floor(max_tiempo_espera / 3600);
        const minutes = Math.floor((max_tiempo_espera % 3600) / 60);
        const seconds = Math.floor(max_tiempo_espera % 60);
        maxTiempoEsperaFormateado = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      if (cantidad_tickets > 0) {
        let [hours, minutes, seconds] = tiempo_total_espera
          .split(':')
          .map(Number);
        const totalSecondsEspera = hours * 3600 + minutes * 60 + seconds;

        [hours, minutes, seconds] = tiempo_total_atencion
          .split(':')
          .map(Number);
        const totalSecondsAtencion = hours * 3600 + minutes * 60 + seconds;

        // Calculo de media
        const mediaSecondsEspera = totalSecondsEspera / cantidad_tickets;
        const mediaSecondsAtencion = totalSecondsAtencion / cantidad_tickets;

        const mediaHoursEspera = Math.floor(mediaSecondsEspera / 3600);
        const mediaMinutesEspera = Math.floor((mediaSecondsEspera % 3600) / 60);
        const mediaSecEspera = Math.floor(mediaSecondsEspera % 60);

        const mediaHoursAtencion = Math.floor(mediaSecondsAtencion / 3600);
        const mediaMinutesAtencion = Math.floor(
          (mediaSecondsAtencion % 3600) / 60,
        );
        const mediaSecAtencion = Math.floor(mediaSecondsAtencion % 60);

        tiempo_promedio_espera = `${String(mediaHoursEspera).padStart(2, '0')}:${String(mediaMinutesEspera).padStart(2, '0')}:${String(mediaSecEspera).padStart(2, '0')}`;
        tiempo_promedio_atencion = `${String(mediaHoursAtencion).padStart(2, '0')}:${String(mediaMinutesAtencion).padStart(2, '0')}:${String(mediaSecAtencion).padStart(2, '0')}`;
      }

      const porcentaje_t30 =
        total_atendidos > 0
          ? ((cantidad_t30_dentro / cantidad_tickets) * 100).toFixed(2)
          : '0.00';

      // Construir la fila en formato texto
      const fila = `${nro}|${data.agencia}|${data.fecha}|${cantidad_tickets}|${total_atendidos}|${total_noatendidos}|${tiempo_promedio_espera}|${tiempo_promedio_atencion}|${cantidad_t30_dentro}|${cantidad_tickets - cantidad_t30_dentro}|${porcentaje_t30}|${maxTiempoEsperaFormateado}`;

      fileContent.push(fila); // Añadir la fila al contenido

      nro++;
    });

    // Crear el contenido como un buffer
    const buffer = Buffer.from(fileContent.join('\n'), 'utf-8');

    return buffer; // Retornamos el buffer con el archivo
  }

  async addMultipleTickets(ticketsData: TicketDto[]): Promise<any> {
    const queryRunner: QueryRunner =
      this.ticketRepo.manager.connection.createQueryRunner();
    //console.log(ticketsData);
    // Inicia la transacción
    await queryRunner.startTransaction();
    try {
      // Inserta los registros dentro de la transacción
      for (const ticketData of ticketsData) {
        const ticketEntity = mapToTicketEntityB(ticketData); // Mapeo del DTO a la entidad
        await queryRunner.manager.save(ticketEntity);
      }

      // Si todo va bien, hace commit de la transacción
      await queryRunner.commitTransaction();
      return {
        code: 200,
        message: 'Registros añadidos correctamente',
      };
    } catch (error) {
      // Si algo falla, hace rollback
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al añadir los registros: ${error.message}`);
    } finally {
      // Libera el QueryRunner después de la transacción
      await queryRunner.release();
    }
  }
}
