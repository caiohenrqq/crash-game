import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import { Public } from '@/infrastructure/auth/public.decorator';
import { AuthenticatedPlayerResponseDto } from '../dtos/authenticated-player-response.dto';
import { HealthCheckResponseDto } from '../dtos/health-check-response.dto';

@Controller()
export class WalletsController {
	@Public()
	@Get('health')
	check(): HealthCheckResponseDto {
		return { status: 'ok', service: 'wallets' };
	}

	@ApiBearerAuth()
	@ApiOkResponse({
		type: AuthenticatedPlayerResponseDto,
	})
	@UseGuards(JwtAuthenticationGuard)
	@Get('me')
	me(@Req() request: AuthenticatedRequest): AuthenticatedPlayerResponseDto {
		return request.authenticatedPlayer as AuthenticatedPlayerResponseDto;
	}
}
