import { Controller, Get, Post, Body, UseGuards, Param , Patch, Delete, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/UpdateUserDto.dto';
import { CreateUserDto } from './dto/CreateUserDto.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Post()
    create(@Body() body: CreateUserDto){
        return this.userService.create(body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get()
    findAll(){
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto,
        @Req() req: any
    ){
        const currentUser = req.user as any;

        if (currentUser.id !== id) {
            throw new ForbiddenException('Você não pode atualizar outro usuário.')
        }

        return this.userService.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/deactivate')
    deactivate(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const currentuser = req.user;

        if (currentuser.id !== id && currentuser.role !== 'ADMIN') {
            throw new ForbiddenException('Você não pode desativar outro usuário.');
        }

        return this.userService.deactivate(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string){
        return this.userService.findOne(id);
    }

}

