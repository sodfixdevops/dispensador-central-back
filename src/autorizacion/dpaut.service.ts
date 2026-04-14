import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dpaut } from './dpaut.entity';
import { DpautInterface } from './dpaut.interface';

@Injectable()
export class DpautService {
  constructor(
    @InjectRepository(Dpaut)
    private readonly dpautRepository: Repository<Dpaut>,
  ) {}

  async findAll(): Promise<Dpaut[]> {
    return this.dpautRepository.find();
  }

  async findOne(id: number): Promise<Dpaut | null> {
    return this.dpautRepository.findOne({ where: { dpautSeri: id } });
  }

  async findByStatus(status: number): Promise<DpautInterface[]> {
    const rows = await this.dpautRepository
      .createQueryBuilder('dpaut')
      .leftJoin('aduser', 'adusr', 'adusr.adusrusrn = dpaut.dpautUsrs')
      .select('dpaut.dpautSeri', 'dpautSeri')
      .addSelect('dpaut.dpautFsol', 'dpautFsol')
      .addSelect('dpaut.dpautNdes', 'dpautNdes')
      .addSelect('dpaut.dpautUsrs', 'dpautUsrs')
      .addSelect('adusr.adusrnick', 'dpautUsrsNick')
      .addSelect('dpaut.dpautUsra', 'dpautUsra')
      .addSelect('dpaut.dpautFaut', 'dpautFaut')
      .addSelect('dpaut.dpautStat', 'dpautStat')
      .where('dpaut.dpautStat = :status', { status })
      .orderBy('dpaut.dpautFsol', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      dpautSeri: r.dpautSeri,
      dpautFsol: r.dpautFsol,
      dpautNdes: r.dpautNdes,
      dpautUsrs: r.dpautUsrs,
      dpautUsrsNick: r.dpautUsrsNick || r.dpautUsrs,
      dpautUsra: r.dpautUsra,
      dpautFaut: r.dpautFaut,
      dpautStat: r.dpautStat,
    }));
  }

  // Métodos auxiliares semánticos
  async findPending(): Promise<DpautInterface[]> {
    return this.findByStatus(1);
  }

  async findAuthorized(): Promise<DpautInterface[]> {
    return this.findByStatus(2);
  }

  async create(data: DpautInterface): Promise<Dpaut> {
    const newRecord = this.dpautRepository.create(data);
    return this.dpautRepository.save(newRecord);
  }

  async update(id: number, data: Partial<DpautInterface>): Promise<Dpaut> {
    await this.dpautRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.dpautRepository.delete(id);
  }
}
