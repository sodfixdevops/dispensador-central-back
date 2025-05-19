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
import {
  mapToUsrInfoDto,
  mapToUsrInfoEntity,
  UsrInfoDto,
  UsrInfoResponseDto,
} from './usrinfo.interface';

@Injectable()
export class UsrInfoService {
  constructor(
    @InjectRepository(UsrInfoEntity)
    private readonly usrInfoRepository: Repository<UsrInfoEntity>,
  ) {}

  async findInfoUsuario(codigoUsuario: string): Promise<UsrInfoDto> {
    try {
      const info = await this.usrInfoRepository.findOneBy({
        usrinfousrn: codigoUsuario,
      });
      return mapToUsrInfoDto(info);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<UsrInfoDto[]> {
    const users = await this.usrInfoRepository.find();
    return users.map((user) => mapToUsrInfoDto(user));
  }

  async actualizarInfo(
    codigoUsuario: string,
    usrInfoDto: UsrInfoDto,
  ): Promise<UsrInfoResponseDto> {
    const info = this.findInfoUsuario(codigoUsuario);
    try {
      if (info) {
        const updatedInfo = await this.update(codigoUsuario, usrInfoDto);
      } else {
        await this.create(usrInfoDto);
      }
      return {
        codigo: 200,
        message: 'Se guardaron los cambios exitosamente',
      };
    } catch (error) {
      return {
        codigo: 400,
        message: error.message,
      };
    }
  }

  async create(usrInfoDto: UsrInfoDto): Promise<UsrInfoDto> {
    const infoEntity = this.usrInfoRepository.create(
      mapToUsrInfoEntity(usrInfoDto),
    );
    const savedEntity = await this.usrInfoRepository.save(infoEntity);
    return mapToUsrInfoDto(savedEntity);
  }

  async update(id: string, usrInfoDto: UsrInfoDto): Promise<UsrInfoDto> {
    await this.usrInfoRepository.update(
      { usrinfousrn: id },
      mapToUsrInfoEntity(usrInfoDto),
    );
    const updatedEntity = await this.usrInfoRepository.findOneBy({
      usrinfousrn: id,
    });
    return mapToUsrInfoDto(updatedEntity);
  }
}
