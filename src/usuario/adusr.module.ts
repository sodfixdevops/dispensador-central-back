import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AduserAliasController, AduserController } from './adusr.controller';
import { AduserEntity } from './adusr.entity';
import { AdusrdEntity } from './adusrd.entity';
import { AduserService } from './adusr.service';
import { JwtModule } from '@nestjs/jwt';
import { DispositivoEntity } from 'src/dispositivos/dispositivo.entity';
import { Liacs } from 'src/liacs/liacs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AduserEntity,
      AdusrdEntity,
      DispositivoEntity,
      Liacs,
    ]),
    JwtModule.register({
      secret: 'B0m3sc02024',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [AduserController, AduserAliasController],
  providers: [AduserService],
  exports: [AduserService],
})
export class AduserModule {}
