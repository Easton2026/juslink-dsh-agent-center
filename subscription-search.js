const filters = new Map([
  ['SEA', 'master_bill_no'], ['BOOKING', 'booking_no'], ['CONTAINER', 'container_no'],
  ['AIR', 'mawb'], ['EXPRESS', 'master_bill_no'], ['CUSTOMS_CN', 'business_no_like'], ['CUSTOMS_US', 'keyword'],
]);

const BUSINESS_LABELS = {
  SEA: '海运提单',
  BOOKING: '海运订舱',
  CONTAINER: '海运集装箱',
  AIR: '空运主单',
  EXPRESS: '国际快递',
  CUSTOMS_CN: '中国关务',
  CUSTOMS_US: '美国关务',
};

const BUSINESS_GROUP_LABELS = {
  SEA: '海运',
  AIR: '空运',
  EXPRESS: '快递',
  CUSTOMS_CN: '中国关务',
  CUSTOMS_US: '美国关务',
};

const OVERVIEW_CATEGORY_META = {
  ETA: ['即将到港', 'info'],
  ETD: ['即将离港', 'info'],
  IN_TRANSIT: ['运输中', 'info'],
  AWAITING_LOADING: ['待装船', 'neutral'],
  AWAITING_PICKUP: ['待提柜', 'neutral'],
  IN_COLLECTING: ['采集中', 'neutral'],
  DELAY: ['预计延误', 'warn'],
  EXCEPTION: ['运输异常', 'danger'],
  FAILED: ['采集失败', 'danger'],
  ISF_FAILED: ['ISF 失败', 'danger'],
  IS_HELD: ['海关扣留', 'danger'],
  IMPORT: ['进口申报', 'info'],
  EXPORT: ['出口申报', 'info'],
  DECLARATION_EXCEPTION: ['报关异常', 'danger'],
};

export function subscriptionArgs(input) {
  if (!filters.has(input?.kind) || typeof input.number !== 'string') return;
  const number = input.number.trim();
  if (!number || number.length > 100 || /\s/.test(number)) return;
  if (input.kind === 'AIR' && !/^(?:\d{3}-?)?\d{8}$/.test(number)) return;
  const page = input.page ?? 0;
  if (!Number.isSafeInteger(page) || page < 0) return;
  const business = ['BOOKING', 'CONTAINER'].includes(input.kind) ? 'SEA' : input.kind;
  return { business_type: business, action: 'search', filters: { [filters.get(input.kind)]: number }, page, size: 10 };
}

function label(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function parseUtcOffsetMinutes(zone) {
  const z = label(zone);
  if (!z) return null;
  if (/^(?:UTC|GMT)$/i.test(z)) return 0;
  const match = /^(?:UTC|GMT)([+-])(\d{1,2})(?::?(\d{2}))?$/i.exec(z);
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const mins = Number(match[3] || 0);
  if (hours > 14 || mins > 59) return null;
  return sign * (hours * 60 + mins);
}

function formatUtcDateParts(date) {
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mm = pad2(date.getUTCMinutes());
  return { text: `${y}-${m}-${d} ${hh}:${mm}`, shortText: `${m}-${d} ${hh}:${mm}` };
}

function formatLocalDateParts(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  return { text: `${y}-${m}-${d} ${hh}:${mm}`, shortText: `${m}-${d} ${hh}:${mm}` };
}

export function formatZonedTime(when, { preferLocal = false } = {}) {
  if (when == null) return null;
  if (typeof when === 'number') {
    if (!Number.isFinite(when)) return null;
    const d = new Date(when);
    if (!Number.isFinite(d.getTime())) return null;
    const parts = preferLocal ? formatLocalDateParts(d) : formatUtcDateParts(d);
    return { ...parts, zone: preferLocal ? '' : 'UTC', ms: when };
  }
  if (typeof when === 'string') {
    const raw = when.trim();
    if (!raw) return null;
    const iso = /^(\d{4})[-/](\d{2})[-/](\d{2})[T\s](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(raw);
    if (iso) {
      const z = iso[6] === 'Z' ? 'UTC' : (iso[6] ? 'UTC' + iso[6] : '');
      return { text: `${iso[1]}-${iso[2]}-${iso[3]} ${iso[4]}:${iso[5]}`, shortText: `${iso[2]}-${iso[3]} ${iso[4]}:${iso[5]}`, zone: z, ms: Number.isFinite(Date.parse(raw)) ? Date.parse(raw) : null };
    }
    return { text: raw, shortText: raw, zone: '', ms: null };
  }
  if (typeof when === 'object') {
    const zone = label(when.zone);
    const ms = Number.isFinite(when.time) ? when.time : null;
    if (ms !== null && Number.isFinite(new Date(ms).getTime())) {
      const offset = parseUtcOffsetMinutes(zone);
      if (offset !== null) {
        const shifted = new Date(ms + offset * 60000);
        const parts = formatUtcDateParts(shifted);
        return { ...parts, zone: zone.toUpperCase(), ms };
      }
      if (zone) {
        try {
          const fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false,
          }).formatToParts(new Date(ms));
          const get = type => fmt.find(p => p.type === type)?.value || '00';
          const h = get('hour') === '24' ? '00' : get('hour');
          const text = `${get('year')}-${get('month')}-${get('day')} ${h}:${get('minute')}`;
          return { text, shortText: `${get('month')}-${get('day')} ${h}:${get('minute')}`, zone, ms };
        } catch {}
      }
      const fallbackStr = label(when.timeStr);
      if (fallbackStr) return formatZonedTime(fallbackStr);
      const parts = preferLocal ? formatLocalDateParts(new Date(ms)) : formatUtcDateParts(new Date(ms));
      return { ...parts, zone: preferLocal ? '' : 'UTC', ms };
    }
    const str = label(when.timeStr);
    if (str) {
      const parsed = formatZonedTime(str);
      if (parsed && !parsed.zone && zone) parsed.zone = zone;
      return parsed;
    }
  }
  return null;
}

function businessLabel(args, row) {
  const filter = Object.keys(args?.filters || {})[0];
  if (filter === 'booking_no') return BUSINESS_LABELS.BOOKING;
  if (filter === 'container_no') return BUSINESS_LABELS.CONTAINER;
  const type = label(args?.business_type) || label(row?.businessType);
  return BUSINESS_LABELS[type] || '物流订阅';
}

function parseEnvelope(result) {
  if (!result || result.isError) return null;
  const content = result.content?.find(c => c.type === 'text');
  if (!content?.text) return null;
  try {
    const value = JSON.parse(content.text);
    return value?.success === true ? value : null;
  } catch {
    return null;
  }
}

function card(row, args) {
  const filter = Object.keys(args?.filters || {})[0];
  const businessType = label(args?.business_type) || label(row.businessType) || 'SEA';
  const air = businessType === 'AIR';
  const bill = label(row.masterBillNo);
  const number = filter === 'booking_no' ? label(row.bookingNo) :
    filter === 'container_no' ? (row.containers || []).map(c => label(c.containerNo)).find(n => n.toUpperCase() === args.filters.container_no.toUpperCase()) || label(row.containerNo) :
    air && /^\d{3}$/.test(row.carrierCode) && /^\d{8}$/.test(bill) ? row.carrierCode + '-' + bill :
    bill || label(row.displayNo) || label(row.businessNo) || label(row.declarationNo);

  const nodes = [];
  for (const [m, place] of [
    [row.originCityMilestone, row.originCityCode],
    [row.polMilestone, row.pol],
    [row.tpMilestone, row.tp],
    [row.podMilestone, row.pod],
    [row.destinationCityMilestone, row.destinationCityCode],
  ]) {
    const when = m?.actTime || m?.estTime;
    if (!m?.name || !when) continue;
    const formatted = formatZonedTime(when);
    if (formatted) {
      nodes.push({
        name: label(m.name),
        place: label(place),
        time: formatted.text,
        shortTime: formatted.shortText,
        zone: formatted.zone,
        estimated: !m.actTime,
      });
    }
  }

  const polWhen = row.polMilestone?.actTime || row.polMilestone?.estTime;
  const podWhen = row.podMilestone?.actTime || row.podMilestone?.estTime;
  const polFmt = formatZonedTime(polWhen);
  const podFmt = formatZonedTime(podWhen);

  const from = label(row.pol) || label(row.origin) || label(row.originCityCode);
  const to = label(row.pod) || label(row.dest) || label(row.destinationCityCode);
  const fromCode = label(row.polFiveCode) || label(row.porFiveCode);
  const toCode = label(row.podFiveCode) || label(row.poeFiveCode);
  const tp = label(row.tp);
  const tpCode = label(row.potFiveCode);
  const segTo = label(row.voyageSegments?.[0]?.toPortCode);
  const viaPort = !tp && segTo && toCode && segTo.toUpperCase() !== toCode.toUpperCase() ? segTo : '';

  const containers = Array.isArray(row.containers)
    ? row.containers.map(c => {
        const no = label(c?.containerNo);
        if (!no) return null;
        const t = formatZonedTime(c.time);
        return {
          no,
          type: label(c.containerType),
          status: label(c.milestoneName) || label(c.currentStatus),
          time: t?.shortText || '',
          zone: t?.zone || '',
        };
      }).filter(Boolean).slice(0, 12)
    : [];

  const updated = formatZonedTime(row.lastUpdatedTime, { preferLocal: true });
  const receiveStatus = label(row.dataReceivingStatus) || label(row.subscribeStatus);
  const warningCount = Array.isArray(row.warningEvents) ? row.warningEvents.length : 0;

  return {
    businessType,
    businessLabel: businessLabel(args, row),
    number: number || label(row.displayNo),
    carrier: label(row.carrierName),
    carrierCode: label(row.carrierCode),
    status: label(row.milestoneName) || label(row.customsStatusName) || label(row.statusDesc),
    receiveStatus,
    from,
    fromCode,
    to,
    toCode,
    tp,
    tpCode,
    viaPort,
    vessel: label(row.polMilestone?.vessel) || label(row.vessel),
    voyage: label(row.polMilestone?.voyage) || label(row.voyage),
    booking: label(row.bookingNo),
    declaration: label(row.declarationNo),
    businessNo: label(row.businessNo),
    direction: label(row.direction),
    transportMode: label(row.transportMode) || label(row.mot),
    containers,
    polTime: polFmt ? {
      label: label(row.polMilestone?.name) || '离港',
      time: polFmt.text,
      shortTime: polFmt.shortText,
      zone: polFmt.zone,
      estimated: !row.polMilestone?.actTime,
    } : null,
    podTime: podFmt ? {
      label: label(row.podMilestone?.name) || '抵港',
      time: podFmt.text,
      shortTime: podFmt.shortText,
      zone: podFmt.zone,
      estimated: !row.podMilestone?.actTime,
    } : null,
    lastUpdated: updated?.text || '',
    warningCount,
    errorMsg: label(row.errorMsg) || label(row.errorMessage),
    nodes,
  };
}

export function subscriptionPage(result, args) {
  const value = parseEnvelope(result);
  if (!value || !Array.isArray(value.data?.content)) return { state: 'unavailable' };
  return {
    state: 'ready',
    rows: value.data.content.map(row => card(row, args)),
    more: value.data.last === false || (args?.page ?? 0) + 1 < value.data.totalPages,
  };
}

export function extractRawSubscriptionIds(result) {
  const value = parseEnvelope(result);
  if (!value || !Array.isArray(value.data?.content)) return [];
  return value.data.content.map(row => (row?.id != null ? String(row.id) : ''));
}

function normalizeSeaEvents(containers) {
  if (!Array.isArray(containers)) return [];
  const list = [];
  for (const c of containers) {
    const cNo = label(c?.containerNo);
    const cType = label(c?.containerType);
    for (const ev of (Array.isArray(c?.events) ? c.events : [])) {
      const t = formatZonedTime(ev?.time);
      list.push({
        containerNo: cNo,
        containerType: cType,
        desc: label(ev?.eventDesc) || label(ev?.eventCode),
        code: label(ev?.eventCode),
        location: label(ev?.location),
        facility: label(ev?.facility),
        mode: label(ev?.mode),
        vessel: label(ev?.vessel),
        voyage: label(ev?.voyage),
        time: t?.text || '',
        shortTime: t?.shortText || '',
        zone: t?.zone || '',
        estimated: ev?.isEsti === 'Y' || ev?.isEsti === true,
        warning: Boolean(ev?.isWarnings),
      });
    }
  }
  return list;
}

export function normalizeTrackingPart(result, args) {
  const value = parseEnvelope(result);
  const data = value?.data;
  if (!data || typeof data !== 'object') return null;
  const businessType = label(args?.business_type) || 'SEA';
  const action = label(args?.action) || 'detail';
  const groupKey = `${businessType}:${label(args?.id) || label(data.masterBillNo) || label(data.displayNo) || 'single'}`;

  const part = {
    groupKey,
    businessType,
    businessLabel: BUSINESS_LABELS[businessType] || '物流追踪',
    action,
    number: label(data.masterBillNo) || label(data.displayNo) || label(data.bookingNo) || label(data.containerNo) || label(data.header?.masterBillNo) || label(data.header?.billNo) || label(data.businessNo) || label(data.declarationNo),
    carrier: label(data.carrierName) || label(data.header?.carrierName),
    carrierCode: label(data.carrierCode) || label(data.header?.carrierCode),
    from: label(data.origin) || label(data.pol) || label(data.header?.pol),
    to: label(data.destination) || label(data.pod) || label(data.header?.pod),
    fromCode: label(data.polFiveCode) || label(data.porFiveCode),
    toCode: label(data.podFiveCode) || label(data.poeFiveCode),
    vessel: label(data.newestVessel) || label(data.vessel) || label(data.header?.vessel),
    voyage: label(data.newestVoyage) || label(data.voyage) || label(data.header?.voyage),
    lastUpdated: formatZonedTime(data.lastUpdatedTime, { preferLocal: true })?.text || '',
  };

  if (action === 'arrival_analysis') {
    const main = formatZonedTime(data.mainTime);
    const first = formatZonedTime(data.firstEta);
    const changes = Array.isArray(data.etaChangeHistory)
      ? data.etaChangeHistory
          .filter(item => item?.recordType === 'CHANGE')
          .map(item => {
            const before = formatZonedTime(item.beforeEta);
            const after = formatZonedTime(item.afterEta);
            return {
              before: before ? `${before.shortText}${before.zone ? ' ' + before.zone : ''}` : '',
              after: after ? `${after.shortText}${after.zone ? ' ' + after.zone : ''}` : '',
              changeType: label(item.changeType),
              changeText: label(item.changeText),
            };
          })
      : [];
    part.arrival = {
      statusText: label(data.arrivalStatusText),
      mainTimeLabel: label(data.mainTimeLabel) || '预计到港',
      mainTime: main?.text || '',
      mainShortTime: main?.shortText || '',
      mainZone: main?.zone || '',
      hintText: label(data.arrivalTimeHintText),
      firstEta: first?.text || '',
      etaChangeCount: Number.isFinite(data.etaChangeCount) ? data.etaChangeCount : changes.length,
      etaChangeText: label(data.etaChangeText),
      changes,
    };
  }

  if (action === 'milestones' && Array.isArray(data.milestones)) {
    part.milestones = data.milestones.map(m => {
      const t = formatZonedTime(m?.eventTime);
      const completed = Number.isFinite(m?.completedContainerCount) ? m.completedContainerCount : 0;
      const total = Number.isFinite(m?.totalContainerCount) ? m.totalContainerCount : 0;
      return {
        name: label(m?.name),
        code: label(m?.code),
        done: completed > 0 || Boolean(t),
        completed,
        total,
        time: t?.text || '',
        shortTime: t?.shortText || '',
        zone: t?.zone || '',
      };
    }).filter(m => m.name);
    if (Array.isArray(data.voyageSegments) && Number.isFinite(data.voyageSegments[0]?.durationDays)) {
      part.durationDays = data.voyageSegments[0].durationDays;
    }
    if (Array.isArray(data.ports)) {
      part.ports = data.ports.map(p => ({
        type: label(p?.type),
        code: label(p?.portCode),
        name: label(p?.portName),
        atd: formatZonedTime(p?.atd),
        etd: formatZonedTime(p?.etd),
        ata: formatZonedTime(p?.ata),
        eta: formatZonedTime(p?.eta),
      }));
    }
  }

  if (action === 'warnings' && Array.isArray(data.warnings)) {
    part.warnings = data.warnings.map(w => {
      const t = formatZonedTime(w?.eventTime);
      return {
        code: label(w?.eventCode),
        name: label(w?.eventName) || label(w?.warningTitle),
        description: label(w?.description),
        time: t?.text || '',
        shortTime: t?.shortText || '',
        zone: t?.zone || '',
        current: Boolean(w?.current),
        containers: Array.isArray(w?.containerNos) ? w.containerNos.map(label).filter(Boolean) : [],
      };
    });
  }

  if (action === 'events' || (action === 'detail' && businessType === 'SEA')) {
    if (Array.isArray(data.containers)) {
      part.containers = data.containers.map(c => ({
        no: label(c?.containerNo),
        type: label(c?.containerType),
        status: label(c?.currentStatus),
      })).filter(c => c.no);
      part.events = normalizeSeaEvents(data.containers);
    }
  }

  if (action === 'detail' && businessType === 'AIR') {
    const rawEvents = Array.isArray(data.events) ? data.events : [];
    part.events = rawEvents.map(ev => {
      const t = formatZonedTime(ev?.eventTime || ev?.time);
      return {
        desc: label(ev?.statueDescription) || label(ev?.statusDescription) || label(ev?.eventDesc) || label(ev?.eventCode),
        code: label(ev?.eventCode),
        location: label(ev?.airportCode) || label(ev?.location),
        mode: 'AIR',
        vessel: label(ev?.flightNo),
        time: t?.text || '',
        shortTime: t?.shortText || '',
        zone: t?.zone || '',
        estimated: ev?.isEsti === 'Y' || ev?.estimated === true,
        warning: Boolean(ev?.isWarning || ev?.isWarnings),
      };
    });
    if (Array.isArray(data.warningEvents)) {
      part.warnings = data.warningEvents.map(w => ({
        name: label(w?.eventName) || label(w?.eventCode) || '空运预警',
        description: label(w?.description) || label(w?.eventDesc),
        time: formatZonedTime(w?.eventTime || w?.time)?.text || '',
        current: true,
      }));
    }
  }

  if (action === 'detail' && businessType === 'EXPRESS') {
    const rawMs = Array.isArray(data.expressMilestones) ? data.expressMilestones : [];
    if (rawMs.length) {
      part.milestones = rawMs.map(m => {
        const when = m?.actTime || m?.estTime;
        const t = formatZonedTime(when);
        return {
          name: label(m?.name) || label(m?.milestoneName),
          done: Boolean(m?.actTime),
          time: t?.text || '',
          shortTime: t?.shortText || '',
          zone: t?.zone || '',
        };
      }).filter(m => m.name);
    }
    const expEvents = Array.isArray(data.expressShipment?.events)
      ? data.expressShipment.events
      : (data.expressShipment?.events === undefined && Array.isArray(data.events) ? data.events : []);
    part.events = expEvents.map(ev => {
      const t = formatZonedTime(ev?.eventTime || ev?.time);
      return {
        desc: label(ev?.locationName) || label(ev?.eventDesc),
        location: label(ev?.city) || label(ev?.location),
        mode: 'EXPRESS',
        time: t?.text || '',
        shortTime: t?.shortText || '',
        zone: t?.zone || '',
        estimated: false,
        warning: Boolean(ev?.isWarning),
      };
    });
  }

  if (action === 'detail' && businessType === 'CUSTOMS_US') {
    const h = data.header || {};
    part.customsMeta = {
      mode: label(h.mot) === 'A' ? '空运清关' : label(h.mot) === 'O' ? '海运清关' : '',
      status: label(h.statusName) || label(h.status),
      isf: h.isf === true ? '已申报' : h.isf === false ? '未申报/异常' : '',
      hblCount: Array.isArray(data.hblDetails) ? data.hblDetails.length : 0,
      heldCount: Array.isArray(data.hblDetails)
        ? data.hblDetails.filter(d => label(d?.holdDispositionCode) && !d?.holdRemoveDate).length
        : 0,
    };
    const rawEvents = Array.isArray(data.events) ? data.events : [];
    part.events = rawEvents.map(ev => {
      const t = formatZonedTime(ev?.eventDate || ev?.eventTime);
      return {
        desc: label(ev?.eventDesc) || label(ev?.dispositionDesc) || label(ev?.eventCode),
        code: label(ev?.eventCode),
        location: label(ev?.location),
        mode: label(ev?.billType),
        time: t?.text || '',
        shortTime: t?.shortText || '',
        zone: t?.zone || '',
        estimated: false,
        warning: Boolean(ev?.isWarning),
      };
    });
  }

  if (action === 'detail' && businessType === 'CUSTOMS_CN') {
    if (Array.isArray(data.customsNodes)) {
      part.milestones = data.customsNodes.map(n => {
        const t = formatZonedTime(n?.eventTime || n?.time);
        return {
          name: label(n?.name) || label(n?.nodeName),
          done: Boolean(t) && !n?.isWarning,
          warning: Boolean(n?.isWarning || n?.warning),
          time: t?.text || '',
          shortTime: t?.shortText || '',
          zone: t?.zone || '',
        };
      }).filter(m => m.name);
    }
    const cnEvents = [];
    for (const cat of (Array.isArray(data.categories) ? data.categories : [])) {
      for (const node of (Array.isArray(cat?.swNodes) ? cat.swNodes : [])) {
        for (const ev of (Array.isArray(node?.events) ? node.events : [])) {
          const t = formatZonedTime(ev?.time);
          cnEvents.push({
            desc: label(ev?.swStatus) || label(ev?.status) || label(ev?.eventCode),
            code: label(ev?.eventCode),
            location: label(ev?.eventSrc) || label(cat?.name),
            time: t?.text || '',
            shortTime: t?.shortText || '',
            zone: t?.zone || '',
            estimated: false,
            warning: Boolean(node?.isWarning || ev?.isWarning),
          });
        }
      }
    }
    part.events = cnEvents;
  }

  return part;
}

export function mergeTrackingParts(parts) {
  const byGroup = new Map();
  for (const part of parts) {
    if (!part) continue;
    const prev = byGroup.get(part.groupKey) || {
      groupKey: part.groupKey,
      businessType: part.businessType,
      businessLabel: part.businessLabel,
      number: '',
      carrier: '',
      carrierCode: '',
      from: '',
      to: '',
      fromCode: '',
      toCode: '',
      vessel: '',
      voyage: '',
      lastUpdated: '',
      durationDays: null,
      arrival: null,
      ports: [],
      milestones: [],
      containers: [],
      warnings: [],
      events: [],
      customsMeta: null,
    };
    for (const k of ['number', 'carrier', 'carrierCode', 'from', 'to', 'fromCode', 'toCode', 'vessel', 'voyage', 'lastUpdated']) {
      if (part[k] && !prev[k]) prev[k] = part[k];
    }
    if (part.durationDays != null) prev.durationDays = part.durationDays;
    if (part.arrival) prev.arrival = part.arrival;
    if (part.ports?.length) prev.ports = part.ports;
    if (part.milestones?.length) prev.milestones = part.milestones;
    if (part.containers?.length) prev.containers = part.containers;
    if (part.warnings?.length) prev.warnings = part.warnings;
    if (part.events?.length && (!prev.events.length || part.action === 'events')) prev.events = part.events;
    if (part.customsMeta) prev.customsMeta = part.customsMeta;
    byGroup.set(part.groupKey, prev);
  }
  return [...byGroup.values()];
}

export function attachTrackingToRow(row, merged) {
  if (!row || !merged) return row;
  const containers = merged.containers?.length
    ? merged.containers.map(mc => {
        const existing = (row.containers || []).find(rc => rc.no === mc.no);
        return { ...existing, ...mc, type: mc.type || existing?.type || '' };
      })
    : row.containers;
  return {
    ...row,
    containers,
    vessel: row.vessel || merged.vessel,
    voyage: row.voyage || merged.voyage,
    lastUpdated: row.lastUpdated || merged.lastUpdated,
    tracking: {
      arrival: merged.arrival,
      durationDays: merged.durationDays,
      ports: merged.ports,
      milestones: merged.milestones,
      warnings: merged.warnings,
      events: merged.events,
      customsMeta: merged.customsMeta,
    },
  };
}

export function normalizeOverviewPart(result, args) {
  const value = parseEnvelope(result);
  const data = value?.data;
  if (!data || typeof data !== 'object') return null;
  const businessType = label(args?.business_type) || 'SEA';
  const action = label(args?.action);
  const filterEntries = Object.entries(args?.filters || {}).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
  const filterKey = filterEntries.map(([k, v]) => `${k}=${v}`).sort().join('&');
  const groupKey = `${businessType}|${filterKey}`;
  const part = {
    groupKey,
    businessType,
    businessName: BUSINESS_GROUP_LABELS[businessType] || businessType,
    filters: filterEntries.map(([k, v]) => `${k}: ${v}`),
    total: null,
    categories: [],
  };
  if (action === 'total' && Number.isFinite(data.totalElements)) {
    part.total = data.totalElements;
  } else if (action === 'categories') {
    part.categories = Object.entries(data)
      .filter(([, count]) => typeof count === 'number' && Number.isFinite(count))
      .map(([key, count]) => {
        const [name, tone] = OVERVIEW_CATEGORY_META[key] || [key, 'neutral'];
        return { key, label: name, count, tone };
      });
  } else {
    return null;
  }
  return part;
}

export function mergeOverviewParts(parts) {
  const byGroup = new Map();
  for (const part of parts) {
    if (!part) continue;
    const prev = byGroup.get(part.groupKey) || {
      groupKey: part.groupKey,
      businessType: part.businessType,
      businessName: part.businessName,
      filters: part.filters,
      total: null,
      categories: [],
    };
    if (part.total !== null) prev.total = part.total;
    if (part.categories.length) prev.categories = part.categories;
    byGroup.set(part.groupKey, prev);
  }
  return [...byGroup.values()].filter(g => g.total !== null || g.categories.length > 0);
}
