import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
} from '@nestjs/common';
import { AgenService } from './agen.service';
import { CreateAgenDto, UpdateAgenDto } from './agen.interface';

@Controller('agencia')
export class AgenController {
  constructor(private readonly agenService: AgenService) {}

  @Post()
  async create(@Body() createAgenDto: CreateAgenDto) {
    return this.agenService.create(createAgenDto);
  }

  @Get()
  async findAll() {
    return this.agenService.findAll();
  }

  @Get('sucursales')
  async findAllSucursales() {
    return this.agenService.findAllSucursales();
  }

  @Get('agencias/:id')
  async findAllAgenciasBySucursal(@Param('id') idAgencia: number) {
    return this.agenService.findAllAgenciasBySucursal(idAgencia);
  }

  @Get('/lista')
  async findAllAgencias() {
    return this.agenService.findAllAgencias();
  }

  @Get(':idAgencia')
  async findOne(@Param('idAgencia') idAgencia: number) {
    return this.agenService.findOne(idAgencia);
  }

  @Get('/filtros/sucursales')
  async filtrosSucursales() {
    return this.agenService.filtroSucursales();
  }

  @Get('/filtros/agencias')
  async filtrosAgenciass() {
    return this.agenService.filtroAgencias();
  }

  @Put(':idAgencia')
  async update(
    @Param('idAgencia') idAgencia: number,
    @Body() updateAgenDto: UpdateAgenDto,
  ) {
    return this.agenService.update(idAgencia, updateAgenDto);
  }

  @Delete(':idAgencia')
  async remove(@Param('idAgencia') idAgencia: number) {
    return this.agenService.remove(idAgencia);
  }
}
