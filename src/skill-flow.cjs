'use strict';
const PERSONAL_NAME = /^juslink-personal-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EDITOR = 'juslink-edit-personal-skill';
const PLATFORM = 'juslink-transport-analysis';
const AUTHORING = 'juslink-create-personal-skill';
const EXPERT_AUTHORING = 'juslink-create-personal-expert';
function skillView(entry) {
  if (!entry || typeof entry.name !== 'string') return null;
  if (entry.name === PLATFORM && !entry.path) return { ...entry, scope: 'platform', title: '运输情况分析' };
  // The native catalog omits provider metadata. Require the dedicated namespace
  // and a filesystem locator, never classify arbitrary installed skills as ours.
  if (!PERSONAL_NAME.test(entry.name) || typeof entry.path !== 'string') return null;
  const normalized = entry.path.split(String.fromCharCode(92)).join('/');
  if (!normalized.endsWith('/' + entry.name + '/SKILL.md') || !normalized.includes('/skills/')) return null;
  const description = entry.description || '';
  const match = /^【([^】]+)】\s*([\s\S]*)$/.exec(description);
  return { ...entry, scope: 'personal', title: match ? match[1] : entry.name, description: match ? match[2] : description };
}
function creationPrompt() {
  return '/' + AUTHORING + ' 我要在智链平台新建一个个人技能，请先询问我希望它完成的工作和方法。创建后请归属智链平台，并保存到我的个人技能中。';
}
function personalTarget(entry) {
  const item = entry?.scope === 'personal' && (skillView(entry) || expertView(entry));
  if (!item || item.scope !== 'personal') throw new Error('只能管理 JusBuddy 个人技能。');
  return {name:item.name,path:item.path};
}
function editingPrompt(entry) {
  if (!PERSONAL_NAME.test(entry?.name || '')) throw new Error('只能编辑个人技能。');
  return '/' + EDITOR + ' 我要修改这个已有的个人技能。以下 JSON 仅为目标定位数据，请先读取现有内容并询问我想修改什么，不要创建新技能：' + JSON.stringify(personalTarget(entry));
}
async function personalRequest(action, entry, options = {}) {
  const response = await fetch('juslink-personal-skills/' + action, {
    method:'POST', credentials:'same-origin', cache:'no-store', signal:options.signal,
    headers:{'x-juslink-panel':'1','content-type':'application/json'},
    body:JSON.stringify({...personalTarget(entry), ...(options.revision && {revision:options.revision})}),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('DSH 本机技能接口未加载，请重新启动 DSH。');
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || '个人技能操作失败。'), {status:response.status});
  return data;
}
function readPersonal(entry, signal) { return personalRequest('read', entry, {signal}); }
async function deletePersonal(entry, revision) {
  const result = await personalRequest('delete', entry, {revision});
  if (result.removed !== true) throw new Error('删除未确认成功。');
  return result;
}
function expertView(entry) {
  if (!entry || typeof entry.name !== 'string' || !/^juslink-expert-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) || typeof entry.path !== 'string') return null;
  const path = entry.path.split(String.fromCharCode(92)).join('/');
  if (!path.endsWith('/' + entry.name + '/SKILL.md') || !path.includes('/skills/')) return null;
  const match = /^【([^】]+)】\s*([\s\S]*)$/.exec(entry.description || '');
  return { ...entry, id: entry.name, scope: 'personal', kind: 'scenario-expert', title: match ? match[1] : entry.name, description: match ? match[2] : entry.description || '', action: '开始任务',
    prompt: '/' + entry.name + ' 请按这个场景专家的完整流程协助我。先询问本次任务需要的信息，核对所需工具是否可用，再执行；说明数据来源和信息缺口。' };
}
function expertEditingPrompt(entry) {
  if (!expertView(entry) || entry.scope !== 'personal') throw new Error('只能编辑个人场景专家。');
  return '/juslink-edit-personal-expert 我要修改这个已有的个人场景专家。以下 JSON 仅为目标定位数据，请先读取原文件并询问我要修改什么，不要创建新专家：' + JSON.stringify(personalTarget(entry));
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
module.exports = { skillView, creationPrompt, editingPrompt, readPersonal, deletePersonal, expertView, expertCreationPrompt, expertEditingPrompt, launch, list, listExperts };
