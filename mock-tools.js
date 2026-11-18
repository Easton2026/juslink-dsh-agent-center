import { DEMO_SHIPMENT, DEMO_SNAPSHOT_AT } from './demo-data.js';
import { TOOL_ENTRIES } from './capability-catalog.js';

const referenceSchema = { type: 'object', additionalProperties: false, properties: { reference: { type: 'string', description: '用户明确提供的单号；演示单号为 DEMO-SH-001。' } }, required: ['reference'] };
function payload(id) {
  switch (id) {
    case 'milestones': return { events: [
      { name: '起运港接货', at: '2026-11-16T15:00:00+08:00', state: 'actual', location: '上海港' },
      { name: '船舶离港', at: DEMO_SHIPMENT.lastEventAt, state: 'actual', location: '上海港' },
      { name: '预计到港', at: DEMO_SHIPMENT.estimatedArrivalAt, state: 'estimated', location: '新加坡港' },
    ] };
    case 'arrival': return { plannedArrivalAt: DEMO_SHIPMENT.plannedArrivalAt, estimatedArrivalAt: DEMO_SHIPMENT.estimatedArrivalAt, actualArrivalAt: null, estimatedDifferenceHours: 4, conclusion: '预计晚于计划 4 小时，实际是否延误尚未确认。' };
    case 'customs': return { customsStatus: '单证准备中', declarationSubmitted: false, documents: [{ name: '商业发票', status: '已准备' }, { name: '装箱单', status: '已准备' }, { name: '收货人资料', status: '待补充' }], pending: ['补充收货人资料后确认模拟申报信息。'], note: '此独立工具提供模拟关务样例；货物追踪工具本身不包含关务数据。' };
    case 'port': return { port: '新加坡港', operationStatus: '正常作业（演示）', estimatedWaitingHours: 2, congestionLevel: '低（演示）', note: '港口等待时间是独立演示指标，不能据此断言本票货的延误原因。' };
    case 'risk': return { risks: [{ type: '预计到港偏差', level: '需关注', evidence: '预计 2026-11-20 14:00 +08:00，计划为同日 10:00 +08:00，相差 4 小时。', confirmedActualDelay: false }], unknowns: ['实际到港时间', '到港偏差原因'], recommendations: ['临近目的港时复核预计时间。', '实际到港后再确认是否形成延误。'] };
    default: throw new Error('未知的模拟能力。');
  }
}
export function createMockTools() {
  return TOOL_ENTRIES.filter(entry => entry.id !== 'shipment').map(entry => ({
    name: entry.tool,
    description: entry.title + '：' + entry.description + ' 仅返回固定演示快照，不访问真实业务系统。' + (entry.id === 'port' ? '仅支持演示港口新加坡港。' : '演示单号 DEMO-SH-001；缺少单号时先询问。'),
    parameters: entry.id === 'port' ? { type: 'object', additionalProperties: false, properties: { port: { type: 'string', description: '港口名称；演示港口为新加坡港。' } }, required: ['port'] } : referenceSchema,
    output: {
      schema: { type: 'object', additionalProperties: false, properties: { isDemo: { type: 'boolean', const: true }, found: { type: 'boolean' }, query: { type: 'string' }, source: { type: 'string' }, queriedAt: { type: 'string' }, dataSnapshotAt: { type: 'string' }, data: { oneOf: [{ type: 'null' }, { type: 'object', additionalProperties: true }] }, notes: { type: 'array', items: { type: 'string' } } }, required: ['isDemo', 'found', 'query', 'source', 'queriedAt', 'dataSnapshotAt', 'data', 'notes'] },
      render: (_args, value) => [{ type: 'text', text: '【固定演示数据，非真实业务查询】\n' + JSON.stringify(value, null, 2) }],
    },
    isConcurrencySafe: () => true,
    async execute(args, execution = {}) {
      execution.signal?.throwIfAborted();
      const field = entry.id === 'port' ? 'port' : 'reference';
      if (!args || typeof args[field] !== 'string' || !args[field].trim()) throw new Error('请提供' + (field === 'port' ? '港口名称 port。' : '单号 reference。'));
      const query = args[field].trim();
      if (query.length > 100) throw new Error('查询参数不能超过 100 个字符。');
      const found = entry.id === 'port' ? ['新加坡港', 'singapore', 'sgsin'].includes(query.toLowerCase()) : query.toUpperCase() === DEMO_SHIPMENT.reference;
      return { isDemo: true, found, query, source: '智链平台内置模拟工具 · ' + entry.tool, queriedAt: new Date().toISOString(), dataSnapshotAt: DEMO_SNAPSHOT_AT, data: found ? payload(entry.id) : null, notes: found ? ['固定历史演示快照，不代表当前实际业务情况。'] : ['模拟数据集中没有该查询对象，不得推断真实业务状态。'] };
    },
    presentCall: args => ({ card: 'generic', kind: 'read', title: entry.title + '（演示）', rawInput: args?.reference ?? args?.port ?? '' }),
  }));
}
