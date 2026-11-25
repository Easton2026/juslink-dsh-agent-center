import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RENDER_CARD_TOOL,
  DESIGN_SYSTEM_CSS,
  RENDER_CARD_PROMPT,
  sanitizeCardHtml,
  buildCardDocument,
  createRenderCardTool,
} from '../render-card.js';

test('sanitizeCardHtml strips scripts, iframes, external images, event handlers, and @import while keeping semantic layout', () => {
  const dirty = `
    <style>@import url("https://evil.test/x.css"); .x { color: red; background: url(https://evil.test/a.png); }</style>
    <div class="wrap" onclick="alert(1)">
      <script>alert("xss")</script>
      <iframe src="https://evil.test"></iframe>
      <img src="https://evil.test/track.png" />
      <a href="javascript:alert(1)">bad</a>
      <button type="button" class="copy-btn" data-copy="OOLU2175633840">复制</button>
      <details class="fold"><summary>明细</summary><p>完整保留</p></details>
    </div>
  `;
  const clean = sanitizeCardHtml(dirty);
  assert.equal(clean.includes('<script'), false);
  assert.equal(clean.includes('<iframe'), false);
  assert.equal(clean.includes('<img'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('@import'), false);
  assert.equal(clean.includes('https://evil.test'), false);
  assert.equal(clean.includes('data-copy="OOLU2175633840"'), true);
  assert.equal(clean.includes('<details class="fold">'), true);
  assert.equal(clean.includes('完整保留'), true);
});

test('buildCardDocument injects fixed design system CSS, theme attribute, and interactive resize/copy bridge', () => {
  const doc = buildCardDocument({
    title: 'OOLU2175633840 · 海运状态',
    html: '<div class="wrap"><div class="no">OOLU2175633840</div></div>',
    theme: 'dark',
    frameId: 'jlc-frame-1',
    withResizeScript: true,
  });
  assert.match(doc, /data-theme="dark"/);
  assert.equal(doc.includes(DESIGN_SYSTEM_CSS), true);
  assert.equal(doc.includes('juslink-frame-height'), true);
  assert.equal(doc.includes('juslink-frame-copy'), true);
});

test('createRenderCardTool validates inputs and returns sanitized card payload', async () => {
  const tool = createRenderCardTool();
  assert.equal(tool.name, RENDER_CARD_TOOL);
  assert.match(RENDER_CARD_PROMPT, /禁止插件或模型私自省略/);
  await assert.rejects(() => tool.execute({ title: '', html: '<div>ok</div>' }), /title/);
  await assert.rejects(() => tool.execute({ title: '测试', html: 'plain text without tags' }), /有效的 HTML/);
  const out = await tool.execute({
    title: '海运提单详情',
    summary: '当前离港在途',
    sourceTool: 'juslink_search_shipment',
    html: '<div class="wrap"><header><div class="no">OOLU2175633840</div></header></div>',
  });
  assert.equal(out.rendered, true);
  assert.equal(out.title, '海运提单详情');
  assert.ok(out.bytes > 0);
});
