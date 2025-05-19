import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('tr_ticket')
export class TicketEntity {
  @PrimaryColumn({ name: 'ticket_idtk', length: 30 })
  ticket_idtk: string;

  @Column({ name: 'ticket_serv', type: 'smallint', nullable: true })
  ticket_serv: number;

  @Column({ name: 'ticket_sbsr', type: 'smallint', nullable: true })
  ticket_sbsr: number;

  @Column({ name: 'ticket_pref', type: 'smallint', nullable: true })
  ticket_pref: number;

  @Column({ name: 'ticket_rqst', type: 'time', nullable: true })
  ticket_rqst: string;

  @Column({ name: 'ticket_srvs', type: 'time', nullable: true })
  ticket_srvs: string;

  @Column({ name: 'ticket_sqos', type: 'time', nullable: true })
  ticket_sqos: string;

  @Column({ name: 'ticket_fech', type: 'date', nullable: true })
  ticket_fech: Date;

  @Column({ name: 'ticket_stat', type: 'smallint', nullable: true })
  ticket_stat: number;

  @Column({ name: 'ticket_mrcb', type: 'smallint', nullable: true })
  ticket_mrcb: number;

  @Column({ name: 'ticket_nrcj', type: 'integer', nullable: true })
  ticket_nrcj: number;

  @Column({ name: 'ticket_usrn', length: 36, nullable: true })
  ticket_usrn: string;

  @Column({ name: 'ticket_plza', type: 'smallint', nullable: true })
  ticket_plza: number;

  @Column({ name: 'ticket_agen', type: 'smallint', nullable: true })
  ticket_agen: number;

  @Column({ name: 'ticket_etqt', length: 20, nullable: true })
  ticket_etqt: string;

  @Column({ name: 'ticket_prio', type: 'integer', nullable: true })
  ticket_prio: number;

  @Column({ name: 'ticket_posi', type: 'integer', nullable: true })
  ticket_posi: number;
}
