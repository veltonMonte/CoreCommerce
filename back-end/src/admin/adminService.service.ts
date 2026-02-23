import { Injectable } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) {}

    async getDashboardStats() {

        const today = new Date();
        today.setHours(0,0,0,0);

        const [
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        lowStock,
        ordersToday,
        revenueToday
        ] = await Promise.all([
           this.prisma.order.aggregate({
                _sum: { total: true },
                where: { status: OrderStatus.PAID }
            }),

           
            this.prisma.order.count(),

            this.prisma.user.count({
                where: { isActive: true }
            }),

            this.prisma.product.count(),


            this.prisma.product.count({
                where: { stock: { lte: 2 } }
            }),

            this.prisma.order.count({
                where: {
                status: OrderStatus.PAID,
                createdAt: { gte: today }
                }
            }),

            this.prisma.order.aggregate({
                _sum: { total: true },
                where: {
                status: OrderStatus.PAID,
                createdAt: { gte: today }
                }
            })
        ]);
        
        return {
            totalRevenue: totalRevenue._sum.total ?? 0,
            totalOrders,
            totalUsers,
            totalProducts,
            lowStock,
            ordersToday,
            revenueToday: revenueToday._sum.total ?? 0
        };
    }
}