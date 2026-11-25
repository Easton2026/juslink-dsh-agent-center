'use strict';
const React = require('react');
const { createElement: h, useState, useEffect, useRef, useSyncExternalStore } = React;
const PANEL_ID = 'juslink-agent-center';
function Icon({ size = 20 }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z' }));
}
function button(text, action, props = {}) { return h('button', { type: 'button', onClick: action, ...props }, text); }
let rememberedTab = 'tools';
let lastSkillSession;
let skillLaunchPending = false;
const deletedPersonalSkills = new Set();
let capabilityLaunchPending = false;
let lastExpertSession;
function CapabilityIcon({ kind }) {
  const paths = {
    box: ['m3 7 9-4 9 4-9 4-9-4Z', 'M3 7v10l9 4 9-4V7', 'M12 11v10', 'm7.5 5 9 4'],
    route: ['M6 7h10a4 4 0 0 1 0 8H8', 'm10 12-3 3 3 3', 'M6 4v6', 'M3 7h6'],
    clock: ['M12 8v5l3 2'],
    document: ['M7 3h7l4 4v14H6V3h1Z', 'M14 3v5h4', 'M9 12h6', 'M9 16h5'],
    port: ['M4 20h16', 'M6 17V9h12v8', 'M4 9h16L12 3 4 9Z', 'M10 12v5', 'M14 12v5'],
    shield: ['m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Z', 'M12 8v5', 'M12 16h.01'],
    chart: ['M4 20h16','M6 17v-5h3v5z','M11 17V8h3v9z','M16 17V4h3v13z'],
    alert: ['M10.3 4.5 2.8 18a1.6 1.6 0 0 0 1.4 2.4h15.6a1.6 1.6 0 0 0 1.4-2.4L13.7 4.5a1.9 1.9 0 0 0-3.4 0Z','M12 9v4','M12 16.5h.01'],
    user: ['M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z','M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2Z'],
    expert: ['M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z','M19 14v6','M16 17h6'],
    grid: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
    layers: ['m3 7 9-4 9 4-9 4-9-4Z','m3 12 9 4 9-4','m3 17 9 4 9-4'],
    building: ['M4 21V5l8-3v19','M12 9h8v12','M2 21h20','M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2'],
  };
  return h('svg', { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    kind === 'clock' && h('circle', { cx: 12, cy: 12, r: 9 }), ...(paths[kind] || paths.box).map((d, i) => h('path', { key: i, d })));
}
const toolLabels = new Map([
  ['sky-vigil-manage-subscription', ['订阅与管理', '建立追踪，并管理已有订阅', 'document']],
  ['sky-vigil-find-subscriptions', ['搜索订阅', '找到需要查看的业务记录', 'box']],
  ['sky-vigil-tracking', ['追踪详情', '查看运输进度和清关情况', 'route']],
  ['sky-vigil-overview', ['统计概览', '了解订阅数量与分类情况', 'chart']],
  ['sky-vigil-reference', ['参考数据', '核对运输公司与状态含义', 'port']],
]);
function gatewayEntry(tool) {
  const [label, summary, icon] = toolLabels.get(tool.name) || [];
  return { id: tool.name, gateway: true, title: label || tool.title || tool.name, description: summary || tool.summary, icon,
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
function readDshTheme() {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const body = typeof document !== 'undefined' ? document.body : null;
  const attr = root?.getAttribute?.('data-theme') || body?.getAttribute?.('data-theme') || '';
  if (attr === 'dark') return 'dark';
  if (attr === 'light') return 'light';
  if (root?.classList?.contains('dark') || body?.classList?.contains('dark')) return 'dark';
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
function useDshTheme() {
  const [theme, setTheme] = useState(readDshTheme);
  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const sync = () => setTheme(readDshTheme());
    const observer = new MutationObserver(sync);
    if (document.documentElement) observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    const mq = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null;
    mq?.addEventListener?.('change', sync);
    return () => {
      observer.disconnect();
      mq?.removeEventListener?.('change', sync);
    };
  }, []);
  return theme;
}
function sanitizeInlineCardHtml(rawHtml) {
  let html = String(rawHtml ?? '').trim();
  const styles = [];
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_m, css) => {
    const cleaned = String(css || '')
      .replace(/<\/?[^>]+>/g, '')
      .replace(/@import\b[^;]*;?/gi, '')
      .replace(/url\(\s*['"]?\s*https?:[^)]*\)/gi, 'none')
      .trim();
    if (cleaned) styles.push(cleaned);
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
function buildInlineCardDocument({ title, html, theme, frameId, withInteractiveScript }) {
  const safeTitle = String(title || '智链业务视图').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const bodyContent = sanitizeInlineCardHtml(html);
  const interactiveScript = withInteractiveScript && frameId
    ? `<script>(function(){var id=${JSON.stringify(frameId)};function send(){var b=document.body;var h=b?Math.ceil(b.getBoundingClientRect().height):0;if(h>0)parent.postMessage({type:'juslink-frame-height',id:id,height:h},'*');}if(typeof ResizeObserver!=='undefined'&&document.body){new ResizeObserver(send).observe(document.body);}document.addEventListener('toggle',function(){requestAnimationFrame(send);},true);document.addEventListener('click',function(e){var btn=e.target&&e.target.closest?e.target.closest('[data-copy]'):null;if(!btn)return;var val=btn.getAttribute('data-copy')||'';if(!val)return;parent.postMessage({type:'juslink-frame-copy',id:id,text:val},'*');var prev=btn.textContent;btn.textContent='已复制';btn.classList.add('copied');setTimeout(function(){btn.textContent=prev||'复制';btn.classList.remove('copied');},1500);});window.addEventListener('load',send);requestAnimationFrame(send);send();})();</script>`
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
function DynamicCardFrame({ item, sessionId, theme }) {
  const iframeRef = useRef(null);
  const frameId = 'jlc-frame-' + item.id;
  const [height, setHeight] = useState(120);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const [expanded, setExpanded] = useState(false);
  const srcDoc = buildInlineCardDocument({ title: item.title, html: item.html, theme, frameId, withInteractiveScript: true });
  const modalDoc = expanded ? buildInlineCardDocument({ title: item.title, html: item.html, theme, frameId: frameId + '-modal', withInteractiveScript: true }) : '';

  useEffect(() => {
    function onMessage(event) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'juslink-frame-height' && data.id === frameId && event.source === iframeRef.current?.contentWindow) {
        const next = Math.min(Math.max(Math.ceil(Number(data.height) || 120), 64), 2400);
        setHeight(next);
      } else if (data.type === 'juslink-frame-copy' && (data.id === frameId || data.id === frameId + '-modal') && typeof data.text === 'string' && data.text) {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(data.text).catch(() => {});
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frameId]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(event) {
      if (event.key === 'Escape') { event.stopPropagation(); setExpanded(false); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  async function saveToCenter() {
    if (saving) return;
    setSaving(true);
    setSaveNote('');
    try {
      const response = await fetch('juslink-artifacts/save', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'x-juslink-panel': '1', 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, title: item.title, summary: item.summary, html: item.html }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.saved) throw new Error(result?.error || '保存失败');
      setSaveNote(result.relativePath ? '已保存至 ' + result.relativePath : '已保存 HTML');
    } catch (err) {
      setSaveNote(err?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  }

  return h('article', { className: 'jlc-dyn-card' },
    h('header', { className: 'jlc-dyn-bar' },
      h('div', { className: 'jlc-dyn-title' },
        h('span', { className: 'jlc-kind-tag' }, 'JusBuddy'),
        h('strong', null, item.title || '业务结果')),
      h('div', { className: 'jlc-dyn-actions' },
        saveNote && h('span', { className: 'jlc-dyn-status', role: 'status' }, saveNote),
        button(saving ? '保存中…' : '保存 HTML', saveToCenter, { className: 'jlc-dyn-btn', disabled: saving || !sessionId }),
        button('放大查看', () => setExpanded(true), { className: 'jlc-dyn-btn' }))),
    h('iframe', {
      ref: iframeRef,
      className: 'jlc-dynamic-frame',
      title: item.title || '智链业务视图',
      sandbox: 'allow-scripts',
      referrerPolicy: 'no-referrer',
      srcDoc,
      style: { height: height + 'px' },
    }),
    expanded && h('div', { className: 'jlc-dyn-modal-backdrop', onClick: e => { if (e.target === e.currentTarget) setExpanded(false); } },
      h('dialog', { open: true, className: 'jlc-dyn-modal', 'aria-label': item.title || '智链业务视图' },
        h('header', { className: 'jlc-dyn-bar' },
          h('strong', null, item.title || '智链业务视图'),
          button('关闭', () => setExpanded(false), { className: 'jlc-dyn-btn' })),
        h('iframe', {
          className: 'jlc-dyn-modal-frame',
          title: (item.title || '智链业务视图') + '（放大）',
          sandbox: 'allow-scripts',
          referrerPolicy: 'no-referrer',
          srcDoc: modalDoc,
        }))));
}
function CardSkeleton() {
  return h('div', { className: 'jlc-dyn-skeleton', role: 'status', 'aria-live': 'polite' },
    h('span', { className: 'jlc-dyn-pulse', 'aria-hidden': true }),
    h('span', null, '正在生成智链业务视图…'));
}
function matchMcpTool(name, suffix) {
  return typeof name === 'string' && name.startsWith('mcp__') && name.endsWith('__' + suffix);
}
function ShipmentCards({ turn, chat, sessionId }) {
  const snapshot = useSyncExternalStore(chat.subscribe, chat.getSnapshot);
  const theme = useDshTheme();
  const dynamicCards = [];
  let pendingRender = false;
  const pages = [];
  const trackingParts = [];
  const overviewParts = [];
  function parseJson(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  function parseArgs(block) {
    return parseJson(block.call?.argsRaw) || {};
  }
  function collect(block) {
    if (!block) return;
    if (block.kind === 'tool-result' && !block.isError) {
      if (block.name === 'juslink_render_card') {
        const resultPayload = parseJson(block.content?.find(c => c.type === 'text')?.text);
        const argsPayload = parseJson(block.call?.argsRaw);
        const html = argsPayload?.html || resultPayload?.html;
        const title = argsPayload?.title || resultPayload?.title || '智链业务视图';
        const summary = argsPayload?.summary || resultPayload?.summary || '';
        if (html) dynamicCards.push({ id: block.callId || String(dynamicCards.length), title, summary, html });
      } else if (block.name === 'juslink_search_shipment') {
        const page = parseJson(block.content?.find(c => c.type === 'text')?.text);
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
    } else if (block.kind === 'tool-call' && block.name === 'juslink_render_card') {
      pendingRender = true;
    }
    for (const child of block.subCalls || []) collect(child);
  }
  for (const key of snapshot?.locations.getTurn(turn.turn) || []) {
    const node = snapshot.nodes.get(key);
    if (node?.kind === 'tool-call') {
      const root = node.data?.root;
      if (root?.name === 'juslink_render_card' && root?.kind !== 'tool-result') pendingRender = true;
      collect(root);
    }
  }
  if (dynamicCards.length || pendingRender) {
    return h('div', { className: 'jlc-chat-results', 'aria-label': '智链业务结果卡片' },
      ...dynamicCards.map(item => h(DynamicCardFrame, { key: 'dyn-' + item.id, item, sessionId, theme })),
      pendingRender && h(CardSkeleton));
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
function CapabilityPage({ ctx, tools, beforeLaunch, accountBusy, page }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const alive = useRef({ active: true, request: 0 });
  async function refresh() {
    const seq = ++alive.current.request;
    setLoading(true); setCatalogError('');
    try {
      const result = await SkillFlow.listExperts(ctx, lastExpertSession);
      if (!alive.current.active || seq !== alive.current.request) return;
      setExperts(result.experts);
    } catch (reason) {
      if (alive.current.active && seq === alive.current.request) setCatalogError('读取个人专家失败：' + (reason.message || String(reason)));
    } finally {
      if (alive.current.active && seq === alive.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    alive.current.active = true;
    if (page !== 'experts') return () => { alive.current.active = false; ++alive.current.request; };
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => { alive.current.active = false; ++alive.current.request; window.removeEventListener('focus', onFocus); };
  }, [page]);
  async function start(entry) {
    if (capabilityLaunchPending || accountBusy) return;
    capabilityLaunchPending = true; setPending(entry.id); setError('');
    try {
      if (entry.gateway && !await beforeLaunch(entry)) return;
      if (!alive.current.active) return;
      await SkillFlow.launch(ctx, entry.prompt, id => { if (entry.scope === 'personal' || entry.id === 'create-expert') lastExpertSession = id; });
    } catch (reason) { if (alive.current.active) setError('未能发起对话：' + (reason.message || String(reason))); }
    finally { capabilityLaunchPending = false; if (alive.current.active) setPending(null); }
  }
  function createExpert() {
    void start({ id: 'create-expert', prompt: SkillFlow.expertCreationPrompt() });
  }
  const visible = [...EXPERT_ENTRIES, ...experts];
  function capabilityCard(entry, isExpert) {
    const personal = isExpert && entry.scope === 'personal';
    const kind = isExpert ? (personal ? 'expert' : entry.id === 'logistics' ? 'chart' : entry.id === 'exceptions' ? 'alert' : 'expert') : entry.icon;
    return h('button', { type: 'button', className: 'jlc-tool-row jlc-capability-card' + (isExpert ? ' jlc-expert-tile' : ' jlc-tool-tile') + (personal ? ' jlc-personal-card' : ''),
      key: (isExpert ? 'expert-' : 'tool-') + entry.id, disabled: !!pending || accountBusy, onClick: () => start(entry),
      'aria-label': entry.title + (personal ? '（个人专家）' : '') },
      h('span', { className: 'jlc-tile-body' },
        h('span', { className: 'jlc-tool-text' }, h('strong', { title: entry.title }, entry.title),
          h('span', { className: 'jlc-cap-description', title: entry.description || undefined }, pending === entry.id ? '正在打开新对话…' : entry.description)),
        !isExpert && h('span', { className: 'jlc-tool-arrow', 'aria-hidden': true }, '›')),
      isExpert && h(ExpertIllustration, { kind }),
      personal && h('span', { className: 'jlc-personal-mark', title: '个人场景专家', 'aria-label': '个人场景专家' }, h(CapabilityIcon, { kind: 'user' })));
  }
  return h('section', { className: 'jlc-launch jlc-capability-home', 'aria-label': page === 'experts' ? '场景专家' : '智链工具' },
    error && h('p', { role: 'alert', className: 'jlc-skill-error' }, error),
    page === 'experts' ? h(React.Fragment, null,
      h('div', { className: 'jlc-page-actions' },
        button(pending === 'create-expert' ? '正在打开…' : '＋ 新建场景专家', createExpert, { disabled: !!pending || accountBusy, className: 'jlc-create-expert' })),
      h('div', { className: 'jlc-cap-grid jlc-cap-grid-experts' }, ...visible.map(entry => capabilityCard(entry, true))),
      loading && h('p', { className: 'jlc-muted jlc-cap-status', role: 'status' }, '正在读取个人场景专家…'),
      catalogError && h('p', { className: 'jlc-skill-error', role: 'alert' }, catalogError)) :
      tools.length ? h('div', { className: 'jlc-cap-grid jlc-cap-grid-tools' }, ...tools.map(gatewayEntry).map(entry => capabilityCard(entry, false))) :
        h('p', { className: 'jlc-muted' }, '当前账号没有可用的智链工具。'));
}
function ExpertIllustration({ kind }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const front = uid + '-front', side = uid + '-side', ink = uid + '-ink';
  const g = (tag, props, ...children) => h(tag, props, ...children);
  const r = (x,y,width,height,fill,rx=4,extra={}) => g('rect',{x,y,width,height,fill,rx,...extra});
  const p = (d,fill,stroke='none',strokeWidth=1,extra={}) => g('path',{d,fill,stroke,strokeWidth,strokeLinecap:'round',strokeLinejoin:'round',...extra});
  const c = (cx,cy,r,fill) => g('circle',{cx,cy,r,fill});
  const f = 'url(#'+front+')', s = 'url(#'+side+')', i = 'url(#'+ink+')';
  const art = {
    chart: () => [
      g('g',{transform:'rotate(7 65 42)'},r(26,13,80,57,s,8),r(31,18,70,47,'#dbe1ff',5)),
      r(14,14,80,56,f,8,{stroke:'#dce2fb',strokeWidth:1}),r(21,21,66,42,'#fff',4),
      p('M27 54h53','none','#e0e5fa',1.2),r(29,42,10,12,'#a9b8f8',2),r(44,34,10,20,'#7e94f1',2),r(59,27,10,27,i,2),
      p('M29 34l17-9 12 4 18-12','none','#687ce8',2.2),c(76,17,3,'#4254c8'),
      g('g',{transform:'translate(79 55)'},c(9,9,10,'#3436bd'),p('M5 9l3 3 5-6','none','#fff',1.8))
    ],
    alert: () => [
      p('M57 8Q63 0 69 8L108 65Q114 76 101 76H21Q8 76 14 65Z',s),
      p('M48 8Q54 0 60 8L99 65Q105 76 92 76H12Q-1 76 5 65Z',f,'#c9d3fa',1),
      p('M48 15Q54 7 60 15L93 64Q96 69 90 69H17Q11 69 15 64Z','#f6f7ff'),
      r(50,29,8,22,i,4),c(54,60,4.3,'#4b49cf'),
      c(97,62,12,'#e5e9ff'),p('M92 62h10M97 57v10','none','#747fdf',1.7)
    ],
    expert: () => [
      p('M60 8Q64 7 65 12L72 31Q73 34 77 35L96 42Q101 44 96 48L77 55Q73 57 72 61L65 79Q63 85 59 79L52 61Q50 57 46 55L27 48Q22 45 27 42L46 35Q50 34 52 30Z',s),
      p('M51 5Q55 4 57 10L64 29Q65 32 69 34L88 40Q93 42 88 46L69 53Q65 55 64 59L57 77Q55 83 51 77L44 59Q42 55 38 53L19 46Q14 43 19 40L38 34Q42 32 44 28Z',f,'#c6d0fa',1),
      p('M54 19l6 18 18 6-18 6-6 18-6-18-18-6 18-6Z',i),
      p('M94 9l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z','#94a4f8'),
      p('M12 17l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z','#b4bff9')
    ]
  };
  return h('span', { className:'jlc-expert-art', 'aria-hidden':true },
    g('svg',{viewBox:'0 0 120 88',width:'100%',height:'100%',preserveAspectRatio:'xMidYMid meet',focusable:false},
      g('defs',null,
        g('linearGradient',{id:front,x1:'0',y1:'0',x2:'1',y2:'1'},g('stop',{offset:'0%',stopColor:'#fff'}),g('stop',{offset:'100%',stopColor:'#dce3ff'})),
        g('linearGradient',{id:side,x1:'0',y1:'0',x2:'1',y2:'1'},g('stop',{offset:'0%',stopColor:'#c8d3ff'}),g('stop',{offset:'100%',stopColor:'#8e9deb'})),
        g('linearGradient',{id:ink,x1:'0',y1:'0',x2:'1',y2:'1'},g('stop',{offset:'0%',stopColor:'#899cff'}),g('stop',{offset:'100%',stopColor:'#3737b8'}))),
      g('ellipse',{cx:62,cy:81,rx:48,ry:5,fill:'#e5e9f9'}),
      ...(art[kind] || art.expert)()));
}
function SkillPage({ ctx }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailRetry, setDetailRetry] = useState(0);
  const lifetime = useRef({ active: true, request: 0 });
  const deleting = useRef(false);
  async function refresh() {
    const seq = ++lifetime.current.request;
    setLoading(true); setError('');
    try {
      const result = await SkillFlow.list(ctx, lastSkillSession);
      const visible = await Promise.all(result.skills.map(async item => {
        if (item.scope !== 'personal' || !deletedPersonalSkills.has(item.name)) return item;
        try { await SkillFlow.readPersonal(item); deletedPersonalSkills.delete(item.name); return item; }
        catch { return null; }
      }));
      if (!lifetime.current.active || seq !== lifetime.current.request) return;
      const next = visible.filter(Boolean);
      setSkills(next);
      setOpened(current => current && next.some(item => item.name === current) ? current : null);
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
    const onVisibility = () => { if (document.visibilityState === 'visible') onFocus(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    let timer;
    let known = ctx.get('sessions')?.list.getSnapshot().ids.join(',');
    const stop = ctx.get('sessions')?.list.subscribe(() => {
      const next = ctx.get('sessions').list.getSnapshot().ids.join(',');
      if (next !== known) { known = next; clearTimeout(timer); timer = setTimeout(onFocus, 250); }
    });
    return () => { lifetime.current.active = false; ++lifetime.current.request; clearTimeout(timer); stop?.(); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  useEffect(() => {
    const item = skills.find(value => value.name === opened);
    setDetail(null);
    if (!item || item.scope !== 'personal') return;
    const controller = new AbortController();
    let active = true;
    setDetail({name:item.name,state:'loading'});
    SkillFlow.readPersonal(item, controller.signal).then(value => {
      if (active) setDetail({name:item.name,state:'ready',...value});
    }).catch(reason => {
      if (active) setDetail({name:item.name,state:'error',error:reason.message || String(reason)});
    });
    return () => { active = false; controller.abort(); };
  }, [opened, skills, detailRetry]);
  async function start(prompt) {
    if (skillLaunchPending || deleting.current) return;
    skillLaunchPending = true; setBusy(true); setError('');
    try { await SkillFlow.launch(ctx, prompt, id => { lastSkillSession = id; }); }
    catch (reason) { if (lifetime.current.active) setError('打开对话失败：' + (reason.message || String(reason))); }
    finally { skillLaunchPending = false; if (lifetime.current.active) setBusy(false); }
  }
  async function remove(item, revision) {
    if (skillLaunchPending || deleting.current || !revision) return;
    if (!window.confirm('确认删除个人技能【' + item.title + '】？删除后将不再作为技能加载。')) return;
    deleting.current = true; setBusy(true); setError('');
    try {
      await SkillFlow.deletePersonal(item, revision);
      deletedPersonalSkills.add(item.name);
      if (!lifetime.current.active) return;
      ++lifetime.current.request;
      setSkills(current => current.filter(value => value.name !== item.name));
      setOpened(current => current === item.name ? null : current);
      await refresh();
    } catch (reason) {
      if (lifetime.current.active) { setError('删除技能失败：' + (reason.message || String(reason))); setDetailRetry(n => n+1); }
    } finally { deleting.current = false; if (lifetime.current.active) setBusy(false); }
  }
  function expanded(item) {
    const personal = item.scope === 'personal';
    const value = detail?.name === item.name ? detail : null;
    const ready = personal && value?.state === 'ready';
    return h('div', {className:'jlc-skill-detail'},
      h('p', null, '调用标识：/' + item.name),
      !personal ? h('pre', null, PLATFORM_SKILL_CONTENT) :
        ready ? h('pre', null, value.content) :
        value?.state === 'error' ? h('div', {className:'jlc-skill-detail-error',role:'alert'}, value.error, ' ',
          button('重试', () => setDetailRetry(n => n+1), {className:'jlc-skill-link',disabled:busy})) :
          h('p', {className:'jlc-muted',role:'status'}, '正在读取技能正文…'),
      personal && h('div', {className:'jlc-skill-manage'},
        button('编辑', () => start(SkillFlow.editingPrompt(item)), {className:'jlc-skill-link',disabled:busy || !ready}),
        button('删除', () => remove(item, value?.revision), {className:'jlc-skill-link jlc-skill-delete',disabled:busy || !ready})));
  }
  return h('section', {className:'jlc-skills jlc-unified-skills','aria-label':'我的技能'},
    h('div', {className:'jlc-page-actions jlc-skills-actions'},
      button(busy ? '正在处理…' : '＋ 新增技能', () => start(SkillFlow.creationPrompt()), {disabled:busy,className:'jlc-create-expert'})),
    error && h('p', {className:'jlc-skill-error',role:'alert'}, error),
    notice && h('p', {className:'jlc-muted',role:'status'}, notice),
    loading && !skills.length ? h('p', {className:'jlc-muted',role:'status'}, '正在读取 DSH 技能目录…') :
      skills.length ? h('div', {className:'jlc-skill-grid'}, ...skills.map(item => h('article', {className:'jlc-skill-card',key:item.name},
        item.scope === 'personal' && h('span', {className:'jlc-personal-mark',title:'个人技能','aria-label':'个人技能'}, h(CapabilityIcon, {kind:'user'})),
        h('div', {className:'jlc-skill-icon','aria-hidden':true}, h(CapabilityIcon, {kind:'layers'})),
        h('div', {className:'jlc-skill-copy'},
          h('button', {type:'button',onClick:() => setOpened(opened === item.name ? null : item.name),className:'jlc-skill-title',title:item.title,'aria-expanded':opened === item.name},
            h('span', {className:'jlc-skill-title-text'}, item.title),
            h('svg', {viewBox:'0 0 16 16',width:16,height:16,fill:'none',stroke:'currentColor',strokeWidth:1.5,'aria-hidden':true,className:'jlc-skill-chevron'}, h('path',{d:'m4 6 4 4 4-4',strokeLinecap:'round',strokeLinejoin:'round'}))),
          h('p', {className:'jlc-cap-description',title:item.description || undefined}, item.description),
          opened === item.name && expanded(item))))) :
        h('div', {className:'jlc-skill-empty'}, h('h2', null, '还没有可用技能'),
          h('p', null, '点击“新增技能”，在 DSH 对话中描述你的方法，保存成功后返回查看。')));
}
function TenantMenu({ tenants, active, onSelect, onAdd, onRemove, busy }) {
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
    button(h(React.Fragment, null, h(CapabilityIcon, { kind:'building' }), h('span', { className:'jlc-tenant-label' }, '当前租户'), h('strong', { title:active?.name || '未选择' }, active?.name || '未选择'), h('i', { 'aria-hidden': true })),
      () => toggle(!open), { ref: trigger, className: 'jlc-tenant-trigger', disabled: busy, 'aria-expanded': open }),
    open && h('div', { className: 'jlc-tenant-menu' },
      ...tenants.map(item => h('div', { key: item.id, className: 'jlc-tenant-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' } },
        button(h(React.Fragment, null,
          h('span', null, item.name),
          item.account && h('span', { style: { fontSize: '12px', color: '#656565', marginLeft: '6px' } }, '(' + item.account + ')'),
          item.id === active?.id && h('span', { 'aria-label': '当前企业', style: { marginLeft: '6px', color: '#101cad', fontWeight: 'bold' } }, '✓')),
          () => { toggle(false); onSelect(item); }, { style: { background: 'none', border: '0', textAlign: 'left', flex: 1, cursor: 'pointer', padding: '4px 0' }, 'aria-pressed': item.id === active?.id }),
        onRemove && tenants.length > 1 && button('移除', e => { e.stopPropagation(); onRemove(item); }, { style: { background: 'none', border: '0', color: '#c00', fontSize: '12px', cursor: 'pointer', padding: '2px 4px', opacity: 0.75 }, title: '移除此企业授权' }))),
      button('＋ 新增企业/租户授权', () => { trigger.current?.focus({ preventScroll: true }); toggle(false); onAdd(); }, { className: 'jlc-tenant-add' })));
}
function Panel({ ctx, workspace, beforeLaunch, authDialog, accountBusy, accountError, changeAccount, onAdd }) {
  const { tenants, activeTenant } = workspace;
  const tools = Array.from(toolLabels.keys(), name => ({ name }));
  const [tab, updateTab] = useState(rememberedTab);
  const setTab = value => { rememberedTab = value; updateTab(value); };
  const tabs = [['tools', '智链工具', 'grid'], ['experts', '场景专家', 'expert'], ['skills', '我的技能', 'layers']];

  return h('div', { className: 'jlc-panel-frame' },
    h('div', { className: 'jlc-root jlc-workspace jlc-home', inert: authDialog ? true : undefined },
    h('header', { className: 'jlc-hero' },
      h('div', { className: 'jlc-hero-top' },
        h('div', { className: 'jlc-brand' }, h('img', { src: JUSDA_LOGO, alt: 'JUSDA 准时达' }), h('span', { className: 'jlc-brand-name' }, 'JusBuddy')),
        h(TenantMenu, { tenants, active: activeTenant, busy: accountBusy, onAdd,
          onSelect: item => { if (item.id !== activeTenant?.id) void changeAccount('switch-tenant', item); },
          onRemove: item => {
            if (window.confirm('确认移除企业【' + item.name + '】的授权凭证吗？')) void changeAccount('remove-tenant', item);
          },
        })),
      h('div', { className: 'jlc-hero-body' },
        h('div', { className: 'jlc-hero-copy' }, h('h1', null, '让供应链业务更简单'), h('p', null, '连接业务工具、场景专家与智能技能')),
        h('div', { className: 'jlc-hero-wordmark', 'aria-hidden': true }, h('span', null, 'JusBuddy'), h('span', null, 'Agent')))),

    h('nav', { className: 'jlc-tabs jlc-workspace-tabs jlc-float-nav', 'aria-label': 'JusBuddy 工作区' }, ...tabs.map(([id, label, kind]) => button(h(React.Fragment, null, h(CapabilityIcon, { kind }), h('span', null, label)), () => setTab(id), { key: id, 'aria-current': tab === id ? 'page' : undefined, className: tab === id ? 'selected' : '' }))),
    h('main', { className: 'jlc-content' },
      accountError && h('p', { role: 'alert', className: 'jlc-skill-error' }, accountError),
      (tab === 'tools' || tab === 'experts') && h(CapabilityPage, { key:tab, page:tab, ctx, tools, beforeLaunch, accountBusy }),
      tab === 'skills' && h(SkillPage, { ctx }))), authDialog);
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
        h('img', { src: LOGO, alt: 'JusBuddy' }),
        h('span', null, 'JusBuddy 授权')),
      h('div', { className: 'jlc-auth-body' },
        h('h1', { role: 'status' }, title), h('p', null, detail), children));
  return modal ? h('div', { className: 'jlc-root jlc-auth-overlay' }, card) : h('main', { className: 'jlc-root jlc-auth' }, card);
}
function WorkspacePanel({ ctx }) {
  const [workspace, setWorkspace] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState('');
  const active = useRef(null);
  const timer = useRef(null);

  function updateWorkspace(result) {
    if (Array.isArray(result.tenants)) {
      setWorkspace({ tenants: result.tenants, activeTenant: result.activeTenant || null });
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    authRequest('workspace', controller.signal).then(result => {
      if (!controller.signal.aborted && result.state === 'ready') setWorkspace(current => current || result);
    }).catch(() => {});
    return () => {
      controller.abort();
      active.current?.abort();
      clearTimeout(timer.current);
    };
  }, []);

  async function changeAccount(action, item) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setAccountBusy(true);
    setAccountError('');
    try {
      const result = await authRequest(action, controller.signal, { tenantId: item.id });
      if (controller.signal.aborted) return;
      if (result.state === 'ready') updateWorkspace(result);
      else setAccountError(result.detail || '企业授权未能更新，请重试。');
    } catch {
      if (!controller.signal.aborted) setAccountError('企业授权未能更新，请重试。');
    } finally {
      if (!controller.signal.aborted) {
        active.current = null;
        setAccountBusy(false);
      }
    }
  }

  async function beforeLaunch(entry) {
    // The chat search tool checks when it receives a bill number.
    if (entry.id === 'sky-vigil-find-subscriptions') return true;
    if (active.current) return false;
    const controller = new AbortController();
    active.current = controller;
    setAccountBusy(true);
    try {
      const result = await authRequest('status', controller.signal);
      if (controller.signal.aborted) return false;
      updateWorkspace(result);
      if (result.state === 'required' || result.state === 'waiting') {
        setDialog({ state: 'required' });
        return false;
      }
      if (result.state !== 'authorized') throw new Error('暂时无法连接智链，请稍后重试。');
      if (!result.tools?.some(tool => tool.name === entry.id)) throw new Error('当前企业未获此工具的权限。');
      return true;
    } finally {
      if (!controller.signal.aborted) {
        active.current = null;
        setAccountBusy(false);
      }
    }
  }

  function dismiss() {
    const cancel = dialog?.state === 'waiting';
    active.current?.abort();
    active.current = null;
    clearTimeout(timer.current);
    setDialog(null);
    if (cancel) void authRequest('cancel').catch(() => {});
  }

  function startAuthorization() {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setAccountError('');
    setDialog({ state: 'starting' });
    async function run(action) {
      try {
        const result = await authRequest(action, controller.signal);
        if (controller.signal.aborted) return;
        updateWorkspace(result);
        if (action === 'start' && result.url) window.open(result.url, '_blank', 'noopener,noreferrer');
        if (result.state === 'waiting') {
          setDialog(previous => ({ ...previous, ...result }));
          timer.current = setTimeout(() => void run('progress'), 1200);
          return;
        }
        setDialog(result.state === 'authorized' ? null : result);
      } catch {
        if (!controller.signal.aborted) setDialog({ state: 'unavailable' });
      }
      if (!controller.signal.aborted) active.current = null;
    }
    void run('start');
  }

  let authDialog;
  if (dialog) {
    const waiting = dialog.state === 'waiting';
    const starting = dialog.state === 'starting';
    const needed = dialog.state === 'required';
    authDialog = h(AuthorizationCard, {
      onDismiss: dismiss,
      title: starting ? '正在准备登录' : waiting ? '请在浏览器中完成授权' : needed ? '请先授权使用智链' : '暂时无法完成授权',
      detail: starting ? '登录页即将打开。' : waiting ? '完成授权后可返回 JusBuddy。' : needed ? '使用智链账号授权后继续当前操作。' : dialog.detail || '请稍后重试。',
    }, h('div', { className: 'jlc-auth-actions' },
      waiting && dialog.url && h('a', { className: 'jlc-auth-action main', href: dialog.url, target: '_blank', rel: 'noopener noreferrer' }, '打开登录页'),
      !waiting && !starting && button(needed ? '去授权' : '重试', startAuthorization, { className: 'jlc-auth-action main' }),
      button('取消', dismiss, { className: 'jlc-auth-action secondary' })));
  }
  return h(Panel, { ctx, workspace: workspace || { tenants: [], activeTenant: null }, beforeLaunch, authDialog, accountBusy, accountError, changeAccount, onAdd: startAuthorization });
}
function Entry({ ctx }) {
  const store = ctx.layout.panelInfo;
  const active = useSyncExternalStore(fn => store.subscribe(fn), () => store.getSnapshot().activePanelId === PANEL_ID);
  return active ? h(WorkspacePanel, { ctx }) : null;
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
    inject: sessionId => ({ chat: ctx.uiConversation.binding(ctx.sessions.binding(sessionId)).target('chat'), sessionId }),
  }, ShipmentCards));
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, BoundPanel));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, label: 'JusBuddy', order: 5 }, Icon));
  ctx.effect(() => {
    return () => {
      if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) ctx.layout.selectPanel(null);
    };
  }, 'juslink: lifecycle');
};
