import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createAuth, probe } from '../gateway-auth.js';

test('a fresh MCP handshake must return tools before opening the panel', async () => {
  const methods = [];
  const result = await probe('test', async options => {
    const rpc = JSON.parse(options.body);
    methods.push(rpc.method);
    assert.equal(options.headers.authorization, 'Bearer test');
    if (rpc.method === 'initialize') return Response.json({ id: 1, result: { protocolVersion: '2025-06-18' } });
    if (rpc.method === 'notifications/initialized') return new Response(null, { status: 202 });
    return new Response('event: message\ndata: {"id":2,"result":{"tools":[]}}\n\n', { headers: { 'content-type': 'text/event-stream' } });
  });
  assert.equal(result.state, 'authorized');
  assert.deepEqual(methods, ['initialize','notifications/initialized','tools/list']);
  for (const [status, state] of [[401,'required'], [403,'required'], [502,'unavailable']]) {
    assert.equal((await probe(undefined, async () => new Response(null, { status }))).state, state);
  }
});

function fixture() {
  const values = new Map();
  const calls = [];
  const credentials = {
    resolve: async key => ({ value: values.get(key) }),
    set: async (key, value) => values.set(key, value),
    unset: async key => values.delete(key),
    readRecord: async key => values.get(key),
    modifyRecord: async (key, modify) => values.set(key, await modify()),
  };
  const auth = createAuth(credentials, {
    check: async token => ({ state: token ? 'authorized' : 'required' }),
    discover: async () => ({ registration_endpoint: 'register', token_endpoint: 'token', authorization_endpoint: 'https://example.test/authorize' }),
    send: async (url, options) => {
      calls.push([url, options]);
      if (url === 'register') return Response.json({ client_id: 'test-id', client_secret: 'test-secret' });
      assert.equal(url, 'token');
      return Response.json({ access_token: 'new-access', refresh_token: 'new-refresh', token_type: 'Bearer' });
    },
  });
  return { values, calls, auth };
}

test('loopback callback validates state and PKCE then verifies tools; refresh is shared', async t => {
  const { auth, values, calls } = fixture();
  t.after(() => auth.dispose());
  assert.equal((await auth.status()).state, 'required');
  const [a, b] = await Promise.all([auth.start(), auth.start()]);
  assert.equal(a.url, b.url);
  const login = new URL(a.url);
  const callback = new URL(login.searchParams.get('redirect_uri'));
  callback.search = new URLSearchParams({ state: 'incorrect', code: 'test' });
  assert.equal((await fetch(callback)).status, 400);
  assert.equal(auth.progress().state, 'waiting');
  callback.searchParams.set('state', login.searchParams.get('state'));
  assert.equal((await fetch(callback)).status, 200);
  assert.equal(auth.progress().state, 'authorized');
  const verifier = calls[1][1].body.get('code_verifier');
  assert.equal(createHash('sha256').update(verifier).digest('base64url'), login.searchParams.get('code_challenge'));
  // The SIT gateway still lists tools for an expired token. Refresh before that probe.
  const expired = 'a.' + Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url') + '.b';
  values.set('JUSLINK_MCP_TOKEN', expired);
  const results = await Promise.all([auth.status(), auth.status()]);
  assert.ok(results.every(result => result.state === 'authorized'));
  assert.equal(calls.filter(([url]) => url === 'token').length, 2);
  assert.equal(calls.at(-1)[1].body.get('grant_type'), 'refresh_token');
});

test('cancelled consent leaves the gate closed; retry gets a new state', async t => {
  const { auth } = fixture();
  t.after(() => auth.dispose());
  const first = new URL((await auth.start()).url);
  const callback = new URL(first.searchParams.get('redirect_uri'));
  callback.search = new URLSearchParams({ state: first.searchParams.get('state'), error: 'access_denied' });
  await (await fetch(callback)).text();
  assert.equal(auth.progress().state, 'required');
  const retry = new URL((await auth.start()).url);
  assert.notEqual(retry.searchParams.get('state'), first.searchParams.get('state'));
});
