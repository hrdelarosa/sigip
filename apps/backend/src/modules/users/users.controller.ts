import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import type { UserResponse, UsersResponse } from '@sigip/shared';
import { toUserResponse } from './presenters/user.presenter';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UsersResponse> {
    const users = await this.usersService.findAll();

    return users.map(toUserResponse);
  }

  @Get(':id')
  async findOne(@Param() params: UserIdParamDto): Promise<UserResponse> {
    const user = await this.usersService.findById(params.id);

    return toUserResponse(user);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    const user = await this.usersService.create(dto);

    return toUserResponse(user);
  }

  @Patch(':id')
  async update(
    @Param() params: UserIdParamDto,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.update(params.id, dto);

    return toUserResponse(user);
  }

  @Patch(':id/status')
  async changeStatus(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserStatusDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.changeStatus(params.id, dto);

    return toUserResponse(user);
  }

  @Patch(':id/password')
  async changePassword(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserPasswordDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.changePassword(params.id, dto);

    return toUserResponse(user);
  }
}
