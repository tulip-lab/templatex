import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const bridge = readFileSync(new URL('../components/SlideSyncBridge.vue', import.meta.url), 'utf8')
const addonLayer = readFileSync(new URL('../global-top.vue', import.meta.url), 'utf8')
const themeLayer = readFileSync(new URL('../../slidev-theme-tulip-lab/global-top.vue', import.meta.url), 'utf8')

test('addon mounts the reviewed sync bridge without coupling it to the theme', () => {
  assert.match(addonLayer, /import SlideSyncBridge/)
  assert.match(addonLayer, /<SlideSyncBridge\s*\/>/)
  assert.doesNotMatch(themeLayer, /SlideSyncBridge/)
  assert.match(themeLayer, /useDeckNavigation/)
})

test('sync bridge keeps presenter authoritative and audience read-only', () => {
  assert.match(bridge, /nav\.isPresenter/)
  assert.match(bridge, /type: 'presenter_hello'/)
  assert.match(bridge, /type: 'page'/)
  assert.match(bridge, /page: nav\.currentPage\.value/)
  assert.match(bridge, /clicks: nav\.clicks\.value/)
  assert.match(bridge, /role\.value === 'audience'/)
  assert.match(bridge, /nav\.clicks/)
  assert.match(bridge, /nav\.go\(page, clicks\)/)
  assert.match(bridge, /lockShortcuts/)
  assert.match(bridge, /slide-sync-audience/)
  assert.match(bridge, /stopImmediatePropagation/)
  assert.match(bridge, /#slide-container > :not\(#slide-content\)/)
  assert.match(bridge, /audienceConnections/)
  assert.match(bridge, /type === 'presence'|\['state', 'presence'\]/)
  assert.match(bridge, /'viewer' : 'viewers'/)
  assert.match(bridge, /\$\{noun\} online/)
  assert.match(bridge, /data\.type === 'ended'/)
  assert.match(bridge, /location\.reload\(\)/)
  assert.doesNotMatch(bridge, /localStorage|sessionStorage/)
})
