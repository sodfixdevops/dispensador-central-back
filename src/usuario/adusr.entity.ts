import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('aduser')
export class AduserEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  adusrusrn: string;

  @Column({ type: 'char', length: 50 })
  adusrnick: string;

  @Column({ type: 'char', length: 80 })
  adusrclav: string;

  @Column({ type: 'smallint' })
  adusrtipo: number;

  @Column({ type: 'datetime' })
  adusrfreg: Date;

  @Column({ type: 'char', length: 36 })
  adusrusra: string;

  @Column({ type: 'datetime', nullable: true })
  adusrfupt: Date;

  @Column({ type: 'char', length: 36, nullable: true })
  adusrusru: string;

  @Column({ type: 'smallint', default: 0 })
  adusrmrcb: number;

  @Column({ type: 'smallint', default: 1 })
  adusrstat: number;
}
