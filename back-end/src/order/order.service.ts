import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto/checkoutDto.dto';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) {}

    async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne(orderId: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: { 
                id: orderId,
                userId: userId
             },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if(!order) {
            throw new NotFoundException('Pedido não encontrado.');
        }

        return order;
    }

    async findAll() {
        return this.prisma.order.findMany({
           include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
           },
           orderBy: {
            createdAt: 'desc'
           }
        });
    }

    async updateStatus(orderId: string, status: OrderStatus) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });

        if(!order) {
            throw new NotFoundException('Pedido não encontrado.');
        }

        return this.prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

    }

    async checkout(userId: string, dto: CheckoutDto)  {
        return this.prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product:  true
                        }
                    }
                }
            });

            if(!cart || cart.items.length === 0) {
                throw new NotFoundException('Carrinho vazio.');
            }

            for(const item of cart.items) {
                if(item.product.stock < item.quantity) {
                    throw new ConflictException(
                        `Estoque insuficiente para ${item.product.name}`
                    );
                }
            }

            const total = cart.items.reduce((acc, item) => {
                return acc + Number(item.product.price) * item.quantity;
            }, 0);

            const order = await tx.order.create({
                 data: {
                    userId,
                    total,
                    status: OrderStatus.PENDING,

                    paymentStatus: 'PENDING',
                    paymentMethod: dto.paymentMethod,

                    street: dto.street,
                    number: dto.number,
                    city: dto.city,
                    state: dto.state,
                    zipCode: dto.zipCode
                }
            });

            for( const item of cart.items) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.product.price
                    }
                });
            }
            return order;
        });
    }

    async cancelOrder(orderId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: {
                    id: orderId,
                    userId: userId
                },
                include: {
                    orderItems: true
                }
            });

            if(!order) {
                throw new NotFoundException('Pedido não encontrado.');
            }

            if (order.status === OrderStatus.CANCELED) {
                throw new ConflictException('Pedido já está cancelado.');
             }

            if (order.status === OrderStatus.SHIPPED) {
                throw new ConflictException('Pedido já foi enviado e não pode ser cancelado.');
            }

            for(const item of order.orderItems) {
                await tx.product.update({
                    where: { id: item.productId},
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }

            return tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.CANCELED }
            });

        });
    }
}
