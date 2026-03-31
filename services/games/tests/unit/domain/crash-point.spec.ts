import { describe, expect, test } from 'bun:test';
import { CrashPoint } from '@/domain/crash-point';

describe('CrashPoint', () => {
	test('creates a crash point from valid hundredths', () => {
		const crashPoint = CrashPoint.fromHundredths(250);

		expect(crashPoint.inHundredths).toBe(250);
		expect(crashPoint.toDisplayValue()).toBe('2.50');
	});

	test('rejects crash points below 1.00x', () => {
		expect(() => CrashPoint.fromHundredths(99)).toThrow(
			'Crash Point must be at least 1.00x',
		);
	});
});
