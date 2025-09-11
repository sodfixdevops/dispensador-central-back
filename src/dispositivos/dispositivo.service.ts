import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DispositivoEntity } from './dispositivo.entity';
import { Repository } from 'typeorm';
import { DispositivoCreateDto, DispositivoDto } from './dispositivo.interface';

@Injectable()
export class DispositivosService {
  constructor(
    @InjectRepository(DispositivoEntity)
    private readonly repo: Repository<DispositivoEntity>,
  ) {}

  async findAll(): Promise<DispositivoDto[]> {
    const data = await this.repo
      .createQueryBuilder('d')
      .leftJoin('aduser', 'u', 'u.adusrusrn = d.addispusrn')
      .select([
        'd.addispcode',
        'd.addispnomb',
        'd.addispusrn',
        'd.addipsapis',
        'd.addispsrl1',
        'd.addispsrl2',
        'd.addispmrcb',
        'd.addispstat',
        'd.addispfreg',
        'd.addispfupt',
        'd.addispusra',
        'd.addispusru',
        'u.adusrnick AS nomUsuario',
      ])
      .where('d.addispmrcb = 0')
      .orderBy('d.addispcode', 'DESC')
      .getRawMany();

    // Mapeo limpio para cumplir con la interface sin prefijos
    return data.map((item: any) => ({
      addispcode: item.d_addispcode,
      addispnomb: item.d_addispnomb,
      addispusrn: item.d_addispusrn,
      addipsapis: item.d_addipsapis,
      addispsrl1: item.d_addispsrl1,
      addispsrl2: item.d_addispsrl2,
      addispmrcb: item.d_addispmrcb,
      addispstat: item.d_addispstat,
      addispfreg: item.d_addispfreg,
      addispfupt: item.d_addispfupt,
      addispusra: item.d_addispusra,
      addispusru: item.d_addispusru,
      nomUsuario: item.nomUsuario,
    }));
  }

  async findOne(id: number): Promise<DispositivoEntity | null> {
    return this.repo.findOneBy({ addispcode: id });
  }

  async findByUser(userId: string): Promise<DispositivoEntity | null> {
    return await this.repo.findOne({
      where: {
        addispusrn: userId,
        addispmrcb: 0, // solo activos, si aplica
      },
    });
  }

  async findById(id: number): Promise<DispositivoEntity> {
    const dispositivo = await this.repo.findOne({ where: { addispcode: id } });
    if (!dispositivo) {
      throw new NotFoundException(`Dispositivo con código ${id} no encontrado`);
    }
    return dispositivo;
  }

  async create(data: DispositivoCreateDto): Promise<DispositivoEntity> {
    return this.repo.save({ ...data, addispfreg: new Date() });
  }

  async update(
    id: number,
    data: DispositivoCreateDto,
  ): Promise<DispositivoEntity> {
    await this.repo.update(id, { ...data, addispfupt: new Date() });
    return this.repo.findOneBy({ addispcode: id });
  }

  async delete(id: number): Promise<void> {
    await this.repo.update(id, { addispmrcb: 1 });
  }
}
