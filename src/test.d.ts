export declare function test(
	name: string,
	tests: Record<string, () => void>
): void

export * as assert from 'uvu/assert'