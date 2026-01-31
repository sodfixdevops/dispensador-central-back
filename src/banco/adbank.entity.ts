import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('adbank')
export class AdbankEntity {
  @PrimaryGeneratedColumn({ name: 'adbankseri', type: 'int' })
  adbankseri: number;

  @Column({ name: 'adbankusrn', type: 'varchar', length: 36, nullable: true })
  adbankusrn?: string;

  @Column({ name: 'adbankncta', type: 'varchar', length: 20, nullable: true })
  adbankncta?: string;

  @Column({ name: 'adbanktipo', type: 'varchar', length: 20, nullable: true })
  adbanktipo?: string;

  @Column({ name: 'adbankmone', type: 'varchar', length: 20, nullable: true })
  adbankmone?: string;

  @Column({ name: 'adbankfreg', type: 'datetime' })
  adbankfreg: Date;

  @Column({ name: 'adbankmrcb', type: 'smallint' })
  adbankmrcb: number;
}
