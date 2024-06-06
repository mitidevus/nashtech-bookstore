import {
  Controller,
  Get,
  Post,
  Render,
  Request,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthExceptionFilter } from './auth/filters';
import {
  AuthenticatedGuard,
  LoginGuard,
  UnauthenticatedGuard,
} from './auth/guard';

@Controller()
@UseFilters(AuthExceptionFilter)
export class AppController {
  constructor() {}

  @UseGuards(UnauthenticatedGuard)
  @Get('/login')
  @Render('login')
  index(@Request() req): { message: string } {
    return { message: req.flash('loginError') };
  }

  @UseGuards(LoginGuard)
  @Post('/login')
  login(@Res() res: Response): void {
    res.redirect('/books');
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  root(@Res() res: Response) {
    res.redirect('/books');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/logout')
  logout(@Request() req, @Res() res: Response): void {
    req.logout((error) => {
      if (error) {
        console.error('Logout error', error);
        res.status(500).send('An error occurred during logout');
      } else {
        res.redirect('/login');
      }
    });
  }
}
