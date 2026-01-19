import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dptrd')
export class Dptrd {
  @PrimaryGeneratedColumn({ name: 'dptrdseri', type: 'int' })
  dptrdseri: number;

  @Column({ name: 'dptrdntra', type: 'int' })
  dptrdntra: number;

  @Column({ name: 'dptrnitem', type: 'int' })
  dptrnitem: number;

  @Column({ name: 'dptrdvlor', type: 'int' })
  dptrdvlor: number;

  @Column({ name: 'dptrdcant', type: 'int' })
  dptrdcant: number;

  @Column({ name: 'dptrdimpo', type: 'decimal', precision: 14, scale: 2 })
  dptrdimpo: number;
}
