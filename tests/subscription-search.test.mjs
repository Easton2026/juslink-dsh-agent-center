import test from 'node:test';
import assert from 'node:assert/strict';
import {
  subscriptionArgs,
  subscriptionPage,
  formatZonedTime,
  normalizeTrackingPart,
  mergeTrackingParts,
  attachTrackingToRow,
  normalizeOverviewPart,
  mergeOverviewParts,
} from '../subscription-search.js';
import { searchSubscriptions } from '../gateway-auth.js';

const mcpText = data => ({ content: [{ type: 'text', text: JSON.stringify({ success: true, data }) }] });

test('direct search only constructs typed read-only queries and preserves leading zeroes', () => {
  const args = subscriptionArgs({ kind: 'AIR', number: ' 123-00001234 ' });
  assert.deepEqual(args.filters, { mawb: '123-00001234' });
  assert.equal(args.action, 'search');
  assert.equal(subscriptionArgs({ kind: 'AIR', number: '123' }), undefined);
  assert.equal(subscriptionArgs({ kind: 'SEA', number: 'x', page: -1 }), undefined);
  assert.equal(subscriptionArgs({ kind: 'manage', number: 'x' }), undefined);
});

test('zoned timestamps convert epoch milliseconds into port local time accurately', () => {
  const yantian = formatZonedTime({ time: 1795318500000, timeStr: '2026-11-22T03:35:00Z', zone: 'UTC+8' });
  assert.equal(yantian.text, '2026-11-22 11:35');
  assert.equal(yantian.zone, 'UTC+8');
  const longBeach = formatZonedTime({ time: 1796684400000, timeStr: null, zone: 'UTC-8' });
  assert.equal(longBeach.text, '2026-12-07 15:00');
  assert.equal(longBeach.zone, 'UTC-8');
});

test('all candidates remain separate, with actual and estimated nodes distinguished and rich fields extracted', () => {
  const args = subscriptionArgs({ kind: 'SEA', number: 'AB' });
  const row = {
    id: '9999999999999999999',
    masterBillNo: 'AB',
    carrierName: '东方海外',
    carrierCode: 'OOLU',
    pol: 'Yantian',
    polFiveCode: 'CNYTN',
    pod: 'Houston',
    podFiveCode: 'USHOU',
    voyageSegments: [{ fromPortCode: 'CNYTN', toPortCode: 'USLGB' }],
    containers: [{ containerNo: 'OOLU5864271', milestoneName: '离港' }],
    polMilestone: { name: '离港', actTime: { time: 1795318500000, timeStr: '2026-11-22T03:35:00Z', zone: 'UTC+8' } },
    podMilestone: { name: '抵港', estTime: { time: 1796684400000, zone: 'UTC-8' } },
  };
  const page = subscriptionPage(mcpText({ content: [row, row], last: false }), args);
  assert.equal(page.rows.length, 2);
  assert.equal('id' in page.rows[0], false);
  assert.equal(page.rows[0].businessLabel, '海运提单');
  assert.equal(page.rows[0].viaPort, 'USLGB');
  assert.equal(page.rows[0].containers[0].no, 'OOLU5864271');
  assert.equal(page.rows[0].polTime.time, '2026-11-22 11:35');
  assert.equal(page.rows[0].podTime.time, '2026-12-07 15:00');
  assert.deepEqual(page.rows[0].nodes.map(n => n.estimated), [false, true]);
  assert.equal(page.more, true);
  assert.equal(subscriptionPage(mcpText({ content: [] }), args).state, 'ready');
  assert.equal(subscriptionPage({ isError: true }, args).state, 'unavailable');
});

test('tracking sub-actions merge into one composite card and attach cleanly onto a search row', () => {
  const id = '6196153398795247616';
  const p1 = normalizeTrackingPart(mcpText({
    masterBillNo: 'OOLU2175633840',
    voyageSegments: [{ durationDays: 16 }],
    milestones: [
      { name: '提空', completedContainerCount: 1, totalContainerCount: 1, eventTime: { time: 1794582060000, zone: 'UTC+8' } },
      { name: '抵港', completedContainerCount: 0, totalContainerCount: 1, eventTime: null },
    ],
  }), { business_type: 'SEA', action: 'milestones', id });
  const p2 = normalizeTrackingPart(mcpText({
    arrivalStatusText: '未到港',
    mainTimeLabel: '预计到港',
    mainTime: { time: 1796684400000, zone: 'UTC-8' },
    arrivalTimeHintText: '距离到港还有 13 天 16 小时',
    etaChangeCount: 1,
    etaChangeText: 'ETA 已变更 1 次',
    etaChangeHistory: [{ recordType: 'CHANGE', beforeEta: { time: 1796603400000, zone: 'UTC-8' }, afterEta: { time: 1796684400000, zone: 'UTC-8' }, changeType: 'DELAYED', changeText: '推迟 23 小时' }],
  }), { business_type: 'SEA', action: 'arrival_analysis', id });
  const p3 = normalizeTrackingPart(mcpText({
    warnings: [{ eventCode: 'WETD', eventName: '离泊变更', description: '离泊时间变更', current: true, eventTime: { time: 1795291970000, zone: 'UTC+8' } }],
  }), { business_type: 'SEA', action: 'warnings', id });
  const p4 = normalizeTrackingPart(mcpText({
    containers: [{ containerNo: 'OOLU5864271', containerType: '40HC', events: [{ eventDesc: 'Vessel Departed', location: 'YANTIAN', mode: 'VESSEL', isEsti: 'N', time: { time: 1795318500000, zone: 'UTC+8' } }] }],
  }), { business_type: 'SEA', action: 'detail', id });

  const merged = mergeTrackingParts([p1, p2, p3, p4]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].durationDays, 16);
  assert.equal(merged[0].arrival.hintText, '距离到港还有 13 天 16 小时');
  assert.equal(merged[0].warnings[0].current, true);
  assert.equal(merged[0].events[0].containerType, '40HC');

  const baseRow = { number: 'OOLU2175633840', containers: [{ no: 'OOLU5864271', type: '' }] };
  const enriched = attachTrackingToRow(baseRow, merged[0]);
  assert.equal(enriched.containers[0].type, '40HC');
  assert.equal(enriched.tracking.milestones.length, 2);
});

test('overview total and categories merge into one KPI card by business type and filters', () => {
  const totalPart = normalizeOverviewPart(mcpText({ totalElements: 12 }), { business_type: 'SEA', action: 'total', filters: {} });
  const catsPart = normalizeOverviewPart(mcpText({ ETA: 3, EXCEPTION: 1, FAILED: 0 }), { business_type: 'SEA', action: 'categories', filters: {} });
  const cards = mergeOverviewParts([totalPart, catsPart]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].businessName, '海运');
  assert.equal(cards[0].total, 12);
  assert.equal(cards[0].categories.find(c => c.key === 'EXCEPTION').tone, 'danger');
  assert.equal(cards[0].categories.find(c => c.key === 'ETA').label, '即将到港');
});

test('read-only tool denial is distinct from an empty search', async () => {
  const args = subscriptionArgs({ kind: 'SEA', number: 'AB' });
  const res = await searchSubscriptions('test', args, async options => {
    const msg = JSON.parse(options.body);
    if (msg.method === 'initialize') return Response.json({ id: 1, result: { protocolVersion: '2025-06-18' } });
    if (msg.method === 'notifications/initialized') return new Response(null, { status: 202 });
    assert.equal(msg.params.name, 'sky-vigil-find-subscriptions');
    return new Response(null, { status: 403 });
  });
  assert.deepEqual(res, { state: 'denied' });
});

test('single SEA match enriches tracking when enrichTracking is enabled without exposing internal IDs', async () => {
  const args = subscriptionArgs({ kind: 'SEA', number: 'OOLU2175633840' });
  const res = await searchSubscriptions('test', args, async options => {
    const msg = JSON.parse(options.body);
    if (msg.method === 'initialize') return Response.json({ id: 1, result: { protocolVersion: '2025-06-18' } });
    if (msg.method === 'notifications/initialized') return new Response(null, { status: 202 });
    if (msg.params?.name === 'sky-vigil-find-subscriptions') {
      return Response.json({
        id: msg.id,
        result: mcpText({
          content: [{
            id: '12345',
            masterBillNo: 'OOLU2175633840',
            pol: 'Yantian',
            pod: 'Houston',
            phone: '13800138000',
            customBusinessField: 'VIP-PRIORITY',
            containers: Array.from({ length: 15 }, (_, i) => ({ containerNo: `OOLU00000${i}`, sealNo: `SL${i}` })),
          }],
          last: true,
        }),
      });
    }
    if (msg.params?.name === 'sky-vigil-tracking' && msg.params.arguments.action === 'arrival_analysis') {
      return Response.json({ id: msg.id, result: mcpText({ arrivalStatusText: '未到港', arrivalTimeHintText: '距离到港还有 13 天', firstEta: { time: 1796603400000, zone: 'UTC-8' } }) });
    }
    if (msg.params?.name === 'sky-vigil-tracking' && msg.params.arguments.action === 'booking') {
      return Response.json({ id: msg.id, result: mcpText({ bookingNo: 'BK999', cutoffRemark: 'CY Cutoff 18:00' }) });
    }
    return Response.json({ id: msg.id, result: mcpText({}) });
  }, { enrichTracking: true });
  assert.equal(res.state, 'ready');
  assert.equal(res.rows.length, 1);
  assert.equal('id' in res.rows[0], false);
  assert.equal(res.rows[0].containers.length, 15);
  assert.equal(res.rows[0].tracking.arrival.hintText, '距离到港还有 13 天');
  // Verify full raw business payload is preserved without omitting fields or truncating arrays
  assert.equal(res.rawRecords.length, 1);
  assert.equal(res.rawRecords[0].customBusinessField, 'VIP-PRIORITY');
  assert.equal(res.rawRecords[0].containers.length, 15);
  assert.equal(res.rawRecords[0].containers[14].sealNo, 'SL14');
  assert.equal('id' in res.rawRecords[0], false);
  assert.equal('phone' in res.rawRecords[0], false);
  assert.equal(res.rawTracking.booking.cutoffRemark, 'CY Cutoff 18:00');
  assert.equal(res.rawTracking.arrival_analysis.firstEta.formattedTime, '2026-12-06 16:30 (UTC-8)');
});
