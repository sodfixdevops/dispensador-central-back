import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AduserEntity } from './adusr.entity';
import { LoginUserDto, LoginUserResponseDTO, UserDto } from './user.interface';

import { UsrInfoService } from './usrinfo.service';
import { UsrInfoDto } from './usrinfo.interface';
import { DispositivosService } from 'src/dispositivos/dispositivo.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(AduserEntity)
    private readonly userRepository: Repository<AduserEntity>,
    private readonly usrInfoService: UsrInfoService,
    private readonly addispService: DispositivosService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // CRUD → ADUSER
  // =========================
  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { adusrmrcb: 0 },
    });
    return users.map((u) => this.toDto(u));
  }

  async findAllAdicionales(): Promise<UsrInfoDto[]> {
    return this.usrInfoService.findAll();
  }

  async findOne(codigoUsuario: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { adusrusrn: codigoUsuario },
    });
    return this.toDto(user);
  }

  async create(userDto: UserDto, queryRunner?: QueryRunner): Promise<UserDto> {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(AduserEntity)
      : this.userRepository;

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const newUser = repo.create({
      adusrusrn: userDto.codigoUsuario,
      adusrnick: userDto.nickUsuario,
      adusrclav: hashedPassword,
      adusrtipo: userDto.tipo,
      adusrstat: userDto.estado,
      adusrmrcb: userDto.marcaBaja,
    });

    const saved = await repo.save(newUser);

    await this.usrInfoService.create({
      codigoUsuario: saved.adusrusrn,
      nombre: saved.adusrnick,
      nroCaja: 0,
      perfil: 0,
    });

    return this.toDto(saved);
  }

  async update(codigoUsuario: string, userDto: UserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { adusrusrn: codigoUsuario },
    });

    if (!user) return null;

    if (userDto.password) {
      user.adusrclav = await bcrypt.hash(userDto.password, 10);
    }

    user.adusrnick = userDto.nickUsuario;
    user.adusrtipo = userDto.tipo;
    user.adusrstat = userDto.estado;
    user.adusrmrcb = userDto.marcaBaja;

    const saved = await this.userRepository.save(user);
    return this.toDto(saved);
  }

  async delete(codigoUsuario: string): Promise<void> {
    await this.userRepository.update(
      { adusrusrn: codigoUsuario },
      { adusrmrcb: 1 },
    );
  }

  // =========================
  // LOGIN → ADUSER
  // =========================
  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDTO> {
    const { username, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        adusrnick: username,
        adusrmrcb: 0,
        adusrstat: 1,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const ok = await bcrypt.compare(password, user.adusrclav);
    if (!ok) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const dispositivo = await this.addispService.findByUser(user.adusrusrn);

    const payload = {
      sub: user.adusrusrn,
      username: user.adusrnick,
      tipo: user.adusrtipo,
    };

    const token = this.jwtService.sign(payload);

    return {
      status: 200,
      username: user.adusrnick,
      tipo: user.adusrtipo,
      token,
      dispositivo: dispositivo
        ? {
            codigo: dispositivo.addispcode,
            descripcion: dispositivo.addispnomb,
            api_url: dispositivo.addipsapis,
          }
        : undefined,
    };
  }

  // =========================
  // MAPPERS
  // =========================
  private toDto(entity: AduserEntity): UserDto {
    return {
      codigoUsuario: entity.adusrusrn,
      nickUsuario: entity.adusrnick,
      password: entity.adusrclav,
      estado: entity.adusrstat,
      marcaBaja: entity.adusrmrcb,
      tipo: entity.adusrtipo,
      fechaRegistro: '',
    };
  }
}
