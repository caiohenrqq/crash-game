import { ApiProperty } from '@nestjs/swagger';

class CurrentRoundBetResponseDto {
	@ApiProperty()
	playerId!: string;

	@ApiProperty()
	amountInCents!: number;
}

export class CurrentRoundResponseDto {
	@ApiProperty()
	roundId!: number;

	@ApiProperty({
		enum: ['betting', 'active', 'crashed'],
	})
	state!: 'betting' | 'active' | 'crashed';

	@ApiProperty({
		type: String,
		nullable: true,
	})
	crashPoint!: string | null;

	@ApiProperty({
		type: [CurrentRoundBetResponseDto],
	})
	bets!: CurrentRoundBetResponseDto[];
}
