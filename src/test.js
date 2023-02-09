import {suite as createSuite} from 'uvu'

const suite = createSuite()

export function test(suiteTitle, tests) {
	for (const title in tests) {
		suite(`${suiteTitle}: ${title}`, tests[title])
	}
}

Promise.resolve().then(() => suite.run())

export * as assert from 'uvu/assert'