import { readFile, writeFile } from 'node:fs/promises';
import { TRANSPORT_ANALYSIS } from './index.js';
import { EXPERT_ENTRIES } from './capability-catalog.js';
import { DESIGN_SYSTEM_CSS } from './render-card.js';
const searchSource = (await readFile(new URL('./subscription-search.js', import.meta.url), 'utf8')).replace(/^export /gm, '');
const skillFlow = await readFile(new URL('./src/skill-flow.cjs', import.meta.url), 'utf8');
const source = await readFile(new URL('./src/client.cjs', import.meta.url), 'utf8');
const css = await readFile(new URL('./src/styles.css', import.meta.url), 'utf8');
const logo = await readFile(new URL('./assets/juslink-logo.png', import.meta.url));
const jusdaLogo = await readFile(new URL('./assets/jusda-logo.png', import.meta.url));
await writeFile(new URL('./client.js', import.meta.url), `window.__ModuleLoader__.load({
  id: '@juslink/agent-center-ui',
  factory(require) {
    const exports = {};
    const CSS = ${JSON.stringify(css)};
    const DESIGN_SYSTEM_CSS = ${JSON.stringify(DESIGN_SYSTEM_CSS)};
    const LOGO = ${JSON.stringify('data:image/png;base64,' + logo.toString('base64'))};
    const JUSDA_LOGO = ${JSON.stringify('data:image/png;base64,' + jusdaLogo.toString('base64'))};
    const PLATFORM_SKILL_CONTENT = ${JSON.stringify(TRANSPORT_ANALYSIS)};
    const EXPERT_ENTRIES = ${JSON.stringify(EXPERT_ENTRIES)};
    const JuslinkCards = (() => { ${searchSource}\n return { subscriptionPage, normalizeTrackingPart, mergeTrackingParts, normalizeOverviewPart, mergeOverviewParts }; })();
    const normalizeSearchPage = JuslinkCards.subscriptionPage;
    const SkillFlow = (() => { const module = { exports: {} }; ${skillFlow}\n return module.exports; })();
    ${source}
    return exports;
  }
});\n`);
console.log('智链平台客户端已构建');
