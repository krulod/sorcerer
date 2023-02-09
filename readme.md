# `@krulod/sorcerer`

An opinionated utility for building and testing packages.

## Usage

Install:

```sh
$ pnpm add -D @krulod/sorcerer
```

Setup `tsconfig.json`:

```json
{
	"compilerOptions": {
		"strict": true,
		"target": "esnext",
		"module": "esnext",
		"lib": ["esnext", "dom"],
		"moduleResolution": "node",
		"experimentalDecorators": true
	},
	"files": ["./index.ts"]
}
```

Write some modules and export them from `index.ts`:

```ts
// index.ts

export * from './src/sum'
```

Create a distribution directory `dist`:

```sh
$ pnpm sorcerer build
```

Write some tests:

```ts
// test/sum.test.ts

import {test, assert} from '@krulod/sorcerer'

import {sum} from '../src/sum.ts'

test('sum', {
	'natural numbers': () => {
		assert.is(sum(1, 2), 3)
	},
})
```

Run tests:

```sh
$ pnpm sorcerer test
```

Incrementally rebuild and rerun tests whenever files change:

```sh
$ pnpm sorcerer dev
```

## Limitations

- neither extensible nor configurable, probably won't suit your needs
- tests are only ran in Node

## Used in

- so far nowhere

<!-- - [`tyger`](https://github.com/krulod/tyger) -->
<!-- - [`panzerkampfwagen`](https://github.com/krulod/panzerkampfwagen) -->

## License

GNU Affero General Public License v3.0 or later
