import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AduserEntity } from './adusr.entity';
import {
  AduserCreateDto,
  AduserCrudDto,
  AduserDto,
  LoginUserDto,
  LoginUserResponseDTO,
} from './adusr.interface';
import { JwtService } from '@nestjs/jwt';
import { DispositivoEntity } from 'src/dispositivos/dispositivo.entity';
import { DispositivosService } from 'src/dispositivos/dispositivo.service';

@Injectable()
export class AduserService {
  constructor(
    @InjectRepository(AduserEntity)
    private readonly aduserRepo: Repository<AduserEntity>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly dispositivoService: DispositivosService,
  ) {}

  async create(
    dto: AduserCreateDto,
    queryRunner?: QueryRunner,
  ): Promise<AduserDto> {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(AduserEntity)
      : this.aduserRepo;

    const hashedPassword = await bcrypt.hash(dto.adusrclav, 10);
    const newUser = repo.create({
      adusrusrn: uuidv4(), // Genera UUID aquí
      adusrnick: dto.adusrnick,
      adusrclav: hashedPassword,
      adusrtipo: dto.adusrtipo,
      adusrfreg: new Date(),
      adusrusra: dto.adusrusra,
      adusrstat: dto.adusrstat ?? 1,
      adusrmrcb: dto.adusrmrcb ?? 0,
    });

    const saved = await repo.save(newUser);
    return this.toDto(saved);
  }

  async createCuentaUsuario(dto: AduserCrudDto): Promise<AduserDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const aduserRepo = queryRunner.manager.getRepository(AduserEntity);
      const dispRepo = queryRunner.manager.getRepository(DispositivoEntity);

      // Validar dispositivo si viene código
      let dispositivo: DispositivoEntity | null = null;
      if (dto.addispcode) {
        dispositivo = await dispRepo.findOneBy({ addispcode: dto.addispcode });
        if (!dispositivo) {
          throw new NotFoundException('Dispositivo no encontrado');
        }
        if (dispositivo.addispstat !== 1) {
          throw new BadRequestException(
            'Dispositivo no disponible para asignación',
          );
        }
      }

      // Crear usuario
      const hashedPassword = await bcrypt.hash(dto.adusrnick, 10);
      const nuevoUsuario = aduserRepo.create({
        adusrusrn: uuidv4(),
        adusrnick: dto.adusrnick,
        adusrclav: hashedPassword,
        adusrtipo: dto.adusrtipo,
        adusrfreg: new Date(),
        adusrusra: dto.adusrusra,
        adusrstat: dto.adusrstat ?? 1,
        adusrmrcb: dto.adusrmrcb ?? 0,
      });
      const savedUser = await aduserRepo.save(nuevoUsuario);

      // Actualizar dispositivo si corresponde
      if (dispositivo) {
        dispositivo.addispusrn = savedUser.adusrusrn;
        dispositivo.addispstat = 2;
        dispositivo.addispfupt = new Date();
        await dispRepo.save(dispositivo);
      }

      await queryRunner.commitTransaction();
      return this.toDto(savedUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(): Promise<AduserDto[]> {
    const list = await this.aduserRepo.find({
      where: { adusrmrcb: 0 },
      order: { adusrnick: 'ASC' },
    });
    return list.map(this.toDto);
  }

  async getById(id: string): Promise<AduserDto | null> {
    const user = await this.aduserRepo.findOneBy({ adusrusrn: id });
    return user ? this.toDto(user) : null;
  }

  async findOne(codigoUsuario: string): Promise<AduserDto> {
    const data = await this.aduserRepo
      .createQueryBuilder('u')
      .leftJoin(
        'addisp',
        'd',
        'd.addispusrn = u.adusrusrn AND d.addispmrcb = 0',
      )
      .addSelect('d.addispcode', 'addispcode') // ← alias limpio solo para este
      .where('u.adusrusrn = :codigoUsuario', { codigoUsuario })
      .getRawOne();

    return {
      adusrusrn: data.u_adusrusrn,
      adusrnick: data.u_adusrnick,
      adusrtipo: data.u_adusrtipo,
      adusrfreg: data.u_adusrfreg,
      adusrusra: data.u_adusrusra,
      adusrstat: data.u_adusrstat,
      adusrmrcb: data.u_adusrmrcb,
      addispcode: data.addispcode ?? undefined, // ← alias limpio sin prefijo
    };
  }

  async update(id: string, dto: Partial<AduserCreateDto>): Promise<AduserDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(AduserEntity, {
        adusrusrn: id,
      });
      if (!user) throw new Error('Usuario no encontrado');

      if (dto.adusrclav) {
        user.adusrclav = await bcrypt.hash(dto.adusrclav, 10);
      }

      if (dto.adusrnick !== undefined) user.adusrnick = dto.adusrnick;
      if (dto.adusrtipo !== undefined) user.adusrtipo = dto.adusrtipo;
      if (dto.adusrusru !== undefined) user.adusrusru = dto.adusrusru;
      user.adusrfupt = new Date();
      if (dto.adusrstat !== undefined) user.adusrstat = dto.adusrstat;
      if (dto.adusrmrcb !== undefined) user.adusrmrcb = dto.adusrmrcb;

      const saved = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return this.toDto(saved);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al actualizar usuario: ${e.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async updateCuentaUsuario(
    id: string,
    dto: AduserCrudDto,
  ): Promise<AduserDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const aduserRepo = queryRunner.manager.getRepository(AduserEntity);
      const dispRepo = queryRunner.manager.getRepository(DispositivoEntity);

      // Verificar existencia del usuario
      const usuario = await aduserRepo.findOneBy({ adusrusrn: id });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Actualizar datos del usuario
      usuario.adusrtipo = dto.adusrtipo;
      usuario.adusrstat = dto.adusrstat;
      usuario.adusrusru = dto.adusrusra; // mismo campo que usra, para evitar otra propiedad
      usuario.adusrfupt = new Date();

      await aduserRepo.save(usuario);
      console.log('AQUI ???');
      // Si viene código de dispositivo, validar y asignar
      if (dto.addispcode) {
        const dispositivo = await dispRepo.findOneBy({
          addispcode: dto.addispcode,
        });
        if (!dispositivo) {
          throw new NotFoundException('Dispositivo no encontrado');
        }
        if (dispositivo.addispstat !== 1 && dispositivo.addispusrn !== id) {
          throw new BadRequestException('Dispositivo ya está asignado');
        }

        // Reasignar dispositivo
        dispositivo.addispusrn = id;
        dispositivo.addispstat = 2;
        dispositivo.addispfupt = new Date();
        dispositivo.addispusru = dto.adusrusra;
        console.log('GUARDANDO ' + dispositivo);
        await dispRepo.save(dispositivo);
      }

      await queryRunner.commitTransaction();
      return this.toDto(usuario);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDTO> {
    try {
      const { username, password } = loginUserDto;
      console.log('HACIENDO LOGIN ');
      console.log(JSON.stringify(loginUserDto, null, 2));
      const user = await this.aduserRepo.findOne({
        where: { adusrnick: username, adusrmrcb: 0, adusrstat: 1 },
      });

      if (!user || !(await bcrypt.compare(password, user.adusrclav))) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      // Buscar el dispositivo asignado, si lo hay
      const dispositivo = await this.dispositivoService.findByUser(
        user.adusrusrn,
      );

      return {
        status: 200,
        id: user.adusrusrn,
        username: user.adusrnick,
        tipo: user.adusrtipo,
        token: this.jwtService.sign({
          username: user.adusrnick,
          tipo: user.adusrtipo,
        }),
        dispositivo: dispositivo
          ? {
              codigo: dispositivo.addispcode,
              descripcion: dispositivo.addispnomb,
              api_url: dispositivo.addipsapis,
            }
          : null,
      };
    } catch (error) {
      return {
        status: 401,
        message: error.message,
      };
    }
  }

  private toDto(entity: AduserEntity): AduserDto {
    return {
      adusrusrn: entity.adusrusrn,
      adusrnick: entity.adusrnick,
      adusrtipo: entity.adusrtipo,
      adusrfreg: entity.adusrfreg,
      adusrusra: entity.adusrusra,
      adusrstat: entity.adusrstat,
      adusrmrcb: entity.adusrmrcb,
    };
  }
}
