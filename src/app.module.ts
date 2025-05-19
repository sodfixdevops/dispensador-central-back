import { DperfModule } from './detalleperfil/dperf.module';
import { PfageModule } from './perfiles/pfage.module';
import { TrconModule } from './conceptos/trcon.module';
import { UserModule } from './usuario/user.module';
import { ServModule } from './servicios/serv.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AgenModule } from './agencia/agen.module';
import * as dotenv from 'dotenv';
import { TicketModule } from './ticket/ticket.module';
dotenv.config();

@Module({
  imports: [
    TicketModule,
    DperfModule,
    DperfModule,
    PfageModule,
    TrconModule,
    AgenModule,
    ServModule,
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
