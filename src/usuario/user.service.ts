import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { LoginUserDto, LoginUserResponseDTO, UserDto } from './user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsrInfoEntity } from './usrinfo.entity';
import { UsrInfoService } from './usrinfo.service';
import { UsrInfoDto } from './usrinfo.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly usrInfoService: UsrInfoService,
    private readonly jwtService: JwtService, // Servicio JWT
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.toDto(user));
  }

  async findAllAdicionales(): Promise<UsrInfoDto[]> {
    const adicionales = await this.usrInfoService.findAll();
    return adicionales;
  }

  async findOne(codigoUsuario: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { userusrn: codigoUsuario },
    });
    return this.toDto(user);
  }

  async create(userDto: UserDto, queryRunner?: QueryRunner): Promise<UserDto> {
    const userRepo = queryRunner
      ? queryRunner.manager.getRepository(UserEntity)
      : this.userRepository;
    const saltRounds = 10;

    // Encriptar la contraseña
    //console.log('clave : ' + userDto.password);
    const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

    // Crear entidad con la fecha de registro y contraseña encriptada
    const newUser = userRepo.create({
      ...this.toEntity(userDto),
      userpass: hashedPassword,
      userfreg: new Date(), // Asigna automáticamente la fecha actual
      usertipo: userDto.tipo,
      usermrcb: userDto.marcaBaja,
      userstat: userDto.estado,
    });

    const savedUser = await this.userRepository.save(newUser);
    const usrinfoData: UsrInfoDto = {
      codigoUsuario: savedUser.userusrn,
      nombre: savedUser.usernick,
      nroCaja: 0,
      perfil: 0,
    };
    const newUsrInfo = this.usrInfoService.create(usrinfoData);

    return this.toDto(savedUser);
  }

  async update(codigoUsuario: string, userDto: UserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { userusrn: codigoUsuario },
    });
    if (user) {
      const updatedUser = this.userRepository.merge(
        user,
        this.toEntity(userDto),
      );
      const result = await this.userRepository.save(updatedUser);
      return this.toDto(result);
    }
    return null;
  }

  async delete(codigoUsuario: string): Promise<void> {
    await this.userRepository.delete({ userusrn: codigoUsuario });
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDTO> {
    try {
      const { username, password } = loginUserDto;
      let user = null;

      user = await this.userRepository.findOne({
        where: [{ usernick: username }],
      });

      if (!user || !(await bcrypt.compare(password, user.userpass))) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      // Generar token JWT
      const payload = { username: user.usernick };
      const token = this.jwtService.sign(payload);
      return {
        status: 200,
        username: user.usernick,
        tipo: user.tipo,
        token: token,
      }; // Devolver el token JWT
    } catch (error) {
      return {
        status: 401,
        message: error.message,
      };
    }
  }

  // Métodos de conversión
  private toDto(entity: UserEntity): UserDto {
    const formattedDate = this.formatDate(entity.userfreg);
    return {
      codigoUsuario: entity.userusrn,
      nickUsuario: entity.usernick,
      password: entity.userpass,
      fechaRegistro: formattedDate,
      marcaBaja: entity.usermrcb,
      estado: entity.userstat,
      tipo: entity.usertipo,
    };
  }

  private toEntity(dto: UserDto): UserEntity {
    return {
      userusrn: dto.codigoUsuario,
      usernick: dto.nickUsuario,
      userpass: dto.password,
      userfreg: new Date(dto.fechaRegistro),
      usermrcb: dto.marcaBaja,
      userstat: dto.estado,
      usertipo: dto.tipo,
    };
  }

  private formatDate(date: any): string {
    // Verifica si la fecha es un string, y si es así, convierte a un objeto Date
    const d = new Date(date);

    // Verifica si la conversión fue exitosa
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date format');
    }

    const day = String(d.getDate()).padStart(2, '0'); // Añade un 0 si el día es menor de 10
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript comienzan en 0
    const year = d.getFullYear();

    return `${day}/${month}/${year}`; // Retorna la fecha en formato DD/MM/YYYY
  }
}
