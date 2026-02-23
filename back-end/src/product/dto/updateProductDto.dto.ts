import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";

export class UpdateProductDto {
        @IsNotEmpty()
        @IsOptional()
        name?: string;
    
        @IsNotEmpty()
        @IsOptional()
        description?: string;
    
        @IsNumber()
        @IsPositive()
        @IsOptional()
        price?: number;
    
        @IsNumber()
        @IsPositive()
        @IsOptional()
        stock?: number;
    
        @IsNotEmpty()
        @IsOptional()
        category?: string;

        @IsOptional()
        mainImage?: string;
        
        @IsOptional()
        hoverImage?: string;
}