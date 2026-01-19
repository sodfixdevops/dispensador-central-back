import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('aduser')
export class AduserEntity {
  @PrimaryColumn({ name: 'adusrusrn', type: 'varchar', length: 36 })
  adusrusrn: string;

  @Column({ name: 'adusrnick', type: 'varchar', length: 50 })
  adusrnick: string;

  @Column({ name: 'adusrclav', type: 'varchar', length: 80 })
  adusrclav: string;

  @Column({ name: 'adusrtipo', type: 'smallint' })
  adusrtipo: number;

  @Column({ name: 'adusrfreg', type: 'datetime' })
  adusrfreg: Date;

  @Column({ name: 'adusrusra', type: 'varchar', length: 36 })
  adusrusra: string;

  @Column({ name: 'adusrfupt', type: 'datetime', nullable: true })
  adusrfupt: Date;

  @Column({ name: 'adusrusru', type: 'varchar', length: 36, nullable: true })
  adusrusru: string;

  @Column({ name: 'adusrmrcb', type: 'smallint', default: 0 })
  adusrmrcb: number;

  @Column({ name: 'adusrstat', type: 'smallint', default: 1 })
  adusrstat: number;
}
