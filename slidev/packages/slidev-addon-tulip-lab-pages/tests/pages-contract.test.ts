import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { asCollaborationRegions, asSpeakerServiceSections, resolveContactQrTarget } from '../utils/config'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const layouts = [
  'tulip-speaker',
  'tulip-deakin',
  'tulip-deakin-rankings',
  'tulip-academy',
  'tulip-collaborations',
  'tulip-questions',
  'tulip-contact',
]

test('publishes the canonical TULIP Lab pages addon', () => {
  assert.equal(packageJson.name, 'slidev-addon-tulip-lab-pages')
  assert.equal(packageJson.version, '0.3.0')
  assert.equal(packageJson.dependencies['qrcode.vue'], '3.10.0')
  assert.equal(packageJson.peerDependencies['slidev-theme-tulip-lab'], '>=0.3.0 <0.4.0')

  for (const name of layouts)
    assert.ok(existsSync(new URL(`../layouts/${name}.vue`, import.meta.url)), `missing ${name} layout`)
})

test('ships fallback media and keeps deck content configurable', () => {
  for (const name of ['gangli-photo.jpg', 'deakin-mark.png', 'tulip-logo.png', 'questions.gif'])
    assert.ok(existsSync(new URL(`../assets/${name}`, import.meta.url)), `missing ${name}`)

  const contact = readFileSync(new URL('../layouts/tulip-contact.vue', import.meta.url), 'utf8')
  const deakin = readFileSync(new URL('../layouts/tulip-deakin.vue', import.meta.url), 'utf8')
  const speaker = readFileSync(new URL('../layouts/tulip-speaker.vue', import.meta.url), 'utf8')
  const academy = readFileSync(new URL('../layouts/tulip-academy.vue', import.meta.url), 'utf8')
  const rankings = readFileSync(new URL('../layouts/tulip-deakin-rankings.vue', import.meta.url), 'utf8')
  const collaborations = readFileSync(new URL('../layouts/tulip-collaborations.vue', import.meta.url), 'utf8')
  const questions = readFileSync(new URL('../layouts/tulip-questions.vue', import.meta.url), 'utf8')
  assert.match(contact, /config\.value\.email/)
  assert.match(contact, /config\.value\.website/)
  assert.match(contact, /config\.value\.websiteLabel/)
  assert.match(contact, /config\.value\.contactLogo/)
  assert.match(contact, /config\.value\.contactQrCode/)
  assert.match(contact, /resolveContactQrTarget\(config\.value\)/)
  assert.match(contact, /import QrcodeVue from 'qrcode\.vue'/)
  assert.match(contact, /qrCodeFailed/)
  assert.match(contact, /@error="qrCodeFailed = true"/)
  assert.match(contact, /class="card-qr"/)
  assert.match(deakin, /import deakinMark from '\.\.\/assets\/deakin-mark\.png'/)
  assert.match(deakin, /class="deakin-mark"/)
  assert.match(speaker, /config\.value\.speakerPhoto/)
  assert.match(speaker, /\.speaker-photo\s*\{[\s\S]*height:\s*24rem/)
  assert.match(speaker, /config\.value\.speakerHighlights/)
  assert.match(speaker, /IEEE Technical Leadership/)
  assert.match(speaker, /Vice Chair/)
  assert.match(speaker, /2025–2026 · previously 2017–2019/)
  assert.match(speaker, /Associate Editor.*Cybersecurity · Springer/)
  assert.match(academy, /config\.value\.academyLinks/)
  assert.match(academy, /config\.value\.academyResearchAreas/)
  assert.match(academy, /\$clicks >= index \+ 1/)
  assert.match(academy, /\['slide', 'presenter'\]/)
  assert.match(rankings, /101-150 worldwide<\/strong><p>Computer Science &amp; Engineering/)
  assert.match(rankings, /rankings\/gras\/2025\/AS0210/)
  assert.match(collaborations, /props\.regions/)
  assert.match(collaborations, /\$clicks\.value/)
  assert.match(collaborations, /props\.includeResearch/)
  assert.match(collaborations, /Research Framework/)
  assert.match(collaborations, /\['slide', 'presenter'\]/)
  assert.match(collaborations, /\\\/export/)
  assert.match(collaborations, /resolvePublicAssetPath\(src/)
  assert.match(collaborations, /props\.homeQr/)
  assert.match(collaborations, /props\.homeCta/)
  assert.match(collaborations, /import QrcodeVue from 'qrcode\.vue'/)
  assert.match(collaborations, /@error="homeQrFailed = true"/)
  assert.match(collaborations, /class="tulip-home-card"/)
  assert.match(questions, /config\.value\.questionsImage/)
})

test('normalizes structured speaker service sections', () => {
  assert.deepEqual(asSpeakerServiceSections([
    {
      title: 'IEEE Technical Leadership',
      items: [
        { role: 'Vice Chair', organisation: 'IEEE CIS DMTC', term: '2025–2026' },
        { role: '', organisation: 'Ignored' },
      ],
    },
  ]), [{
    title: 'IEEE Technical Leadership',
    items: [{ role: 'Vice Chair', organisation: 'IEEE CIS DMTC', term: '2025–2026' }],
  }])
})

test('resolves generated contact QR targets in explicit profile and website order', () => {
  assert.equal(resolveContactQrTarget({
    contactQrUrl: 'https://example.com/contact',
    speakerProfileUrl: 'https://example.com/profile',
    website: 'https://example.com',
  }), 'https://example.com/contact')
  assert.equal(resolveContactQrTarget({
    speakerProfileUrl: 'https://example.com/profile',
    website: 'https://example.com',
  }), 'https://example.com/profile')
  assert.equal(resolveContactQrTarget({ website: 'https://example.com' }), 'https://example.com')
  assert.equal(resolveContactQrTarget({}), 'https://www.tulip.academy')
})

test('documents the canonical shared-page section and session structure', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')

  assert.match(readme, /section: TULIP Lab\ntocExpand: false\nsession: Gang Li/)
  assert.match(readme, /session: Deakin/)
  assert.match(readme, /session: TULIP Lab/)
  assert.match(readme, /layout: tulip-collaborations/)
  assert.match(readme, /matching stable Theme release/)
  assert.match(readme, /share one visual contract/)
  assert.doesNotMatch(readme, /includeResearch: true\nhomeQr:/)
  assert.match(readme, /layout: tulip-questions\nsection: Closing\ntocExpand: false\nsession: Questions/)
  assert.match(readme, /session: Contact/)
})

test('accepts only the supported collaboration photo layout', () => {
  const regions = asCollaborationRegions([
    {
      name: 'South Korea',
      institutions: ['Chonnam National University'],
      photoLayout: 'portrait-feature',
    },
    {
      name: 'Mainland China',
      institutions: ['Hunan University'],
      photoLayout: 'unsupported-layout',
    },
  ])

  assert.equal(regions[0]?.photoLayout, 'portrait-feature')
  assert.equal(regions[1]?.photoLayout, undefined)
})
