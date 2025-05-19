import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ServService } from './serv.service';
import { ServDto } from './serv.interface';

@Controller('servicios')
export class ServController {
  constructor(private readonly servService: ServService) {}

  @Get()
  async findAll(): Promise<ServDto[]> {
    return await this.servService.findAll();
  }
  @Get('subservicios/:id')
  async listaSubservicios(@Param('id') idServicio: number): Promise<ServDto[]> {
    return await this.servService.ListaSubservicios(idServicio);
  }
  @Get('subserviciosaccion')
  async listaSubserviciosAccion(): Promise<ServDto[]> {
    return await this.servService.listaSubserviciosAccion();
  }

  @Get(':idServicio')
  async findOne(@Param('idServicio') idServicio: number): Promise<ServDto> {
    return await this.servService.findOne(idServicio);
  }

  @Get('/filtros/servicios')
  async filtrosSucursales() {
    return this.servService.filtroServicios();
  }

  @Get('/filtros/subservicios')
  async filtrosAgenciass() {
    return this.servService.filtroSubservicio();
  }

  @Get('/lista/:codigos')
  async findServiciosByCodes(@Param('codigos') codigos: string) {
    return this.servService.findServiciosByCodes(codigos);
  }

  @Post()
  async create(@Body() servDto: ServDto): Promise<ServDto> {
    return await this.servService.create(servDto);
  }

  @Put(':idServicio')
  async update(
    @Param('idServicio') idServicio: number,
    @Body() servDto: ServDto,
  ): Promise<ServDto> {
    return await this.servService.update(idServicio, servDto);
  }

  @Delete(':idServicio')
  async delete(@Param('idServicio') idServicio: number): Promise<void> {
    await this.servService.delete(idServicio);
  }
}
