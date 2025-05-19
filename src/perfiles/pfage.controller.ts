import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PfageService } from './pfage.service';
import { CreatePfageDto, PfageDto, PfageMasivoDto } from './pfage.interface';

@Controller('perfilesagencia')
export class PfageController {
  constructor(private readonly pfageService: PfageService) {}

  @Post()
  async create(@Body() createPfageDto: CreatePfageDto): Promise<PfageDto> {
    return this.pfageService.create(createPfageDto);
  }

  @Get()
  async findAll(): Promise<PfageDto[]> {
    return this.pfageService.findAll();
  }

  @Get('/agenciasperfil/:perfil')
  async findByPerfil(@Param('perfil') perfil: number): Promise<PfageDto[]> {
    return this.pfageService.findByPerfil(perfil);
  }

  @Get('/perfiles/:agencia/:tipo')
  async findPerfilesAgencia(
    @Param('agencia') agencia: number,
    @Param('tipo') tipo: number,
  ): Promise<PfageDto[]> {
    return this.pfageService.findPerfilesAgencia(agencia, tipo);
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo: number): Promise<PfageDto> {
    return this.pfageService.findOne(codigo);
  }

  @Put(':codigo')
  async update(
    @Param('codigo') codigo: number,
    @Body() updatePfageDto: CreatePfageDto,
  ): Promise<PfageDto> {
    return this.pfageService.update(codigo, updatePfageDto);
  }

  @Delete(':codigo')
  async remove(@Param('codigo') codigo: number): Promise<void> {
    return this.pfageService.remove(codigo);
  }

  @Post('bulk')
  async createMany(@Body() masivo: PfageMasivoDto): Promise<PfageDto[]> {
    return this.pfageService.createMany(masivo);
  }
}
