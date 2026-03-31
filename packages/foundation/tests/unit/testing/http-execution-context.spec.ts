import { describe, expect, test } from 'bun:test';
import { createHttpExecutionContext } from '@crash/foundation/testing/http-execution-context';

describe('createHttpExecutionContext', () => {
	test('returns an execution context that exposes the provided request through the http adapter', () => {
		const request = {
			headers: {
				authorization: 'Bearer token',
			},
		};
		const context = createHttpExecutionContext(request);

		expect(context.switchToHttp().getRequest<unknown>()).toBe(request);
		expect(context.getType()).toBe('http');
	});
});
