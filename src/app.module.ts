import { UserModule } from './usuario/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import * as dotenv from 'dotenv';

import { GbconModule } from './conceptos/gbcon.module';
import { AduserModule } from './usuario/adusr.module';
import { DispositivosModule } from './dispositivos/disposito.module';
import { TransaccionModule } from './transaccion/transaccion.module';
import { DpautModule } from './autorizacion/dpaut.module';
import { DesembolsoModule } from './desembolso/desembolso.module';
dotenv.config();

@Module({
  imports: [
    GbconModule,
    AduserModule,
    DispositivosModule,
    TransaccionModule,
    DpautModule,
    DesembolsoModule,
    /*TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: false,
    }),*/
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dbType = process.env.DB_TYPE;

        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: false,
          };
        }

        if (dbType === 'mssql') {
          return {
            type: 'mssql',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 1433,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: false,
            options: {
              encrypt: process.env.DB_ENCRYPT === 'true',
              trustServerCertificate: true,
            },
          };
        }

        throw new Error(`DB_TYPE no soportado: ${dbType}`);
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
