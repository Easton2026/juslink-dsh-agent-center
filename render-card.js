export const RENDER_CARD_TOOL = 'juslink_render_card';
export const MAX_CARD_HTML_BYTES = 512 * 1024;

export const DESIGN_SYSTEM_CSS = `:root{
  --bg:#ffffff;--card:#ffffff;--soft:#f6f8fc;--line:#dde4f2;--ink:#1d2433;--ink2:#5c667a;
  --brand:#1c3faa;--brand-soft:rgba(28,63,170,.09);--brand-line:rgba(28,63,170,.22);
  --green:#0e7a4b;--green-soft:rgba(14,122,75,.10);--green-line:rgba(14,122,75,.24);
  --amber:#b25e09;--amber-soft:rgba(217,119,6,.12);--amber-line:rgba(217,119,6,.24);--amber-ink:#8f4a05;
  --red:#c42b33;--red-soft:rgba(220,38,38,.11);--red-line:rgba(220,38,38,.24);--red-ink:#991b1b;
  --blue:#1c3faa;--blue-soft:rgba(28,63,170,.09);--blue-line:rgba(28,63,170,.22);--blue-ink:#1c3faa;
  --gray-soft:#f6f8fc;--row-line:#edf1f8;--dot-border:#c4cee2;--bullet:#1c3faa;--footer-ink:#7a8599;--footer-b:#5c667a;
}
:root[data-theme="dark"]{
  --bg:#161922;--card:#1c202b;--soft:#232836;--line:#2e3547;--ink:#e6ebf5;--ink2:#98a3b8;
  --brand:#6e8efb;--brand-soft:rgba(110,142,251,.16);--brand-line:rgba(110,142,251,.32);
  --green:#34d399;--green-soft:rgba(16,185,129,.16);--green-line:rgba(52,211,153,.32);
  --amber:#fbbf24;--amber-soft:rgba(245,158,11,.16);--amber-line:rgba(251,191,36,.32);--amber-ink:#fcd34d;
  --red:#f87171;--red-soft:rgba(239,68,68,.16);--red-line:rgba(248,113,113,.32);--red-ink:#fca5a5;
  --blue:#6e8efb;--blue-soft:rgba(110,142,251,.16);--blue-line:rgba(110,142,251,.32);--blue-ink:#93affd;
  --gray-soft:#232836;--row-line:#262c3b;--dot-border:#4b556b;--bullet:#6e8efb;--footer-ink:#8792a6;--footer-b:#b0bacb;
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  background:var(--bg);color:var(--ink);
  font-family:system-ui,-apple-system,"PingFang SC","Segoe UI","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  font-size:13.5px;line-height:1.55;-webkit-font-smoothing:antialiased;padding:16px 18px 18px;
}
.wrap{max-width:920px;margin:0 auto}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px}
header{display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px;justify-content:space-between;margin-bottom:12px}
.head-left{display:flex;flex-direction:column;gap:3px;min-width:0}
.head-id{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kind-tag{
  display:inline-flex;align-items:center;padding:2px 8px;border-radius:6px;
  font-size:12px;font-weight:600;background:var(--brand-soft);color:var(--brand);white-space:nowrap;
}
.no{font-size:16px;font-weight:680;letter-spacing:.2px;font-variant-numeric:tabular-nums;color:var(--ink);overflow-wrap:anywhere}
.sub{font-size:12px;color:var(--ink2)}
.copy-btn{
  appearance:none;padding:2px 8px;border:1px solid var(--line);border-radius:6px;
  background:transparent;color:var(--ink2);font:inherit;font-size:11.5px;line-height:1.5;cursor:pointer;
  transition:background .12s,color .12s,border-color .12s;
}
.copy-btn:hover{background:var(--soft);color:var(--ink)}
.copy-btn.copied{border-color:var(--green);color:var(--green)}
.badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.badge{
  display:inline-flex;align-items:center;gap:6px;background:var(--brand-soft);color:var(--brand);
  border:1px solid transparent;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;white-space:nowrap;
}
.badge.ok{background:var(--green-soft);color:var(--green)}
.badge.warn{background:var(--amber-soft);color:var(--amber)}
.badge.danger{background:var(--red-soft);color:var(--red)}
.badge.info{background:var(--brand-soft);color:var(--brand)}
.badge.neutral{background:var(--gray-soft);color:var(--ink2)}
.dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.alert{
  display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;
  background:var(--amber-soft);border:1px solid var(--amber-line);border-radius:10px;
  padding:9px 12px;font-size:12.5px;line-height:1.6;color:var(--amber);margin-bottom:12px;
}
.alert.ok{background:var(--green-soft);border-color:var(--green-line);color:var(--green)}
.alert.danger{background:var(--red-soft);border-color:var(--red-line);color:var(--red)}
.alert.info{background:var(--brand-soft);border-color:var(--brand-line);color:var(--brand)}
.alert b{font-weight:650}
.chip{
  display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;
  font-size:11.5px;font-weight:600;background:var(--card);color:var(--ink);border:1px solid var(--line);
}
.chip.ok{color:var(--green);border-color:var(--green-line)}
.chip.warn{color:var(--amber);border-color:var(--amber-line)}
.chip.danger{color:var(--red);border-color:var(--red-line)}
.chip.info{color:var(--brand);border-color:var(--brand-line)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(136px,1fr));gap:10px;margin-bottom:12px}
.kpi{padding:11px 13px;background:var(--soft);border-radius:10px;border:1px solid var(--line);min-width:0}
.kpi.info{background:var(--brand-soft);border-color:var(--brand-line)}
.kpi.info .vl{color:var(--brand)}
.kpi.ok{background:var(--green-soft);border-color:var(--green-line)}
.kpi.ok .vl{color:var(--green)}
.kpi.warn{background:var(--amber-soft);border-color:var(--amber-line)}
.kpi.warn .vl{color:var(--amber)}
.kpi.danger{background:var(--red-soft);border-color:var(--red-line)}
.kpi.danger .vl{color:var(--red)}
.kpi .lb{font-size:11.5px;color:var(--ink2);margin-bottom:4px}
.kpi .vl{font-size:17px;font-weight:680;font-variant-numeric:tabular-nums;line-height:1.25;color:var(--ink);overflow-wrap:anywhere;word-break:break-word}
.kpi .vl small{font-size:12px;font-weight:500;color:var(--ink2);margin-left:3px}
section{margin-bottom:12px}
.sec-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:0 0 8px 2px;flex-wrap:wrap}
.sec-hd h2{font-size:13.5px;font-weight:650;color:var(--ink)}
.sec-hd span{font-size:12px;color:var(--ink2)}
.pad{padding:14px 16px}
.route{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:10px;background:var(--soft)}
.port{min-width:120px}
.port .p1{font-size:15px;font-weight:650;color:var(--ink)}
.port .p2{font-size:11.5px;color:var(--ink2);margin-top:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.port .p3{font-size:12px;color:var(--ink2);margin-top:4px;font-variant-numeric:tabular-nums}
.arrow{flex:1;min-width:90px;position:relative;height:26px}
.arrow::before{content:"";position:absolute;left:0;right:10px;top:12px;height:2px;background:linear-gradient(90deg,var(--brand) 0%,var(--brand) 55%,var(--line) 55%,var(--line) 100%);border-radius:2px}
.arrow::after{content:"";position:absolute;right:0;top:8px;width:8px;height:8px;border-top:2px solid var(--ink2);border-right:2px solid var(--ink2);transform:rotate(45deg)}
.arrow span{position:absolute;left:50%;top:-4px;transform:translateX(-50%);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:550;color:var(--brand);white-space:nowrap}
.vessel{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line);display:flex;gap:12px 18px;flex-wrap:wrap;font-size:12.5px;color:var(--ink2)}
.vessel b{color:var(--ink);font-weight:600}
.meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:10px 16px}
.meta-cell{display:flex;flex-direction:column;gap:2px;min-width:0}
.meta-cell dt{font-size:11.5px;color:var(--ink2)}
.meta-cell dd{font-size:13px;font-weight:550;color:var(--ink);overflow-wrap:anywhere}
.stepper-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;font-weight:600;color:var(--ink2)}
.stepper-head b{color:var(--brand);font-variant-numeric:tabular-nums}
.stepper{display:flex;align-items:flex-start;gap:4px;overflow-x:auto;padding-bottom:2px}
.step{position:relative;flex:1 0 46px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
.step:not(:last-child)::after{content:"";position:absolute;top:5px;left:calc(50% + 6px);right:calc(-50% + 6px);height:2px;background:var(--line)}
.step.done:not(:last-child)::after{background:var(--brand)}
.step .sdot{position:relative;z-index:1;width:11px;height:11px;border-radius:50%;border:2px solid var(--dot-border);background:var(--card)}
.step.done .sdot{border-color:var(--brand);background:var(--brand)}
.step.current .sdot{border-color:var(--brand);background:var(--brand);box-shadow:0 0 0 3px var(--brand-soft)}
.step.warn .sdot{border-color:var(--red);background:var(--red)}
.step .snm{font-size:11px;color:var(--ink2);white-space:nowrap}
.step.done .snm,.step.current .snm{color:var(--ink);font-weight:600}
.step.warn .snm{color:var(--red);font-weight:600}
.tl{padding:4px 0 2px}
.row{display:grid;grid-template-columns:110px 18px 1fr;gap:0;align-items:start}
.row .t{font-size:12px;color:var(--ink2);font-variant-numeric:tabular-nums;padding-top:2px;text-align:right;padding-right:10px}
.row .rail{position:relative;display:flex;justify-content:center;height:100%;min-height:30px}
.row .rail::before{content:"";position:absolute;top:13px;bottom:-6px;width:1.5px;background:var(--line)}
.row:last-child .rail::before{display:none}
.row .rail i{width:9px;height:9px;border-radius:50%;background:var(--card);border:2px solid var(--dot-border);margin-top:5px;z-index:1}
.row.done .rail i{background:var(--brand);border-color:var(--brand)}
.row.warn .rail i{background:var(--red);border-color:var(--red)}
.row .c{padding:0 0 12px 10px;min-width:0}
.row .c h3{font-size:13px;font-weight:600;line-height:1.4;color:var(--ink)}
.row .c p{font-size:12px;color:var(--ink2);margin-top:2px;line-height:1.5}
.tag{display:inline-block;font-size:11px;font-weight:600;padding:0 6px;border-radius:4px;background:var(--gray-soft);color:var(--ink2);margin-left:7px;vertical-align:1px}
.tag.ok{background:var(--green-soft);color:var(--green)}
.tag.warn{background:var(--amber-soft);color:var(--amber)}
.tag.danger{background:var(--red-soft);color:var(--red)}
.tag.info{background:var(--brand-soft);color:var(--brand)}
.wgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.w{padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--soft)}
.w.current{background:var(--amber-soft);border-color:var(--amber-line)}
.w .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;flex-wrap:wrap}
.w .nm{font-size:12.5px;font-weight:640;color:var(--ink)}
.w .code{font-size:11px;color:var(--ink2);font-family:ui-monospace,Menlo,Consolas,monospace}
.w ul{list-style:none;display:flex;flex-direction:column;gap:5px}
.w li{font-size:12px;color:var(--ink2);line-height:1.5;padding-left:11px;position:relative}
.w li::before{content:"";position:absolute;left:0;top:6px;width:5px;height:5px;border-radius:50%;background:var(--bullet)}
.w.note{background:var(--card);border-style:dashed}
details.fold{border:1px solid var(--line);border-radius:10px;background:var(--card);padding:10px 14px;margin-bottom:10px}
details.fold summary{color:var(--brand);font-size:13px;font-weight:600;cursor:pointer;user-select:none;list-style:revert}
details.fold[open] summary{margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed var(--line)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th{text-align:left;font-weight:600;font-size:11.5px;color:var(--ink2);padding:0 10px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:8px 10px;border-bottom:1px solid var(--row-line);font-variant-numeric:tabular-nums;color:var(--ink);vertical-align:top}
tr:last-child td{border-bottom:none}
td.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.2px}
.ok-text{color:var(--green);font-weight:600}
.warn-text{color:var(--amber);font-weight:600}
.danger-text{color:var(--red);font-weight:600}
footer{font-size:11.5px;color:var(--footer-ink);line-height:1.65;margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)}
footer b{color:var(--footer-b);font-weight:600}
@media(max-width:640px){
  .wgrid{grid-template-columns:1fr}
  .row{grid-template-columns:86px 16px 1fr}
}`;

export const RENDER_CARD_PROMPT = [
  '当用户在对话里调用任一智链业务工具（juslink_search_shipment、sky-vigil-find-subscriptions、sky-vigil-tracking、sky-vigil-overview、sky-vigil-manage-subscription、sky-vigil-reference）并获得业务结果时：',
  '1. 必须紧接着自动调用 juslink_render_card，把本次结果按固定视觉风格生成自包含 HTML 片段（不限定固定版式，根据本次实际返回的数据自由组合需要展示的模块），直接内嵌渲染在对话流中。',
  '2. 【全量展示硬要求】后端接口返回的所有有效业务数据都必须完整呈现在视图中，禁止插件或模型私自省略、截断或丢弃任何业务字段或明细记录（例如所有集装箱号与箱型、全部航段与船舶信息、全部轨迹事件、全部预警与变更历史、全部关务分单/分组/扣留记录、原始备注、更新时间、时区口径等）。当字段或明细条目较多时，使用 <details class="fold"> 折叠区或明细表格 <table> 完整收纳，不得用“等 N 条”省略数据。仅按合规要求隐藏纯内部技术订阅 ID 与个人手机号等敏感凭据。',
  '3. 系统会自动注入固定风格 CSS 与浅/深色主题变量，并自动接管 [data-copy] 复制按钮与折叠高度自适应。请严格使用以下设计规范类名自由组合版式（可按需补充少量轻量内联样式，但不要改写主题配色与字体体系）：',
  '   - 外层：<div class="wrap">...</div>',
  '   - 头部：<header><div class="head-left"><div class="head-id"><span class="kind-tag">业务类型</span><div class="no">单号或主标题</div><button type="button" class="copy-btn" data-copy="完整单号">复制</button></div><div class="sub">副标题/承运商/更新时间</div></div><div class="badges"><div class="badge [ok|warn|danger|info|neutral]"><span class="dot"></span>状态文案</div></div></header>',
  '   - 结论/预警提醒条：<div class="alert [ok|warn|danger|info]"><b>核心结论</b> 补充说明 <span class="chip [ok|warn|danger|info]">高亮标签</span></div>',
  '   - 指标卡：<div class="kpis"><div class="card kpi [info|ok|warn|danger]"><div class="lb">指标名</div><div class="vl">数值<small>单位</small></div></div>...</div>',
  '   - 航线/船期卡：<section class="card pad"><div class="route"><div class="port"><div class="p1">起运港</div><div class="p2">五字码</div><div class="p3">实际/预计时间(时区)</div></div><div class="arrow"><span>航程/中转</span></div><div class="port"><div class="p1">目的港</div><div class="p2">五字码</div><div class="p3">预计/实际时间(时区)</div></div></div><div class="vessel"><span>船名/航次 <b>值</b></span>...</div></section>',
  '   - 元信息网格：<section class="card pad"><dl class="meta-grid"><div class="meta-cell"><dt>字段名</dt><dd>字段值</dd></div>...</dl></section>',
  '   - 横向里程碑进度条：<section class="card pad"><div class="stepper-head"><span>运输里程碑</span><b>已完成 X / Y</b></div><div class="stepper"><div class="step [done|current|warn]"><span class="sdot"></span><span class="snm">节点名</span></div>...</div></section>',
  '   - 节点时间轴：<section><div class="sec-hd"><h2>标题</h2><span>口径说明</span></div><div class="card pad tl"><div class="row [done|warn]"><div class="t">时间(时区)</div><div class="rail"><i></i></div><div class="c"><h3>节点<span class="tag [ok|warn|danger|info]">实际/预计</span></h3><p>地点、码头、运输方式、箱号等完整明细</p></div></div></div></section>',
  '   - 异常与口径提示：<section><div class="sec-hd"><h2>预警与异常</h2><span>汇总</span></div><div class="wgrid"><div class="w [current|note]">...</div></div></section>',
  '   - 明细表：<section><div class="sec-hd"><h2>明细</h2><span>共 N 条</span></div><div class="card pad table-wrap"><table><thead><tr><th>列</th></tr></thead><tbody><tr><td>值</td></tr></tbody></table></div></section>',
  '   - 折叠收纳区：<details class="fold" [open]><summary>完整明细标题 (N)</summary>内部放时间轴、明细表或元信息网格</details>',
  '   - 页脚：<footer>数据来源、采集状态与时间口径说明</footer>',
  '4. 严禁在 html 中放入 <script>、<form>、<iframe>、<object>、<embed>、on* 事件属性或外链图片/样式。',
  '5. 调用 juslink_render_card 成功后，对话正文只需用 1 句简短中文总结核心结论或引导下一步操作，不要在正文里重复罗列视图中已展示的字段和明细。',
  '6. 若工具返回未授权或尚未确定单号需要向用户追问时，直接用中文简短沟通，不调用 juslink_render_card。',
].join('\n');

export function sanitizeCardHtml(rawHtml) {
  let html = String(rawHtml ?? '').trim();
  const styles = [];
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_m, css) => {
    const cleanedCss = String(css || '')
      .replace(/<\/?[^>]+>/g, '')
      .replace(/@import\b[^;]*;?/gi, '')
      .replace(/url\(\s*['"]?\s*https?:[^)]*\)/gi, 'none')
      .trim();
    if (cleanedCss) styles.push(cleanedCss);
    return '';
  });
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];
  html = html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?(html|head|body|meta|title|base|link)\b[^>]*>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<(iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|form|img)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, '$1="#"');
  const styleBlock = styles.length ? `<style>${styles.join('\n')}</style>\n` : '';
  return (styleBlock + html.trim()).trim();
}

export function buildCardDocument({ title = '智链业务视图', html = '', theme = 'light', frameId = '', withResizeScript = false } = {}) {
  const safeTitle = String(title || '智链业务视图').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const bodyContent = sanitizeCardHtml(html);
  const interactiveScript = withResizeScript && frameId
    ? `<script>(function(){var id=${JSON.stringify(frameId)};function send(){var h=Math.max(document.documentElement.scrollHeight||0,document.body?document.body.scrollHeight:0);parent.postMessage({type:'juslink-frame-height',id:id,height:h},'*');}if(typeof ResizeObserver!=='undefined'){new ResizeObserver(send).observe(document.documentElement);}document.addEventListener('toggle',function(){setTimeout(send,0);},true);document.addEventListener('click',function(e){var btn=e.target&&e.target.closest?e.target.closest('[data-copy]'):null;if(!btn)return;var val=btn.getAttribute('data-copy')||'';if(!val)return;parent.postMessage({type:'juslink-frame-copy',id:id,text:val},'*');var prev=btn.textContent;btn.textContent='已复制';btn.classList.add('copied');setTimeout(function(){btn.textContent=prev||'复制';btn.classList.remove('copied');},1500);});window.addEventListener('load',send);send();})();</script>`
    : '';
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="${theme === 'dark' ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>${DESIGN_SYSTEM_CSS}</style>
</head>
<body>
${bodyContent}
${interactiveScript}
</body>
</html>`;
}

export function createRenderCardTool() {
  return {
    name: RENDER_CARD_TOOL,
    description: '将智链业务工具返回的全部有效业务数据以固定视觉风格、动态版式的 HTML 视图直接内嵌渲染在当前对话流中。调用任意智链业务工具并拿到结果后自动调用本工具，完整呈现后端返回的全部业务数据（不得省略或截断），不要在正文里输出 HTML 源码。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'html'],
      properties: {
        title: { type: 'string', description: '视图中文标题，不超过 80 个字符，如“OOLU2175633840 · 海运运输与追踪”。' },
        summary: { type: 'string', description: '可选的一两句业务结论摘要。' },
        html: { type: 'string', description: '自包含 HTML 片段（使用固定设计规范类名，完整呈现所有业务数据，不含 script/form/iframe/外链资源）。' },
        sourceTool: { type: 'string', description: '可选的来源工具名，如 sky-vigil-tracking 或 juslink_search_shipment。' },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['rendered', 'title', 'html', 'bytes'],
        properties: {
          rendered: { type: 'boolean' },
          title: { type: 'string' },
          summary: { type: 'string' },
          html: { type: 'string' },
          sourceTool: { type: 'string' },
          bytes: { type: 'number' },
        },
      },
      render: () => [{ type: 'text', text: '【智链业务视图已在对话中内嵌渲染】请用 1 句简短中文给出核心结论或下一步建议，不要在正文重复罗列视图中已展示的字段和明细。' }],
    },
    isConcurrencySafe: () => true,
    presentCall: args => ({ card: 'generic', kind: 'read', title: '生成智链业务视图', rawInput: args?.title ?? '' }),
    async execute(args, execution = {}) {
      execution.signal?.throwIfAborted?.();
      const title = typeof args?.title === 'string' ? args.title.trim().slice(0, 80) : '';
      const rawHtml = typeof args?.html === 'string' ? args.html : '';
      if (!title) throw new Error('请提供视图标题 title。');
      if (!rawHtml.trim()) throw new Error('请提供视图内容 html。');
      const html = sanitizeCardHtml(rawHtml);
      const bytes = Buffer.byteLength(html, 'utf8');
      if (bytes > MAX_CARD_HTML_BYTES) throw new Error(`视图 HTML 超过 ${MAX_CARD_HTML_BYTES} 字节上限，请精简后再渲染。`);
      if (!/<(div|section|header|article|main|table|ul|ol|p|h[1-6]|svg|details)[\s>]/i.test(html)) {
        throw new Error('视图内容看起来不是有效的 HTML 片段。');
      }
      return {
        rendered: true,
        title,
        summary: typeof args?.summary === 'string' ? args.summary.trim().slice(0, 200) : '',
        html,
        sourceTool: typeof args?.sourceTool === 'string' ? args.sourceTool.trim().slice(0, 80) : '',
        bytes,
      };
    },
  };
}
