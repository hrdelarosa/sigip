import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: UserIdParamDto) {
    return this.usersService.findById(params.id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param() params: UserIdParamDto, @Body() dto: UpdateUserDto) {
    return this.usersService.update(params.id, dto);
  }

  @Patch(':id/status')
  changeStatus(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserStatusDto,
  ) {
    return this.usersService.changeStatus(params.id, dto);
  }

  @Patch(':id/password')
  async changePassword(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserPasswordDto,
  ) {
    return await this.usersService.changePassword(params.id, dto);
  }
}
