import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { DispositivosService } from './dispositivo.service';
import { DispositivoCreateDto } from './dispositivo.interface';

@Controller('dispositivos')
export class DispositivosController {
  constructor(private readonly servicio: DispositivosService) {}

  @Get()
  getAll() {
    return this.servicio.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.servicio.findOne(id);
  }

  @Post()
  create(@Body() data: DispositivoCreateDto) {
    return this.servicio.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: DispositivoCreateDto) {
    return this.servicio.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.servicio.delete(id);
  }
}
