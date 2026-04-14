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
import { Liacs } from 'src/liacs/liacs.entity';
import { AdusrdEntity } from './adusrd.entity';

@Injectable()
export class AduserService {
  private static readonly ACTIVE_MRCB = 0;
  private static readonly CLOSED_MRCB = 9;

  constructor(
    @InjectRepository(AduserEntity)
    private readonly aduserRepo: Repository<AduserEntity>,
    @InjectRepository(AdusrdEntity)
    private readonly adusrdRepo: Repository<AdusrdEntity>,
    @InjectRepository(Liacs)
    private readonly liacsRepo: Repository<Liacs>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  private getClientIp(rawIp?: string): string {
    if (!rawIp) return '0.0.0.0';
    const normalized = rawIp
      .replace('::ffff:', '')
      .split(',')[0]
      .trim()
      .slice(0, 20);
    return normalized || '0.0.0.0';
  }

  private getInactivityCutoff(now: Date): Date {
    const inactivityMinutes = Number(
      process.env.LIACS_INACTIVITY_MINUTES ?? 5,
    );
    const safeMinutes =
      Number.isFinite(inactivityMinutes) && inactivityMinutes > 0
        ? inactivityMinutes
        : 5;
    return new Date(now.getTime() - safeMinutes * 60_000);
  }

  private async setDeviceAssignment(
    queryRunner: QueryRunner,
    userId: string,
    deviceCode?: number | null,
  ): Promise<void> {
    const adusrdRepo = queryRunner.manager.getRepository(AdusrdEntity);
    const dispRepo = queryRunner.manager.getRepository(DispositivoEntity);

    await adusrdRepo.update({ adusrdusrn: userId, adusrdmrcb: 0 }, { adusrdmrcb: 9 });

    if (!deviceCode || deviceCode <= 0) return;

    const dispositivo = await dispRepo.findOneBy({ addispcode: deviceCode });
    if (!dispositivo) {
      throw new NotFoundException('Dispositivo no encontrado');
    }
    if (dispositivo.addispmrcb !== 0 || dispositivo.addispstat === 9) {
      throw new BadRequestException('Dispositivo no disponible para asignaciÃ³n');
    }

    const existente = await adusrdRepo.findOneBy({
      adusrdusrn: userId,
      adusrddisp: deviceCode,
    });

    if (existente) {
      existente.adusrdmrcb = 0;
      await adusrdRepo.save(existente);
    } else {
      await adusrdRepo.save(
        adusrdRepo.create({
          adusrdusrn: userId,
          adusrddisp: deviceCode,
          adusrdmrcb: 0,
        }),
      );
    }
  }

  private async findAssignedDeviceByUserId(
    userId: string,
  ): Promise<DispositivoEntity | null> {
    const rows = await this.adusrdRepo
      .createQueryBuilder('r')
      .innerJoin(
        DispositivoEntity,
        'd',
        'd.addispcode = r.adusrddisp AND d.addispmrcb = 0',
      )
      .select([
        'd.addispcode AS addispcode',
        'd.addispnomb AS addispnomb',
        'd.addispusrn AS addispusrn',
        'd.addipsapis AS addipsapis',
        'd.addispsrl1 AS addispsrl1',
        'd.addispsrl2 AS addispsrl2',
        'd.addispmrcb AS addispmrcb',
        'd.addispstat AS addispstat',
        'd.addispfreg AS addispfreg',
        'd.addispfupt AS addispfupt',
        'd.addispusra AS addispusra',
        'd.addispusru AS addispusru',
      ])
      .where('r.adusrdusrn = :userId', { userId })
      .andWhere('r.adusrdmrcb = 0')
      .orderBy('r.adusrdseri', 'DESC')
      .getRawMany();

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    const dispositivo = new DispositivoEntity();
    dispositivo.addispcode = row.addispcode;
    dispositivo.addispnomb = row.addispnomb;
    dispositivo.addispusrn = row.addispusrn;
    dispositivo.addipsapis = row.addipsapis;
    dispositivo.addispsrl1 = row.addispsrl1;
    dispositivo.addispsrl2 = row.addispsrl2;
    dispositivo.addispmrcb = row.addispmrcb;
    dispositivo.addispstat = row.addispstat;
    dispositivo.addispfreg = row.addispfreg;
    dispositivo.addispfupt = row.addispfupt;
    dispositivo.addispusra = row.addispusra;
    dispositivo.addispusru = row.addispusru;

    return dispositivo;
  }

  private async findAssignedDevicesByUserId(
    userId: string,
  ): Promise<DispositivoEntity[]> {
    const rows = await this.adusrdRepo
      .createQueryBuilder('r')
      .innerJoin(
        DispositivoEntity,
        'd',
        'd.addispcode = r.adusrddisp AND d.addispmrcb = 0',
      )
      .select([
        'd.addispcode AS addispcode',
        'd.addispnomb AS addispnomb',
        'd.addispusrn AS addispusrn',
        'd.addipsapis AS addipsapis',
        'd.addispsrl1 AS addispsrl1',
        'd.addispsrl2 AS addispsrl2',
        'd.addispmrcb AS addispmrcb',
        'd.addispstat AS addispstat',
        'd.addispfreg AS addispfreg',
        'd.addispfupt AS addispfupt',
        'd.addispusra AS addispusra',
        'd.addispusru AS addispusru',
      ])
      .where('r.adusrdusrn = :userId', { userId })
      .andWhere('r.adusrdmrcb = 0')
      .orderBy('r.adusrdseri', 'DESC')
      .getRawMany();

    return (rows || []).map((row: any) => {
      const dispositivo = new DispositivoEntity();
      dispositivo.addispcode = row.addispcode;
      dispositivo.addispnomb = row.addispnomb;
      dispositivo.addispusrn = row.addispusrn;
      dispositivo.addipsapis = row.addipsapis;
      dispositivo.addispsrl1 = row.addispsrl1;
      dispositivo.addispsrl2 = row.addispsrl2;
      dispositivo.addispmrcb = row.addispmrcb;
      dispositivo.addispstat = row.addispstat;
      dispositivo.addispfreg = row.addispfreg;
      dispositivo.addispfupt = row.addispfupt;
      dispositivo.addispusra = row.addispusra;
      dispositivo.addispusru = row.addispusru;
      return dispositivo;
    });
  }

  async create(
    dto: AduserCreateDto,
    queryRunner?: QueryRunner,
  ): Promise<AduserDto> {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(AduserEntity)
      : this.aduserRepo;

    const hashedPassword = await bcrypt.hash(dto.adusrclav, 10);
    const newUser = repo.create({
      adusrusrn: uuidv4(), // Genera UUID aquÃ­
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

      if (dto.addispcode && dto.addispcode > 0) {
        const dispositivo = await dispRepo.findOneBy({
          addispcode: dto.addispcode,
        });
        if (!dispositivo) {
          throw new NotFoundException('Dispositivo no encontrado');
        }
        if (dispositivo.addispmrcb !== 0 || dispositivo.addispstat === 9) {
          throw new BadRequestException('Dispositivo no disponible para asignación');
        }
      }

      const hashedPassword = await bcrypt.hash(dto.adusrclav, 10);
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

      await this.setDeviceAssignment(
        queryRunner,
        savedUser.adusrusrn,
        dto.addispcode ?? null,
      );

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
        AdusrdEntity,
        'r',
        'r.adusrdusrn = u.adusrusrn AND r.adusrdmrcb = 0',
      )
      .addSelect('r.adusrddisp', 'addispcode')
      .where('u.adusrusrn = :codigoUsuario', { codigoUsuario })
      .orderBy('r.adusrdseri', 'DESC')
      .getRawOne();

    return {
      adusrusrn: data.u_adusrusrn,
      adusrnick: data.u_adusrnick,
      adusrtipo: data.u_adusrtipo,
      adusrfreg: data.u_adusrfreg,
      adusrusra: data.u_adusrusra,
      adusrstat: data.u_adusrstat,
      adusrmrcb: data.u_adusrmrcb,
      addispcode: data.addispcode ?? undefined,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al actualizar usuario: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async bajaUsuario(id: string, adusrusru?: string): Promise<AduserDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(AduserEntity, {
        adusrusrn: id,
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      user.adusrmrcb = 9;
      user.adusrfupt = new Date();
      if (adusrusru) {
        user.adusrusru = adusrusru;
      }

      const saved = await queryRunner.manager.save(user);
      await queryRunner.manager
        .getRepository(AdusrdEntity)
        .update({ adusrdusrn: id, adusrdmrcb: 0 }, { adusrdmrcb: 9 });
      await queryRunner.commitTransaction();
      return this.toDto(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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

      const usuario = await aduserRepo.findOneBy({ adusrusrn: id });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      usuario.adusrtipo = dto.adusrtipo;
      usuario.adusrstat = dto.adusrstat;
      usuario.adusrusru = dto.adusrusra;
      usuario.adusrfupt = new Date();
      await aduserRepo.save(usuario);

      await this.setDeviceAssignment(queryRunner, id, dto.addispcode ?? null);

      await queryRunner.commitTransaction();
      return this.toDto(usuario);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(
    loginUserDto: LoginUserDto,
    clientIp?: string,
  ): Promise<LoginUserResponseDTO> {
    try {
      const { username, password } = loginUserDto;
      const user = await this.aduserRepo.findOne({
        where: { adusrnick: username, adusrmrcb: 0, adusrstat: 1 },
      });

      if (!user || !(await bcrypt.compare(password, user.adusrclav))) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      const dispositivosAsignados = await this.findAssignedDevicesByUserId(
        user.adusrusrn,
      );
      const dispositivo =
        dispositivosAsignados.length > 0 ? dispositivosAsignados[0] : null;
      const now = new Date();
      const cutoff = this.getInactivityCutoff(now);

      const sesionesActivas = await this.liacsRepo.find({
        where: {
          liacsUsrn: user.adusrusrn,
          liacsMrcb: AduserService.ACTIVE_MRCB,
        },
        order: { liacsSeri: 'DESC' },
      });

      const sesionVigente = sesionesActivas.find((s) => {
        const ultimaActividad = s.liacsUact || s.liacsFreg;
        return !!ultimaActividad && ultimaActividad >= cutoff;
      });

      if (sesionVigente) {
        return {
          status: 409,
          message:
            'El usuario ya tiene una sesion activa. Cierre sesion en el otro equipo o espere a su expiracion.',
        };
      }

      if (sesionesActivas.length > 0) {
        for (const s of sesionesActivas) {
          s.liacsMrcb = AduserService.CLOSED_MRCB;
          s.liacsFult = now;
        }
        await this.liacsRepo.save(sesionesActivas);
      }

      const nuevaSesion = this.liacsRepo.create({
        liacsUsrn: user.adusrusrn,
        liacsDisp: dispositivo?.addispcode ?? 0,
        liacsNrip: this.getClientIp(clientIp),
        liacsMrcb: AduserService.ACTIVE_MRCB,
        liacsFreg: now,
        liacsUact: now,
        liacsFult: null,
      });
      const savedSession = await this.liacsRepo.save(nuevaSesion);

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
        dispositivos: dispositivosAsignados.map((d) => ({
          codigo: d.addispcode,
          descripcion: d.addispnomb,
          api_url: d.addipsapis,
        })),
        liacsseri: savedSession.liacsSeri,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 401,
        message,
      };
    }
  }

  async heartbeatSession(liacsseri: number | undefined, userId: string): Promise<{
    success: boolean;
    active: boolean;
    mrcb?: number;
    liacsseri?: number;
    message?: string;
  }> {
    let sesion: Liacs | null = null;
    if (liacsseri) {
      sesion = await this.liacsRepo.findOne({
        where: { liacsSeri: liacsseri, liacsUsrn: userId },
      });
    }

    if (!sesion) {
      sesion = await this.liacsRepo.findOne({
        where: { liacsUsrn: userId, liacsMrcb: AduserService.ACTIVE_MRCB },
        order: { liacsSeri: 'DESC' },
      });
    }

    if (!sesion) {
      return {
        success: false,
        active: false,
        message: 'Sesion no encontrada.',
      };
    }

    if (sesion.liacsMrcb === AduserService.CLOSED_MRCB) {
      return {
        success: true,
        active: false,
        mrcb: sesion.liacsMrcb,
        liacsseri: sesion.liacsSeri,
      };
    }

    sesion.liacsUact = new Date();
    await this.liacsRepo.save(sesion);
    return {
      success: true,
      active: true,
      mrcb: sesion.liacsMrcb,
      liacsseri: sesion.liacsSeri,
    };
  }

  async logoutSession(liacsseri: number | undefined, userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    let sesion: Liacs | null = null;
    if (liacsseri) {
      sesion = await this.liacsRepo.findOne({
        where: { liacsSeri: liacsseri, liacsUsrn: userId },
      });
    }

    if (!sesion) {
      sesion = await this.liacsRepo.findOne({
        where: { liacsUsrn: userId, liacsMrcb: AduserService.ACTIVE_MRCB },
        order: { liacsSeri: 'DESC' },
      });
    }

    if (!sesion) {
      return { success: true, message: 'No habia sesion activa para cerrar.' };
    }

    sesion.liacsMrcb = AduserService.CLOSED_MRCB;
    sesion.liacsFult = new Date();
    sesion.liacsUact = new Date();
    await this.liacsRepo.save(sesion);

    return { success: true, message: 'Sesion cerrada correctamente.' };
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







