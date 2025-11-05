import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Perfil do usuário retornado com sucesso.' })
    async getProfile(@Req() req) {
        return this.userService.getProfile(req.user.address);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    @ApiOperation({ summary: 'Atualizar perfil do usuário' })
    @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
    async updateProfile(
        @Body() dto: UpdateProfileDto,
        @Req() req: any,
    ) {
        const address: string = req.user.address;
        return this.userService.updateProfile(address, dto);
    }
}
