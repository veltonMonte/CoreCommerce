import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService) {}

    async login(data: LoginDto) {

        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        
        if (!user) {
            throw new UnauthorizedException('Email ou senha inválidos');
        }

        const isPasswordValid = await bcrypt.compare(
            data.password,
            user.password
        );

        if(!isPasswordValid){
            throw new UnauthorizedException("Email ou senha inválidos");
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return{
            access_token: this.jwtService.sign(payload),
        }

    }
}
