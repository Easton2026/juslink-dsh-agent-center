import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPersonalSkillStore, personalBody } from '../personal-skill-store.js';
import flow from '../src/skill-flow.cjs';
const name='juslink-personal-demo';
const raw='---\nname: '+name+'\ndescription: "【测试】用途"\nmetadata:\n  plugin: "@juslink/agent-center-ui"\n  scope: personal\n---\n# 测试正文\n';
test('read real body, reject stale deletion, retain supporting files',async t=>{
  const home=await mkdtemp(join(tmpdir(),'jusbuddy-skill-')); t.after(()=>rm(home,{recursive:true,force:true}));
  const dir=join(home,'skills',name),path=join(dir,'SKILL.md'); await mkdir(dir,{recursive:true}); await writeFile(path,raw); await writeFile(join(dir,'notes.txt'),'keep');
  const store=createPersonalSkillStore({home}),target={name,path},first=await store.read(target);
  assert.equal(first.content,'# 测试正文'); await writeFile(path,raw+'changed');
  await assert.rejects(()=>store.remove({...target,revision:first.revision}),{status:409});
  const second=await store.read(target); assert.deepEqual(await store.remove({...target,revision:second.revision}),{removed:true});
  await assert.rejects(()=>store.read(target),{status:404}); assert.equal(await readFile(join(dir,'notes.txt'),'utf8'),'keep');
});
test('reject external paths, wrong owner, links and platform skills',async t=>{
  const home=await mkdtemp(join(tmpdir(),'jusbuddy-skill-')); t.after(()=>rm(home,{recursive:true,force:true}));
  const dir=join(home,'skills',name),path=join(dir,'SKILL.md'); await mkdir(dir,{recursive:true}); await writeFile(path,raw.replace('scope: personal','scope: platform'));
  const store=createPersonalSkillStore({home});
  await assert.rejects(()=>store.read({name,path}),{status:403});
  await assert.rejects(()=>store.read({name,path:join(home,'other','SKILL.md')}),{status:403});
  await assert.rejects(()=>store.read({name:'juslink-transport-analysis',path}),{status:400});
  await rm(path); const other=join(home,'outside.md'); await writeFile(other,raw); await symlink(other,path);
  await assert.rejects(()=>store.read({name,path}),{status:403}); assert.equal(await readFile(other,'utf8'),raw);
});
test('editing invokes only a valid existing personal target',()=>{
  const target={name,path:'/home/demo/.dsh/skills/'+name+'/SKILL.md',scope:'personal'};
  assert.match(flow.editingPrompt(target),/^\/juslink-edit-personal-skill /);
  assert.ok(flow.editingPrompt(target).includes(JSON.stringify({name,path:target.path})));
  assert.throws(()=>flow.editingPrompt({...target,scope:'platform'})); assert.throws(()=>flow.editingPrompt({...target,name:'juslink-personal-../bad'}));
  assert.equal(personalBody(raw,name),'# 测试正文');
});
