import * as fs from 'node:fs'
import * as path from 'node:path'
import * as child_process from 'node:child_process'
import {rollup, watch} from 'rollup'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'

const TEST_OUTPUT = {file: 'dist/tests.js'}

export async function build() {
	rmDist()

	const build = await rollup({
		...baseConfig(),
		input: path.join(process.cwd(), 'index.ts'),
		perf: true,
	})

	
	await build.write({
		dir: 'dist',
		preserveModules: true
	})

	const terser = (await import('@rollup/plugin-terser')).default

	await build.write({
		file: 'dist/tyger.js',
		plugins: [terser()]
	})

	await build.close()

	const [elapsed] = build.getTimings()['# BUILD']

	console.log('done!')
	console.log('built files:', build.watchFiles.length)
	console.log('built in:', formatDur(elapsed))
}

export async function test() {
	rmDist()

	const build = await rollup(testConfig())

	await build.write(TEST_OUTPUT)
	await build.close()

	testRun()
}

export async function dev() {
	rmDist()

	console.log('working...')

	const watcher = watch({
		...testConfig(),
		output: TEST_OUTPUT,
	})

	watcher.on('event', event => {
		if (event.code !== 'BUNDLE_END') return

		console.clear()
		console.log('built in:', formatDur(event.duration), '\n')
		
		testRun()
	})
}

function rmDist() {
	if (fs.existsSync('dist')) {
		fs.rmSync('dist', {recursive: true})
	}
}

function baseConfig() {
	return {
		external: /(node_modules|sorcerer)/,
		plugins: [
			typescript(),
			nodeResolve(),
		],
	}
}

function formatDur(dur) {
	return (dur / 1000).toFixed(1) + 's'
}

function testConfig() {
	return {
		...baseConfig(),
		input: fs.readdirSync('test').map(f => path.join('test', f)),
	}
}

function testRun() {
	child_process.spawnSync(
		'node dist/tests.js',
		{shell: true, stdio: 'inherit'}
	)
}