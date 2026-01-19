import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dptrn')
export class Dptrn {
  @PrimaryGeneratedColumn({ name: 'dptrnntra', type: 'int' })
  dptrnntra: number;

  @Column({ name: 'dptrnndes', type: 'int', nullable: true })
  dptrnndes: number;

  @Column({ name: 'dptrncmon', type: 'int' })
  dptrncmon: number;

  @Column({ name: 'dptrnftra', type: 'datetime' })
  dptrnftra: Date;

  @Column({ name: 'dptrnimpo', type: 'decimal', precision: 14, scale: 2 })
  dptrnimpo: number;

  @Column({ name: 'dptrnmrcb', type: 'smallint' })
  dptrnmrcb: number;

  @Column({ name: 'dptrnstat', type: 'smallint' })
  dptrnstat: number;

  @Column({ name: 'dptrnfreg', type: 'datetime' })
  dptrnfreg: Date;

  @Column({ name: 'dptrnusrn', type: 'varchar', length: 36 })
  dptrnusrn: string;
}
