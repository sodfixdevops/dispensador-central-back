// src/dispositivos/entities/dispositivo.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addisp')
export class DispositivoEntity {
  @PrimaryGeneratedColumn()
  addispcode: number;

  @Column({ length: 70 })
  addispnomb: string;

  @Column({ length: 36 })
  addispusrn: string;

  @Column({ length: 70 })
  addipsapis: string;

  @Column({ length: 70 })
  addispsrl1: string;

  @Column({ length: 70 })
  addispsrl2: string;

  @Column()
  addispmrcb: number;

  @Column()
  addispstat: number;

  @Column({ type: 'date' })
  addispfreg: Date;

  @Column({ type: 'date', nullable: true })
  addispfupt?: Date;

  @Column({ length: 36, nullable: true })
  addispusra?: string;

  @Column({ length: 36, nullable: true })
  addispusru?: string;
}
