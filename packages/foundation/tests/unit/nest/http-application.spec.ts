import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { configureHttpApplication } from '@crash/foundation/nest/http-application';
import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

describe('configureHttpApplication', () => {
	afterEach(() => {
		mock.restore();
	});

	test('skips swagger setup when api docs are disabled', () => {
		const disable = mock(() => undefined);
		const useGlobalPipes = mock(() => undefined);
		const setupSpy = spyOn(SwaggerModule, 'setup');

		configureHttpApplication(createNestApplicationStub(), {
			title: 'Crash Game Games Service',
			description: 'Foundation API for the Crash Game Games Service.',
			apiDocsEnabled: false,
		});

		expect(disable).toHaveBeenCalledWith('x-powered-by');
		expect(useGlobalPipes).toHaveBeenCalledTimes(1);
		expect(setupSpy).not.toHaveBeenCalled();

		function createNestApplicationStub(): INestApplication {
			return {
				getHttpAdapter: () => ({
					getInstance: () => ({
						disable,
					}),
				}),
				useGlobalPipes,
			} as unknown as INestApplication;
		}
	});

	test('registers swagger when api docs are enabled', () => {
		const createDocumentSpy = spyOn(
			SwaggerModule,
			'createDocument',
		).mockReturnValue({} as ReturnType<typeof SwaggerModule.createDocument>);
		const setupSpy = spyOn(SwaggerModule, 'setup').mockImplementation(
			() => undefined,
		);

		configureHttpApplication(
			{
				getHttpAdapter: () => ({
					getInstance: () => ({
						disable: () => undefined,
					}),
				}),
				useGlobalPipes: () => undefined,
			} as unknown as INestApplication,
			{
				title: 'Crash Game Games Service',
				description: 'Foundation API for the Crash Game Games Service.',
				apiDocsEnabled: true,
			},
		);

		expect(createDocumentSpy).toHaveBeenCalledTimes(1);
		expect(setupSpy).toHaveBeenCalledWith(
			'docs',
			expect.anything(),
			expect.anything(),
		);
	});
});
