import {build, dev, test} from './src/program.js'

const [command] = process.argv.slice(2)

if (!command) {
	console.log('available commands:')
	console.log('\tbuild')
	console.log('\ttest')
	console.log('\tdev')
}

else if (command === 'build') await build()
else if (command === 'test') await test()
else if (command === 'dev') await dev()

else {
	console.error('unknown command:', command)
	process.exit(1)
}