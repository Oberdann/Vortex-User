import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'O campo [name] precisa ser uma string.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'O campo [email] precisa ser um e-mail válido.' })
  email?: string;
}
