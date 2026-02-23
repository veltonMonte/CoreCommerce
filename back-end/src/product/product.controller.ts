import { Body, Controller, Delete, Put, Get, Param, Post, UseGuards, Query, ParseIntPipe, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateProductDto } from './dto/createProductDto.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateProductDto } from './dto/updateProductDto.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
    @UseInterceptors(
        FilesInterceptor('images', 2, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueName =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    callback(
                        null,
                        uniqueName + extname(file.originalname));
                },
            }),

            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image/')) {
                    return callback(
                        new BadRequestException('Apenas imagens são permitidas'),
                        false
                    );
                }
                callback(null, true);
            },
            limits: {
                fileSize: 8 * 1024 * 1024,
            }
        }),
    )
    create(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: CreateProductDto,
    ) {
        if (!files || files.length < 2) {
            throw new BadRequestException('É obrigatório enviar 2 imagens.');
        }

        const mainImage = `/uploads/${files[0].filename}`
        const hoverImage = `/uploads/${files[1].filename}`;

        return this.productService.create({
            ...body,
            mainImage,
            hoverImage,
        });
    }

    @Get()
    findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 12
    ) {
        return this.productService.findAll(Number(page), Number(limit));
    }

    @Get('price-range')
    findByPriceRange(
        @Query('min', ParseIntPipe) min: number,
        @Query('max', ParseIntPipe) max: number
    ) {
        return this.productService.findByPriceRange(min, max);
    }

    @Get('category/:category')
    findByCategory(@Param('category') category: string) {
        return this.productService.findByCategory(category);
    }

    @Get('home')
    getHomeProducts() {
        return this.productService.getHomeSections();
    }

    @Get('search')
    searchProducts(@Query('q') term: string) {
        if (!term) {
            return [];
        }
        return this.productService.searchProducts(term);
    }

    @Get(':id')
    readOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Put(':id')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'mainImage', maxCount: 1 },
                { name: 'hoverImage', maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const uniqueName =
                            Date.now() + '-' + Math.round(Math.random() * 1e9);
                        callback(null, uniqueName + extname(file.originalname));
                    },
                }),
                fileFilter: (req, file, callback) => {
                    if (!file.mimetype.startsWith('image/')) {
                        return callback(
                            new BadRequestException('Apenas imagens são permitidas'),
                            false,
                        );
                    }
                    callback(null, true);
                },
                limits: {
                    fileSize: 8 * 1024 * 1024,
                },
            },
        ),
    )
    update(
        @Param('id') id: string,
        @UploadedFiles()
        files: {
            mainImage?: Express.Multer.File[];
            hoverImage?: Express.Multer.File[];
        },
        @Body() body: UpdateProductDto,
    ) {
        const updateData: any = { ...body };

        if (files?.mainImage?.length) {
            updateData.mainImage = `/uploads/${files.mainImage[0].filename}`;
        }

        if (files?.hoverImage?.length) {
            updateData.hoverImage = `/uploads/${files.hoverImage[0].filename}`;
        }

        return this.productService.update(id, updateData);
    }

}
