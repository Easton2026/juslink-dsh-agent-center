window.__ModuleLoader__.load({
  id: '@juslink/agent-center-ui',
  factory(require) {
    const exports = {};
    const CSS = ".jlc-root{height:100%;min-height:0;overflow:auto;background:#f8fafb;color:#21313d;font-family:system-ui,-apple-system,\"PingFang SC\",sans-serif;font-size:14px;line-height:1.6;color-scheme:light;isolation:isolate}.jlc-root *{box-sizing:border-box}.jlc-root button,.jlc-root input{font:inherit}.jlc-root button{cursor:pointer}.jlc-root button:focus-visible,.jlc-root input:focus-visible{outline:3px solid #72b8b0;outline-offset:3px}.jlc-header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:25px 36px 20px;padding-left:max(36px,var(--dsh-frame-leading-clearance,0px));background:#fff;border-bottom:1px solid #e4e9ed}.jlc-brand{display:flex;align-items:center;gap:14px;font-size:19px;font-weight:650}.jlc-brand img{width:85px;height:28px;object-fit:contain}.jlc-divider{height:20px;border-left:1px solid #dce2e5;margin:0 5px}.jlc-subtitle{font-size:14px;font-weight:400;color:#72808a}.jlc-mode{font-size:12px;background:#edf4f2;color:#3b7069;padding:4px 11px;border-radius:4px;white-space:nowrap}.jlc-tabs{display:flex;gap:25px;padding:0 36px;background:#fff;border-bottom:1px solid #e4e9ed;overflow-x:auto}.jlc-tabs button{background:none;border:0;border-bottom:2px solid transparent;border-radius:0;color:#75828b;padding:16px 0 13px;white-space:nowrap}.jlc-tabs button.selected{border-bottom-color:#237c70;color:#216b61;font-weight:600}.jlc-content{max-width:1250px;margin:auto;padding:32px 40px 45px}.jlc-root h1{font-size:28px;line-height:1.4;letter-spacing:-.6px;font-weight:650;margin:0 0 14px}.jlc-root h2{font-size:17px;font-weight:600;margin:0 0 8px}.jlc-root h3{font-size:17px;font-weight:600;margin:0}.jlc-root p{margin:8px 0}.jlc-intro{padding:10px 0 27px;max-width:800px}.jlc-intro>p:last-child{color:#73818c;font-size:14px;max-width:700px;line-height:1.9}.jlc-eyebrow{color:#24776c;font-size:13px;margin-bottom:12px!important}.jlc-section-title{display:flex;align-items:center;justify-content:space-between;margin:8px 0 16px;gap:16px}.jlc-section-title span{font-size:12px;color:#8b979f}.jlc-section-title h2{margin:0}.jlc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.jlc-card{position:relative;padding:22px;background:#fff;border:1px solid #e3e9ec;border-radius:9px;min-height:204px;display:flex;flex-direction:column}.jlc-number{font-size:12px;font-variant-numeric:tabular-nums;letter-spacing:1px;color:#819a97;margin-bottom:13px}.jlc-summary{font-size:13px;color:#657680;margin-top:7px!important}.jlc-example{font-size:12px;color:#8c989f;padding-top:5px}.jlc-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:18px}.jlc-card-bottom small{font-size:11px;color:#87959c}.jlc-card-bottom button{background:none;border:0;padding:0;font-size:12px;color:#257a6e;white-space:nowrap}.jlc-query{margin-top:26px;padding:23px 26px;border:1px solid #dde6e5;border-radius:9px;background:#fff}.jlc-muted{color:#7b8992;font-size:13px}.jlc-query form{margin-top:18px}.jlc-query label{display:block;color:#667781;font-size:12px;margin-bottom:6px}.jlc-input-row{display:flex;gap:12px}.jlc-input-row input{min-width:0;flex:1;border:1px solid #dce4e7;border-radius:5px;background:#fbfcfc;color:#233b47;padding:10px 13px}.jlc-root .jlc-primary{border:0;background:#267c70;color:#fff;padding:10px 20px;border-radius:5px;white-space:nowrap}.jlc-root button:disabled{opacity:.55;cursor:wait}.jlc-result{border:1px solid #e1e7eb;border-radius:7px;padding:20px;margin-top:18px;background:#fff}.jlc-result-title{display:flex;justify-content:space-between;align-items:center;gap:12px}.jlc-result-title h3{font-size:15px}.jlc-status{font-size:12px;padding:3px 9px;border-radius:4px;background:#f1f4f6;color:#70818d;white-space:nowrap}.jlc-status.completed{background:#eaf5ef;color:#29724c}.jlc-status.failed,.jlc-status.interrupted{background:#fff3e9;color:#a66529}.jlc-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:18px 0}.jlc-facts dt{font-size:12px;color:#83919b}.jlc-facts dd{margin:4px 0 0;font-size:14px;overflow-wrap:anywhere}.jlc-note{font-size:12px;color:#91a0a6;margin-top:22px!important}.jlc-empty{margin-top:26px;padding:45px 32px;background:#fff;border:1px solid #e4e9ed;border-radius:8px;max-width:850px}.jlc-empty p{max-width:650px;color:#6f818d;line-height:1.9}.jlc-empty button{margin-top:15px}.jlc-experts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:26px}.jlc-expert{padding:25px;background:#fff;border:1px solid #e4e9ed;border-radius:8px}.jlc-expert small{color:#8b9a9f}.jlc-expert p{margin:16px 0}@media(min-width:1500px){.jlc-content{padding-top:45px}.jlc-card{min-height:220px}}@media(max-width:850px){.jlc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.jlc-content{padding:25px}.jlc-header{padding:22px 25px}.jlc-subtitle,.jlc-divider{display:none}.jlc-facts{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){.jlc-grid,.jlc-experts,.jlc-facts{grid-template-columns:1fr}.jlc-tabs{padding:0 22px;gap:20px}.jlc-content{padding:22px}.jlc-root h1{font-size:23px}.jlc-input-row{flex-direction:column}.jlc-section-title span{display:none}.jlc-card{min-height:190px}}\n";
    const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAAgCAIAAAAZhijPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALXSURBVGhD7ZlNTsMwEIW75Fhdca5KHKziCOw5AHvWUJ79htfJxG6dZgIC9VNUeZz5fXVSJHanO5W7EMZ/EOLz/dmut6fJWtf7s7n26QpxPB4Ph4MZSazMifD9fo8M52nrZbf7FLeqyMfrIz5td0pbCNTb7Xb4NDuDlTmhAsLByq9HcgRFGkKoZKIQ63NmCUGKHC8PXotfE4LHlesRcoUAQYvfEYJNlD4GnnCSLgRgD1xfFwImagMs6EC4CcyuIASwXX8r5MRTakK4QwEfgVh82o0KTGYIaWud6DwI2+CXcV0IlKGJBR0INwFNuQV4N+Tkc4E+dJfy8dOjCZVBbfiK3FnKshMxKIQZNcrPwyQhZ8D7z6FPEMKrILEWoceTZo4QTR+skYFdzoVgCP29EFh7E4QMCGEs4d2l4EhShQUvS1XFgg6EmwDr+ZyByzk1uS+hTYYog2elCno2QbIQBJ6hxcs5m0KEkFAChBKDNFUAOUIAuXkUMiiEny2EyCTcXIreC7j4YyHShCDw0VSEUYlCyJn7g5SD8P2bjUVQATSECF3K9IW1CWxrSnBIFAIh8mf4VSYHofPnbBxD9QDLNHfUCqhxBezbquLHA1xzKuShyYTes4YWQojMCyFzvARFhf4fsvZ1IS9hdkIPYHYHOGgwgDUSArM3OBHeBD5KTJ6F/kEQky49rEfUdxM4NDOQ0HeWEEBJ6CDCKWi+EeY0xkBe3xBBVbVLB66BebT0UtNhKnnSQZl93RAiUzmB8sAnHIFxCch5jJWoJDomNAU7DszdbmClBCRfiB6Y2ab/xn+3N9CY/yYJSI4QqH31bQSgBQ8zHy7bXUju/CLtRKxv5QJF6G3mF5mPBjobOReDlOHx/m8Nv4XoaUIQ/nThc6kiZWxN3h8+fX6RLASwecIM/EeLu7hfLnmGi1FbDu/JF0JQkfPYYU5ekuNnx56zoRB/i7sQxl2Iyun0BbJocIzibCQTAAAAAElFTkSuQmCC";
    'use strict';
const React = require('react');
const { createElement: h, useState, useEffect, useSyncExternalStore } = React;
const PANEL_ID = 'juslink-agent-center';
const STORAGE_KEY = 'juslink.agent-center.ui.v1';
const capabilities = [
  { id: 'direct', name: '直接任务', number: '01', summary: '一句话，查询一项业务信息', example: '帮我查下这票货在哪里了', detail: '补齐必要参数，选择对应工具，展示查询时间、状态和来源。', status: '可体验模拟查询' },
  { id: 'complex', name: '复杂任务', number: '02', summary: '围绕目标，组织多项业务能力', example: '帮我分析这票货有没有延误风险', detail: '由 Agent 按实际目标动态规划，关联运输、关务、港口与风险信息。', status: '待接入 Agent 执行' },
  { id: 'expert', name: '场景专家', number: '03', summary: '把常用任务组合成专业场景', example: '使用物流综合分析专家', detail: '组合 Tool、Skill 和输出要求，支持平台预置及用户自建。', status: '展示能力范围' },
  { id: 'tasks', name: '任务工作台', number: '04', summary: '执行到哪一步，随时可回看', example: '查看正在执行和等待处理的任务', detail: '记录步骤、等待原因与结果。当前模拟查询记录保存在本机。', status: '可查看本机模拟记录' },
  { id: 'artifacts', name: '成果中心', number: '05', summary: '保存成果，继续修改和使用', example: '打开报告，再调整分析重点', detail: '后续接入 AI 动态 HTML、报表、来源追溯和版本管理。', status: '成果生成待接入' },
  { id: 'skills', name: '工作方法', number: '06', summary: '让 Agent 理解你的专业经验', example: '以后分析延误，先说结论再列证据', detail: '用自然语言维护 Skill，由 Agent 根据任务发现和加载。', status: 'Skill 管理待接入' },
];
const DEMO = { reference: 'DEMO-SH-001', status: '运输途中', route: '上海港 → 新加坡港', vessel: 'JUSLINK DEMO', lastEvent: '已离开起运港', nextEvent: '等待目的港到港信息', source: '本机模拟工具 · mock.shipment.lookup' };
let records = [];
let storageError = false;
try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); if (Array.isArray(saved)) records = saved; } catch { storageError = true; }
records = records.map(r => r.status === 'running' ? { ...r, status: 'interrupted', error: '页面已重载，请重新发起模拟查询。' } : r);
const subscribers = new Set();
const timers = new Set();
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); storageError = false; } catch { storageError = true; }
  subscribers.forEach(fn => fn());
}
function useRecords() { return useSyncExternalStore(fn => { subscribers.add(fn); return () => subscribers.delete(fn); }, () => records); }
function startLookup(reference) {
  const id = crypto.randomUUID();
  const record = { id, reference, title: '查询货物 ' + reference, status: 'running', startedAt: new Date().toISOString() };
  records = [record, ...records]; persist();
  const timer = setTimeout(() => {
    timers.delete(timer);
    records = records.map(r => r.id !== id ? r : { ...r, status: reference === DEMO.reference ? 'completed' : 'failed', finishedAt: new Date().toISOString(), result: reference === DEMO.reference ? { ...DEMO, queriedAt: new Date().toISOString() } : null, error: reference === DEMO.reference ? null : '模拟数据集中没有该单号。请使用 DEMO-SH-001。' });
    persist();
  }, 1800);
  timers.add(timer);
  return id;
}
function Icon({ size = 20 }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z' }));
}
function button(text, action, props = {}) { return h('button', { type: 'button', onClick: action, ...props }, text); }
function formatDate(value) { return new Date(value).toLocaleString('zh-CN', { hour12: false }); }
const statusText = { running: '查询中', completed: '已完成', failed: '未查到数据', interrupted: '已中断' };
function Result({ record }) {
  if (!record) return null;
  return h('section', { className: 'jlc-result', 'aria-live': 'polite' },
    h('div', { className: 'jlc-result-title' }, h('h3', null, record.title), h('span', { className: 'jlc-status ' + record.status }, statusText[record.status])),
    h('p', { className: 'jlc-muted' }, '发起于 ' + formatDate(record.startedAt)),
    record.status === 'running' && h('p', null, '正在等待模拟工具返回…'),
    record.error && h('p', { role: 'status' }, record.error),
    record.result && h(React.Fragment, null,
      h('dl', { className: 'jlc-facts' }, ...[['当前状态', record.result.status], ['运输路线', record.result.route], ['船名', record.result.vessel], ['最近节点', record.result.lastEvent], ['下一节点', record.result.nextEvent], ['查询时间', formatDate(record.result.queriedAt)]].map(([key, value]) => h('div', { key }, h('dt', null, key), h('dd', null, value)))),
      h('p', { className: 'jlc-muted' }, '来源：' + record.result.source + '。以上为演示数据。')));
}
function Panel() {
  const [tab, setTab] = useState('home');
  const [reference, setReference] = useState(DEMO.reference);
  const [activeId, setActiveId] = useState(null);
  const list = useRecords();
  const active = list.find(r => r.id === activeId);
  const running = list.some(r => r.status === 'running');
  const tabs = [['home', '能力与任务'], ['tasks', '任务工作台'], ['artifacts', '成果中心'], ['expert', '场景专家'], ['skills', '我的工作方法']];
  function openCapability(item) {
    if (item.id === 'direct') { document.getElementById('jlc-query')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); document.getElementById('jlc-reference')?.focus(); }
    else if (item.id === 'complex') setTab('expert');
    else setTab(item.id);
  }
  return h('div', { className: 'jlc-root' },
    h('header', { className: 'jlc-header' },
      h('div', { className: 'jlc-brand' }, h('img', { src: LOGO, alt: 'JusLink' }), h('span', null, '智链平台'), h('span', { className: 'jlc-divider' }), h('span', { className: 'jlc-subtitle' }, 'Agent 能力与任务中心')),
      h('span', { className: 'jlc-mode' }, '本机演示')),
    h('nav', { className: 'jlc-tabs', 'aria-label': '智链平台工作区' }, ...tabs.map(([id, label]) => button(label + (id === 'tasks' && list.length ? ' · ' + list.length : ''), () => setTab(id), { key: id, 'aria-current': tab === id ? 'page' : undefined, className: tab === id ? 'selected' : '' }))),
    h('main', { className: 'jlc-content' },
      storageError && h('p', { role: 'alert' }, '本机存储不可用，记录可能无法保留。'),
      tab === 'home' && h(React.Fragment, null,
        h('section', { className: 'jlc-intro' }, h('p', { className: 'jlc-eyebrow' }, '从业务目标开始'), h('h1', null, '把一项需求，交给 Agent 完成。'), h('p', null, '查询一票货、分析运输风险，或把专业经验沉淀成可复用的方法。让能力围绕任务协同，让每次工作留下成果。')),
        h('div', { className: 'jlc-section-title' }, h('h2', null, '你可以在这里做什么'), h('span', null, '六项能力 · 一个工作空间')),
        h('div', { className: 'jlc-grid' }, ...capabilities.map(item => h('article', { className: 'jlc-card', key: item.id }, h('span', { className: 'jlc-number' }, item.number), h('h3', null, item.name), h('p', { className: 'jlc-summary' }, item.summary), h('p', { className: 'jlc-example' }, '“' + item.example + '”'), h('div', { className: 'jlc-card-bottom' }, h('small', null, item.status), button('查看 →', () => openCapability(item), { 'aria-label': '查看' + item.name }))))),
        h('section', { className: 'jlc-query', id: 'jlc-query' },
          h('div', null, h('h2', null, '先体验一次货物查询'), h('p', { className: 'jlc-muted' }, '输入演示单号，查看工具等待、查询结果和任务记录。')),
          h('form', { onSubmit: e => { e.preventDefault(); if (!reference.trim() || running) return; setActiveId(startLookup(reference.trim())); } },
            h('label', { htmlFor: 'jlc-reference' }, '演示单号'), h('div', { className: 'jlc-input-row' }, h('input', { id: 'jlc-reference', required: true, maxLength: 100, value: reference, onChange: e => setReference(e.target.value), placeholder: DEMO.reference }), h('button', { type: 'submit', disabled: running, className: 'jlc-primary' }, running ? '查询中…' : '查询模拟货物'))),
          h(Result, { record: active })),
        h('p', { className: 'jlc-note' }, '当前已接入 DSH 官方导航与主面板扩展。业务系统、Agent 执行和动态 HTML 生成将在后续接入。')),
      tab === 'tasks' && h(React.Fragment, null, h('h1', null, '任务工作台'), h('p', { className: 'jlc-muted' }, '本机模拟查询的执行记录。切换面板后仍可回看；页面重载会中断未完成的模拟执行。'), list.length ? list.map(record => h(Result, { key: record.id, record })) : h('div', { className: 'jlc-empty' }, h('h2', null, '还没有任务'), h('p', null, '从能力与任务页面发起一次模拟查询。'), button('去发起任务', () => setTab('home'), { className: 'jlc-primary' }))),
      tab === 'artifacts' && h(React.Fragment, null, h('h1', null, '成果中心'), h('div', { className: 'jlc-empty' }, h('h2', null, '在这里保留每一次工作的成果'), h('p', null, '后续由 Agent 根据任务数据和风格提示词动态生成 HTML、报告或文件，并保存来源与版本。'), h('p', { className: 'jlc-muted' }, '当前尚未连接成果生成服务。'))),
      tab === 'expert' && h(React.Fragment, null, h('h1', null, '场景专家'), h('p', { className: 'jlc-muted' }, '以下是待接入的场景说明，展示工具与专业方法如何围绕任务组合。'), h('div', { className: 'jlc-experts' }, ...[['物流综合分析', '分析一票货的整体情况，按需要查询运输、关务、港口与风险。', '运输状态 · 关务查询 · 港口洞察 · 风险查询'], ['运输异常跟进', '核对计划与实际节点，识别异常证据、业务影响及后续跟进事项。', '运输节点 · 时效对比 · 异常分析方法']].map(([title, description, tools]) => h('article', { className: 'jlc-expert', key: title }, h('h2', null, title), h('p', null, description), h('p', { className: 'jlc-muted' }, tools), h('small', null, '场景展示 · 执行待接入'))))),
      tab === 'skills' && h(React.Fragment, null, h('h1', null, '我的工作方法'), h('div', { className: 'jlc-empty' }, h('h2', null, '把你的经验，变成 Agent 可复用的方法'), h('p', null, '例如：分析运输延误时，先看当前状态和计划时效，再核对港口、关务与风险，报告先说结论，再列依据。'), h('p', { className: 'jlc-muted' }, '自然语言维护、Skill 保存和自动加载将在后续接入。')))));
}
exports.inject = ['slots', 'layout'];
exports.apply = function apply(ctx) {
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.juslinkAgentCenter = 'true';
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, 'juslink: scoped styles');
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, Panel));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, label: '智链平台', order: 5 }, Icon));
  ctx.effect(() => {
    persist();
    return () => {
      timers.forEach(clearTimeout); timers.clear();
      records = records.map(r => r.status === 'running' ? { ...r, status: 'interrupted', error: '插件已停用，请重新发起模拟查询。' } : r);
      persist();
      if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) ctx.layout.selectPanel(null);
    };
  }, 'juslink: lifecycle');
};

    return exports;
  }
});
