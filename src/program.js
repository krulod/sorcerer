import * as fs from 'node:fs'
import * as path from 'node:path'
import * as child_process from 'node:child_process'
import {rollup, watch} from 'rollup'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import multiEntry from '@rollup/plugin-multi-entry'

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
		preserveModules: true,
	})

	const terser = (await import('@rollup/plugin-terser')).default
	
	const {name} = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
	
	const bundlePath = `dist/${name}.min.js`

	const {output} = await build.write({
		file: bundlePath,
		plugins: [
			terser({compress: false, mangle: false}),
		],
	})
	
	await build.close()
	
	const [elapsed] = build.getTimings()['# BUILD']
	
	console.log('done!')
	console.log('built files:', build.watchFiles.length)
	console.log('build time:', formatDur(elapsed))

	const {gzipSize} = await import('gzip-size')

	const bundle = output[0].code
	const minzipped = await gzipSize(bundle)

	console.log('minzipped:', formatBytes(minzipped))
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
		if (event.code !== 'BUNDLE_END') {
			return
		}

		console.clear()
		console.log('build time:', formatDur(event.duration), '\n')
		
		testRun()
	})
}

function rmDist() {
	if (fs.existsSync('dist')) {
		fs.rmSync('dist', {recursive: true})
	}
}

function baseConfig(...plug) {
	return {
		external: /(node_modules|sorcerer)/,
		plugins: [
			typescript(),
			nodeResolve(),
			...plug,
		],
	}
}

function formatDur(dur) {
	return (dur / 1000).toFixed(1) + 's'
}

function formatBytes(b) {
	return b < 1000
		? b + 'b'
		: (b / 1000).toFixed(2) + 'kb'
}

function testConfig() {
	return {
		...baseConfig(
			multiEntry(),
		),
		input: fs.readdirSync('test').map(f => path.join('test', f)),
	}
}

function testRun() {
	child_process.spawnSync(
		'node dist/tests.js',
		{shell: true, stdio: 'inherit'}
	)
}
