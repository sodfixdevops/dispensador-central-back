import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AduserController } from './adusr.controller';
import { AduserEntity } from './adusr.entity';
import { AduserService } from './adusr.service';
import { JwtModule } from '@nestjs/jwt';
import { DispositivosModule } from 'src/dispositivos/disposito.module';
import { DispositivosService } from 'src/dispositivos/dispositivo.service';
import { DispositivoEntity } from 'src/dispositivos/dispositivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AduserEntity, DispositivoEntity]),
    JwtModule.register({
      secret: 'B0m3sc02024',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [AduserController],
  providers: [AduserService, DispositivosService],
  exports: [AduserService],
})
export class AduserModule {}
