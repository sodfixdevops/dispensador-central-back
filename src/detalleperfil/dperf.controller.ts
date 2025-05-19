import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { DperfService } from './dperf.service';
import { CreateDperfDto, DperfDto, dperfMasivoDto } from './dperf.interface';

@Controller('perfilesservicio')
export class DperfController {
  constructor(private readonly dperfService: DperfService) {}

  @Post()
  async create(@Body() createDperfDto: CreateDperfDto): Promise<DperfDto> {
    return this.dperfService.create(createDperfDto);
  }

  @Get()
  async findAll(): Promise<DperfDto[]> {
    return this.dperfService.findAll();
  }

  @Get('/perfil/subservicios/:perfil/:servicio/:tipo')
  async findByPerfilServicio(
    @Param('perfil') perfil: number,
    @Param('servicio') servicio: number,
    @Param('tipo') tipo: number,
  ): Promise<DperfDto[]> {
    return this.dperfService.findByPerfilServicio(perfil, servicio, tipo);
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo: number): Promise<DperfDto> {
    return this.dperfService.findOne(codigo);
  }

  @Get('/serviciosperfil/:perfil')
  async findByPerfil(@Param('perfil') perfil: number): Promise<DperfDto[]> {
    return this.dperfService.findByPerfil(perfil);
  }

  @Put(':codigo')
  async update(
    @Param('codigo') codigo: number,
    @Body() updateDperfDto: CreateDperfDto,
  ): Promise<DperfDto> {
    return this.dperfService.update(codigo, updateDperfDto);
  }

  @Delete(':codigo')
  async remove(@Param('codigo') codigo: number): Promise<void> {
    return this.dperfService.remove(codigo);
  }

  @Post('bulk')
  async createMany(@Body() masivos: dperfMasivoDto): Promise<DperfDto[]> {
    return this.dperfService.createMany(masivos);
  }
}
