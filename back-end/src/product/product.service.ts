import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/createProductDto.dto';
import { UpdateProductDto } from './dto/updateProductDto.dto';
import { OrderStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateProductDto & {
        mainImage: string;
        hoverImage: string;
    }) {
        return this.prisma.product.create({
            data,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.product.delete({
            where: { id },
        });
    }

    async update(
        id: string,
        data: UpdateProductDto & {
            mainImage?: string;
            hoverImage?: string;
        },
    ) {
        const product = await this.findOne(id);

        if (data.mainImage && product.mainImage) {
            const oldPath = path.join(
                process.cwd(),
                product.mainImage.replace('/uploads/', 'uploads/')
            );

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        if (data.hoverImage && product.hoverImage) {
            const oldPath = path.join(
                process.cwd(),
                product.hoverImage.replace('/uploads/', 'uploads/')
            );

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async findByCategory(category: string) {
        return this.prisma.product.findMany({
            where: { category },
        });
    }

    async findByPriceRange(min: number, max: number) {
        return this.prisma.product.findMany({
            where: {
                price: {
                    gte: min,
                    lte: max,
                },
            },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Produto não existe.')
        }

        return product;
    }

    async findAll(page = 1, limit = 12) {
        return this.prisma.product.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    }

    async findNewProducts() {
        const thirtsDaysAgo = new Date();
        thirtsDaysAgo.setDate(thirtsDaysAgo.getDate() - 30);

        return this.prisma.product.findMany({
            where: {
                createdAt: {
                    gte: thirtsDaysAgo
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 8
        });
    }

    async findTopSellingProducts() {
        const topProducts = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    status: OrderStatus.PAID
                }
            },
            _sum: { quantity: true },
            orderBy: {
                _sum: { quantity: 'desc' }
            },
            take: 8
        });

        const productIds = topProducts.map(p => p.productId);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: productIds }
            }
        });

        return productIds.map(id =>
            products.find(p => p.id === id)
        );
    }

    async findLowStockProducts() {
        return this.prisma.product.findMany({
            where: {
                stock: {
                    lte: 2
                }
            },
            orderBy: {
                stock: 'asc'
            },
            take: 6
        });
    }

    async getHomeSections() {
        const [newProducts, topSelling, lowStock] = await Promise.all([
            this.findNewProducts(),
            this.findTopSellingProducts(),
            this.findLowStockProducts()
        ]);

        return {
            newProducts,
            topSelling,
            lowStock
        };
    }

    async searchProducts(term: string) {
        return this.prisma.product.findMany({
            where: {
                name: {
                    contains: term,
                    mode: 'insensitive'
                }
            }
        });
    }

}
