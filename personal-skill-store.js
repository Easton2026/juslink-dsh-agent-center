import { lstat, realpath, open, unlink, rmdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const NAME = /^juslink-personal-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BYTES = 512 * 1024;
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function scalar(value) {
  const s = value.trim();
  return ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) ? s.slice(1,-1) : s;
}
export function personalBody(raw, name) {
  const match = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/.exec(raw);
  if (!match) fail('个人技能缺少有效的 YAML frontmatter。');
  const lines = match[1].split(/\r?\n/);
  const names = lines.filter(line => /^name\s*:/.test(line));
  const metas = lines.filter(line => /^metadata\s*:/.test(line));
  const meta = lines.findIndex(line => /^metadata\s*:\s*$/.test(line));
  const nested = [];
  if (meta >= 0) for (const line of lines.slice(meta+1)) { if (/^\S/.test(line)) break; nested.push(line); }
  const get = key => {
    const found = nested.filter(line => new RegExp('^\\s+'+key+'\\s*:').test(line));
    return found.length === 1 ? scalar(found[0].slice(found[0].indexOf(':')+1)) : '';
  };
  if (names.length !== 1 || metas.length !== 1 || scalar(names[0].slice(names[0].indexOf(':')+1)) !== name ||
      get('plugin') !== '@juslink/agent-center-ui' || get('scope') !== 'personal') fail('该文件不符合 JusBuddy 个人技能归属规则，不能读取或删除。',403);
  return match[2].trim();
}
export function createPersonalSkillStore({ home = process.env.DSH_HOME || join(homedir(), '.dsh') } = {}) {
  async function locate(input) {
    const name = input?.name;
    if (typeof name !== 'string' || name.length > 128 || !NAME.test(name) || typeof input?.path !== 'string') fail('无效的个人技能标识。');
    const expected = join(resolve(home),'skills',name,'SKILL.md');
    if (resolve(input.path) !== expected) fail('该技能不在当前 DSH 用户技能目录中。',403);
    try {
      const root = await realpath(resolve(home)), dir = join(root,'skills',name), file = join(dir,'SKILL.md');
      for (const target of [dirname(dir),dir]) {
        const stat = await lstat(target);
        if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(target) !== target) fail('拒绝访问链接或非标准技能目录。',403);
      }
      const stat = await lstat(file);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || await realpath(file) !== file) fail('拒绝访问链接或非标准技能文件。',403);
      return {name,dir,file,stat};
    } catch (error) {
      if (error.code === 'ENOENT') fail('个人技能文件不存在，可能已被删除。',404);
      throw error;
    }
  }
  async function inspect(input) {
    const target = await locate(input);
    const fd = await open(target.file,constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
    try {
      const stat = await fd.stat();
      if (!stat.isFile() || stat.nlink !== 1 || stat.ino !== target.stat.ino || stat.dev !== target.stat.dev) fail('技能文件已变化，请重新打开。',409);
      if (stat.size > MAX_BYTES) fail('技能正文超过 512 KB，无法在页面中读取。',413);
      const raw = await fd.readFile();
      if (raw.length > MAX_BYTES) fail('技能正文超过 512 KB，无法在页面中读取。',413);
      return {...target,content:personalBody(raw.toString('utf8'),target.name),revision:createHash('sha256').update(raw).digest('hex')};
    } finally { await fd.close(); }
  }
  return {
    async read(input) { const value = await inspect(input); return {content:value.content,revision:value.revision}; },
    async remove(input) {
      const value = await inspect(input);
      if (input.revision !== value.revision) fail('技能已修改，请重新展开详情后再删除。',409);
      const current = await locate(input);
      if (current.stat.ino !== value.stat.ino || current.stat.dev !== value.stat.dev || current.stat.mtimeMs !== value.stat.mtimeMs || current.stat.size !== value.stat.size) fail('技能已变化，请重新展开详情。',409);
      await unlink(current.file);
      try { await rmdir(current.dir); } catch {}
      return {removed:true};
    },
  };
}
export function registerPersonalSkills(ctx) {
  if (!ctx.webServer?.register || !ctx.connection?.requestRejection) return;
  const store = createPersonalSkillStore();
  for (const [action,run] of [['read',store.read],['delete',store.remove]]) {
    ctx.effect(() => ctx.webServer.register({
      kind:'exact',path:'/juslink-personal-skills/'+action,
      handler:async(req,res) => {
        const rejection = ctx.connection.requestRejection(req);
        if (rejection || req.method !== 'POST' || req.headers['x-juslink-panel'] !== '1') { res.writeHead(rejection || 403).end(); return; }
        const reply = (status,value) => res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'}).end(JSON.stringify(value));
        try {
          const chunks=[]; let size=0;
          for await (const chunk of req) { size+=chunk.length; if(size>16*1024){reply(413,{error:'请求过大。'});return;} chunks.push(chunk); }
          reply(200,await run(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')));
        } catch(err) { reply(err?.status || 400,{error:err?.status ? err.message : '本机技能文件操作失败，请检查 DSH 文件权限或重试。'}); }
      },
    }),'juslink: personal skills '+action);
  }
}
