import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'O campo [name] precisa ser uma string.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'O campo [email] precisa ser um e-mail válido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'O campo [password] precisa ser uma string.' })
  @MinLength(6, {
    message: 'O campo [password] precisa ter no mínimo 6 caracteres.',
  })
  password?: string;
}
