'use strict';
const PERSONAL_PREFIX = 'juslink-personal-';
const PLATFORM = 'juslink-transport-analysis';
const AUTHORING = 'juslink-create-personal-skill';
const EXPERT_AUTHORING = 'juslink-create-personal-expert';
function skillView(entry) {
  if (!entry || typeof entry.name !== 'string') return null;
  if (entry.name === PLATFORM && !entry.path) return { ...entry, scope: 'platform', title: '运输情况分析' };
  // The native catalog omits provider metadata. Require the dedicated namespace
  // and a filesystem locator, never classify arbitrary installed skills as ours.
  if (!entry.name.startsWith(PERSONAL_PREFIX) || !entry.path) return null;
  const normalized = entry.path.split(String.fromCharCode(92)).join('/');
  if (!normalized.endsWith('/' + entry.name + '/SKILL.md') || !normalized.includes('/skills/')) return null;
  const description = entry.description || '';
  const match = /^【([^】]+)】\s*([\s\S]*)$/.exec(description);
  return { ...entry, scope: 'personal', title: match ? match[1] : entry.name, description: match ? match[2] : description };
}
function creationPrompt() {
  return '/' + AUTHORING + ' 我要在智链平台新建一个个人技能，请先询问我希望它完成的工作和方法。创建后请归属智链平台，并保存到我的个人技能中。';
}
function expertView(entry) {
  if (!entry || typeof entry.name !== 'string' || !/^juslink-expert-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) || typeof entry.path !== 'string') return null;
  const path = entry.path.split(String.fromCharCode(92)).join('/');
  if (!path.endsWith('/' + entry.name + '/SKILL.md') || !path.includes('/skills/')) return null;
  const match = /^【([^】]+)】\s*([\s\S]*)$/.exec(entry.description || '');
  return { ...entry, id: entry.name, scope: 'personal', kind: 'scenario-expert', title: match ? match[1] : entry.name, description: match ? match[2] : entry.description || '', action: '开始任务',
    prompt: '/' + entry.name + ' 请按这个场景专家的完整流程协助我。先询问本次任务需要的信息，核对所需工具是否可用，再执行；说明数据来源和信息缺口。' };
}
function expertCreationPrompt() {
  return '/' + EXPERT_AUTHORING + ' 我要在智链平台创建一个属于自己的场景专家。请先询问我想解决什么问题，再帮我拆解目标、匹配当前可用工具，整理完整的执行方法。方案确认后，保存到我的个人场景专家中。';
}
function assertServices(ctx, needsCatalog = false) {
  if (!ctx.get('sessions')?.create || !ctx.get('uiWorkspace')?.openSession || (needsCatalog && !ctx.get('remote.skills')?.list)) {
    throw new Error('当前 DSH 未提供所需的会话或技能目录接口，请更新 DSH 后重试。');
  }
}
async function launch(ctx, prompt, onCreated) {
  assertServices(ctx);
  const sessions = ctx.get('sessions');
  // No sessionId: always create a fresh conversation and preserve existing drafts.
  const id = await sessions.create({});
  onCreated?.(id);
  await sessions.using(id, { source: 'workspaceOperation' }, async reference => {
    await reference.ready;
    const session = reference.binding.session;
    const submission = session.beginSubmission({ text: prompt, attachments: [] });
    ctx.get('uiWorkspace').openSession(id);
    const result = await session.prompt([{ type: 'text', text: prompt }], 'queue', undefined, submission.requestId);
    if (!result.ok) throw result.error;
  });
  return id;
}
async function catalog(ctx, preferredId) {
  assertServices(ctx, true);
  const snapshot = ctx.get('sessions').list.getSnapshot();
  const id = preferredId && snapshot.byId[preferredId] ? preferredId : snapshot.ids.find(id => snapshot.byId[id]?.origin !== 'subagent');
  if (!id) return { skills: [], needsSession: true };
  const result = await ctx.get('remote.skills').list({ sessionId: id });
  if (!result.ok) throw result.error;
  return { skills: result.value.skills, needsSession: false };
}
async function list(ctx, preferredId) {
  const result = await catalog(ctx, preferredId);
  return { ...result, skills: result.skills.map(skillView).filter(Boolean) };
}
async function listExperts(ctx, preferredId) {
  const result = await catalog(ctx, preferredId);
  return { experts: result.skills.map(expertView).filter(Boolean), needsSession: result.needsSession };
}
module.exports = { skillView, creationPrompt, expertView, expertCreationPrompt, launch, list, listExperts };
