import type { ExecutionContext } from '@nestjs/common';

export function createHttpExecutionContext(
	request: unknown,
	handler: () => unknown = () => undefined,
): ExecutionContext {
	return {
		getArgs: () => [request],
		getArgByIndex: (index: number) => [request][index],
		getClass: () => class TestController {},
		getHandler: () => handler,
		getType: () => 'http',
		switchToHttp: () => ({
			getRequest: () => request,
			getResponse: () => undefined,
			getNext: () => undefined,
		}),
		switchToRpc: () => ({
			getData: () => undefined,
			getContext: () => undefined,
		}),
		switchToWs: () => ({
			getClient: () => undefined,
			getData: () => undefined,
			getPattern: () => undefined,
		}),
	} as unknown as ExecutionContext;
}
