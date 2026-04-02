import { ApiProperty } from '@nestjs/swagger';

export class CashOutBetResponseDto {
	@ApiProperty()
	betId!: number;

	@ApiProperty()
	playerId!: string;

	@ApiProperty()
	amountInCents!: number;

	@ApiProperty({
		enum: ['cashed_out'],
	})
	status!: 'cashed_out';

	@ApiProperty()
	payoutInCents!: number;
}
