import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Render,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { RegisterDto } from './register.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import { Patch } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { ChangeUserDto } from './changeUser.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    if (
      !registerDto.email ||
      !registerDto.password ||
      !registerDto.passwordAgain
    ) {
      throw new BadRequestException('Fill all boxes');
    }
    if (!registerDto.email.includes('@')) {
      throw new BadRequestException('Email must conatin a @ character');
    }
    if (registerDto.password !== registerDto.passwordAgain) {
      throw new BadRequestException('The two passwords must match');
    }
    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'The password must be at least  characters long',
      );
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.id = undefined;
    user.email = registerDto.email;
    user.password = await bcrypt.hash(registerDto.password, 15);
    await userRepo.save(user);

    return user;
  }

  @Patch('users/:id')
  async patchUser(
    @Param('id') id: number,
    @Body() changeUserDto: ChangeUserDto,
  ) {
    if (!changeUserDto.email.includes('@')) {
      throw new BadRequestException('Email must conatin a @ character');
    }
    if (
      !changeUserDto.profilePictureUrl.startsWith('http://') &&
      !changeUserDto.profilePictureUrl.startsWith('https://')
    ) {
      throw new BadRequestException('Url must start with http:// or https://');
    }

    const userRepo = this.dataSource.getRepository(User);
    const userToChange = await userRepo.findOneBy({ id: id });
    userToChange.email = changeUserDto.email;
    userToChange.profilePictureUrl = changeUserDto.profilePictureUrl;
    userRepo.save(userToChange);

  }
}
