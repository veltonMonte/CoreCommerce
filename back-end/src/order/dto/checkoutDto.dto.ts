import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CheckoutDto {

    @IsNotEmpty()
    street: string;

    @IsNotEmpty()
    number: string;

    @IsNotEmpty()
    city: string;

    @IsNotEmpty()
    state: string;

    @IsNotEmpty()
    zipCode: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}