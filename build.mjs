import { readFile, writeFile } from 'node:fs/promises';
import { DEMO_SHIPMENT } from './demo-data.js';
import { TRANSPORT_ANALYSIS } from './index.js';
import { TOOL_ENTRIES, EXPERT_ENTRIES } from './capability-catalog.js';
const skillFlow = await readFile(new URL('./src/skill-flow.cjs', import.meta.url), 'utf8');
const source = await readFile(new URL('./src/client.cjs', import.meta.url), 'utf8');
const css = await readFile(new URL('./src/styles.css', import.meta.url), 'utf8');
const logo = await readFile(new URL('./assets/juslink-logo.png', import.meta.url));
await writeFile(new URL('./client.js', import.meta.url), `window.__ModuleLoader__.load({
  id: '@juslink/agent-center-ui',
  factory(require) {
    const exports = {};
    const CSS = ${JSON.stringify(css)};
    const LOGO = ${JSON.stringify('data:image/png;base64,' + logo.toString('base64'))};
    const DEMO_DATA = ${JSON.stringify(DEMO_SHIPMENT)};
    const PLATFORM_SKILL_CONTENT = ${JSON.stringify(TRANSPORT_ANALYSIS)};
    const TOOL_ENTRIES = ${JSON.stringify(TOOL_ENTRIES)};
    const EXPERT_ENTRIES = ${JSON.stringify(EXPERT_ENTRIES)};
    const SkillFlow = (() => { const module = { exports: {} }; ${skillFlow}\n return module.exports; })();
    ${source}
    return exports;
  }
});\n`);
console.log('智链平台客户端已构建');
