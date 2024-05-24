import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof ForbiddenException) {
      request.flash('loginError', 'Please login to access this page!');
      response.redirect('/login');
    } else if (exception instanceof UnauthorizedException) {
      request.flash('loginError', 'Wrong email or password!');
      response.redirect('/login');
    } else if (exception.getStatus() === 302) {
      response.redirect('/');
    } else {
      response.redirect('/error');
    }
  }
}
