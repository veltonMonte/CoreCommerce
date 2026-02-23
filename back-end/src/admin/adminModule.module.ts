import { Module } from '@nestjs/common';
import { AdminControlle } from './adminController.controller';
import { AdminService } from './adminService.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AdminControlle],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}