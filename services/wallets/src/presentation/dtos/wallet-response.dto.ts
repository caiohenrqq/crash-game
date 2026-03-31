import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
	@ApiProperty()
	playerId: string;

	@ApiProperty()
	balanceInCents: number;
}
