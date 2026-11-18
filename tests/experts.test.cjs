const { test } = require('node:test');
const assert = require('node:assert/strict');
const flow = require('../src/skill-flow.cjs');
const expert = { name: 'juslink-expert-arrival-check', description: '【到港跟进专家】核对到港时间与风险', path: '/home/demo/.dsh/skills/juslink-expert-arrival-check/SKILL.md' };

test('personal experts have a dedicated file namespace and safe invocation', () => {
  const item = flow.expertView(expert);
  assert.equal(item.title, '到港跟进专家');
  assert.equal(item.scope, 'personal');
  assert.match(item.prompt, /^\/juslink-expert-arrival-check /);
  assert.equal(flow.skillView(expert), null);
  assert.equal(flow.expertView({ name: 'juslink-personal-method', path: '/home/demo/.dsh/skills/juslink-personal-method/SKILL.md' }), null);
  for (const bad of [{ ...expert, path: undefined }, { ...expert, path: '/other/SKILL.md' }, { ...expert, name: 'juslink-expert-../bad' }, { ...expert, name: 'juslink-expert-x\n/another' }, { name: 'unrelated' }]) {
    assert.equal(flow.expertView(bad), null);
  }
  assert.equal(flow.expertView({ ...expert, path: 'C:\\Users\\demo\\.dsh\\skills\\juslink-expert-arrival-check\\SKILL.md' }).title, item.title);
});

function fixture() {
  const calls = [];
  const session = {
    beginSubmission(value) { calls.push(['submission', value]); return { requestId: 'request-expert' }; },
    async prompt(...args) { calls.push(['prompt', ...args]); return { ok: true }; },
  };
  const services = {
    sessions: {
      list: { getSnapshot: () => ({ ids: ['existing', 'creator'], byId: { existing: {}, creator: {} } }) },
      async create(value) { calls.push(['create', value]); return 'fresh'; },
      async using(id, options, fn) { try { await fn({ ready: Promise.resolve(), binding: { session } }); } finally { calls.push(['released', id]); } },
    },
    uiWorkspace: { openSession: id => calls.push(['open', id]) },
    'remote.skills': { async list(args) { calls.push(['list', args]); return { ok: true, value: { skills: [expert, { name: 'juslink-transport-analysis' }, { name: 'juslink-personal-test', path: '/home/demo/.dsh/skills/juslink-personal-test/SKILL.md' }] } }; } },
  };
  return { ctx: { get: name => services[name] }, services, calls };
}

test('creation and subsequent use open fresh conversations without touching old drafts', async () => {
  const { ctx, calls } = fixture();
  let created;
  await flow.launch(ctx, flow.expertCreationPrompt(), id => { created = id; });
  assert.equal(created, 'fresh');
  assert.deepEqual(calls[0], ['create', {}]);
  const submission = calls.find(x => x[0] === 'submission')[1];
  assert.match(submission.text, /^\/juslink-create-personal-expert /);
  assert.equal(calls.find(x => x[0] === 'prompt')[4], 'request-expert');
  assert.deepEqual(calls.at(-1), ['released', 'fresh']);
  calls.length = 0;
  await flow.launch(ctx, flow.expertView(expert).prompt);
  assert.deepEqual(calls[0], ['create', {}]);
  assert.match(calls.find(x => x[0] === 'submission')[1].text, /^\/juslink-expert-arrival-check /);
});

test('expert catalog is separate from methods, uses creator session and reports failures', async () => {
  const { ctx, services, calls } = fixture();
  assert.equal((await flow.listExperts(ctx, 'creator')).experts.length, 1);
  assert.deepEqual(calls.at(-1), ['list', { sessionId: 'creator' }]);
  assert.equal((await flow.list(ctx)).skills.length, 2);
  services['remote.skills'].list = async () => ({ ok: false, error: new Error('permission denied') });
  await assert.rejects(() => flow.listExperts(ctx), /permission denied/);
  services.sessions.list.getSnapshot = () => ({ ids: [], byId: {} });
  assert.deepEqual(await flow.listExperts(ctx), { experts: [], needsSession: true });
  assert(!calls.some(x => x[0] === 'create'));
});

test('host registers the authoring skill as explicit-only with real tool schemas', async () => {
  const { apply } = await import('../index.js');
  const tools = [], skills = [];
  apply({ tools: { register: tool => tools.push(tool) }, skills: { register: skill => skills.push(skill) }, workingDirectory: {} });
  assert.equal(tools.length, 7);
  assert.equal(skills.length, 4);
  const authoring = skills.find(s => s.name === 'juslink-create-personal-expert');
  assert.deepEqual(authoring.invocation, { modelInvocable: false, userInvocable: true });
  const catalog = JSON.parse(authoring.content.split('## 插件工具参考目录\n')[1].split('\n\n不要修改平台专家')[0]);
  assert.deepEqual(catalog.map(t => t.name), tools.map(t => t.name));
  assert.deepEqual(catalog[0].parameters, tools[0].parameters);
});
