import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controllers';
import { UsrInfoService } from './usrinfo.service';
import { UsrInfoEntity } from './usrinfo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UsrInfoEntity]),
    JwtModule.register({
      secret: 'B0m3sc02024',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UsrInfoService],
  exports: [UserService, JwtModule],
})
export class UserModule {}
