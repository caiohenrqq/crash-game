import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { walletsConfig } from './infrastructure/config/wallets-config';
import { configureApplication } from './presentation/configure-application';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	configureApplication(app);
	await app.listen(walletsConfig.port, '0.0.0.0');
	console.log(`Wallets service running on port ${walletsConfig.port}`);
}

bootstrap();
