import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthenticatedPlayerResponseDto {
	@ApiProperty()
	playerId: string;

	@ApiPropertyOptional()
	username?: string;

	@ApiPropertyOptional()
	email?: string;
}
