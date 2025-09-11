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

  async findByStatus(status: number): Promise<Dpaut[]> {
    return await this.dpautRepository.find({
      where: { dpautStat: status },
      order: { dpautFsol: 'DESC' },
    });
  }

  // Métodos auxiliares semánticos
  async findPending(): Promise<Dpaut[]> {
    return this.findByStatus(1);
  }

  async findAuthorized(): Promise<Dpaut[]> {
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
