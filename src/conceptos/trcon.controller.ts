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
import { TrconService } from './trcon.service';
import {
  CreateTrconDto,
  TrconMasivoDto,
  UpdateTrconDto,
} from './trcon.interface';

@Controller('conceptos')
export class TrconController {
  constructor(private readonly trconService: TrconService) {}

  @Post()
  async create(@Body() createTrconDto: CreateTrconDto) {
    return this.trconService.create(createTrconDto);
  }

  @Post('bulk')
  async createMany(@Body() masivo: TrconMasivoDto): Promise<CreateTrconDto[]> {
    return this.trconService.createMany(masivo);
  }

  @Get()
  async findAll() {
    return this.trconService.findAll();
  }

  @Get('prefijo/:prefijo')
  async findByPrefijo(@Param('prefijo') prefijo: number) {
    return this.trconService.findConceptosByPrefijo(prefijo);
  }

  @Get('concepto/:prefijo/:correlativo')
  async findByUnique(
    @Param('prefijo') prefijo: number,
    @Param('correlativo') correlativo: number,
  ) {
    return this.trconService.findOne(prefijo, correlativo);
  }

  @Get('perfiles/')
  async findByPerfiles() {
    return this.trconService.findConceptosByPerfiles();
  }

  @Get('cabecera/')
  async findConceptosCabecera() {
    return this.trconService.findConceptosCabecera();
  }

  @Get(':prefijo/:correlativo')
  async findOne(
    @Param('prefijo') prefijo: number,
    @Param('correlativo') correlativo: number,
  ) {
    return this.trconService.findOne(prefijo, correlativo);
  }

  @Put(':prefijo/:correlativo')
  async update(
    @Param('prefijo') prefijo: number,
    @Param('correlativo') correlativo: number,
    @Body() updateTrconDto: UpdateTrconDto,
  ) {
    return this.trconService.update(prefijo, correlativo, updateTrconDto);
  }

  @Delete(':prefijo/:correlativo')
  async remove(
    @Param('prefijo') prefijo: number,
    @Param('correlativo') correlativo: number,
  ) {
    return this.trconService.remove(prefijo, correlativo);
  }
}
