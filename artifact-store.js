import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

export const ARTIFACT_DIR = 'juslink-artifacts';
export const ARTIFACT_INDEX = 'index.json';
export const ARTIFACT_TOOL = 'juslink_artifact_save';
export const MAX_TITLE = 80;
export const MAX_HTML_BYTES = 2 * 1024 * 1024;
export const MAX_ARTIFACTS = 200;

/** Resolve the artifact directory inside a session working directory, refusing escapes. */
export function artifactRoot(cwd) {
  const root = resolve(cwd);
  const dir = resolve(root, ARTIFACT_DIR);
  if (relative(root, dir) !== ARTIFACT_DIR) throw new Error('成果目录必须位于当前工作目录内。');
  return dir;
}

function newId(now) {
  return 'art-' + now.toString(36) + '-' + Math.random().toString(16).slice(2, 6).padEnd(4, '0');
}

function cleanLine(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function readIndex(dir) {
  try {
    const parsed = JSON.parse(await readFile(join(dir, ARTIFACT_INDEX), 'utf8'));
    const list = Array.isArray(parsed?.artifacts) ? parsed.artifacts : [];
    return list.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string');
  } catch {
    return [];
  }
}

async function writeJson(file, value) {
  const temp = file + '.tmp';
  await writeFile(temp, JSON.stringify(value, null, 2) + '\n', 'utf8');
  await rename(temp, file);
}

/**
 * Save one HTML artifact under the session working directory and update its index.
 * The index is the only file the platform page reads, so a partially written
 * artifact never becomes visible.
 */
export async function saveArtifact({ cwd, title, html, summary }) {
  if (typeof title !== 'string' || !title.trim()) throw new Error('请提供成果标题 title。');
  if (typeof html !== 'string' || !html.trim()) throw new Error('请提供成果内容 html。');
  const bytes = Buffer.byteLength(html, 'utf8');
  if (bytes > MAX_HTML_BYTES) throw new Error('成果内容超过 ' + MAX_HTML_BYTES + ' 字节上限，请精简后再保存。');
  if (!/<(html|body|section|div|article|main|table|svg)[\s>]/i.test(html)) throw new Error('内容看起来不是 HTML，请提供完整的 HTML 片段或文档。');

  const dir = artifactRoot(cwd);
  const id = newId(Date.now());
  await mkdir(join(dir, id), { recursive: true });
  await writeFile(join(dir, id, 'index.html'), html, 'utf8');

  const entry = {
    id,
    title: cleanLine(title, MAX_TITLE),
    summary: cleanLine(summary, 200),
    createdAt: new Date().toISOString(),
    owner: 'personal',
    scope: 'personal',
    plugin: '@juslink/agent-center-ui',
    file: id + '/index.html',
    bytes,
    source: 'DSH 对话',
  };
  const artifacts = [entry, ...(await readIndex(dir)).filter(item => item.id !== id)].slice(0, MAX_ARTIFACTS);
  await writeJson(join(dir, ARTIFACT_INDEX), { version: 1, artifacts });

  return {
    saved: true,
    id,
    title: entry.title,
    createdAt: entry.createdAt,
    bytes,
    relativePath: ARTIFACT_DIR + '/' + entry.file,
    indexPath: ARTIFACT_DIR + '/' + ARTIFACT_INDEX,
    total: artifacts.length,
    note: '已保存到当前 DSH 工作区。请使用返回的相对路径打开成果文件。',
  };
}

export function createArtifactTool(ctx) {
  return {
    name: ARTIFACT_TOOL,
    description: '把对话中已经生成好的 HTML 成果保存到当前 DSH 工作区的成果目录。用户要求把报告、看板或图表保存到平台时使用；只在 HTML 生成并检查过之后调用，不用于查询业务数据。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string', description: '成果标题，中文，不超过 80 个字符。' },
        html: { type: 'string', description: '完整 HTML 文档或片段，含内联样式；不要放脚本，页面以禁用脚本的沙箱渲染。' },
        summary: { type: 'string', description: '可选的一两句话说明，展示在成果列表中。' },
      },
      required: ['title', 'html'],
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          saved: { type: 'boolean' },
          id: { type: 'string' },
          title: { type: 'string' },
          createdAt: { type: 'string' },
          bytes: { type: 'number' },
          relativePath: { type: 'string' },
          indexPath: { type: 'string' },
          total: { type: 'number' },
          note: { type: 'string' },
        },
        required: ['saved', 'id', 'title', 'createdAt', 'bytes', 'relativePath', 'indexPath', 'total', 'note'],
      },
      render: (_args, value) => [{ type: 'text', text: '【已保存 HTML】\n' + JSON.stringify(value, null, 2) }],
    },
    isConcurrencySafe: () => false,
    async execute(args, execution = {}) {
      execution.signal?.throwIfAborted();
      if (execution.agent === undefined) throw new Error('当前执行没有关联会话，无法确定成果保存目录。');
      const cwd = await ctx.workingDirectory.ensure(execution.agent, execution.signal);
      if (!cwd) throw new Error('当前会话没有工作目录，无法保存成果。');
      execution.signal?.throwIfAborted();
      return saveArtifact({ cwd, title: args?.title, html: args?.html, summary: args?.summary });
    },
    presentCall: args => ({ card: 'generic', kind: 'edit', title: '保存成果到智链平台', rawInput: args?.title ?? '' }),
  };
}
