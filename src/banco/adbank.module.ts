import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdbankEntity } from './adbank.entity';
import { AdbankService } from './adbank.service';
import { AdbankController } from './adbank.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdbankEntity])],
  controllers: [AdbankController],
  providers: [AdbankService],
  exports: [AdbankService],
})
export class AdbankModule {}
