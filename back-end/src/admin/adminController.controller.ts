import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { AdminService } from "./adminService.service";

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
    constructor(private adminService: AdminService) {}

    @Get('dashboard')
    getDashboard(){
        return this.adminService.getDashboardStats();
    }
}