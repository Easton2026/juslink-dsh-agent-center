import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';

const resource = 'https://higress-sit.jusda.int/mcp-servers/juslink-api-gateway-sit';
const issuer = 'https://sit.jusda.cloud/login-entrance';
const clientKey = 'juslink-agent-center/sit-client';
const accessRef = 'JUSLINK_MCP_TOKEN';
const refreshRef = 'JUSLINK_MCP_REFRESH_TOKEN';
const required = { state: 'required' };
const unavailable = { state: 'unavailable' };

async function request(url, options) {
  return fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(12000) });
}

// The temporary HTTP exception is scoped to this exact SIT gateway.
async function gateway(options) {
  try { return await request(resource, options); }
  catch (error) {
    const certificates = ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'SELF_SIGNED_CERT_IN_CHAIN', 'DEPTH_ZERO_SELF_SIGNED_CERT'];
    if (!certificates.includes(error.cause?.code)) throw error;
    return request(resource.replace('https:', 'http:'), options);
  }
}

async function payload(response, id) {
  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) throw Error('Incomplete MCP stream');
        buffer += value;
        let boundary;
        while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
          const block = buffer.slice(0, boundary.index);
          buffer = buffer.slice(boundary.index + boundary[0].length);
          const data = block.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
          if (data) {
            const message = JSON.parse(data);
            if (message.id === id) return message.result;
          }
        }
      }
    } finally { await reader.cancel(); }
  }
  const message = await response.json();
  if (message.id === id) return message.result;
}

export async function probe(token, send = gateway) {
  const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };
  if (token) headers.authorization = 'Bearer ' + token;
  const post = body => send({ method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', ...body }) });
  const failure = (response, step) => [401, 403].includes(response.status) ? required :
    { state: 'unavailable', detail: step + '失败（HTTP ' + response.status + '）。' };
  let session;
  try {
    const init = await post({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'juslink-agent-center', version: '1' } } });
    if (!init.ok) return failure(init, '连接智链 MCP');
    session = init.headers.get('mcp-session-id');
    if (session) headers['mcp-session-id'] = session;
    const info = await payload(init, 1);
    if (!info?.protocolVersion) return unavailable;
    headers['mcp-protocol-version'] = info.protocolVersion;
    const ready = await post({ method: 'notifications/initialized' });
    if (!ready.ok) return failure(ready, '确认 MCP 连接');
    const tools = new Map();
    const cursors = new Set();
    let cursor;
    do {
      const id = 2 + cursors.size;
      const list = await post({ id, method: 'tools/list', params: cursor ? { cursor } : {} });
      if (!list.ok) return failure(list, '读取工具列表');
      const page = await payload(list, id);
      if (!Array.isArray(page?.tools)) return unavailable;
      for (const tool of page.tools) {
        if (typeof tool.name !== 'string') continue;
        const title = tool.title || tool.annotations?.title;
        tools.set(tool.name, { name: tool.name, title: typeof title === 'string' ? title.trim() : '',
          summary: typeof tool.description === 'string' ? tool.description.split(/\r?\n/, 1)[0].slice(0, 180) : '' });
      }
      cursor = page.nextCursor;
      if (cursor && (cursors.has(cursor) || cursors.size >= 64)) return unavailable;
      if (cursor) cursors.add(cursor);
    } while (cursor);
    return { state: 'authorized', tools: [...tools.values()] };
  } finally {
    if (session) await send({ method: 'DELETE', headers }).catch(() => {});
  }
}

async function endpoints() {
  const load = async url => {
    const response = await request(url);
    if (!response.ok) throw Error('Discovery failed');
    return response.json();
  };
  const meta = await load('https://mpsit.jus-link.com/login-entrance/.well-known/oauth-protected-resource');
  if (meta.resource !== resource || !meta.authorization_servers?.includes(issuer)) throw Error('Unexpected resource');
  const config = await load('https://sit.jusda.cloud/.well-known/oauth-authorization-server/login-entrance');
  if (config.issuer !== issuer || !['token_endpoint','authorization_endpoint','registration_endpoint'].every(key => new URL(config[key]).origin === new URL(issuer).origin)) throw Error('Unexpected issuer');
  return config;
}

export function createAuth(credentials, { check = probe, discover = endpoints, send = request } = {}) {
  let pending, checking, starting;
  let disposed = false;
  const storedClient = async () => (await credentials.readRecord(clientKey))?.payload;
  async function exchange(endpoint, client, params) {
    const response = await send(endpoint, { method: 'POST', body: new URLSearchParams({
      client_id: client.id, client_secret: client.secret, resource, ...params,
    }) });
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'invalid_client') {
        await credentials.deleteRecord(clientKey);
        return required;
      }
      if (['invalid_grant', 'access_denied'].includes(data.error)) return required;
      throw Error('Token exchange failed');
    }
    if (!data.access_token || data.token_type?.toLowerCase() !== 'bearer') throw Error('Invalid token response');
    if (data.refresh_token) await credentials.set(refreshRef, data.refresh_token);
    else if (params.grant_type === 'authorization_code') await credentials.unset(refreshRef);
    await credentials.set(accessRef, data.access_token);
    return check(data.access_token);
  }
  async function status() {
    const token = (await credentials.resolve(accessRef))?.value;
    // SIT can serve tools/list even after the bearer token has expired.
    let expiresAt;
    if (token?.split('.').length === 3) {
      try { expiresAt = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')).exp; } catch {}
    }
    const result = !token || (Number.isFinite(expiresAt) && expiresAt * 1000 <= Date.now() + 15000)
      ? required : await check(token);
    if (result.state !== 'required') return result;
    const client = await storedClient();
    const refresh = (await credentials.resolve(refreshRef))?.value;
    if (!client || !refresh) return required;
    return exchange((await discover()).token_endpoint, client, { grant_type: 'refresh_token', refresh_token: refresh });
  }
  async function start() {
    if (pending?.state === 'waiting') return { state: 'waiting', url: pending.url };
    const config = await discover();
    let client = await storedClient();
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const attempt = { state: 'waiting' };
    const server = createServer(async (req, res) => {
      let url;
      try { url = new URL(req.url, 'http://127.0.0.1'); }
      catch { res.writeHead(400).end(); return; }
      if (req.method !== 'GET' || url.pathname !== '/callback' || url.searchParams.get('state') !== state || attempt.used || !attempt.url) {
        res.writeHead(400).end(); return;
      }
      attempt.used = true;
      try {
        const code = url.searchParams.get('code');
        const result = code && !url.searchParams.has('error') ? await exchange(config.token_endpoint, client, {
          grant_type: 'authorization_code', code, redirect_uri: client.redirect, code_verifier: verifier,
        }) : required;
        attempt.state = result.state;
        attempt.tools = result.tools;
      } catch { attempt.state = 'unavailable'; }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(attempt.state === 'authorized' ? '授权成功，可以返回智链平台。' : '请返回智链平台查看授权状态。');
      attempt.close();
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(client ? Number(new URL(client.redirect).port) : 0, '127.0.0.1', resolve);
    });
    const timer = setTimeout(() => { if (!attempt.used) { attempt.state = 'required'; attempt.close(); } }, 300000);
    attempt.close = () => {
      clearTimeout(timer);
      if (server.listening) server.close();
    };
    try {
      if (!client) {
        const redirect = 'http://127.0.0.1:' + server.address().port + '/callback';
        const response = await send(config.registration_endpoint, { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ client_name: '智链业务插件', redirect_uris: [redirect], grant_types: ['authorization_code','refresh_token'], response_types: ['code'], token_endpoint_auth_method: 'client_secret_post', scope: 'mcp:tools' }) });
        if (!response.ok) throw Error('Registration failed');
        const data = await response.json();
        if (!data.client_id || !data.client_secret) throw Error('Incomplete registration');
        client = { id: data.client_id, secret: data.client_secret, redirect };
        await credentials.modifyRecord(clientKey, async () => ({ kind: 'grant', payload: client }));
      }
      const url = new URL(config.authorization_endpoint);
      url.search = new URLSearchParams({ response_type: 'code', client_id: client.id, redirect_uri: client.redirect,
        scope: 'mcp:tools', resource, state, code_challenge_method: 'S256',
        code_challenge: createHash('sha256').update(verifier).digest('base64url') }).toString();
      if (disposed) throw Error('Plugin closed');
      attempt.url = url.href;
      pending = attempt;
      return { state: 'waiting', url: attempt.url };
    } catch (error) { attempt.close(); throw error; }
  }
  return {
    status() {
      if (pending?.state === 'waiting') return Promise.resolve({ state: 'waiting', url: pending.url });
      return checking ??= status().finally(() => { checking = undefined; });
    },
    start() { return starting ??= start().finally(() => { starting = undefined; }); },
    progress() { return { state: pending?.state ?? 'required', ...(pending?.tools && { tools: pending.tools }) }; },
    cancel() {
      if (pending?.state === 'waiting' && !pending.used) {
        pending.state = 'required';
        pending.used = true;
        pending.close();
      }
      return { state: pending?.state ?? 'required' };
    },
    dispose() { disposed = true; pending?.close(); },
  };
}

export function registerAuth(ctx) {
  const auth = createAuth(ctx.credentials);
  ctx.effect(() => () => auth.dispose(), 'juslink: close OAuth callback');
  for (const action of ['status', 'start', 'progress', 'cancel']) {
    ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/juslink-auth/' + action,
      handler: async (req, res) => {
        const rejection = ctx.connection.requestRejection(req);
        if (rejection || req.method !== 'POST' || req.headers['x-juslink-panel'] !== '1') {
          res.writeHead(rejection || 403).end(); return;
        }
        let result;
        try { result = await auth[action](); } catch (error) {
          const code = [error?.cause?.code, error?.code, error?.name].find(value => typeof value === 'string' && /^[A-Za-z_0-9]{1,60}$/.test(value));
          result = { state: 'unavailable', detail: '本机授权服务处理失败（' + (code || '未知错误') + '）。' };
        }
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(result));
      },
    }), 'juslink: auth ' + action);
  }
}
