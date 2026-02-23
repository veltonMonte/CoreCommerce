import { Body, Controller, Post, Req, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OrderService } from './order.service';
import { CheckoutDto } from './dto/checkoutDto.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderStatus } from '@prisma/client';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private orderService: OrderService) {} 

    @Post('checkout')
    checkout(
        @Req() req: any,
        @Body() dto: CheckoutDto
    ) {
        return this.orderService.checkout(req.user.id, dto);
    }

    @Get('me')
    findUserOrders(@Req() req: any) {
        return this.orderService.findUserOrders(req.user.id);
    }

    @Get(':id')
    findOne(
        @Req() req: any,
        @Param('id') id: string
    ) {
        return this.orderService.findOne(id, req.user.id);
    }

    @Patch(':id/cancel') 
    cancelOrder(
        @Req() req: any,
        @Param('id') id: string
    ) {
        return this.orderService.cancelOrder(id, req.user.id);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Get()
    findAll() {
        return this.orderService.findAll();
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: OrderStatus
    ) {
        return this.orderService.updateStatus(id, status);
    }

    

}
