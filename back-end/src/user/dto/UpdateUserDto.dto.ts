import { IsEAN, IsEmail, isEmail, IsOptional, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(6)
    password?: string;
    
}