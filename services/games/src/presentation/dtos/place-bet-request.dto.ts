import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class PlaceBetRequestDto {
	@ApiProperty()
	@IsInt()
	@Min(1)
	amountInCents!: number;
}
