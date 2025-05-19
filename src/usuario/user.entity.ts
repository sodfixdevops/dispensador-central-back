import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tr_user')
export class UserEntity {
  @PrimaryColumn({ name: 'userusrn', type: 'char', length: 36 })
  userusrn: string;

  @Column({ name: 'usernick', type: 'char', length: 50 })
  usernick: string;

  @Column({ name: 'userpass', type: 'char', length: 80 })
  userpass: string;

  @Column({ name: 'userfreg', type: 'date' })
  userfreg: Date;

  @Column({ name: 'usermrcb', type: 'smallint', default: 0 })
  usermrcb: number;

  @Column({ name: 'userstat', type: 'smallint', default: 1 })
  userstat: number;

  @Column({ name: 'usertipo', type: 'smallint' })
  usertipo: number;
}
