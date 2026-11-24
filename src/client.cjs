'use strict';
const React = require('react');
const { createElement: h, useState, useEffect, useRef, useSyncExternalStore } = React;
const PANEL_ID = 'juslink-agent-center';
const STORAGE_KEY = 'juslink.agent-center.ui.v1';
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
let rememberedTab = 'home';
let lastSkillSession;
let skillLaunchPending = false;
let capabilityLaunchPending = false;
let lastExpertSession;
let rememberedExpertScope = 'platform';
function CapabilityIcon({ kind }) {
  const paths = {
    box: ['m3 7 9-4 9 4-9 4-9-4Z', 'M3 7v10l9 4 9-4V7', 'M12 11v10', 'm7.5 5 9 4'],
    route: ['M6 7h10a4 4 0 0 1 0 8H8', 'm10 12-3 3 3 3', 'M6 4v6', 'M3 7h6'],
    clock: ['M12 8v5l3 2'],
    document: ['M7 3h7l4 4v14H6V3h1Z', 'M14 3v5h4', 'M9 12h6', 'M9 16h5'],
    port: ['M4 20h16', 'M6 17V9h12v8', 'M4 9h16L12 3 4 9Z', 'M10 12v5', 'M14 12v5'],
    shield: ['m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Z', 'M12 8v5', 'M12 16h.01'],
  };
  return h('svg', { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    kind === 'clock' && h('circle', { cx: 12, cy: 12, r: 9 }), ...(paths[kind] || paths.box).map((d, i) => h('path', { key: i, d })));
}
const toolLabels = new Map([
  ['sky-vigil-manage-subscription', ['订阅与管理', '建立追踪，并管理已有订阅', 'document']],
  ['sky-vigil-find-subscriptions', ['搜索订阅', '找到需要查看的业务记录', 'box']],
  ['sky-vigil-tracking', ['追踪详情', '查看运输进度和清关情况', 'route']],
  ['sky-vigil-overview', ['统计概览', '了解订阅数量与分类情况', 'clock']],
  ['sky-vigil-reference', ['参考数据', '核对运输公司与状态含义', 'port']],
]);
function gatewayEntry(tool) {
  const [label, summary, icon] = toolLabels.get(tool.name) || [];
  return { id: tool.name, title: label || tool.title || tool.name, description: summary || tool.summary, icon,
    prompt: tool.name === 'sky-vigil-find-subscriptions' ? '查一票智链订阅' : '帮我' + (label || tool.title || tool.name) + '。使用当前智链授权，信息够了就直接办理，只问本次缺的必要信息。用中文简短给我业务结果。新增、修改或删除订阅时以我的明确要求为准。' };
}
function statusTone(text) {
  const s = String(text || '');
  if (!s) return 'neutral';
  if (/异常|延误|扣留|失败|退单|查验|甩柜|滞留|超期/.test(s)) return 'danger';
  if (/变更|推迟|等待|采集/.test(s)) return 'warn';
  if (/抵港|到港|送达|签收|放行|还空|结关|完成/.test(s)) return 'success';
  if (/离港|在途|装船|起飞|派送|进港|提空/.test(s)) return 'info';
  return 'neutral';
}
const MODE_LABELS = { VESSEL: '海运', TRUCK: '卡车', RAIL: '铁路', AIR: '空运', EXPRESS: '快递', M: '主单', H: '分单' };
const RECEIVE_LABELS = { IN_COLLECTING: ['采集中', 'warn'], FAILED: ['采集失败', 'danger'] };
function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  function onCopy() {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }).catch(() => {});
    }
  }
  return h('button', { type: 'button', className: 'jlc-copy-btn' + (copied ? ' copied' : ''), onClick: onCopy, title: '复制单号', 'aria-label': copied ? '已复制单号' : '复制单号 ' + value },
    copied ? '已复制' : '复制');
}
function formatTimeTag(time, zone) {
  if (!time) return '';
  return zone ? `${time} (${zone})` : time;
}
function ArrivalBanner({ arrival, warnings, errorMsg }) {
  const currentWarnCount = Array.isArray(warnings) ? warnings.filter(w => w.current).length : 0;
  const delayChange = arrival?.changes?.find(c => c.changeText);
  if (!arrival?.hintText && !arrival?.etaChangeText && !currentWarnCount && !errorMsg) return null;
  const tone = errorMsg ? 'danger' : (arrival?.etaChangeCount > 0 || currentWarnCount > 0) ? 'warn' : 'info';
  return h('div', { className: 'jlc-banner ' + tone },
    arrival?.hintText && h('span', { className: 'jlc-banner-main' }, arrival.hintText),
    arrival?.etaChangeText && h('span', { className: 'jlc-banner-chip warn' },
      arrival.etaChangeText + (delayChange?.changeText ? ' · ' + delayChange.changeText : '')),
    currentWarnCount > 0 && h('span', { className: 'jlc-banner-chip danger' }, currentWarnCount + ' 条当前预警'),
    errorMsg && h('span', { className: 'jlc-banner-chip danger' }, errorMsg));
}
function MilestoneStepper({ milestones }) {
  if (!Array.isArray(milestones) || !milestones.length) return null;
  const doneCount = milestones.filter(m => m.done).length;
  let lastDone = -1;
  milestones.forEach((m, i) => { if (m.done) lastDone = i; });
  return h('div', { className: 'jlc-stepper-wrap' },
    h('div', { className: 'jlc-stepper-head' },
      h('span', null, '运输里程碑'),
      h('span', { className: 'jlc-stepper-ratio' }, `已完成 ${doneCount} / ${milestones.length}`)),
    h('div', { className: 'jlc-stepper', role: 'list' },
      ...milestones.map((m, idx) => {
        const cls = m.warning ? 'warn' : (idx === lastDone ? 'current' : m.done ? 'done' : 'pending');
        const tip = [m.name, m.shortTime ? formatTimeTag(m.shortTime, m.zone) : '未发生', m.total > 0 ? `${m.completed}/${m.total}箱` : ''].filter(Boolean).join(' · ');
        return h('div', { key: idx, className: 'jlc-step ' + cls, role: 'listitem', title: tip },
          h('span', { className: 'jlc-step-dot', 'aria-hidden': true }),
          h('span', { className: 'jlc-step-name' }, m.name));
      })));
}
function EventTimeline({ events, nodes }) {
  if (Array.isArray(events) && events.length) {
    return h('details', { className: 'jlc-fold' },
      h('summary', null, `完整轨迹事件 (${events.length})`),
      h('ol', { className: 'jlc-timeline' }, ...events.map((ev, i) =>
        h('li', { key: i, className: 'jlc-tl-item' + (ev.estimated ? ' est' : ' act') + (ev.warning ? ' warn' : '') },
          h('span', { className: 'jlc-tl-dot', 'aria-hidden': true }),
          h('div', { className: 'jlc-tl-body' },
            h('div', { className: 'jlc-tl-top' },
              h('span', { className: 'jlc-tl-tag ' + (ev.estimated ? 'est' : 'act') }, ev.estimated ? '预计' : '实际'),
              h('strong', { className: 'jlc-tl-title' }, ev.desc || ev.code || '节点更新'),
              ev.mode && h('span', { className: 'jlc-tl-mode' }, MODE_LABELS[ev.mode] || ev.mode),
              h('span', { className: 'jlc-tl-time' }, formatTimeTag(ev.time, ev.zone))),
            h('div', { className: 'jlc-tl-sub' },
              [ev.location, ev.facility, ev.vessel && (ev.vessel + (ev.voyage ? ' / ' + ev.voyage : '')), ev.containerNo && (ev.containerNo + (ev.containerType ? ' · ' + ev.containerType : ''))].filter(Boolean).join(' · ')))))));
  }
  if (Array.isArray(nodes) && nodes.length) {
    return h('details', { className: 'jlc-fold' },
      h('summary', null, `查看运输节点 (${nodes.length})`),
      h('ol', { className: 'jlc-timeline' }, ...nodes.map((n, i) =>
        h('li', { key: i, className: 'jlc-tl-item' + (n.estimated ? ' est' : ' act') },
          h('span', { className: 'jlc-tl-dot', 'aria-hidden': true }),
          h('div', { className: 'jlc-tl-body' },
            h('div', { className: 'jlc-tl-top' },
              h('span', { className: 'jlc-tl-tag ' + (n.estimated ? 'est' : 'act') }, n.estimated ? '预计' : '实际'),
              h('strong', { className: 'jlc-tl-title' }, n.name),
              h('span', { className: 'jlc-tl-time' }, formatTimeTag(n.time, n.zone))),
            n.place && h('div', { className: 'jlc-tl-sub' }, n.place))))));
  }
  return null;
}
function WarningsFold({ warnings }) {
  if (!Array.isArray(warnings) || !warnings.length) return null;
  const active = warnings.filter(w => w.current).length;
  return h('details', { className: 'jlc-fold' },
    h('summary', null, `预警与变更记录 (${warnings.length}${active ? ` · ${active} 条当前` : ''})`),
    h('ul', { className: 'jlc-warn-list' }, ...warnings.map((w, i) =>
      h('li', { key: i, className: 'jlc-warn-item' + (w.current ? ' current' : '') },
        h('div', { className: 'jlc-warn-head' },
          h('span', { className: 'jlc-warn-flag' }, w.current ? '当前' : '历史'),
          h('strong', null, w.name || w.code || '预警'),
          w.time && h('span', { className: 'jlc-tl-time' }, formatTimeTag(w.time, w.zone))),
        w.description && h('p', { className: 'jlc-warn-desc' }, w.description)))));
}
function EtaHistoryFold({ arrival }) {
  if (!arrival?.changes?.length) return null;
  return h('details', { className: 'jlc-fold' },
    h('summary', null, `ETA 变更记录 (${arrival.changes.length})`),
    h('ul', { className: 'jlc-warn-list' }, ...arrival.changes.map((c, i) =>
      h('li', { key: i, className: 'jlc-warn-item current' },
        h('div', { className: 'jlc-warn-head' },
          h('span', { className: 'jlc-warn-flag' }, c.changeText || '变更'),
          h('span', { className: 'jlc-warn-desc' }, `${c.before || '原预计'} → ${c.after || '新预计'}`))))));
}
function ShipmentSummaryCard({ row, compact = false }) {
  const tracking = row.tracking;
  const status = row.status || tracking?.arrival?.statusText || '订阅记录';
  const recvBadge = RECEIVE_LABELS[row.receiveStatus];
  const podShort = tracking?.arrival?.mainShortTime || row.podTime?.shortTime || '';
  const podZone = tracking?.arrival?.mainZone || row.podTime?.zone || '';
  const podLabel = tracking?.arrival?.mainTimeLabel || (row.podTime ? (row.podTime.estimated ? '预计' : '实际') + row.podTime.label : '');
  const midLabel = [
    tracking?.durationDays ? `海运约 ${tracking.durationDays} 天` : '',
    row.tp ? `经 ${row.tp}` : (row.viaPort ? `经 ${row.viaPort}` : ''),
  ].filter(Boolean).join(' · ');

  const containerSummary = row.containers?.length
    ? row.containers.slice(0, 2).map(c => c.type ? `${c.no} (${c.type})` : c.no).join('、') + (row.containers.length > 2 ? ` 等 ${row.containers.length} 箱` : '')
    : '';
  const metaItems = [
    ['承运商', [row.carrier, row.carrierCode].filter(Boolean).join(' · ')],
    ['船名 / 航次', [row.vessel, row.voyage].filter(Boolean).join(' / ')],
    ['集装箱', containerSummary],
    ['订舱号', row.booking && row.booking !== row.number ? row.booking : ''],
    ['报关单号', row.declaration && row.declaration !== row.number ? row.declaration : ''],
    ['业务号', row.businessNo && row.businessNo !== row.number ? row.businessNo : ''],
    ['进出口', row.direction === 'I' ? '进口' : row.direction === 'E' ? '出口' : ''],
    ['清关方式', row.transportMode === 'O' ? '海运清关' : row.transportMode === 'A' ? '空运清关' : ''],
    ['数据更新', row.lastUpdated],
  ].filter(([, v]) => v);

  return h('article', { className: 'jlc-card jlc-shipment' + (compact ? ' compact' : '') },
    h('header', { className: 'jlc-card-head' },
      h('div', { className: 'jlc-card-id' },
        h('span', { className: 'jlc-kind-tag' }, row.businessLabel || '物流订阅'),
        h('strong', { className: 'jlc-bill-no' }, row.number || '未知单号'),
        h(CopyButton, { value: row.number })),
      h('div', { className: 'jlc-card-badges' },
        recvBadge && h('span', { className: 'jlc-badge ' + recvBadge[1] }, recvBadge[0]),
        h('span', { className: 'jlc-badge ' + statusTone(status) }, status))),
    h(ArrivalBanner, { arrival: tracking?.arrival, warnings: tracking?.warnings, errorMsg: row.errorMsg }),
    (row.from || row.to) && h('div', { className: 'jlc-route' },
      h('div', { className: 'jlc-port' },
        h('div', { className: 'jlc-port-name' }, row.from || '起运地未提供', row.fromCode && h('span', { className: 'jlc-port-code' }, row.fromCode)),
        row.polTime && h('div', { className: 'jlc-port-time' },
          `${row.polTime.estimated ? '预计' : '实际'}${row.polTime.label} · ${formatTimeTag(row.polTime.shortTime || row.polTime.time, row.polTime.zone)}`)),
      h('div', { className: 'jlc-route-mid', 'aria-hidden': true },
        midLabel && h('span', { className: 'jlc-route-chip' }, midLabel),
        h('span', { className: 'jlc-route-line' })),
      h('div', { className: 'jlc-port jlc-port-end' },
        h('div', { className: 'jlc-port-name' }, row.to || '目的地未提供', row.toCode && h('span', { className: 'jlc-port-code' }, row.toCode)),
        podShort && h('div', { className: 'jlc-port-time' },
          `${podLabel} · ${formatTimeTag(podShort, podZone)}`))),
    metaItems.length > 0 && h('dl', { className: 'jlc-meta-grid' },
      ...metaItems.map(([k, v]) => h('div', { key: k, className: 'jlc-meta-cell' }, h('dt', null, k), h('dd', null, v)))),
    tracking?.customsMeta && h('div', { className: 'jlc-customs-strip' },
      tracking.customsMeta.mode && h('span', null, tracking.customsMeta.mode),
      tracking.customsMeta.status && h('span', null, '状态：' + tracking.customsMeta.status),
      tracking.customsMeta.isf && h('span', null, 'ISF：' + tracking.customsMeta.isf),
      tracking.customsMeta.hblCount > 0 && h('span', null, `分单 ${tracking.customsMeta.hblCount} 票`),
      tracking.customsMeta.heldCount > 0 && h('span', { className: 'danger' }, `扣留 ${tracking.customsMeta.heldCount} 票`)),
    h(MilestoneStepper, { milestones: tracking?.milestones }),
    h('div', { className: 'jlc-folds' },
      h(EventTimeline, { events: tracking?.events, nodes: row.nodes }),
      h(WarningsFold, { warnings: tracking?.warnings }),
      h(EtaHistoryFold, { arrival: tracking?.arrival })));
}
function TrackingDetailCard({ item }) {
  const status = item.arrival?.statusText || (item.milestones?.filter(m => m.done).at(-1)?.name) || '追踪详情';
  const polPort = item.ports?.find(p => p.type === 'POL');
  const podPort = item.ports?.find(p => p.type === 'POD');
  const fromName = item.from || polPort?.name || '';
  const toName = item.to || podPort?.name || '';
  const polWhen = polPort?.atd || polPort?.etd;
  const podWhen = podPort?.ata || podPort?.eta;
  const containerSummary = item.containers?.length
    ? item.containers.slice(0, 2).map(c => c.type ? `${c.no} (${c.type})` : c.no).join('、') + (item.containers.length > 2 ? ` 等 ${item.containers.length} 箱` : '')
    : '';
  const metaItems = [
    ['承运商', [item.carrier, item.carrierCode].filter(Boolean).join(' · ')],
    ['船名 / 航次', [item.vessel, item.voyage].filter(Boolean).join(' / ')],
    ['集装箱', containerSummary],
    ['数据更新', item.lastUpdated],
  ].filter(([, v]) => v);

  return h('article', { className: 'jlc-card jlc-tracking' },
    h('header', { className: 'jlc-card-head' },
      h('div', { className: 'jlc-card-id' },
        h('span', { className: 'jlc-kind-tag' }, (item.businessLabel || '物流') + ' · 追踪详情'),
        item.number && h('strong', { className: 'jlc-bill-no' }, item.number),
        h(CopyButton, { value: item.number })),
      h('span', { className: 'jlc-badge ' + statusTone(status) }, status)),
    h(ArrivalBanner, { arrival: item.arrival, warnings: item.warnings }),
    (fromName || toName) && h('div', { className: 'jlc-route' },
      h('div', { className: 'jlc-port' },
        h('div', { className: 'jlc-port-name' }, fromName || '起运地', (item.fromCode || polPort?.code) && h('span', { className: 'jlc-port-code' }, item.fromCode || polPort?.code)),
        polWhen && h('div', { className: 'jlc-port-time' }, (polPort?.atd ? '实际离港 · ' : '预计离港 · ') + formatTimeTag(polWhen.shortText, polWhen.zone))),
      h('div', { className: 'jlc-route-mid', 'aria-hidden': true },
        item.durationDays && h('span', { className: 'jlc-route-chip' }, `海运约 ${item.durationDays} 天`),
        h('span', { className: 'jlc-route-line' })),
      h('div', { className: 'jlc-port jlc-port-end' },
        h('div', { className: 'jlc-port-name' }, toName || '目的地', (item.toCode || podPort?.code) && h('span', { className: 'jlc-port-code' }, item.toCode || podPort?.code)),
        (item.arrival?.mainShortTime || podWhen) && h('div', { className: 'jlc-port-time' },
          item.arrival?.mainShortTime
            ? `${item.arrival.mainTimeLabel} · ${formatTimeTag(item.arrival.mainShortTime, item.arrival.mainZone)}`
            : (podPort?.ata ? '实际抵港 · ' : '预计抵港 · ') + formatTimeTag(podWhen.shortText, podWhen.zone)))),
    metaItems.length > 0 && h('dl', { className: 'jlc-meta-grid' },
      ...metaItems.map(([k, v]) => h('div', { key: k, className: 'jlc-meta-cell' }, h('dt', null, k), h('dd', null, v)))),
    item.customsMeta && h('div', { className: 'jlc-customs-strip' },
      item.customsMeta.mode && h('span', null, item.customsMeta.mode),
      item.customsMeta.status && h('span', null, '状态：' + item.customsMeta.status),
      item.customsMeta.isf && h('span', null, 'ISF：' + item.customsMeta.isf),
      item.customsMeta.hblCount > 0 && h('span', null, `分单 ${item.customsMeta.hblCount} 票`),
      item.customsMeta.heldCount > 0 && h('span', { className: 'danger' }, `扣留 ${item.customsMeta.heldCount} 票`)),
    h(MilestoneStepper, { milestones: item.milestones }),
    h('div', { className: 'jlc-folds' },
      h(EventTimeline, { events: item.events }),
      h(WarningsFold, { warnings: item.warnings }),
      h(EtaHistoryFold, { arrival: item.arrival })));
}
function OverviewKpiCard({ item }) {
  return h('article', { className: 'jlc-card jlc-overview' },
    h('header', { className: 'jlc-card-head' },
      h('div', { className: 'jlc-card-id' },
        h('span', { className: 'jlc-kind-tag' }, '统计概览'),
        h('strong', { className: 'jlc-bill-no' }, `${item.businessName}订阅概况`)),
      item.total !== null && h('div', { className: 'jlc-kpi-total' },
        h('span', null, '总订阅'),
        h('strong', null, String(item.total)))),
    item.filters.length > 0 && h('div', { className: 'jlc-filter-row' },
      ...item.filters.map((f, i) => h('span', { key: i, className: 'jlc-filter-chip' }, f))),
    item.categories.length > 0 && h('div', { className: 'jlc-kpi-grid' },
      ...item.categories.map(cat =>
        h('div', { key: cat.key, className: 'jlc-kpi-tile ' + (cat.count > 0 ? cat.tone : 'zero') },
          h('span', { className: 'jlc-kpi-label' }, cat.label),
          h('strong', { className: 'jlc-kpi-val' }, String(cat.count))))),
    item.categories.length > 0 && h('p', { className: 'jlc-kpi-note' }, '各状态分类可能存在交叉重叠，不直接相加等于总量。'));
}
function matchMcpTool(name, suffix) {
  return typeof name === 'string' && name.startsWith('mcp__') && name.endsWith('__' + suffix);
}
function ShipmentCards({ turn, chat }) {
  const snapshot = useSyncExternalStore(chat.subscribe, chat.getSnapshot);
  const pages = [];
  const trackingParts = [];
  const overviewParts = [];
  function parseArgs(block) {
    try { return JSON.parse(block.call?.argsRaw); } catch { return {}; }
  }
  function collect(block) {
    if (block?.kind === 'tool-result' && !block.isError) {
      if (block.name === 'juslink_search_shipment') {
        let page;
        try { page = JSON.parse(block.content.find(c => c.type === 'text')?.text); } catch {}
        if (page?.state === 'ready' && Array.isArray(page.rows)) pages.push({ ...page, id: block.callId });
      } else if (matchMcpTool(block.name, 'sky-vigil-find-subscriptions')) {
        const page = normalizeSearchPage(block, { filters: {}, page: 0, ...parseArgs(block) });
        if (page?.state === 'ready' && Array.isArray(page.rows)) pages.push({ ...page, id: block.callId });
      } else if (matchMcpTool(block.name, 'sky-vigil-tracking')) {
        const part = JuslinkCards.normalizeTrackingPart(block, parseArgs(block));
        if (part) trackingParts.push(part);
      } else if (matchMcpTool(block.name, 'sky-vigil-overview')) {
        const part = JuslinkCards.normalizeOverviewPart(block, parseArgs(block));
        if (part) overviewParts.push(part);
      }
    }
    for (const child of block?.subCalls || []) collect(child);
  }
  for (const key of snapshot?.locations.getTurn(turn.turn) || []) {
    const node = snapshot.nodes.get(key);
    if (node?.kind === 'tool-call') collect(node.data.root);
  }
  const trackingCards = JuslinkCards.mergeTrackingParts(trackingParts);
  const overviewCards = JuslinkCards.mergeOverviewParts(overviewParts);
  if (!pages.length && !trackingCards.length && !overviewCards.length) return null;
  return h('div', { className: 'jlc-chat-results', 'aria-label': '智链业务结果卡片' },
    ...overviewCards.map(item => h(OverviewKpiCard, { key: 'ov-' + item.groupKey, item })),
    ...pages.map(page =>
      h(React.Fragment, { key: 'pg-' + page.id },
        !page.rows.length && h('p', { className: 'jlc-empty-tip' }, '当前账号下未找到符合条件的订阅。'),
        ...page.rows.map((row, index) => h(ShipmentSummaryCard, { key: index, row, compact: page.rows.length > 2 })),
        page.more && h('p', { className: 'jlc-more-tip' }, '还有更多记录，可以在对话中继续翻页查看。'))),
    ...trackingCards.map(item => h(TrackingDetailCard, { key: 'tr-' + item.groupKey, item })));
}
function CapabilityPage({ ctx, tools }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [scope, setScope] = useState(rememberedExpertScope);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [needsSession, setNeedsSession] = useState(false);
  const alive = useRef({ active: true, request: 0 });
  function selectScope(value) { rememberedExpertScope = value; setScope(value); }
  async function refresh() {
    const seq = ++alive.current.request;
    setLoading(true); setCatalogError('');
    try {
      const result = await SkillFlow.listExperts(ctx, lastExpertSession);
      if (!alive.current.active || seq !== alive.current.request) return;
      setExperts(result.experts); setNeedsSession(result.needsSession);
    } catch (reason) {
      if (alive.current.active && seq === alive.current.request) setCatalogError('读取个人专家失败：' + (reason.message || String(reason)));
    } finally {
      if (alive.current.active && seq === alive.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    alive.current.active = true;
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => { alive.current.active = false; ++alive.current.request; window.removeEventListener('focus', onFocus); };
  }, []);
  async function start(entry) {
    if (capabilityLaunchPending) return;
    capabilityLaunchPending = true; setPending(entry.id); setError('');
    try { await SkillFlow.launch(ctx, entry.prompt, id => { if (entry.scope === 'personal' || entry.id === 'create-expert') lastExpertSession = id; }); }
    catch (reason) { if (alive.current.active) setError('未能发起对话：' + (reason.message || String(reason))); }
    finally { capabilityLaunchPending = false; if (alive.current.active) setPending(null); }
  }
  function createExpert() {
    selectScope('personal');
    void start({ id: 'create-expert', prompt: SkillFlow.expertCreationPrompt() });
  }
  const visible = scope === 'platform' ? EXPERT_ENTRIES : experts;
  return h('section', { className: 'jlc-launch' },
    h('div', { className: 'jlc-expert-heading' }, h('h1', { className: 'jlc-launch-heading' }, '场景专家'),
      h('div', { className: 'jlc-expert-actions' },
        button(pending === 'create-expert' ? '正在打开…' : '＋ 新建场景专家', createExpert, { disabled: !!pending, className: 'jlc-primary' }))),
    h('div', { className: 'jlc-skill-scopes jlc-expert-scopes', role: 'tablist', 'aria-label': '场景专家来源' },
      ...[['platform', '平台提供', EXPERT_ENTRIES.length], ['personal', '我的专家', loading ? '…' : experts.length]].map(([key, label, count]) => button(label + ' · ' + count, () => selectScope(key), { key, role: 'tab', 'aria-selected': scope === key, className: scope === key ? 'selected' : '' }))),
    catalogError && h('p', { className: 'jlc-skill-error', role: 'alert' }, catalogError),
    scope === 'personal' && loading && !experts.length ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取我的场景专家…') :
    visible.length ? h('div', { className: 'jlc-workflows' }, ...visible.map(entry => h('article', { key: entry.id, className: 'jlc-workflow' },
      h('h2', null, entry.title), h('p', null, entry.description),
      button(pending === entry.id ? '正在打开…' : entry.action, () => start(entry), { disabled: !!pending, className: 'jlc-workflow-start', 'aria-label': entry.action + '：' + entry.title })))) :
      !catalogError && h('div', { className: 'jlc-expert-empty' }, h('h2', null, '创建你的第一个场景专家'),
        h('p', null, needsSession ? '点击新建，在 DSH 对话中描述你想解决的问题。' : '描述业务目标，让 DSH 帮你组合工具、整理步骤，保存为可重复使用的专家。'),
        button('新建场景专家', createExpert, { disabled: !!pending, className: 'jlc-workflow-start' })),
    scope === 'personal' && h('p', { className: 'jlc-muted jlc-expert-note' }, '保存在当前 DSH 用户的个人技能中。创建并保存成功后，返回这里查看。'),
    error && h('p', { role: 'alert', className: 'jlc-skill-error' }, error),
    h('h2', { className: 'jlc-launch-heading jlc-tools-heading' }, '已授权工具'),
    tools.length ? h('div', { className: 'jlc-tool-list' }, ...tools.map(gatewayEntry).map(entry =>
      h('button', { type: 'button', className: 'jlc-tool-row', key: entry.id, disabled: !!pending, onClick: () => start(entry), 'aria-label': entry.title },
        h('span', { className: 'jlc-tool-icon' }, h(CapabilityIcon, { kind: entry.icon })),
        h('span', { className: 'jlc-tool-text' }, h('strong', null, entry.title), h('span', null, pending === entry.id ? '正在打开新对话…' : entry.description)),
        h('span', { className: 'jlc-tool-arrow', 'aria-hidden': true }, '↗')))) :
      h('p', { className: 'jlc-muted' }, '当前账号没有可用的智链工具。'),
    h('p', { className: 'jlc-launch-note' }, '查询范围由当前 SIT 授权账号决定。顶部租户切换仅供演示。'));
}
function SkillPage({ ctx }) {
  const [scope, setScope] = useState('platform');
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(null);
  const lifetime = useRef({ active: true, request: 0 });
  async function refresh() {
    const seq = ++lifetime.current.request;
    setLoading(true); setError('');
    try {
      const result = await SkillFlow.list(ctx, lastSkillSession);
      if (!lifetime.current.active || seq !== lifetime.current.request) return;
      setSkills(result.skills);
      setNotice(result.needsSession ? '还没有可用于读取技能目录的 DSH 会话。点击“新增”，即可开始创建。' : '');
    } catch (reason) {
      if (lifetime.current.active && seq === lifetime.current.request) setError('读取技能目录失败：' + (reason.message || String(reason)));
    } finally {
      if (lifetime.current.active && seq === lifetime.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    lifetime.current.active = true;
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    let timer;
    let known = ctx.get('sessions')?.list.getSnapshot().ids.join(',');
    const stop = ctx.get('sessions')?.list.subscribe(() => {
      const next = ctx.get('sessions').list.getSnapshot().ids.join(',');
      if (next !== known) { known = next; clearTimeout(timer); timer = setTimeout(onFocus, 250); }
    });
    return () => { lifetime.current.active = false; ++lifetime.current.request; clearTimeout(timer); stop?.(); window.removeEventListener('focus', onFocus); };
  }, []);
  async function start(prompt) {
    if (skillLaunchPending) return;
    skillLaunchPending = true; setBusy(true); setError('');
    try { await SkillFlow.launch(ctx, prompt, id => { lastSkillSession = id; }); }
    catch (reason) { if (lifetime.current.active) setError('打开对话失败：' + (reason.message || String(reason))); }
    finally { skillLaunchPending = false; if (lifetime.current.active) setBusy(false); }
  }
  const counts = key => skills.filter(item => item.scope === key).length;
  const needle = query.trim().toLocaleLowerCase();
  const visible = skills.filter(item => item.scope === scope && (!needle || [item.title, item.description, item.name].join(' ').toLocaleLowerCase().includes(needle)));
  return h('section', { className: 'jlc-skills' },
    h('div', { className: 'jlc-skills-heading' }, h('div', null, h('h1', null, '技能'), h('p', { className: 'jlc-muted' }, '把专业经验保存为技能，在对话中按需使用。')),
      h('div', { className: 'jlc-skills-actions' }, h('input', { type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: '搜索技能', 'aria-label': '搜索智链技能' }),
        button(busy ? '正在打开…' : '＋ 新增', () => start(SkillFlow.creationPrompt()), { disabled: busy, className: 'jlc-primary' }))),
    h('div', { className: 'jlc-skill-scopes', role: 'tablist', 'aria-label': '技能来源' }, ...[['platform', '平台'], ['personal', '个人']].map(([key, label]) => button(label + ' · ' + counts(key), () => { setScope(key); setOpened(null); }, { key, role: 'tab', 'aria-selected': scope === key, className: scope === key ? 'selected' : '' }))),
    error && h('p', { className: 'jlc-skill-error', role: 'alert' }, error),
    notice && h('p', { className: 'jlc-muted', role: 'status' }, notice),
    h('p', { className: 'jlc-skill-caption' }, scope === 'platform' ? '由智链平台提供，随插件更新。' : '由你创建并关联智链平台，保存在当前 DSH 用户的个人技能目录。'),
    loading ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取 DSH 技能目录…') :
      visible.length ? h('div', { className: 'jlc-skill-grid' }, ...visible.map(item => h('article', { className: 'jlc-skill-card', key: item.name },
        h('div', { className: 'jlc-skill-icon', 'aria-hidden': true }, h(Icon, { size: 21 })),
        h('div', { className: 'jlc-skill-copy' }, button(item.title, () => setOpened(opened === item.name ? null : item.name), { className: 'jlc-skill-title', 'aria-expanded': opened === item.name }), h('p', null, item.description),
          h('div', { className: 'jlc-skill-card-actions' }, h('span', null, '已可用'), button('在新对话中使用', () => start('/' + item.name + ' 请按这个工作方法协助我，先询问这次任务所需的信息。'), { disabled: busy, className: 'jlc-skill-link' })),
          opened === item.name && h('div', { className: 'jlc-skill-detail' }, h('p', null, '调用标识：/' + item.name),
            item.scope === 'platform' ? h('pre', null, PLATFORM_SKILL_CONTENT) : h('p', null, '技能文件：' + item.path),
            h('p', { className: 'jlc-muted' }, item.scope === 'platform' ? '平台技能为只读。新增自己的方法时，请使用右上角“新增”。' : '此技能使用 DSH 原生文件机制加载，更新或重装智链插件不会覆盖此文件。')))))) :
        h('div', { className: 'jlc-skill-empty' }, h('h2', null, needle ? '没有匹配的技能' : scope === 'personal' ? '还没有个人技能' : '暂未发现平台技能'),
          h('p', null, needle ? '试试其他名称或关键词。' : scope === 'personal' ? '点击“新增”，在 DSH 对话中描述你的方法。实际保存成功后，返回这里查看。' : '请确认插件已启用，再重新进入技能页。')),
    h('p', { className: 'jlc-note' }, '新增会打开 DSH 新对话，并自动带入创建技能与关联智链平台的说明。对话中写出内容不代表已保存，以文件保存成功和目录可见为准。'));
}
let lastArtifactSession;
const ARTIFACT_INDEX_PATH = 'juslink-artifacts/index.json';
function artifactSessions(ctx) {
  const sessions = ctx.get('sessions');
  const snapshot = sessions?.list?.getSnapshot?.();
  if (!snapshot) return [];
  const ordinary = snapshot.ids.filter(key => snapshot.byId[key]?.origin !== 'subagent');
  const ordered = (lastArtifactSession ? [lastArtifactSession] : []).concat(ordinary);
  return [...new Set(ordered)].filter(key => snapshot.byId[key]).slice(0, 8);
}
function remoteValue(result) {
  if (result && typeof result === 'object' && result.ok === false) throw result.error ?? new Error('远程调用失败');
  if (result && typeof result === 'object' && result.ok === true) return result.value;
  return result;
}
function decodeBytes(value) {
  const data = value?.data ?? value;
  if (typeof data === 'string') return data;
  if (data instanceof Uint8Array) return new TextDecoder('utf-8').decode(data);
  if (data instanceof ArrayBuffer) return new TextDecoder('utf-8').decode(new Uint8Array(data));
  if (data && Array.isArray(data.data)) return new TextDecoder('utf-8').decode(new Uint8Array(data.data));
  throw new Error('无法解析工作区文件内容。');
}
function isMissingFile(reason) {
  const text = String(reason?.code ?? '') + ' ' + String(reason?.message ?? reason ?? '');
  return /workspace-file\/not-found|not-found|ENOENT/.test(text);
}
async function readArtifactFile(ctx, path, signal) {
  const remote = ctx.get('remote.workspaceFiles');
  if (!remote?.readBytes) throw new Error('当前 DSH 未提供工作区文件接口，无法读取成果。');
  const candidates = artifactSessions(ctx);
  if (!candidates.length) throw new Error('还没有可用于读取成果的 DSH 会话。');
  let lastError;
  for (const sessionId of candidates) {
    signal?.throwIfAborted?.();
    try {
      const text = decodeBytes(remoteValue(await remote.readBytes(sessionId, path, {}, signal)));
      lastArtifactSession = sessionId;
      return text;
    } catch (reason) {
      if (reason?.name === 'AbortError') throw reason;
      lastError = reason;
    }
  }
  throw lastError;
}
function formatBytes(bytes) {
  if (typeof bytes !== 'number' || !isFinite(bytes) || bytes < 0) return '';
  return bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
}
function MyQueriesPage({ ctx, onGoHome }) {
  const list = useRecords();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [opened, setOpened] = useState(null);
  const [opening, setOpening] = useState('');
  const [busy, setBusy] = useState(false);
  const lifetime = useRef({ active: true, request: 0, controller: null });
  async function refresh() {
    const seq = ++lifetime.current.request;
    lifetime.current.controller?.abort();
    const controller = new AbortController();
    lifetime.current.controller = controller;
    setLoading(true); setError('');
    try {
      let text;
      try { text = await readArtifactFile(ctx, ARTIFACT_INDEX_PATH, controller.signal); }
      catch (reason) {
        if (isMissingFile(reason)) { if (lifetime.current.active && seq === lifetime.current.request) { setItems([]); setNotice('还没有成果。在对话中生成 HTML 后，让 Agent 保存，回到本页即可查看。'); } return; }
        throw reason;
      }
      let parsed = {};
      try { parsed = JSON.parse(text || '{}'); } catch { throw new Error('成果索引文件格式无法解析。'); }
      const list = Array.isArray(parsed.artifacts) ? parsed.artifacts.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.file === 'string') : [];
      if (!lifetime.current.active || seq !== lifetime.current.request) return;
      setItems(list);
      setNotice(list.length ? '' : '还没有成果。在对话中生成 HTML 后，让 Agent 保存，回到本页即可查看。');
    } catch (reason) {
      if (lifetime.current.active && seq === lifetime.current.request) setError('读取成果失败：' + (reason?.message || String(reason)));
    } finally {
      if (lifetime.current.active && seq === lifetime.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    lifetime.current.active = true;
    void refresh();
    return () => { lifetime.current.active = false; ++lifetime.current.request; lifetime.current.controller?.abort(); };
  }, []);
  async function toggle(item) {
    if (opened?.id === item.id) { setOpened(null); return; }
    setOpening(item.id); setError('');
    const controller = new AbortController();
    try {
      const html = await readArtifactFile(ctx, 'juslink-artifacts/' + item.file, controller.signal);
      if (lifetime.current.active) setOpened({ id: item.id, html });
    } catch (reason) {
      if (lifetime.current.active) setError('打开成果失败：' + (reason?.message || String(reason)));
    } finally {
      if (lifetime.current.active) setOpening('');
    }
  }
  async function start() {
    if (busy) return;
    setBusy(true); setError('');
    try { await SkillFlow.launch(ctx, '/juslink-artifact-publish 请生成一份简短的 HTML 成果，保存到智链平台成果中心。', () => {}); }
    catch (reason) { if (lifetime.current.active) setError('打开对话失败：' + (reason?.message || String(reason))); }
    finally { if (lifetime.current.active) setBusy(false); }
  }
  return h('section', { className: 'jlc-artifacts' },
    h('div', { className: 'jlc-skills-heading' }, h('div', null, h('h1', null, '历史'), h('p', { className: 'jlc-muted' }, '查询记录与生成的 HTML 成果集中在这里查看。')),
      h('div', { className: 'jlc-skills-actions' },
        button(busy ? '正在打开…' : '＋ 生成并保存', start, { disabled: busy, className: 'jlc-primary' }))),
    error && h('p', { className: 'jlc-skill-error', role: 'alert' }, error),
    notice && h('p', { className: 'jlc-muted', role: 'status' }, notice),
    list.length ? list.map(record => h(Result, { key: record.id, record })) : h('div', { className: 'jlc-empty' }, h('h2', null, '还没有查询记录'), h('p', null, '从「工具」页面选择场景专家或工具，在新对话中开始。'), button('去发起任务', onGoHome, { className: 'jlc-primary' })),
    loading ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取成果目录…') :
      items.length ? h('div', { className: 'jlc-artifact-list' }, ...items.map(item => h('article', { key: item.id, className: 'jlc-artifact-card' },
        h('div', { className: 'jlc-artifact-head' },
          h('div', null, h('h3', null, item.title), item.summary && h('p', { className: 'jlc-muted' }, item.summary)),
          button(opening === item.id ? '正在读取…' : opened?.id === item.id ? '收起' : '查看', () => toggle(item), { className: 'jlc-skill-link', disabled: opening === item.id })),
        h('div', { className: 'jlc-artifact-meta' },
          h('span', null, '保存于 ' + (item.createdAt ? formatDate(item.createdAt) : '未知时间')),
          formatBytes(item.bytes) && h('span', null, formatBytes(item.bytes)),
          h('span', null, item.owner === 'personal' ? '个人成果' : '平台成果'),
          h('span', null, '沙箱渲染 · 脚本禁用')),
        opened?.id === item.id && h('div', { className: 'jlc-artifact-frame-wrap' },
          h('iframe', { className: 'jlc-artifact-frame', title: item.title, sandbox: '', referrerPolicy: 'no-referrer', srcDoc: opened.html }),
          h('p', { className: 'jlc-muted' }, '文件：' + item.file))))) :
        h('div', { className: 'jlc-empty' }, h('h2', null, '还没有成果'), h('p', null, '在对话中生成 HTML 报告或看板后，让 Agent 保存到成果中心；保存成功后返回这里即可查看。'),
          button('去生成一份成果', start, { disabled: busy, className: 'jlc-primary' })),
    h('p', { className: 'jlc-note' }, '查询记录保存在本机浏览器存储；成果以 HTML 文件保存在当前 DSH 工作区的 juslink-artifacts 目录，用禁用脚本的沙箱 iframe 渲染，脚本、表单和弹窗不会执行。'));
}
function TenantMenu({ tenants, active, onSelect, onAdd }) {
  const [open, toggle] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    function outside(event) { if (!root.current?.contains(event.target)) toggle(false); }
    function escape(event) { if (event.key === 'Escape') { toggle(false); trigger.current?.focus(); } }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return h('div', { className: 'jlc-tenant', ref: root },
    button(h(React.Fragment, null, h('span', null, '当前租户：'), h('strong', null, active?.name || '名称待获取'), h('i', { 'aria-hidden': true })),
      () => toggle(!open), { ref: trigger, className: 'jlc-tenant-trigger', 'aria-expanded': open }),
    open && h('div', { className: 'jlc-tenant-menu' },
      ...tenants.map(item => button(h(React.Fragment, null, h('span', null, item.name), item.id === active?.id && h('span', { 'aria-label': '当前租户' }, '✓')),
        () => { toggle(false); onSelect(item); }, { key: item.id, className: 'jlc-tenant-row', 'aria-pressed': item.id === active?.id })),
      button('＋ 新增租户授权', () => { trigger.current?.focus({ preventScroll: true }); toggle(false); onAdd(); }, { className: 'jlc-tenant-add' })));
}
const demoTenants = [
  { id: 'sichuan', name: '四川小神厨物流有限公司' },
  { id: 'chengdu', name: '成都锦川供应链有限公司' },
  { id: 'chongqing', name: '重庆渝江物流有限公司' },
];
function DemoTenantAuthorization({ available, onClose, onGrant }) {
  const [choosing, setChoosing] = useState(false);
  const [choice, select] = useState(available[0]?.id);
  const item = available.find(t => t.id === choice);
  return h(AuthorizationCard, { onDismiss: onClose, title: choosing ? '选择要授权的演示租户' : '授权使用智链工作台',
    detail: choosing ? (available.length ? '确认后将进入所选租户的工作台。' : '所有演示租户均已添加。') : '使用你的智链账号登录并授权，即可进入工作台。' },
    choosing && available.length > 0 && h('div', { className: 'jlc-tenant-choices' },
      ...available.map(t => h('label', { key: t.id }, h('input', { type: 'radio', name: 'juslink-demo-tenant',
        checked: t.id === choice, onChange: () => select(t.id) }), t.name))),
    h('div', { className: 'jlc-auth-actions' },
      !choosing && button('去授权', () => setChoosing(true), { className: 'jlc-auth-action main' }),
      choosing && item && button('确认添加', () => onGrant(item), { className: 'jlc-auth-action main' }),
      button('取消', onClose, { className: 'jlc-auth-action secondary' })));
}
function Panel({ ctx, tools = [] }) {
  const [tenants, setTenants] = useState(() => [demoTenants[0]]);
  const [active, onSelect] = useState(demoTenants[0]);
  const [adding, setAdding] = useState(false);
  const onAdd = () => setAdding(true);
  function grant(item) {
    setTenants(previous => previous.some(t => t.id === item.id) ? previous : [...previous, item]);
    onSelect(item);
    setAdding(false);
  }
  const [tab, updateTab] = useState(rememberedTab);
  const setTab = value => { rememberedTab = value; updateTab(value); };
  const tabs = [['home', '工具'], ['queries', '历史'], ['skills', '技能']];
  return h('div', { className: 'jlc-panel-frame' },
    h('div', { className: 'jlc-root' + (tab === 'home' ? ' jlc-home' : ''), inert: adding || undefined },
    h('header', { className: 'jlc-header' },
      h('div', { className: 'jlc-brand' }, h('img', { src: LOGO, alt: 'JusLink' }), h('span', { className: 'jlc-brand-name' }, '准时达智链平台')),
      h(TenantMenu, { tenants, active, onSelect, onAdd })),

    h('nav', { className: 'jlc-tabs jlc-workspace-tabs', 'aria-label': '智链平台工作区' }, ...tabs.map(([id, label]) => button(label, () => setTab(id), { key: id, 'aria-current': tab === id ? 'page' : undefined, className: tab === id ? 'selected' : '' }))),
    h('main', { className: 'jlc-content' },
      storageError && h('p', { role: 'alert' }, '本机存储不可用，记录可能无法保留。'),
      tab === 'home' && h(CapabilityPage, { ctx, tools }),
      tab === 'queries' && h(MyQueriesPage, { ctx, onGoHome: () => setTab('home') }),
      tab === 'skills' && h(SkillPage, { ctx }))),
    adding && h(DemoTenantAuthorization, { available: demoTenants.filter(t => !tenants.some(granted => granted.id === t.id)), onClose: () => setAdding(false), onGrant: grant }));
}
async function authRequest(action, signal, data) {
  const response = await fetch('juslink-auth/' + action, { method: 'POST', credentials: 'same-origin',
    headers: { 'x-juslink-panel': '1', ...(data && { 'content-type': 'application/json' }) }, body: data && JSON.stringify(data), cache: 'no-store', signal });
  if (!response.ok) {
    const missing = [404, 405].includes(response.status);
    return { state: 'unavailable', detail: missing ? 'DSH 尚未加载本机授权接口，请重新启动 DSH。' : 'DSH 授权接口返回 HTTP ' + response.status + '，请重试。' };
  }
  if (!response.headers.get('content-type')?.includes('application/json')) return { state: 'unavailable', detail: 'DSH 本机授权接口未返回检查结果，请重新启动 DSH。' };
  return response.json();
}

function AuthorizationCard({ title, detail, children, onDismiss }) {
  const dialog = useRef(null);
  const modal = Boolean(onDismiss);
  useEffect(() => {
    if (!modal) return;
    const element = dialog.current;
    const frame = element.closest('.jlc-panel-frame');
    element.focus({ preventScroll: true });
    return () => requestAnimationFrame(() => {
      if (frame?.isConnected && document.activeElement === document.body)
        frame.querySelector('.jlc-tenant-trigger')?.focus({ preventScroll: true });
    });
  }, [modal]);
  const card = h(modal ? 'dialog' : 'section', modal ? {
    ref: dialog, open: true, tabIndex: -1, className: 'jlc-auth-card jlc-auth-dialog', 'aria-label': title,
    onKeyDown: event => {
      if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); onDismiss(); }
    },
  } : { className: 'jlc-auth-card' },
      h('header', { className: 'jlc-auth-brand' },
        h('img', { src: LOGO, alt: 'JusLink' }),
        h('span', null, '工作台授权')),
      h('div', { className: 'jlc-auth-body' },
        h('h1', { role: 'status' }, title), h('p', null, detail), children));
  return modal ? h('div', { className: 'jlc-root jlc-auth-overlay' }, card) : h('main', { className: 'jlc-root jlc-auth' }, card);
}
function AuthorizedPanel({ ctx }) {
  const [result, setResult] = useState({ state: 'checking' });
  const [request, setRequest] = useState({ action: 'status' });
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function run(action) {
      try {
        const next = await authRequest(action, controller.signal);
        if (controller.signal.aborted) return;
        if (action === 'start' && next.url) window.open(next.url, '_blank', 'noopener,noreferrer');
        setResult(previous => next.state === 'waiting' ? { ...previous, ...next } : next);
        if (next.state === 'waiting') timer = setTimeout(() => run('progress'), 1200);
      } catch {
        if (!controller.signal.aborted) setResult({ state: 'unavailable' });
      }
    }
    run(request.action);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [request]);
  function begin(action) { setResult({ state: 'checking' }); setRequest({ action }); }
  if (result.state === 'authorized') return h(Panel, { ctx, tools: result.tools });
  const waiting = result.state === 'waiting';
  const needed = result.state === 'required';
  const checking = result.state === 'checking';
  return h(AuthorizationCard, { title: checking ? '正在检查授权' : needed ? '授权使用智链工作台' : waiting ? '请在浏览器中完成授权' : '暂时无法确认授权状态',
    detail: checking ? '正在向智链平台确认你的访问权限。' : needed ? '使用你的智链账号登录并授权，即可进入工作台。' : waiting ? '授权成功后，这里会自动进入工作台。' : result.detail || '未能完成智链网关授权检查，请重试。' },
        !checking && h('div', { className: 'jlc-auth-actions' },
          waiting && result.url && h('a', { className: 'jlc-auth-action main', href: result.url, target: '_blank', rel: 'noopener noreferrer' },
            '打开登录页', h('span', { 'aria-hidden': true }, '↗')),
          waiting ? button('取消', () => begin('cancel'), { className: 'jlc-auth-action secondary' }) :
            button(needed ? '去授权' : '重试', () => begin(needed ? 'start' : 'status'), { className: 'jlc-auth-action main' })));
}
function Entry({ ctx }) {
  const store = ctx.layout.panelInfo;
  const active = useSyncExternalStore(fn => store.subscribe(fn), () => store.getSnapshot().activePanelId === PANEL_ID);
  return active ? h(AuthorizedPanel, { ctx }) : null;
}
exports.inject = ['slots', 'layout', 'sessions', 'uiConversation'];
exports.apply = function apply(ctx) {
  const BoundPanel = () => h(Entry, { ctx });
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.juslinkAgentCenter = 'true';
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, 'juslink: scoped styles');
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail', id: 'juslink-subscriptions',
    inject: sessionId => ({ chat: ctx.uiConversation.binding(ctx.sessions.binding(sessionId)).target('chat') }),
  }, ShipmentCards));
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, BoundPanel));
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
