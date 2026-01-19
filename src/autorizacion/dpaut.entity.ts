import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dpaut')
export class Dpaut {
  @PrimaryGeneratedColumn({ name: 'dpautseri', type: 'int' })
  dpautSeri: number;

  @Column({ name: 'dpautfsol', type: 'datetime', nullable: true })
  dpautFsol: Date;

  @Column({ name: 'dpautndes', type: 'int', nullable: true })
  dpautNdes: number;

  @Column({ name: 'dpautusrs', type: 'varchar', length: 36, nullable: true })
  dpautUsrs: string;

  @Column({ name: 'dpautusra', type: 'varchar', length: 36, nullable: true })
  dpautUsra: string;

  @Column({ name: 'dpautfaut', type: 'datetime', nullable: true })
  dpautFaut: Date;

  @Column({ name: 'dpautstat', type: 'smallint' })
  dpautStat: number;
}
