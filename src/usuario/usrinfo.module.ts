import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controllers';
import { UsrInfoEntity } from './usrinfo.entity';
import { UsrInfoService } from './usrinfo.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsrInfoEntity])],
  controllers: [],
  providers: [UsrInfoService],
  exports: [UsrInfoService],
})
export class UserModule {}
