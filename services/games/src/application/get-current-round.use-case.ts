import { Injectable } from '@nestjs/common';
import { RoundRepository } from './ports/round.repository';

@Injectable()
export class GetCurrentRoundUseCase {
	constructor(private readonly roundRepository: RoundRepository) {}

	execute() {
		return this.roundRepository.findCurrentRound();
	}
}
