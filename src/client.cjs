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
      isExpert ? h('span', { className: 'jlc-tool-icon' }, h(CapabilityIcon, { kind })) : h(ToolIllustration, { kind }),
      h('span', { className: 'jlc-tile-body' },
        h('span', { className: 'jlc-tool-text' }, h('strong', { title: entry.title }, entry.title),
          h('span', { className: 'jlc-cap-description', title: entry.description || undefined }, pending === entry.id ? '正在打开新对话…' : entry.description)),
        h('span', { className: 'jlc-tool-arrow', 'aria-hidden': true }, '›')),
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
function ToolIllustration({ kind }) {
  const shape = (tag, props, ...children) => h(tag, props, ...children);
  const rect = (x,y,width,height,fill,rx=3) => shape('rect',{x,y,width,height,fill,rx});
  const path = (d,fill,stroke,strokeWidth=2) => shape('path',{d,fill,stroke,strokeWidth,strokeLinecap:'round',strokeLinejoin:'round'});
  const circle = (cx,cy,r,fill) => shape('circle',{cx,cy,r,fill});
  const art = {
    document: () => [rect(65,18,57,64,'#b7c4ff',6),rect(56,12,57,64,'#fff',6),path('M94 12v17h19','#d9e2ff','#9baeff',1),rect(65,35,37,4,'#9bafff'),rect(65,45,31,4,'#b5c1f7'),rect(65,55,24,4,'#b5c1f7'),circle(112,70,13,'#343bc9'),path('M106 70l4 4 8-9','none','#fff',2.6)],
    box: () => [path('M53 34l30-15 30 15-30 15Z','#c0ceff'),path('M53 34v33l30 15V49Z','#7e97f2'),path('M83 49l30-15v33L83 82Z','#526de3'),path('M68 27l30 15','none','#fff',3),circle(113,58,19,'#fff'),shape('circle',{cx:113,cy:58,r:13,fill:'#dae4ff',stroke:'#354bd4',strokeWidth:3}),path('M126 71l12 12','none','#354bd4',6)],
    route: () => [path('M52 63C60 35 78 75 95 43S122 26 136 40','none','#8197ef',5),path('M52 63C60 35 78 75 95 43S122 26 136 40','none','#fff',1.6),circle(52,63,9,'#333bc9'),circle(52,63,3,'#fff'),path('M136 57s-14-15-14-22a14 14 0 1 1 28 0c0 7-14 22-14 22Z','#4351da'),circle(136,35,5,'#fff')],
    chart: () => [rect(50,15,93,65,'#c8d4ff',7),rect(44,10,93,65,'#fff',7),path('M57 63h66','none','#c4cff4'),rect(61,44,13,19,'#9cafff'),rect(79,34,13,29,'#7189ef'),rect(97,21,13,42,'#3f52db'),path('M58 37l22-13 13 5 27-15','none','#7189ef',2),circle(120,14,3,'#4351da')],
    port: () => [path('M51 39l40-24 40 24Z','#526de3'),rect(56,39,70,35,'#fff',3),rect(65,43,11,27,'#9cadf6'),rect(85,43,11,27,'#9cadf6'),rect(105,43,11,27,'#9cadf6'),rect(50,73,82,6,'#526de3'),circle(137,66,12,'#343bc9'),path('M132 66h10M137 61v10','none','#fff',2)],
  };
  return h('span', { className:'jlc-tool-art', 'aria-hidden':true },
    h('svg',{viewBox:'0 0 184 96',width:'100%',height:'100%',preserveAspectRatio:'xMidYMid meet',focusable:false},
      shape('ellipse',{cx:92,cy:80,rx:53,ry:8,fill:'#cbd6fa'}),
      ...(art[kind] || art.box)()));
}
function SkillPage({ ctx }) {
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
  const needle = query.trim().toLocaleLowerCase();
  const visible = skills.filter(item => !needle || [item.title, item.description, item.name].join(' ').toLocaleLowerCase().includes(needle));
  return h('section', { className: 'jlc-skills jlc-unified-skills', 'aria-label': '我的技能' },
    h('div', { className: 'jlc-page-actions jlc-skills-actions' },
      h('input', { type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: '搜索技能', 'aria-label': '搜索智链技能' }),
      button(busy ? '正在打开…' : '＋ 新增技能', () => start(SkillFlow.creationPrompt()), { disabled: busy, className: 'jlc-create-expert' })),
    error && h('p', { className: 'jlc-skill-error', role: 'alert' }, error),
    notice && h('p', { className: 'jlc-muted', role: 'status' }, notice),
    loading && !skills.length ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取 DSH 技能目录…') :
      visible.length ? h('div', { className: 'jlc-skill-grid' }, ...visible.map(item => h('article', { className: 'jlc-skill-card', key: item.name },
        item.scope === 'personal' && h('span', { className: 'jlc-personal-mark', title: '个人技能', 'aria-label': '个人技能' }, h(CapabilityIcon, { kind: 'user' })),
        h('div', { className: 'jlc-skill-icon', 'aria-hidden': true }, h(CapabilityIcon, { kind:'layers' })),
        h('div', { className: 'jlc-skill-copy' },
          button(item.title, () => setOpened(opened === item.name ? null : item.name), { className: 'jlc-skill-title', title: item.title, 'aria-expanded': opened === item.name }),
          h('p', { className:'jlc-cap-description', title: item.description || undefined }, item.description),
          h('div', { className: 'jlc-skill-card-actions' }, button('在新对话中使用', () => start('/' + item.name + ' 请按这个工作方法协助我，先询问这次任务所需的信息。'), { disabled: busy, className: 'jlc-skill-link' })),
          opened === item.name && h('div', { className: 'jlc-skill-detail' }, h('p', null, '调用标识：/' + item.name),
            item.scope === 'platform' ? h('pre', null, PLATFORM_SKILL_CONTENT) : h('p', null, '技能文件：' + item.path),
            h('p', { className: 'jlc-muted' }, item.scope === 'platform' ? '平台技能为只读。新增自己的方法时，请使用右上角“新增技能”。' : '此技能使用 DSH 原生文件机制加载，更新或重装智链插件不会覆盖此文件。')))))) :
        h('div', { className: 'jlc-skill-empty' }, h('h2', null, needle ? '没有匹配的技能' : '还没有可用技能'),
          h('p', null, needle ? '试试其他名称或关键词。' : '点击“新增技能”，在 DSH 对话中描述你的方法，保存成功后返回查看。')));
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
