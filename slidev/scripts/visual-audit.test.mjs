import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from '@playwright/test'
import { auditSlide } from './visual-audit.mjs'

test('audits the formula root without treating KaTeX script layout as tiny text', async (context) => {
  const browser = await chromium.launch({ headless: true })
  context.after(async () => await browser.close())
  const page = await browser.newPage()

  await page.setContent(`
    <div class="slidev-page-1">
      <div class="slidev-layout" style="--tulip-caption-size:10.24px;--tulip-small-size:12.16px">
        <span class="katex" style="font-size:16px">
          <span class="mtight" style="font-size:8px">i</span>
          <span class="vlist-s" style="font-size:1px">x</span>
        </span>
      </div>
    </div>
  `)

  let audit = await auditSlide(page, 1)
  assert.equal(audit.findings.some(finding => finding.code === 'font-below-caption-floor'), false)

  await page.locator('.katex').evaluate(element => element.style.fontSize = '8px')
  audit = await auditSlide(page, 1)
  const finding = audit.findings.find(item => item.code === 'font-below-caption-floor')
  assert.deepEqual(finding?.elements, ['span.katex=8px'])
})
