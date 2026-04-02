import { ApiProperty } from '@nestjs/swagger';

export class PlaceBetResponseDto {
	@ApiProperty()
	betId!: number;

	@ApiProperty()
	playerId!: string;

	@ApiProperty()
	amountInCents!: number;

	@ApiProperty({
		enum: ['pending_debit', 'accepted', 'debit_rejected', 'cashed_out', 'lost'],
	})
	status!:
		| 'pending_debit'
		| 'accepted'
		| 'debit_rejected'
		| 'cashed_out'
		| 'lost';
}
