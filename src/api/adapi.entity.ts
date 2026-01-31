import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('adapi')
export class AdapiEntity {
  @PrimaryGeneratedColumn({ name: 'adapiseri', type: 'int' })
  adapiseri: number;

  @Column({ name: 'adapicurl', type: 'varchar', length: 100 })
  adapicurl: string;

  @Column({ name: 'adapiresp', type: 'varchar', length: 10, nullable: true })
  adapiresp?: string;

  @Column({ name: 'adapifreg', type: 'datetime' })
  adapifreg: Date;

  @Column({ name: 'adapifupt', type: 'datetime' })
  adapifupt: Date;

  @Column({ name: 'adapiobse', type: 'varchar', length: 500, nullable: true })
  adapiobse?: string;

  @Column({ name: 'adapistat', type: 'smallint' })
  adapistat: number;
}
