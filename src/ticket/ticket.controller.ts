import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TicketService } from './ticket.service';
import {
  llamadaTicketDto,
  llamadaTicketResponseDto,
  nuevoTicketDto,
  nuevoTicketResponseDto,
  reporteResumenColasParamDto,
  TicketDto,
} from './ticket.interface';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(@Body() ticketDto: TicketDto): Promise<TicketDto> {
    return this.ticketService.create(ticketDto);
  }

  @Get()
  async findAll(): Promise<TicketDto[]> {
    return this.ticketService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TicketDto> {
    return this.ticketService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() ticketDto: TicketDto,
  ): Promise<TicketDto> {
    return this.ticketService.update(id, ticketDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.ticketService.delete(id);
  }

  @Get('stats/:codigoUsuario/:fecha')
  async getTicketStats(
    @Param('codigoUsuario') codigoUsuario: string,
    @Param('fecha') fecha: string,
  ) {
    return this.ticketService.getTicketStatsForUser(codigoUsuario, fecha);
  }

  @Post('reportes/resumenColas')
  async reporteResumenColas(@Body() param: reporteResumenColasParamDto) {
    return this.ticketService.reporte_ResumenColas(param);
  }

  @Post('reportes/resumenasfi')
  async reporteAsfi(
    @Body() param: reporteResumenColasParamDto,
    @Res() res: Response,
  ) {
    //return this.ticketService.reporteAsfi(param);
    const fileBuffer = await this.ticketService.reporteAsfi(param);

    // Configuramos los encabezados para la descarga del archivo
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte_resumen_colas.txt',
    );
    res.setHeader('Content-Length', fileBuffer.length);

    // Enviamos el archivo como respuesta
    res.end(fileBuffer);
  }

  @Post('migracion')
  async addMultipleTickets(@Body() ticketsData: TicketDto[]) {
    try {
      const result = await this.ticketService.addMultipleTickets(ticketsData);
      return result; // El mensaje de éxito o el resultado de la operación
    } catch (error) {
      throw new Error(`Error al agregar los tickets: ${error.message}`);
    }
  }
}
