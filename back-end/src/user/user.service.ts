import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/UpdateUserDto.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async create(data: { name: string; email: string; password: string}) {

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { name: data.name }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new ConflictException('Email já está em uso.');
            }
            if (existingUser.name === data.name) {
                throw new ConflictException('Nome já está em uso.');
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            }
        });
    }

    async findAll(){
        return this.prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
    }

    async update(id: string, data: UpdateUserDto){

        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if(!user) {
            throw new NotFoundException('Usuário não encontrado.')
        }

        if(data.password){
            data.password = await bcrypt.hash(data.password, 10);
        }

        if (!user.isActive) {
            throw new ConflictException('Usuário está desativado.');
        }
        return this.prisma.user.update({
            where: { id },
            data,
        })
    }

    async deactivate(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if(!user) {
            throw new NotFoundException('Usuário não encontrado.')
        }

        if(user.role === 'ADMIN') {
            throw new ConflictException('Esse usuário não pode ser desativado.')
        }

        if (!user.isActive) {
            throw new ConflictException('Usuário já está desativado.');
        }

        return this.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
            }
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        if(!user){
            throw new NotFoundException('Usuário não encontrado.');
        }

        return user;
    }
    
}
