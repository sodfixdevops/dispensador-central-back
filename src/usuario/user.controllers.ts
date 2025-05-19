import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserDto, LoginUserResponseDTO, UserDto } from './user.interface';
import { UsrInfoDto } from './usrinfo.interface';

@Controller('usuarios')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserDto[]> {
    return await this.userService.findAll();
  }

  @Get('adicionales')
  async findAllAdicionales(): Promise<UsrInfoDto[]> {
    return await this.userService.findAllAdicionales();
  }

  @Get(':codigoUsuario')
  async findOne(
    @Param('codigoUsuario') codigoUsuario: string,
  ): Promise<UserDto> {
    return await this.userService.findOne(codigoUsuario);
  }

  @Post('create')
  async create(@Body() userDto: UserDto): Promise<UserDto> {
    return await this.userService.create(userDto);
  }

  @Put(':codigoUsuario')
  async update(
    @Param('codigoUsuario') codigoUsuario: string,
    @Body() userDto: UserDto,
  ): Promise<UserDto> {
    return await this.userService.update(codigoUsuario, userDto);
  }

  @Delete(':codigoUsuario')
  async delete(@Param('codigoUsuario') codigoUsuario: string): Promise<void> {
    await this.userService.delete(codigoUsuario);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoginUserResponseDTO> {
    const resp = await this.userService.login(loginUserDto);
    return resp;
  }
}
