import { Controller, Post, Get, Put, Param, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AduserService } from './adusr.service';
import {
  AduserCreateDto,
  AduserCrudDto,
  AduserDto,
  LoginUserDto,
  SessionHeartbeatDto,
  SessionLogoutDto,
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
    console.log('AQIOOOO');
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

  @Put('baja/:id')
  bajaUsuario(@Param('id') id: string, @Body() dto: Partial<AduserCreateDto>) {
    console.warn(`Solicitud de baja recibida en /aduser/baja/${id}`);
    return this.aduserService.bajaUsuario(id, dto?.adusrusru);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      typeof forwarded === 'string'
        ? forwarded
        : Array.isArray(forwarded)
          ? forwarded[0]
          : req.ip;
    return this.aduserService.login(dto, clientIp);
  }

  @Post('session/heartbeat')
  heartbeat(@Body() dto: SessionHeartbeatDto) {
    return this.aduserService.heartbeatSession(dto.liacsseri, dto.userId);
  }

  @Post('session/logout')
  logoutSession(@Body() dto: SessionLogoutDto) {
    return this.aduserService.logoutSession(dto.liacsseri, dto.userId);
  }
}

@ApiTags('Usuarios')
@Controller('usuarios')
export class AduserAliasController {
  constructor(private readonly aduserService: AduserService) {}

  @Put('baja/:id')
  bajaUsuario(@Param('id') id: string, @Body() dto: Partial<AduserCreateDto>) {
    console.warn(`Solicitud de baja recibida en /usuarios/baja/${id}`);
    return this.aduserService.bajaUsuario(id, dto?.adusrusru);
  }
}
