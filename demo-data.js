// Shared by browser and Host. Fixed mock data; never a real business query.
export const DEMO_SHIPMENT = Object.freeze({
  reference: 'DEMO-SH-001', status: '运输途中', route: '上海港 → 新加坡港',
  vessel: 'JUSLINK DEMO', lastEvent: '已离开起运港',
  lastEventAt: '2026-11-17T08:00:00+08:00', nextEvent: '等待目的港到港信息',
  plannedArrivalAt: '2026-11-20T10:00:00+08:00',
  estimatedArrivalAt: '2026-11-20T14:00:00+08:00',
  actualArrivalAt: null, customsStatus: null, portCongestion: null,
  source: '本机模拟工具 · juslink_shipment_lookup',
});
export const DEMO_SNAPSHOT_AT = '2026-11-17T08:00:00+08:00';
