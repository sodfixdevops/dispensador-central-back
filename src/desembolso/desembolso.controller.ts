import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DesembolsoService } from './desembolso.service';
import { DesembolsoInterface } from './desembolso.interface';

@Controller('desembolso')
export class DesembolsoController {
  constructor(private readonly service: DesembolsoService) {}

  @Post()
  async create(@Body() body: DesembolsoInterface) {
    return this.service.create(body);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':dpdesndes')
  async findOne(@Param('dpdesndes') dpdesndes: string) {
    return this.service.findOne(+dpdesndes);
  }
}
