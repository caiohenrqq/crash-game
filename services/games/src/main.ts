import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { gamesConfig } from './infrastructure/config/games-config';
import { configureApplication } from './presentation/configure-application';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	configureApplication(app);
	await app.listen(gamesConfig.port, '0.0.0.0');
	console.log(`Games service running on port ${gamesConfig.port}`);
}

bootstrap();
