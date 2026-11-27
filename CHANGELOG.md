# [5.1.0](https://github.com/ducktors/arecibo/compare/v5.0.2...v5.1.0) (2026-11-27)


### Bug Fixes

* accept only a plain object with checks as readinessChecks ([119f7ad](https://github.com/ducktors/arecibo/commit/119f7ad29d31363d909040ae47f12186ce9825fa))
* reject a readiness check that is not a function ([b9c89d1](https://github.com/ducktors/arecibo/commit/b9c89d132732c49762bdd1491aff8566d3896469))


### Features

* add the readinessChecks option ([64aecaa](https://github.com/ducktors/arecibo/commit/64aecaa0174571eec38765f5fbe89f052762362e))

## [5.0.2](https://github.com/ducktors/arecibo/compare/v5.0.1...v5.0.2) (2026-11-27)


### Bug Fixes

* **deps:** accept Fastify 6 and use fastify-plugin 6 ([399a096](https://github.com/ducktors/arecibo/commit/399a096565f487ea1e077e06f7eac026287d793a))
* **package:** do not publish the test files ([c2f0589](https://github.com/ducktors/arecibo/commit/c2f05899cad7463c2a651d447736c8c9c5563b07))
* **schema:** send objects from custom callbacks as JSON ([8e3d64c](https://github.com/ducktors/arecibo/commit/8e3d64c142b4cd7d0d480846509eadd35ffd5d9d))
* **types:** make the logLevel option optional ([47b7f9c](https://github.com/ducktors/arecibo/commit/47b7f9c8484172061ee805d88c5a264788bd15e0))

## [5.0.1](https://github.com/ducktors/arecibo/compare/v5.0.0...v5.0.1) (2026-11-27)


### Bug Fixes

* **deps:** bump diff ([2c55115](https://github.com/ducktors/arecibo/commit/2c5511583fe9c09d1867582cab0dc906b3a43da4))

# [5.0.0](https://github.com/ducktors/arecibo/compare/v4.0.4...v5.0.0) (2026-11-27)


* feat!: require Node.js 22 or later ([a25ba63](https://github.com/ducktors/arecibo/commit/a25ba63e4d4ab46a04a99cdc9edc1ffafed449c5))


### Bug Fixes

* **deps:** bump js-yaml in the npm_and_yarn group across 1 directory ([89fb4fe](https://github.com/ducktors/arecibo/commit/89fb4fe697e9625582b148e6f23c308b39186692))


### BREAKING CHANGES

* arecibo no longer supports Node.js 20.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>

## [4.0.4](https://github.com/ducktors/arecibo/compare/v4.0.3...v4.0.4) (2025-08-13)


### Bug Fixes

* **deps:** bump brace-expansion in the npm_and_yarn group ([4fa745e](https://github.com/ducktors/arecibo/commit/4fa745e18f920cec872b060be4bbf3dd57299006))

## [4.0.3](https://github.com/ducktors/arecibo/compare/v4.0.2...v4.0.3) (2025-06-04)


### Bug Fixes

* **deps:** bump fastify from 5.3.1 to 5.3.2 in the npm_and_yarn group ([2ef4292](https://github.com/ducktors/arecibo/commit/2ef42928c2230dc37ba3fcd2b5cb7d1602ba410a))

## [4.0.2](https://github.com/ducktors/arecibo/compare/v4.0.1...v4.0.2) (2025-04-22)


### Bug Fixes

* **deps:** bump fastify from 5.2.1 to 5.3.1 in the npm_and_yarn group ([281ed5a](https://github.com/ducktors/arecibo/commit/281ed5a538981107305813c3608d44062f0952bc))

## [4.0.1](https://github.com/ducktors/arecibo/compare/v4.0.0...v4.0.1) (2025-02-20)


### Bug Fixes

* improve code on index.ts and update biome ([2267524](https://github.com/ducktors/arecibo/commit/22675245f6e1f2c61687a31188a3d8e48f0b721f))

# [4.0.0](https://github.com/ducktors/arecibo/compare/v3.1.1...v4.0.0) (2025-02-20)


### Code Refactoring

* remove support to fastify 3 and eslint ([1551e25](https://github.com/ducktors/arecibo/commit/1551e259ff677ed49a6580832819aaf5321d0079))


### BREAKING CHANGES

* Remove support to Fastify 3

## [3.1.1](https://github.com/ducktors/arecibo/compare/v3.1.0...v3.1.1) (2025-02-19)


### Bug Fixes

* remove preinstall script ([392b07f](https://github.com/ducktors/arecibo/commit/392b07f3c0cd77a63c5718368313a4096d7d78d0))

# [3.1.0](https://github.com/ducktors/arecibo/compare/v3.0.1...v3.1.0) (2025-01-07)


### Features

* add support to fastift 5 ([19b1f71](https://github.com/ducktors/arecibo/commit/19b1f71baf668f14f7928a18e006aebcf633ca0f))

## [3.0.1](https://github.com/ducktors/arecibo/compare/v3.0.0...v3.0.1) (2024-07-31)


### Bug Fixes

* **deps:** bump braces from 3.0.2 to 3.0.3 in the npm_and_yarn group ([02b70e8](https://github.com/ducktors/arecibo/commit/02b70e8ab3bc10a95ed907950bc3eb4ffc29d829))

# [3.0.0](https://github.com/ducktors/arecibo/compare/v2.2.3...v3.0.0) (2023-10-23)


### Features

* **node:** remove node16 support on pipeline and package.json ([23eb74c](https://github.com/ducktors/arecibo/commit/23eb74cb1f59166312b388b0d56731566f5fe7c8))


### BREAKING CHANGES

* **node:** Remove Node v16

## [2.2.3](https://github.com/ducktors/arecibo/compare/v2.2.2...v2.2.3) (2023-10-23)


### Bug Fixes

* **node:** rollaback to node 16 ([0c2d28f](https://github.com/ducktors/arecibo/commit/0c2d28fc4745bb470bea98c09029b5ac01116c4b))

## [2.2.2](https://github.com/ducktors/arecibo/compare/v2.2.1...v2.2.2) (2023-08-03)


### Bug Fixes

* **deps:** bump word-wrap from 1.2.3 to 1.2.4 ([b10ea28](https://github.com/ducktors/arecibo/commit/b10ea286cfea7a1d5d0fa8be5da91d336e563740))

## [2.2.1](https://github.com/ducktors/arecibo/compare/v2.2.0...v2.2.1) (2023-02-09)


### Bug Fixes

* **deps:** bump @types/node from 16.18.11 to 18.11.19 ([69d1075](https://github.com/ducktors/arecibo/commit/69d1075a8e756a8bc917a3d79b5890b7114446ba))

# [2.2.0](https://github.com/ducktors/arecibo/compare/v2.1.1...v2.2.0) (2023-02-01)


### Features

* update depencencies, add ci tools ([99125ff](https://github.com/ducktors/arecibo/commit/99125ff4370a0ceb1beafbef53b2e1e15b997731))

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2018-12-28
### Added
- Schemas on readiness and liveness routes. [Pull reference.](https://github.com/ducktors/arecibo/pull/3)
