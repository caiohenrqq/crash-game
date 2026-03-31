import {
	configureHttpApplication,
	createHttpSwaggerDocument,
} from '@crash/foundation/nest/http-application';
import type { INestApplication } from '@nestjs/common';

export function configureApplication(app: INestApplication): void {
	configureHttpApplication(app, {
		title: 'Crash Game Wallets Service',
		description: 'Foundation API for the Crash Game Wallets Service.',
	});
}

export function createSwaggerDocument(app: INestApplication) {
	return createHttpSwaggerDocument(app, {
		title: 'Crash Game Wallets Service',
		description: 'Foundation API for the Crash Game Wallets Service.',
	});
}
