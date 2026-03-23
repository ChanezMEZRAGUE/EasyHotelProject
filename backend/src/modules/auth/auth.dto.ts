import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Chanez' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mezrag' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '0612345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateMeDto {
  @ApiProperty({ example: 'Chanez', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string;

  @ApiProperty({ example: 'Mezrague', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  @ApiProperty({ example: '0612345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}
