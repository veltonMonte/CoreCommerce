import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
        @IsString()
        @IsNotEmpty()
        @MinLength(3)
        name: string;
    
        @IsEmail()
        email: string;

        @IsString()
        @MinLength(6)
        @MinLength(8)
        password: string;
}