import assert from 'node:assert/strict'
import test from 'node:test'
import { declaredLocalPackages, parseArguments, usePackedPackages } from './validate-consumer.mjs'

test('requires an explicit profile and resolves the consumer path', () => {
  const parsed = parseArguments(['--', '--profile', 'talk', './examples/talk', '--keep'])
  assert.equal(parsed.profile, 'talk')
  assert.equal(parsed.keep, true)
  assert.match(parsed.consumer, /examples\/talk$/)
  assert.throws(() => parseArguments(['./examples/talk']), /--profile/)
})

test('finds TULIP packages declared across dependency groups', () => {
  assert.deepEqual(declaredLocalPackages({
    dependencies: {
      'slidev-addon-tulip-lab-pages': '0.2.2',
      'slidev-theme-tulip-lab': '0.2.2',
    },
    devDependencies: {
      'tulip-slidev-check': '0.2.1',
    },
  }), [
    'slidev-theme-tulip-lab',
    'slidev-addon-tulip-lab-pages',
    'tulip-slidev-check',
  ])
})

test('rewrites only declared TULIP dependencies to packed archives', () => {
  const manifest = usePackedPackages({
    dependencies: {
      '@slidev/cli': '52.19.0',
      'slidev-addon-tulip-lab-pages': '0.2.2',
      'slidev-theme-tulip-lab': '0.2.2',
    },
  }, new Map([
    ['slidev-addon-tulip-lab-pages', '/packages/pages.tgz'],
    ['slidev-theme-tulip-lab', '/packages/theme.tgz'],
  ]))

  assert.equal(manifest.dependencies['@slidev/cli'], '52.19.0')
  assert.equal(manifest.dependencies['slidev-addon-tulip-lab-pages'], 'file:/packages/pages.tgz')
  assert.equal(manifest.dependencies['slidev-theme-tulip-lab'], 'file:/packages/theme.tgz')
  assert.equal(manifest.dependencies['slidev-addon-tulip-lab-live'], undefined)
})

test('requires an archive for every declared local package', () => {
  assert.throws(() => usePackedPackages({
    dependencies: {
      'slidev-theme-tulip-lab': '0.2.2',
    },
  }, new Map()), /Missing packed archive for slidev-theme-tulip-lab/)
})
