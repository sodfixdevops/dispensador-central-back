import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpException,
  Param,
  Put,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { GbconService } from './gbcon.service';
import { GbconDataDto } from './gbcon.interface';

@Controller('conceptos')
export class GbconController {
  constructor(private readonly gbconService: GbconService) {}

  @Post()
  async create(@Body() gbconDataDto: GbconDataDto, @Res() res: Response) {
    try {
      const result = await this.gbconService.create(gbconDataDto);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'Concepto Creado Correctamente',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        uccess: false,
        message: 'Error al crear el concepto',
        error: error.message || 'Error interno',
      });
    }
  }

  @Put('prefijo/:pref/correlativo/:corr')
  async update(
    @Param('pref') pref: number,
    @Param('corr') corr: number,
    @Body() gbconDataDto: GbconDataDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.gbconService.update(pref, corr, gbconDataDto);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'Concepto actualizado Correctamente',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Error al actualizar el concepto',
        error: error.message || 'Error interno',
      });
    }
  }

  @Get('cabecera/')
  async findConceptosCabecera() {
    return this.gbconService.getPrefijos();
  }

  @Get('prefijo/:prefijo')
  async findByPrefijo(@Param('prefijo') prefijo: number) {
    return this.gbconService.getDetallePrefijo(prefijo);
  }
}
