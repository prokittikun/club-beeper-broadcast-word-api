import { IsNotEmpty, IsString } from 'class-validator';

export class BasicBodyDto {
  @IsString()
  @IsNotEmpty()
  readonly clientId: string;

  @IsString()
  @IsNotEmpty()
  readonly roomId: string;
}
