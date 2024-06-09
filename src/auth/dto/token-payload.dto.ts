import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TokenPayloadDto {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  iat?: number;

  @IsNumber()
  exp?: number;
}
