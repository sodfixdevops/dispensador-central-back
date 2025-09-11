import { Controller, Post, Get, Put, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AduserService } from './adusr.service';
import {
  AduserCreateDto,
  AduserCrudDto,
  AduserDto,
  LoginUserDto,
} from './adusr.interface';

@ApiTags('Usuarios')
@Controller('aduser')
export class AduserController {
  constructor(private readonly aduserService: AduserService) {}

  @Post('registrar')
  create(@Body() dto: AduserCreateDto) {
    return this.aduserService.create(dto);
  }

  @Get()
  getAll() {
    return this.aduserService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.aduserService.findOne(id);
  }

  @Put('modificar/:id')
  update(@Param('id') id: string, @Body() dto: AduserCreateDto) {
    return this.aduserService.update(id, dto);
  }

  @Post('new')
  async createCuentaUsuario(@Body() dto: AduserCrudDto): Promise<AduserDto> {
    return this.aduserService.createCuentaUsuario(dto);
  }

  @Put('update/:id')
  async updateCuentaUsuario(
    @Param('id') id: string,
    @Body() dto: AduserCrudDto,
  ): Promise<AduserDto> {
    console.log('ESTOY ACA');
    return this.aduserService.updateCuentaUsuario(id, dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.aduserService.login(dto);
  }
}
