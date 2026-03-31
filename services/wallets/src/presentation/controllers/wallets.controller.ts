import {
	ConflictException,
	Controller,
	Get,
	NotFoundException,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
} from '@nestjs/swagger';
import { CreateWalletUseCase } from '@/application/create-wallet.use-case';
import { DuplicateWalletError } from '@/application/errors/duplicate-wallet.error';
import { WalletNotFoundError } from '@/application/errors/wallet-not-found.error';
import { GetWalletUseCase } from '@/application/get-wallet.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import { Public } from '@/infrastructure/auth/public.decorator';
import { HealthCheckResponseDto } from '../dtos/health-check-response.dto';
import { WalletResponseDto } from '../dtos/wallet-response.dto';

@Controller()
export class WalletsController {
	constructor(
		private readonly createWalletUseCase: CreateWalletUseCase,
		private readonly getWalletUseCase: GetWalletUseCase,
	) {}

	@Public()
	@Get('health')
	check(): HealthCheckResponseDto {
		return { status: 'ok', service: 'wallets' };
	}

	@ApiBearerAuth()
	@ApiCreatedResponse({
		type: WalletResponseDto,
	})
	@ApiConflictResponse({
		description: 'Wallet already exists for the authenticated player',
	})
	@UseGuards(JwtAuthenticationGuard)
	@Post()
	async create(
		@Req() request: AuthenticatedRequest,
	): Promise<WalletResponseDto> {
		try {
			const wallet = await this.createWalletUseCase.execute({
				playerId: this.getAuthenticatedPlayerId(request),
			});

			return {
				playerId: wallet.playerId,
				balanceInCents: wallet.balanceInCents,
			};
		} catch (error) {
			if (error instanceof DuplicateWalletError)
				throw new ConflictException(error.message);

			throw error;
		}
	}

	@ApiBearerAuth()
	@ApiOkResponse({
		type: WalletResponseDto,
	})
	@ApiNotFoundResponse({
		description: 'Wallet not found for the authenticated player',
	})
	@UseGuards(JwtAuthenticationGuard)
	@Get('me')
	async me(@Req() request: AuthenticatedRequest): Promise<WalletResponseDto> {
		try {
			const wallet = await this.getWalletUseCase.execute({
				playerId: this.getAuthenticatedPlayerId(request),
			});

			return {
				playerId: wallet.playerId,
				balanceInCents: wallet.balanceInCents,
			};
		} catch (error) {
			if (error instanceof WalletNotFoundError)
				throw new NotFoundException(error.message);

			throw error;
		}
	}

	private getAuthenticatedPlayerId(request: AuthenticatedRequest): string {
		if (!request.authenticatedPlayer)
			throw new UnauthorizedException('Authenticated player is required');

		return request.authenticatedPlayer.playerId;
	}
}
