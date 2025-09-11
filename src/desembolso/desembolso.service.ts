import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DesembolsoInterface } from './desembolso.interface';
import { Dpdes } from './desembolso.entity';

@Injectable()
export class DesembolsoService {
  constructor(
    @InjectRepository(Dpdes)
    private readonly repo: Repository<Dpdes>,
    private readonly dataSource: DataSource,
  ) {}

  // Método reutilizable dentro de cualquier flujo transaccional
  async crearDesembolsoTransaccional(
    data: DesembolsoInterface,
    manager: EntityManager = this.dataSource.manager,
  ): Promise<Dpdes> {
    const entity = this.repo.create(data);
    return await manager.save(entity);
  }

  // Método público que inicia su propia transacción
  async create(data: DesembolsoInterface): Promise<Dpdes> {
    return await this.dataSource.transaction(async (manager) => {
      return this.crearDesembolsoTransaccional(data, manager);
    });
  }

  async findAll(): Promise<Dpdes[]> {
    return await this.repo.find();
  }

  async findOne(dpdesndes: number): Promise<Dpdes | null> {
    return await this.repo.findOne({ where: { dpdesndes } });
  }
}
