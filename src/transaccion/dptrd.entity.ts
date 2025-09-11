import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dptrd')
export class Dptrd {
  @PrimaryGeneratedColumn()
  dptrdseri: number;

  @Column()
  dptrdntra: number;

  @Column()
  dptrnitem: number;

  @Column()
  dptrdvlor: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  dptrdcant: number;

  @Column()
  dptrdimpo: number;
}
