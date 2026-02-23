import {
  Controller,
  Post,
  Delete,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AddItemTocarDto } from './dto/AddItemToCartDto.dto';
import { CartService } from './cartService.service';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
    constructor(private cartService: CartService) {}

    @Post('add')
    addItem(
        @Req() req: any,
        @Body() dto: AddItemTocarDto
    ) {
        return this.cartService.addItemCart(req.user.id, dto);
    }

    @Get()
    getCart(@Req() req: any) {
        return this.cartService.getCart(req.user.id);
    }

    @Delete(':productId')
    remove(
        @Req() req: any,
        @Param('productId') id: string,
    ) {
        return this.cartService.removeItemCart(req.user.id, id);
    }

    @Patch(':productId')
    updateItem(
        @Req() req: any,
        @Param('productId') productId: string,
        @Body() dto: AddItemTocarDto
    ) {
        return this.cartService.updateCartItem(req.user.id, productId, dto);
    }
}