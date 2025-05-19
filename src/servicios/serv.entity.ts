import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('tr_serv')
export class ServEntity {
  @PrimaryColumn({ name: 'servcode' })
  servcode: number;

  @Column({ name: 'servdesc', type: 'char', length: 50, nullable: true })
  servdesc?: string;

  @Column({ name: 'servsigl', type: 'char', length: 3, nullable: true })
  servsigl?: string;

  @Column({ name: 'servprio', type: 'smallint', nullable: true })
  servprio?: number;

  @Column({ name: 'servposi', type: 'smallint', nullable: true })
  servposi?: number;

  @Column({ name: 'servidsr', type: 'int', nullable: true })
  servidsr?: number;

  @Column({ name: 'servtipo', type: 'smallint', nullable: true })
  servtipo?: number;
}
