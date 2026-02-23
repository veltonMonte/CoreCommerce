import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddItemTocarDto } from "./dto/AddItemToCartDto.dto";
import { Product } from "@prisma/client";
import { retry } from "rxjs";

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

    async addItemCart(userId: string, dto: AddItemTocarDto) {

        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        let userCart = cart;

        if(!userCart) {
            userCart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if(!product) {
            throw new NotFoundException('Produto não encontrado.');
        }

        if (product.stock < dto.quantity) {
            throw new ConflictException('Estoque insuficiente');
        }

        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: userCart.id,
                    productId: dto.productId
                }
            }
        });

        if(existingItem) {

            const newQuantity = existingItem.quantity + dto.quantity;

            if (product.stock < newQuantity) {
                throw new ConflictException('Estoque insuficiente');
            }

            return this.prisma.cartItem.update({
                where: {
                    cartId_productId: {
                        cartId: userCart.id,
                        productId: dto.productId
                    }
                },
                data: {
                    quantity: newQuantity
                }
            });
        }

        return this.prisma.cartItem.create({
            data: {
                cartId: userCart.id,
                productId: dto.productId,
                quantity: dto.quantity
            }
        });
    }

    async getCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if(!cart) {
            return { items: [] };
        }

        return cart;

    }

    async removeItemCart(userId: string, productId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        
        if(!cart) {
            return { items: [] };
        }

        const cartItem = await this.prisma.cartItem.findUnique({
            where: { 
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
             }
        });

        if(!cartItem) {
            throw new NotFoundException('Item não encontrado no seu carrinho.');
        }

        await this.prisma.cartItem.delete({
            where: { 
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        })

        return this.getCart(userId);

    }

    async updateCartItem(userId: string, productId: string, dto: AddItemTocarDto) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        
        if(!cart) {
            return { items: [] };
        }

        if(!product) {
            throw new NotFoundException('Produto Não encontrado');
        }

       if(product.stock < dto.quantity) {
            throw new ConflictException('Estoque insuficiente.');        
       }

       const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                            productId
                }
            }
        });

        if(!cartItem) {
            throw new NotFoundException('Item não encontrado no seu carrinho.');
        }

       return this.prisma.cartItem.update({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId
            }
        },
        data: {
            quantity: dto.quantity
        }
       });

    }

    
    
}