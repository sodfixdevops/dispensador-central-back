import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { LiacsService } from './liacs.service';
import { LiacsCreateDto } from './liacs.interface';

@Controller('liacs')
export class LiacsController {
  constructor(private readonly servicio: LiacsService) {}

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.servicio.findOne(id);
  }

  @Post()
  create(@Body() data: LiacsCreateDto) {
    return this.servicio.create(data);
  }

  @Patch(':id/activity')
  refreshActivity(@Param('id') id: number) {
    return this.servicio.updateActivity(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.servicio.delete(id);
  }
}
