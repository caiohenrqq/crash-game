import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import {
	DocumentBuilder,
	type OpenAPIObject,
	SwaggerModule,
} from '@nestjs/swagger';

export function configureHttpApplication(
	app: INestApplication,
	options: {
		title: string;
		description: string;
		apiDocsEnabled: boolean;
	},
): void {
	app.getHttpAdapter().getInstance().disable('x-powered-by');
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	);

	if (!options.apiDocsEnabled) return;

	SwaggerModule.setup('docs', app, createHttpSwaggerDocument(app, options));
}

export function createHttpSwaggerDocument(
	app: INestApplication,
	options: {
		title: string;
		description: string;
		apiDocsEnabled?: boolean;
	},
): OpenAPIObject {
	return SwaggerModule.createDocument(
		app,
		new DocumentBuilder()
			.setTitle(options.title)
			.setDescription(options.description)
			.setVersion('0.0.1')
			.addBearerAuth({
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			})
			.build(),
	);
}
