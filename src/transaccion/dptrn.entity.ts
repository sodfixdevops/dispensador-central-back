import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dptrn')
export class Dptrn {
  @PrimaryGeneratedColumn()
  dptrnntra: number;

  @Column({ type: 'int', nullable: true })
  dptrnndes: number;

  @Column({ type: 'int', nullable: false })
  dptrncmon: number;

  @Column({ type: 'datetime' })
  dptrnftra: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  dptrnimpo: number;

  @Column({ type: 'smallint' })
  dptrnmrcb: number;

  @Column({ type: 'smallint' })
  dptrnstat: number;

  @Column({ type: 'datetime' })
  dptrnfreg: Date;

  @Column({ type: 'char', length: 36 })
  dptrnusrn: string;
}
