import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DpautService } from './dpaut.service';
import { DpautInterface } from './dpaut.interface';

@Controller('dpaut')
export class DpautController {
  constructor(private readonly dpautService: DpautService) {}

  @Get()
  async getAll() {
    return this.dpautService.findAll();
  }

  @Get('by/:id')
  async getOne(@Param('id') id: number) {
    return this.dpautService.findOne(id);
  }
  @Get('todos')
  async getAutorizaciones() {
    return this.dpautService.findAll();
  }

  @Get('pendientes')
  async getPendientes() {
    return await this.dpautService.findPending();
  }

  @Get('autorizadas')
  async getAutorizadas() {
    return await this.dpautService.findAuthorized();
  }

  @Post()
  async create(@Body() body: DpautInterface) {
    return this.dpautService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: Partial<DpautInterface>) {
    return this.dpautService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.dpautService.delete(id);
  }

  @Get('status/:status')
  async getByStatus(@Param('status') status: number) {
    console.log('AQUI B');
    return this.dpautService.findByStatus(status);
  }
}
