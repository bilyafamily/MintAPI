import { Expose } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  type: string;

  @IsString()
  additionalInfo?: string;
}

export class CreateUserNotificationDto {
  @Expose({ name: 'Title' })
  @IsString()
  Title: string;

  @Expose({ name: 'Message' })
  @IsString()
  Message: string;

  @Expose({ name: 'Type' })
  @IsString()
  Type: string;

  @Expose({ name: 'RecipientEmail' })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  RecipientEmail: string[];

  @Expose({ name: 'AdditionalInfo' })
  @IsString()
  AdditionalInfo?: string;

  @Expose({ name: 'UserEmail' })
  @IsOptional()
  UserEmail: string;
}
