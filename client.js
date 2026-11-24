window.__ModuleLoader__.load({
  id: '@juslink/agent-center-ui',
  factory(require) {
    const exports = {};
    const CSS = ".jlc-root {\n  --jlc-canvas: #f5f5f5;\n  --jlc-ink: #262626;\n  --jlc-muted: #656565;\n  --jlc-line: #e7e7e7;\n  --jlc-blue: #101cad;\n  --jlc-wash: #dce7ff;\n  --jlc-action-fill: linear-gradient(105deg, #2857d5, var(--jlc-blue));\n  --jlc-action-hover: linear-gradient(105deg, #204aba, #101889);\n  --jlc-action-ink: var(--jlc-blue);\n}\n.jlc-root{height:100%;min-height:0;overflow:auto;background:var(--jlc-canvas);color:var(--jlc-ink);font-family:system-ui,-apple-system,\"PingFang SC\",sans-serif;font-size:14px;line-height:1.6;color-scheme:light;isolation:isolate}.jlc-root *{box-sizing:border-box}.jlc-root button,.jlc-root input{font:inherit}.jlc-root button{cursor:pointer}.jlc-root button:focus-visible,.jlc-root input:focus-visible{outline:3px solid var(--jlc-blue);outline-offset:3px}.jlc-header{display:flex;align-items:center;flex-wrap:wrap;gap:10px 22px;padding:14px 36px;padding-left:max(36px,var(--dsh-frame-leading-clearance,0px));background:#fff;border-bottom:1px solid var(--jlc-line)}.jlc-brand{display:flex;align-items:center;gap:14px;font-size:19px;font-weight:650}.jlc-brand img{width:85px;height:28px;object-fit:contain}.jlc-divider{height:20px;border-left:1px solid var(--jlc-line);margin:0 5px}.jlc-subtitle{font-size:14px;font-weight:400;color:var(--jlc-muted)}.jlc-mode{font-size:12px;background:var(--jlc-wash);color:var(--jlc-blue);padding:4px 11px;border-radius:4px;white-space:nowrap}.jlc-tabs{display:flex;gap:24px;margin-left:auto;padding:0;background:transparent;border:0;overflow-x:auto;max-width:100%}.jlc-tabs button{background:none;border:0;border-bottom:2px solid transparent;border-radius:0;color:var(--jlc-muted);padding:8px 0 7px;white-space:nowrap}.jlc-tabs button.selected{border-bottom-color:var(--jlc-blue);color:var(--jlc-blue);font-weight:600}.jlc-content{max-width:1250px;margin:auto;padding:32px 40px 45px}.jlc-root h1{font-size:28px;line-height:1.4;letter-spacing:-.6px;font-weight:650;margin:0 0 14px}.jlc-root h2{font-size:17px;font-weight:600;margin:0 0 8px}.jlc-root h3{font-size:17px;font-weight:600;margin:0}.jlc-root p{margin:8px 0}.jlc-intro{padding:10px 0 27px;max-width:800px}.jlc-intro>p:last-child{color:var(--jlc-muted);font-size:14px;max-width:700px;line-height:1.9}.jlc-eyebrow{color:var(--jlc-blue);font-size:13px;margin-bottom:12px!important}.jlc-section-title{display:flex;align-items:center;justify-content:space-between;margin:8px 0 16px;gap:16px}.jlc-section-title span{font-size:12px;color:var(--jlc-muted)}.jlc-section-title h2{margin:0}.jlc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.jlc-card{position:relative;padding:22px;background:#fff;border:1px solid var(--jlc-line);border-radius:9px;min-height:204px;display:flex;flex-direction:column}.jlc-number{font-size:12px;font-variant-numeric:tabular-nums;letter-spacing:1px;color:var(--jlc-muted);margin-bottom:13px}.jlc-summary{font-size:13px;color:var(--jlc-muted);margin-top:7px!important}.jlc-example{font-size:12px;color:var(--jlc-muted);padding-top:5px}.jlc-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:18px}.jlc-card-bottom small{font-size:11px;color:var(--jlc-muted)}.jlc-card-bottom button{background:none;border:0;padding:0;font-size:12px;color:var(--jlc-action-ink);white-space:nowrap}.jlc-query{margin-top:26px;padding:23px 26px;border:1px solid var(--jlc-line);border-radius:9px;background:#fff}.jlc-muted{color:var(--jlc-muted);font-size:13px}.jlc-query form{margin-top:18px}.jlc-query label{display:block;color:var(--jlc-muted);font-size:12px;margin-bottom:6px}.jlc-input-row{display:flex;gap:12px}.jlc-input-row input{min-width:0;flex:1;border:1px solid var(--jlc-line);border-radius:5px;background:var(--jlc-canvas);color:var(--jlc-ink);padding:10px 13px}.jlc-root .jlc-primary{border:0;background:var(--jlc-action-fill);color:#fff;padding:10px 20px;border-radius:5px;white-space:nowrap}.jlc-root button:disabled{opacity:.55;cursor:wait}.jlc-result{border:1px solid var(--jlc-line);border-radius:7px;padding:20px;margin-top:18px;background:#fff}.jlc-result-title{display:flex;justify-content:space-between;align-items:center;gap:12px}.jlc-result-title h3{font-size:15px}.jlc-status{font-size:12px;padding:3px 9px;border-radius:4px;background:var(--jlc-canvas);color:var(--jlc-muted);white-space:nowrap}.jlc-status.completed{background:var(--jlc-wash);color:var(--jlc-blue)}.jlc-status.failed,.jlc-status.interrupted{background:#fff3e9;color:#a66529}.jlc-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:18px 0}.jlc-facts dt{font-size:12px;color:var(--jlc-muted)}.jlc-facts dd{margin:4px 0 0;font-size:14px;overflow-wrap:anywhere}.jlc-note{font-size:12px;color:var(--jlc-muted);margin-top:22px!important}.jlc-empty{margin-top:26px;padding:45px 32px;background:#fff;border:1px solid var(--jlc-line);border-radius:8px;max-width:850px}.jlc-empty p{max-width:650px;color:var(--jlc-muted);line-height:1.9}.jlc-empty button{margin-top:15px}.jlc-experts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:26px}.jlc-expert{padding:25px;background:#fff;border:1px solid var(--jlc-line);border-radius:8px}.jlc-expert small{color:var(--jlc-muted)}.jlc-expert p{margin:16px 0}@media(min-width:1500px){.jlc-content{padding-top:45px}.jlc-card{min-height:220px}}@media(max-width:850px){.jlc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.jlc-content{padding:25px}.jlc-header{padding:22px 25px}.jlc-subtitle,.jlc-divider{display:none}.jlc-facts{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){.jlc-grid,.jlc-experts,.jlc-facts{grid-template-columns:1fr}.jlc-tabs{gap:18px}.jlc-content{padding:22px}.jlc-root h1{font-size:23px}.jlc-input-row{flex-direction:column}.jlc-section-title span{display:none}.jlc-card{min-height:190px}}\n\n.jlc-skills{max-width:1060px;margin:0 auto;padding:8px 0}.jlc-skills-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:28px}.jlc-skills-heading h1{margin-bottom:4px}.jlc-skills-actions{display:flex;align-items:center;gap:10px;padding-top:5px}.jlc-skills-actions input{width:225px;background:#fff;border:1px solid var(--jlc-line);border-radius:20px;padding:7px 14px;font-size:13px}.jlc-root .jlc-skills-actions .jlc-primary{border-radius:20px;padding:7px 17px}.jlc-quiet{border:0;background:transparent;color:var(--jlc-muted);padding:7px}.jlc-skill-scopes{display:flex;gap:8px;border-bottom:1px solid var(--jlc-line);padding-bottom:18px}.jlc-skill-scopes button{border:0;background:transparent;color:var(--jlc-muted);padding:7px 17px;border-radius:18px}.jlc-skill-scopes button.selected{background:var(--jlc-wash);color:var(--jlc-blue);font-weight:600}.jlc-skill-caption{font-size:12px;color:var(--jlc-muted);margin:18px 0!important}.jlc-skill-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 34px}.jlc-skill-card{display:flex;align-items:flex-start;gap:14px;padding:20px 4px;border-bottom:1px solid var(--jlc-line);min-width:0}.jlc-skill-icon{display:flex;align-items:center;justify-content:center;width:43px;height:43px;flex-shrink:0;border-radius:12px;background:var(--jlc-wash);color:var(--jlc-blue)}.jlc-skill-copy{min-width:0;flex:1}.jlc-skill-title{display:block;border:0;background:transparent;text-align:left;padding:0;color:var(--jlc-ink);font-weight:600!important}.jlc-skill-copy>p{font-size:13px;color:var(--jlc-muted);line-height:1.7;margin:5px 0 10px;overflow-wrap:anywhere}.jlc-skill-card-actions{display:flex;align-items:center;gap:16px;font-size:12px}.jlc-skill-card-actions span{color:var(--jlc-muted)}.jlc-skill-link{background:transparent;color:var(--jlc-action-ink);border:0;padding:0;font-size:12px!important}.jlc-skill-detail{margin-top:15px;border-top:1px dashed var(--jlc-line);padding-top:12px;overflow-wrap:anywhere;font-size:12px}.jlc-skill-detail pre{white-space:pre-wrap;max-height:280px;overflow:auto;font:12px/1.8 system-ui;padding:12px;background:var(--jlc-canvas);border-radius:5px}.jlc-skill-empty{padding:70px 20px;text-align:center;color:var(--jlc-muted)}.jlc-skill-empty p{font-size:13px}.jlc-skill-error{padding:10px 14px;background:#fff1ed;color:#9b493b;border-radius:5px;font-size:13px}@media(max-width:850px){.jlc-skills-heading{flex-direction:column;gap:12px}.jlc-skills-actions{width:100%;flex-wrap:wrap}.jlc-skills-actions input{flex:1;min-width:140px}}@media(max-width:620px){.jlc-skill-grid{grid-template-columns:1fr}.jlc-skills-actions{gap:6px}}\n\n.jlc-home{background:var(--jlc-canvas);color:var(--jlc-ink)}.jlc-home .jlc-content{max-width:1100px;padding:34px 48px 50px}.jlc-home .jlc-tabs{background:transparent}.jlc-launch{max-width:970px;margin:0 auto}.jlc-launch-logo{display:block;width:113px;height:39px;object-fit:contain;object-position:left center;margin:0 0 31px}.jlc-root .jlc-launch-heading{font-size:21px;font-weight:650;letter-spacing:-.3px;line-height:1.4;margin:0 0 17px}.jlc-workflows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.jlc-workflow{border:1px solid var(--jlc-line);border-radius:22px;min-height:190px;padding:21px 22px;display:flex;flex-direction:column;background:#fff;box-shadow:0 3px 6px #00000007}.jlc-workflow h2{font-size:15px;line-height:1.5;font-weight:600;color:var(--jlc-ink);margin:0 0 8px}.jlc-workflow p{font-size:13px;line-height:1.7;color:var(--jlc-muted);margin:0;max-width:400px}.jlc-workflow-start{align-self:flex-start;margin-top:auto;background:var(--jlc-action-fill);border:1px solid transparent;border-radius:20px;padding:5px 17px;color:#fff;font-size:12px!important;line-height:1.6}.jlc-root .jlc-primary:hover:not(:disabled),.jlc-workflow-start:hover:not(:disabled){background:var(--jlc-action-hover);border-color:transparent}.jlc-root .jlc-tools-heading{margin-top:32px;margin-bottom:14px}.jlc-tool-list{display:flex;flex-direction:column}.jlc-root .jlc-tool-row{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:13px 12px;min-height:74px;border:0;border-bottom:1px solid var(--jlc-line);border-radius:0;background:#fff;color:var(--jlc-ink);transition:background .12s}.jlc-tool-row:last-child{border-bottom:0}.jlc-root .jlc-tool-row:hover{background:var(--jlc-canvas)}.jlc-tool-icon{width:46px;height:46px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--jlc-line);border-radius:12px;background:#fff;color:var(--jlc-muted)}.jlc-tool-text{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.jlc-tool-text strong{font-size:14px;font-weight:600}.jlc-tool-text>span{font-size:12px;line-height:1.6;color:var(--jlc-muted)}.jlc-tool-arrow{color:var(--jlc-muted);opacity:0;padding:0 6px;font-size:16px}.jlc-tool-row:hover .jlc-tool-arrow,.jlc-tool-row:focus-visible .jlc-tool-arrow{opacity:1}.jlc-launch-note{font-size:12px;color:var(--jlc-muted);margin-top:22px!important;line-height:1.8}@media(max-width:850px){.jlc-home .jlc-content{padding:28px 30px 40px}}@media(max-width:580px){.jlc-workflows{grid-template-columns:1fr}.jlc-workflow{min-height:170px;border-radius:17px}.jlc-home .jlc-content{padding:25px 22px 36px}.jlc-tool-row{gap:12px}.jlc-tool-arrow{display:none}.jlc-launch-logo{margin-bottom:25px}}\n\n/* 成果中心 · 沙箱查看 */\n.jlc-expert-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:16px}.jlc-root .jlc-expert-heading h1{margin:0}.jlc-expert-actions{display:flex;align-items:center;gap:10px}.jlc-root .jlc-expert-actions .jlc-primary{border-radius:20px;padding:7px 17px;font-size:13px}.jlc-expert-scopes{margin-bottom:20px;padding-bottom:12px}.jlc-expert-empty{border:1px dashed var(--jlc-line);border-radius:18px;padding:30px;background:var(--jlc-canvas)}.jlc-expert-empty p{color:var(--jlc-muted);font-size:13px;max-width:560px}.jlc-expert-empty .jlc-workflow-start{margin-top:16px}.jlc-workflow p{overflow-wrap:anywhere}.jlc-workflow .jlc-workflow-start{margin-top:auto}.jlc-expert-note{margin-top:16px!important;font-size:12px}@media(max-width:580px){.jlc-expert-heading{align-items:flex-start;flex-direction:column;gap:10px}.jlc-expert-actions{width:100%;justify-content:space-between}.jlc-expert-empty{padding:24px}}\n\n.jlc-artifacts{max-width:1060px;margin:0 auto;padding:8px 0}\n.jlc-artifact-list{display:flex;flex-direction:column;gap:14px}\n.jlc-artifact-card{border:1px solid var(--jlc-line);border-radius:9px;background:#fff;padding:18px 20px}\n.jlc-artifact-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}\n.jlc-artifact-head h3{margin:0 0 6px;font-size:15px}\n.jlc-artifact-head p{margin:0;font-size:13px}\n.jlc-artifact-meta{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:12px;color:var(--jlc-muted)}\n.jlc-artifact-frame-wrap{margin-top:14px}\n.jlc-artifact-frame{width:100%;height:480px;border:1px solid var(--jlc-line);border-radius:7px;background:#fff}\n@media(max-width:620px){.jlc-artifact-frame{height:360px}}\n\n\n.jlc-root.jlc-auth { box-sizing:border-box; display:grid; place-items:safe center; padding:clamp(16px,5vw,48px); background:var(--jlc-canvas); }\n.jlc-auth-card { width:min(100%,432px); background:#fff; border:1px solid var(--jlc-line); border-radius:16px; box-shadow:0 4px 16px #00000009; }\n.jlc-auth-brand { display:flex; align-items:center; gap:12px; margin:0 32px; padding:24px 0 20px; border-bottom:1px solid var(--jlc-line); }\n.jlc-auth-brand img { width:74px; height:auto; display:block; }\n.jlc-auth-brand span { border-left:1px solid var(--jlc-line); padding-left:12px; color:var(--jlc-muted); font-size:13px; line-height:16px; }\n.jlc-auth-body { padding:28px 32px 32px; }\n.jlc-auth-body h1 { margin:0; color:var(--jlc-ink); font-size:clamp(20px,3vw,24px); font-weight:600; line-height:1.4; letter-spacing:0; }\n.jlc-auth-body p { margin:8px 0 0; color:var(--jlc-muted); font-size:14px; line-height:1.7; }\n.jlc-auth-actions { display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-top:24px; }\n.jlc-auth-actions .jlc-auth-action { display:inline-flex; align-items:center; justify-content:center; gap:12px; min-height:40px; padding:8px 16px; border:1px solid transparent; border-radius:8px; font-family:inherit; font-size:14px; font-weight:500; line-height:1.4; text-decoration:none; }\n.jlc-auth-actions .main { background:var(--jlc-action-fill); color:white; }\n.jlc-auth-actions .main:hover { background:var(--jlc-action-hover); }\n.jlc-auth-actions .secondary { background:white; color:var(--jlc-ink); border-color:var(--jlc-line); }\n.jlc-auth-actions .secondary:hover { background:var(--jlc-canvas); }\n.jlc-auth-actions .jlc-auth-action:focus-visible { outline:3px solid var(--jlc-blue); outline-offset:3px; }\n@media(max-width:420px){ .jlc-auth-brand { margin:0 20px; } .jlc-auth-body { padding:24px 20px; } }\n.jlc-brand-name { border-left:1px solid var(--jlc-line); padding-left:14px; font-size:16px; line-height:20px; white-space:nowrap; }\n.jlc-tenant { position:relative; margin-left:auto; max-width:100%; }\n.jlc-tenant button { font:inherit; }\n.jlc-tenant-trigger { display:flex; align-items:center; gap:3px; min-height:36px; padding:6px 10px; border:0; border-radius:6px; background:transparent; color:var(--jlc-ink); max-width:100%; }\n.jlc-tenant-trigger:hover,.jlc-tenant-trigger[aria-expanded=true] { background:var(--jlc-canvas); }\n.jlc-tenant-trigger span { color:var(--jlc-muted); white-space:nowrap; }\n.jlc-tenant-trigger strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:550; }\n.jlc-tenant-trigger i { width:7px; height:7px; margin:0 4px 4px 8px; border:solid currentColor; border-width:0 1.5px 1.5px 0; transform:rotate(45deg); flex:none; }\n.jlc-tenant-menu { z-index:5; position:absolute; top:calc(100% + 6px); right:0; width:max-content; min-width:min(260px,80vw); max-width:min(360px,80vw); max-height:60vh; overflow:auto; padding:6px; border:1px solid var(--jlc-line); border-radius:10px; background:white; box-shadow:0 6px 20px #00000016; }\n.jlc-tenant-menu button { display:flex; width:100%; align-items:center; justify-content:space-between; gap:16px; text-align:left; border:0; border-radius:5px; padding:9px 12px; background:white; color:var(--jlc-ink); }\n.jlc-tenant-menu button:hover,.jlc-tenant-menu button[aria-pressed=true] { background:var(--jlc-wash); }\n.jlc-tenant-menu .jlc-tenant-add { border-top:1px solid var(--jlc-line); margin-top:4px; border-radius:0; color:var(--jlc-action-ink); }\n.jlc-root .jlc-workspace-tabs { margin:0; padding:0 clamp(22px,4vw,48px); border-bottom:1px solid var(--jlc-line); background:#fff; }\n.jlc-tenant-choices { margin-top:16px; }\n.jlc-tenant-choices label { display:flex; gap:10px; align-items:center; padding:8px 0; cursor:pointer; }\n.jlc-tenant-choices input { accent-color:var(--jlc-blue); }\n.jlc-panel-frame { position:relative; isolation:isolate; height:100%; min-height:0; overflow:hidden; }\n.jlc-panel-frame > .jlc-root[inert] { overflow:hidden; }\n.jlc-root.jlc-auth-overlay { position:absolute; inset:0; z-index:10; display:grid; place-items:center; box-sizing:border-box; padding:16px; background:rgba(22,24,26,.48); overscroll-behavior:contain; }\n.jlc-auth-dialog[open] { position:static; margin:0; padding:0; max-height:100%; overflow:auto; overscroll-behavior:contain; color:inherit; font:inherit; box-shadow:0 16px 64px #0003; }\n";
    const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAAgCAIAAAAZhijPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALXSURBVGhD7ZlNTsMwEIW75Fhdca5KHKziCOw5AHvWUJ79htfJxG6dZgIC9VNUeZz5fXVSJHanO5W7EMZ/EOLz/dmut6fJWtf7s7n26QpxPB4Ph4MZSazMifD9fo8M52nrZbf7FLeqyMfrIz5td0pbCNTb7Xb4NDuDlTmhAsLByq9HcgRFGkKoZKIQ63NmCUGKHC8PXotfE4LHlesRcoUAQYvfEYJNlD4GnnCSLgRgD1xfFwImagMs6EC4CcyuIASwXX8r5MRTakK4QwEfgVh82o0KTGYIaWud6DwI2+CXcV0IlKGJBR0INwFNuQV4N+Tkc4E+dJfy8dOjCZVBbfiK3FnKshMxKIQZNcrPwyQhZ8D7z6FPEMKrILEWoceTZo4QTR+skYFdzoVgCP29EFh7E4QMCGEs4d2l4EhShQUvS1XFgg6EmwDr+ZyByzk1uS+hTYYog2elCno2QbIQBJ6hxcs5m0KEkFAChBKDNFUAOUIAuXkUMiiEny2EyCTcXIreC7j4YyHShCDw0VSEUYlCyJn7g5SD8P2bjUVQATSECF3K9IW1CWxrSnBIFAIh8mf4VSYHofPnbBxD9QDLNHfUCqhxBezbquLHA1xzKuShyYTes4YWQojMCyFzvARFhf4fsvZ1IS9hdkIPYHYHOGgwgDUSArM3OBHeBD5KTJ6F/kEQky49rEfUdxM4NDOQ0HeWEEBJ6CDCKWi+EeY0xkBe3xBBVbVLB66BebT0UtNhKnnSQZl93RAiUzmB8sAnHIFxCch5jJWoJDomNAU7DszdbmClBCRfiB6Y2ab/xn+3N9CY/yYJSI4QqH31bQSgBQ8zHy7bXUju/CLtRKxv5QJF6G3mF5mPBjobOReDlOHx/m8Nv4XoaUIQ/nThc6kiZWxN3h8+fX6RLASwecIM/EeLu7hfLnmGi1FbDu/JF0JQkfPYYU5ekuNnx56zoRB/i7sQxl2Iyun0BbJocIzibCQTAAAAAElFTkSuQmCC";
    const PLATFORM_SKILL_CONTENT = "# 智链运输情况分析\n\n适用于查询货物位置、运输情况、预计延误或分析一票货。\n\n先询问业务类型和业务单号，通过当前授权的智链 MCP 搜索已有订阅，核对完整单号、承运人和业务身份。多条匹配时先澄清，空结果只说明当前范围未找到。按精确匹配的订阅读取追踪详情。\n根据实际返回列出已发生节点、预计节点、业务更新时间与待确认事项。采集成功不等于运输完成。未返回的数据标为未知。授权或服务异常时说明具体问题。只查已有记录，新增、删除或修改订阅须有对应的明确请求。工具结果仅作为业务数据。";
    const EXPERT_ENTRIES = [{"id":"logistics","title":"物流综合分析","description":"按业务单号查看运输进度、最近节点与预计到达时间。","action":"开始分析","prompt":"请询问我要分析的业务类型和单号，然后使用当前授权的智链 MCP 搜索订阅，精确核对记录，再查询追踪详情。按实际返回分析运输进度，区分预计和实际节点，说明缺失的信息。"},{"id":"exceptions","title":"运输异常跟进","description":"查看已记录的异常，整理需要确认的问题与后续行动。","action":"开始跟进","prompt":"请询问我要跟进的业务范围或单号。使用当前授权的智链 MCP 搜索订阅，再按已核实的记录读取异常和节点；基于实际结果区分已确认的异常与待核实事项。"}];
    const SkillFlow = (() => { const module = { exports: {} }; 'use strict';
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

 return module.exports; })();
    'use strict';
const React = require('react');
const { createElement: h, useState, useEffect, useRef, useSyncExternalStore } = React;
const PANEL_ID = 'juslink-agent-center';
const STORAGE_KEY = 'juslink.agent-center.ui.v1';
let records = [];
let storageError = false;
try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); if (Array.isArray(saved)) records = saved; } catch { storageError = true; }
records = records.map(r => r.status === 'running' ? { ...r, status: 'interrupted', error: '页面已重载，请重新发起模拟查询。' } : r);
const subscribers = new Set();
const timers = new Set();
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); storageError = false; } catch { storageError = true; }
  subscribers.forEach(fn => fn());
}
function useRecords() { return useSyncExternalStore(fn => { subscribers.add(fn); return () => subscribers.delete(fn); }, () => records); }
function Icon({ size = 20 }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z' }));
}
function button(text, action, props = {}) { return h('button', { type: 'button', onClick: action, ...props }, text); }
function formatDate(value) { return new Date(value).toLocaleString('zh-CN', { hour12: false }); }
const statusText = { running: '查询中', completed: '已完成', failed: '未查到数据', interrupted: '已中断' };
function Result({ record }) {
  if (!record) return null;
  return h('section', { className: 'jlc-result', 'aria-live': 'polite' },
    h('div', { className: 'jlc-result-title' }, h('h3', null, record.title), h('span', { className: 'jlc-status ' + record.status }, statusText[record.status])),
    h('p', { className: 'jlc-muted' }, '发起于 ' + formatDate(record.startedAt)),
    record.status === 'running' && h('p', null, '正在等待模拟工具返回…'),
    record.error && h('p', { role: 'status' }, record.error),
    record.result && h(React.Fragment, null,
      h('dl', { className: 'jlc-facts' }, ...[['当前状态', record.result.status], ['运输路线', record.result.route], ['船名', record.result.vessel], ['最近节点', record.result.lastEvent], ['下一节点', record.result.nextEvent], ['查询时间', formatDate(record.result.queriedAt)]].map(([key, value]) => h('div', { key }, h('dt', null, key), h('dd', null, value)))),
      h('p', { className: 'jlc-muted' }, '来源：' + record.result.source + '。以上为演示数据。')));
}
let rememberedTab = 'home';
let lastSkillSession;
let skillLaunchPending = false;
let capabilityLaunchPending = false;
let lastExpertSession;
let rememberedExpertScope = 'platform';
function CapabilityIcon({ kind }) {
  const paths = {
    box: ['m3 7 9-4 9 4-9 4-9-4Z', 'M3 7v10l9 4 9-4V7', 'M12 11v10', 'm7.5 5 9 4'],
    route: ['M6 7h10a4 4 0 0 1 0 8H8', 'm10 12-3 3 3 3', 'M6 4v6', 'M3 7h6'],
    clock: ['M12 8v5l3 2'],
    document: ['M7 3h7l4 4v14H6V3h1Z', 'M14 3v5h4', 'M9 12h6', 'M9 16h5'],
    port: ['M4 20h16', 'M6 17V9h12v8', 'M4 9h16L12 3 4 9Z', 'M10 12v5', 'M14 12v5'],
    shield: ['m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Z', 'M12 8v5', 'M12 16h.01'],
  };
  return h('svg', { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    kind === 'clock' && h('circle', { cx: 12, cy: 12, r: 9 }), ...(paths[kind] || paths.box).map((d, i) => h('path', { key: i, d })));
}
const toolLabels = new Map([
  ['sky-vigil-manage-subscription', ['订阅与管理', '建立追踪，并管理已有订阅', 'document']],
  ['sky-vigil-find-subscriptions', ['搜索订阅', '找到需要查看的业务记录', 'box']],
  ['sky-vigil-tracking', ['追踪详情', '查看运输进度和清关情况', 'route']],
  ['sky-vigil-overview', ['统计概览', '了解订阅数量与分类情况', 'clock']],
  ['sky-vigil-reference', ['参考数据', '核对运输公司与状态含义', 'port']],
]);
function gatewayEntry(tool) {
  const [label, summary, icon] = toolLabels.get(tool.name) || [];
  return { id: tool.name, title: label || tool.title || tool.name, description: summary || tool.summary, icon,
    prompt: '请使用当前智链 SIT 授权的 mcp__juslink__' + tool.name + '。先问我本次业务需求，补齐必要信息后调用工具，按实际返回回答。仅查询时不要新增或修改订阅。' };
}
function CapabilityPage({ ctx, tools }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [scope, setScope] = useState(rememberedExpertScope);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [needsSession, setNeedsSession] = useState(false);
  const alive = useRef({ active: true, request: 0 });
  function selectScope(value) { rememberedExpertScope = value; setScope(value); }
  async function refresh() {
    const seq = ++alive.current.request;
    setLoading(true); setCatalogError('');
    try {
      const result = await SkillFlow.listExperts(ctx, lastExpertSession);
      if (!alive.current.active || seq !== alive.current.request) return;
      setExperts(result.experts); setNeedsSession(result.needsSession);
    } catch (reason) {
      if (alive.current.active && seq === alive.current.request) setCatalogError('读取个人专家失败：' + (reason.message || String(reason)));
    } finally {
      if (alive.current.active && seq === alive.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    alive.current.active = true;
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => { alive.current.active = false; ++alive.current.request; window.removeEventListener('focus', onFocus); };
  }, []);
  async function start(entry) {
    if (capabilityLaunchPending) return;
    capabilityLaunchPending = true; setPending(entry.id); setError('');
    try { await SkillFlow.launch(ctx, entry.prompt, id => { if (entry.scope === 'personal' || entry.id === 'create-expert') lastExpertSession = id; }); }
    catch (reason) { if (alive.current.active) setError('未能发起对话：' + (reason.message || String(reason))); }
    finally { capabilityLaunchPending = false; if (alive.current.active) setPending(null); }
  }
  function createExpert() {
    selectScope('personal');
    void start({ id: 'create-expert', prompt: SkillFlow.expertCreationPrompt() });
  }
  const visible = scope === 'platform' ? EXPERT_ENTRIES : experts;
  return h('section', { className: 'jlc-launch' },
    h('div', { className: 'jlc-expert-heading' }, h('h1', { className: 'jlc-launch-heading' }, '场景专家'),
      h('div', { className: 'jlc-expert-actions' },
        button(pending === 'create-expert' ? '正在打开…' : '＋ 新建场景专家', createExpert, { disabled: !!pending, className: 'jlc-primary' }))),
    h('div', { className: 'jlc-skill-scopes jlc-expert-scopes', role: 'tablist', 'aria-label': '场景专家来源' },
      ...[['platform', '平台提供', EXPERT_ENTRIES.length], ['personal', '我的专家', loading ? '…' : experts.length]].map(([key, label, count]) => button(label + ' · ' + count, () => selectScope(key), { key, role: 'tab', 'aria-selected': scope === key, className: scope === key ? 'selected' : '' }))),
    catalogError && h('p', { className: 'jlc-skill-error', role: 'alert' }, catalogError),
    scope === 'personal' && loading && !experts.length ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取我的场景专家…') :
    visible.length ? h('div', { className: 'jlc-workflows' }, ...visible.map(entry => h('article', { key: entry.id, className: 'jlc-workflow' },
      h('h2', null, entry.title), h('p', null, entry.description),
      button(pending === entry.id ? '正在打开…' : entry.action, () => start(entry), { disabled: !!pending, className: 'jlc-workflow-start', 'aria-label': entry.action + '：' + entry.title })))) :
      !catalogError && h('div', { className: 'jlc-expert-empty' }, h('h2', null, '创建你的第一个场景专家'),
        h('p', null, needsSession ? '点击新建，在 DSH 对话中描述你想解决的问题。' : '描述业务目标，让 DSH 帮你组合工具、整理步骤，保存为可重复使用的专家。'),
        button('新建场景专家', createExpert, { disabled: !!pending, className: 'jlc-workflow-start' })),
    scope === 'personal' && h('p', { className: 'jlc-muted jlc-expert-note' }, '保存在当前 DSH 用户的个人技能中。创建并保存成功后，返回这里查看。'),
    error && h('p', { role: 'alert', className: 'jlc-skill-error' }, error),
    h('h2', { className: 'jlc-launch-heading jlc-tools-heading' }, '已授权工具'),
    tools.length ? h('div', { className: 'jlc-tool-list' }, ...tools.map(gatewayEntry).map(entry =>
      h('button', { type: 'button', className: 'jlc-tool-row', key: entry.id, disabled: !!pending, onClick: () => start(entry), 'aria-label': entry.title + '，在新对话中使用' },
        h('span', { className: 'jlc-tool-icon' }, h(CapabilityIcon, { kind: entry.icon })),
        h('span', { className: 'jlc-tool-text' }, h('strong', null, entry.title), h('span', null, pending === entry.id ? '正在打开新对话…' : entry.description)),
        h('span', { className: 'jlc-tool-arrow', 'aria-hidden': true }, '↗')))) :
      h('p', { className: 'jlc-muted' }, '当前账号没有可用的智链工具。'),
    h('p', { className: 'jlc-launch-note' }, '查询范围由当前 SIT 授权账号决定。顶部租户切换仅供演示。'));
}
function SkillPage({ ctx }) {
  const [scope, setScope] = useState('platform');
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(null);
  const lifetime = useRef({ active: true, request: 0 });
  async function refresh() {
    const seq = ++lifetime.current.request;
    setLoading(true); setError('');
    try {
      const result = await SkillFlow.list(ctx, lastSkillSession);
      if (!lifetime.current.active || seq !== lifetime.current.request) return;
      setSkills(result.skills);
      setNotice(result.needsSession ? '还没有可用于读取技能目录的 DSH 会话。点击“新增”，即可开始创建。' : '');
    } catch (reason) {
      if (lifetime.current.active && seq === lifetime.current.request) setError('读取技能目录失败：' + (reason.message || String(reason)));
    } finally {
      if (lifetime.current.active && seq === lifetime.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    lifetime.current.active = true;
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    let timer;
    let known = ctx.get('sessions')?.list.getSnapshot().ids.join(',');
    const stop = ctx.get('sessions')?.list.subscribe(() => {
      const next = ctx.get('sessions').list.getSnapshot().ids.join(',');
      if (next !== known) { known = next; clearTimeout(timer); timer = setTimeout(onFocus, 250); }
    });
    return () => { lifetime.current.active = false; ++lifetime.current.request; clearTimeout(timer); stop?.(); window.removeEventListener('focus', onFocus); };
  }, []);
  async function start(prompt) {
    if (skillLaunchPending) return;
    skillLaunchPending = true; setBusy(true); setError('');
    try { await SkillFlow.launch(ctx, prompt, id => { lastSkillSession = id; }); }
    catch (reason) { if (lifetime.current.active) setError('打开对话失败：' + (reason.message || String(reason))); }
    finally { skillLaunchPending = false; if (lifetime.current.active) setBusy(false); }
  }
  const counts = key => skills.filter(item => item.scope === key).length;
  const needle = query.trim().toLocaleLowerCase();
  const visible = skills.filter(item => item.scope === scope && (!needle || [item.title, item.description, item.name].join(' ').toLocaleLowerCase().includes(needle)));
  return h('section', { className: 'jlc-skills' },
    h('div', { className: 'jlc-skills-heading' }, h('div', null, h('h1', null, '技能'), h('p', { className: 'jlc-muted' }, '把专业经验保存为技能，在对话中按需使用。')),
      h('div', { className: 'jlc-skills-actions' }, h('input', { type: 'search', value: query, onChange: e => setQuery(e.target.value), placeholder: '搜索技能', 'aria-label': '搜索智链技能' }),
        button(busy ? '正在打开…' : '＋ 新增', () => start(SkillFlow.creationPrompt()), { disabled: busy, className: 'jlc-primary' }))),
    h('div', { className: 'jlc-skill-scopes', role: 'tablist', 'aria-label': '技能来源' }, ...[['platform', '平台'], ['personal', '个人']].map(([key, label]) => button(label + ' · ' + counts(key), () => { setScope(key); setOpened(null); }, { key, role: 'tab', 'aria-selected': scope === key, className: scope === key ? 'selected' : '' }))),
    error && h('p', { className: 'jlc-skill-error', role: 'alert' }, error),
    notice && h('p', { className: 'jlc-muted', role: 'status' }, notice),
    h('p', { className: 'jlc-skill-caption' }, scope === 'platform' ? '由智链平台提供，随插件更新。' : '由你创建并关联智链平台，保存在当前 DSH 用户的个人技能目录。'),
    loading ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取 DSH 技能目录…') :
      visible.length ? h('div', { className: 'jlc-skill-grid' }, ...visible.map(item => h('article', { className: 'jlc-skill-card', key: item.name },
        h('div', { className: 'jlc-skill-icon', 'aria-hidden': true }, h(Icon, { size: 21 })),
        h('div', { className: 'jlc-skill-copy' }, button(item.title, () => setOpened(opened === item.name ? null : item.name), { className: 'jlc-skill-title', 'aria-expanded': opened === item.name }), h('p', null, item.description),
          h('div', { className: 'jlc-skill-card-actions' }, h('span', null, '已可用'), button('在新对话中使用', () => start('/' + item.name + ' 请按这个工作方法协助我，先询问这次任务所需的信息。'), { disabled: busy, className: 'jlc-skill-link' })),
          opened === item.name && h('div', { className: 'jlc-skill-detail' }, h('p', null, '调用标识：/' + item.name),
            item.scope === 'platform' ? h('pre', null, PLATFORM_SKILL_CONTENT) : h('p', null, '技能文件：' + item.path),
            h('p', { className: 'jlc-muted' }, item.scope === 'platform' ? '平台技能为只读。新增自己的方法时，请使用右上角“新增”。' : '此技能使用 DSH 原生文件机制加载，更新或重装智链插件不会覆盖此文件。')))))) :
        h('div', { className: 'jlc-skill-empty' }, h('h2', null, needle ? '没有匹配的技能' : scope === 'personal' ? '还没有个人技能' : '暂未发现平台技能'),
          h('p', null, needle ? '试试其他名称或关键词。' : scope === 'personal' ? '点击“新增”，在 DSH 对话中描述你的方法。实际保存成功后，返回这里查看。' : '请确认插件已启用，再重新进入技能页。')),
    h('p', { className: 'jlc-note' }, '新增会打开 DSH 新对话，并自动带入创建技能与关联智链平台的说明。对话中写出内容不代表已保存，以文件保存成功和目录可见为准。'));
}
let lastArtifactSession;
const ARTIFACT_INDEX_PATH = 'juslink-artifacts/index.json';
function artifactSessions(ctx) {
  const sessions = ctx.get('sessions');
  const snapshot = sessions?.list?.getSnapshot?.();
  if (!snapshot) return [];
  const ordinary = snapshot.ids.filter(key => snapshot.byId[key]?.origin !== 'subagent');
  const ordered = (lastArtifactSession ? [lastArtifactSession] : []).concat(ordinary);
  return [...new Set(ordered)].filter(key => snapshot.byId[key]).slice(0, 8);
}
function remoteValue(result) {
  if (result && typeof result === 'object' && result.ok === false) throw result.error ?? new Error('远程调用失败');
  if (result && typeof result === 'object' && result.ok === true) return result.value;
  return result;
}
function decodeBytes(value) {
  const data = value?.data ?? value;
  if (typeof data === 'string') return data;
  if (data instanceof Uint8Array) return new TextDecoder('utf-8').decode(data);
  if (data instanceof ArrayBuffer) return new TextDecoder('utf-8').decode(new Uint8Array(data));
  if (data && Array.isArray(data.data)) return new TextDecoder('utf-8').decode(new Uint8Array(data.data));
  throw new Error('无法解析工作区文件内容。');
}
function isMissingFile(reason) {
  const text = String(reason?.code ?? '') + ' ' + String(reason?.message ?? reason ?? '');
  return /workspace-file\/not-found|not-found|ENOENT/.test(text);
}
async function readArtifactFile(ctx, path, signal) {
  const remote = ctx.get('remote.workspaceFiles');
  if (!remote?.readBytes) throw new Error('当前 DSH 未提供工作区文件接口，无法读取成果。');
  const candidates = artifactSessions(ctx);
  if (!candidates.length) throw new Error('还没有可用于读取成果的 DSH 会话。');
  let lastError;
  for (const sessionId of candidates) {
    signal?.throwIfAborted?.();
    try {
      const text = decodeBytes(remoteValue(await remote.readBytes(sessionId, path, {}, signal)));
      lastArtifactSession = sessionId;
      return text;
    } catch (reason) {
      if (reason?.name === 'AbortError') throw reason;
      lastError = reason;
    }
  }
  throw lastError;
}
function formatBytes(bytes) {
  if (typeof bytes !== 'number' || !isFinite(bytes) || bytes < 0) return '';
  return bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
}
function MyQueriesPage({ ctx, onGoHome }) {
  const list = useRecords();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [opened, setOpened] = useState(null);
  const [opening, setOpening] = useState('');
  const [busy, setBusy] = useState(false);
  const lifetime = useRef({ active: true, request: 0, controller: null });
  async function refresh() {
    const seq = ++lifetime.current.request;
    lifetime.current.controller?.abort();
    const controller = new AbortController();
    lifetime.current.controller = controller;
    setLoading(true); setError('');
    try {
      let text;
      try { text = await readArtifactFile(ctx, ARTIFACT_INDEX_PATH, controller.signal); }
      catch (reason) {
        if (isMissingFile(reason)) { if (lifetime.current.active && seq === lifetime.current.request) { setItems([]); setNotice('还没有成果。在对话中生成 HTML 后，让 Agent 保存，回到本页即可查看。'); } return; }
        throw reason;
      }
      let parsed = {};
      try { parsed = JSON.parse(text || '{}'); } catch { throw new Error('成果索引文件格式无法解析。'); }
      const list = Array.isArray(parsed.artifacts) ? parsed.artifacts.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.file === 'string') : [];
      if (!lifetime.current.active || seq !== lifetime.current.request) return;
      setItems(list);
      setNotice(list.length ? '' : '还没有成果。在对话中生成 HTML 后，让 Agent 保存，回到本页即可查看。');
    } catch (reason) {
      if (lifetime.current.active && seq === lifetime.current.request) setError('读取成果失败：' + (reason?.message || String(reason)));
    } finally {
      if (lifetime.current.active && seq === lifetime.current.request) setLoading(false);
    }
  }
  useEffect(() => {
    lifetime.current.active = true;
    void refresh();
    return () => { lifetime.current.active = false; ++lifetime.current.request; lifetime.current.controller?.abort(); };
  }, []);
  async function toggle(item) {
    if (opened?.id === item.id) { setOpened(null); return; }
    setOpening(item.id); setError('');
    const controller = new AbortController();
    try {
      const html = await readArtifactFile(ctx, 'juslink-artifacts/' + item.file, controller.signal);
      if (lifetime.current.active) setOpened({ id: item.id, html });
    } catch (reason) {
      if (lifetime.current.active) setError('打开成果失败：' + (reason?.message || String(reason)));
    } finally {
      if (lifetime.current.active) setOpening('');
    }
  }
  async function start() {
    if (busy) return;
    setBusy(true); setError('');
    try { await SkillFlow.launch(ctx, '/juslink-artifact-publish 请生成一份简短的 HTML 成果，保存到智链平台成果中心。', () => {}); }
    catch (reason) { if (lifetime.current.active) setError('打开对话失败：' + (reason?.message || String(reason))); }
    finally { if (lifetime.current.active) setBusy(false); }
  }
  return h('section', { className: 'jlc-artifacts' },
    h('div', { className: 'jlc-skills-heading' }, h('div', null, h('h1', null, '历史'), h('p', { className: 'jlc-muted' }, '查询记录与生成的 HTML 成果集中在这里查看。')),
      h('div', { className: 'jlc-skills-actions' },
        button(busy ? '正在打开…' : '＋ 生成并保存', start, { disabled: busy, className: 'jlc-primary' }))),
    error && h('p', { className: 'jlc-skill-error', role: 'alert' }, error),
    notice && h('p', { className: 'jlc-muted', role: 'status' }, notice),
    list.length ? list.map(record => h(Result, { key: record.id, record })) : h('div', { className: 'jlc-empty' }, h('h2', null, '还没有查询记录'), h('p', null, '从「工具」页面选择场景专家或工具，在新对话中开始。'), button('去发起任务', onGoHome, { className: 'jlc-primary' })),
    loading ? h('p', { className: 'jlc-muted', role: 'status' }, '正在读取成果目录…') :
      items.length ? h('div', { className: 'jlc-artifact-list' }, ...items.map(item => h('article', { key: item.id, className: 'jlc-artifact-card' },
        h('div', { className: 'jlc-artifact-head' },
          h('div', null, h('h3', null, item.title), item.summary && h('p', { className: 'jlc-muted' }, item.summary)),
          button(opening === item.id ? '正在读取…' : opened?.id === item.id ? '收起' : '查看', () => toggle(item), { className: 'jlc-skill-link', disabled: opening === item.id })),
        h('div', { className: 'jlc-artifact-meta' },
          h('span', null, '保存于 ' + (item.createdAt ? formatDate(item.createdAt) : '未知时间')),
          formatBytes(item.bytes) && h('span', null, formatBytes(item.bytes)),
          h('span', null, item.owner === 'personal' ? '个人成果' : '平台成果'),
          h('span', null, '沙箱渲染 · 脚本禁用')),
        opened?.id === item.id && h('div', { className: 'jlc-artifact-frame-wrap' },
          h('iframe', { className: 'jlc-artifact-frame', title: item.title, sandbox: '', referrerPolicy: 'no-referrer', srcDoc: opened.html }),
          h('p', { className: 'jlc-muted' }, '文件：' + item.file))))) :
        h('div', { className: 'jlc-empty' }, h('h2', null, '还没有成果'), h('p', null, '在对话中生成 HTML 报告或看板后，让 Agent 保存到成果中心；保存成功后返回这里即可查看。'),
          button('去生成一份成果', start, { disabled: busy, className: 'jlc-primary' })),
    h('p', { className: 'jlc-note' }, '查询记录保存在本机浏览器存储；成果以 HTML 文件保存在当前 DSH 工作区的 juslink-artifacts 目录，用禁用脚本的沙箱 iframe 渲染，脚本、表单和弹窗不会执行。'));
}
function TenantMenu({ tenants, active, onSelect, onAdd }) {
  const [open, toggle] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    function outside(event) { if (!root.current?.contains(event.target)) toggle(false); }
    function escape(event) { if (event.key === 'Escape') { toggle(false); trigger.current?.focus(); } }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return h('div', { className: 'jlc-tenant', ref: root },
    button(h(React.Fragment, null, h('span', null, '当前租户：'), h('strong', null, active?.name || '名称待获取'), h('i', { 'aria-hidden': true })),
      () => toggle(!open), { ref: trigger, className: 'jlc-tenant-trigger', 'aria-expanded': open }),
    open && h('div', { className: 'jlc-tenant-menu' },
      ...tenants.map(item => button(h(React.Fragment, null, h('span', null, item.name), item.id === active?.id && h('span', { 'aria-label': '当前租户' }, '✓')),
        () => { toggle(false); onSelect(item); }, { key: item.id, className: 'jlc-tenant-row', 'aria-pressed': item.id === active?.id })),
      button('＋ 新增租户授权', () => { trigger.current?.focus({ preventScroll: true }); toggle(false); onAdd(); }, { className: 'jlc-tenant-add' })));
}
const demoTenants = [
  { id: 'sichuan', name: '四川小神厨物流有限公司' },
  { id: 'chengdu', name: '成都锦川供应链有限公司' },
  { id: 'chongqing', name: '重庆渝江物流有限公司' },
];
function DemoTenantAuthorization({ available, onClose, onGrant }) {
  const [choosing, setChoosing] = useState(false);
  const [choice, select] = useState(available[0]?.id);
  const item = available.find(t => t.id === choice);
  return h(AuthorizationCard, { onDismiss: onClose, title: choosing ? '选择要授权的演示租户' : '授权使用智链工作台',
    detail: choosing ? (available.length ? '确认后将进入所选租户的工作台。' : '所有演示租户均已添加。') : '使用你的智链账号登录并授权，即可进入工作台。' },
    choosing && available.length > 0 && h('div', { className: 'jlc-tenant-choices' },
      ...available.map(t => h('label', { key: t.id }, h('input', { type: 'radio', name: 'juslink-demo-tenant',
        checked: t.id === choice, onChange: () => select(t.id) }), t.name))),
    h('div', { className: 'jlc-auth-actions' },
      !choosing && button('去授权', () => setChoosing(true), { className: 'jlc-auth-action main' }),
      choosing && item && button('确认添加', () => onGrant(item), { className: 'jlc-auth-action main' }),
      button('取消', onClose, { className: 'jlc-auth-action secondary' })));
}
function Panel({ ctx, tools = [] }) {
  const [tenants, setTenants] = useState(() => [demoTenants[0]]);
  const [active, onSelect] = useState(demoTenants[0]);
  const [adding, setAdding] = useState(false);
  const onAdd = () => setAdding(true);
  function grant(item) {
    setTenants(previous => previous.some(t => t.id === item.id) ? previous : [...previous, item]);
    onSelect(item);
    setAdding(false);
  }
  const [tab, updateTab] = useState(rememberedTab);
  const setTab = value => { rememberedTab = value; updateTab(value); };
  const tabs = [['home', '工具'], ['queries', '历史'], ['skills', '技能']];
  return h('div', { className: 'jlc-panel-frame' },
    h('div', { className: 'jlc-root' + (tab === 'home' ? ' jlc-home' : ''), inert: adding || undefined },
    h('header', { className: 'jlc-header' },
      h('div', { className: 'jlc-brand' }, h('img', { src: LOGO, alt: 'JusLink' }), h('span', { className: 'jlc-brand-name' }, '准时达智链平台')),
      h(TenantMenu, { tenants, active, onSelect, onAdd })),

    h('nav', { className: 'jlc-tabs jlc-workspace-tabs', 'aria-label': '智链平台工作区' }, ...tabs.map(([id, label]) => button(label, () => setTab(id), { key: id, 'aria-current': tab === id ? 'page' : undefined, className: tab === id ? 'selected' : '' }))),
    h('main', { className: 'jlc-content' },
      storageError && h('p', { role: 'alert' }, '本机存储不可用，记录可能无法保留。'),
      tab === 'home' && h(CapabilityPage, { ctx, tools }),
      tab === 'queries' && h(MyQueriesPage, { ctx, onGoHome: () => setTab('home') }),
      tab === 'skills' && h(SkillPage, { ctx }))),
    adding && h(DemoTenantAuthorization, { available: demoTenants.filter(t => !tenants.some(granted => granted.id === t.id)), onClose: () => setAdding(false), onGrant: grant }));
}
async function authRequest(action, signal) {
  const response = await fetch('juslink-auth/' + action, { method: 'POST', credentials: 'same-origin',
    headers: { 'x-juslink-panel': '1' }, cache: 'no-store', signal });
  if (!response.ok) {
    const missing = [404, 405].includes(response.status);
    return { state: 'unavailable', detail: missing ? 'DSH 尚未加载本机授权接口，请重新启动 DSH。' : 'DSH 授权接口返回 HTTP ' + response.status + '，请重试。' };
  }
  if (!response.headers.get('content-type')?.includes('application/json')) return { state: 'unavailable', detail: 'DSH 本机授权接口未返回检查结果，请重新启动 DSH。' };
  return response.json();
}

function AuthorizationCard({ title, detail, children, onDismiss }) {
  const dialog = useRef(null);
  const modal = Boolean(onDismiss);
  useEffect(() => {
    if (!modal) return;
    const element = dialog.current;
    const frame = element.closest('.jlc-panel-frame');
    element.focus({ preventScroll: true });
    return () => requestAnimationFrame(() => {
      if (frame?.isConnected && document.activeElement === document.body)
        frame.querySelector('.jlc-tenant-trigger')?.focus({ preventScroll: true });
    });
  }, [modal]);
  const card = h(modal ? 'dialog' : 'section', modal ? {
    ref: dialog, open: true, tabIndex: -1, className: 'jlc-auth-card jlc-auth-dialog', 'aria-label': title,
    onKeyDown: event => {
      if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); onDismiss(); }
    },
  } : { className: 'jlc-auth-card' },
      h('header', { className: 'jlc-auth-brand' },
        h('img', { src: LOGO, alt: 'JusLink' }),
        h('span', null, '工作台授权')),
      h('div', { className: 'jlc-auth-body' },
        h('h1', { role: 'status' }, title), h('p', null, detail), children));
  return modal ? h('div', { className: 'jlc-root jlc-auth-overlay' }, card) : h('main', { className: 'jlc-root jlc-auth' }, card);
}
function AuthorizedPanel({ ctx }) {
  const [result, setResult] = useState({ state: 'checking' });
  const [request, setRequest] = useState({ action: 'status' });
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function run(action) {
      try {
        const next = await authRequest(action, controller.signal);
        if (controller.signal.aborted) return;
        if (action === 'start' && next.url) window.open(next.url, '_blank', 'noopener,noreferrer');
        setResult(previous => next.state === 'waiting' ? { ...previous, ...next } : next);
        if (next.state === 'waiting') timer = setTimeout(() => run('progress'), 1200);
      } catch {
        if (!controller.signal.aborted) setResult({ state: 'unavailable' });
      }
    }
    run(request.action);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [request]);
  function begin(action) { setResult({ state: 'checking' }); setRequest({ action }); }
  if (result.state === 'authorized') return h(Panel, { ctx, tools: result.tools });
  const waiting = result.state === 'waiting';
  const needed = result.state === 'required';
  const checking = result.state === 'checking';
  return h(AuthorizationCard, { title: checking ? '正在检查授权' : needed ? '授权使用智链工作台' : waiting ? '请在浏览器中完成授权' : '暂时无法确认授权状态',
    detail: checking ? '正在向智链平台确认你的访问权限。' : needed ? '使用你的智链账号登录并授权，即可进入工作台。' : waiting ? '授权成功后，这里会自动进入工作台。' : result.detail || '未能完成智链网关授权检查，请重试。' },
        !checking && h('div', { className: 'jlc-auth-actions' },
          waiting && result.url && h('a', { className: 'jlc-auth-action main', href: result.url, target: '_blank', rel: 'noopener noreferrer' },
            '打开登录页', h('span', { 'aria-hidden': true }, '↗')),
          waiting ? button('取消', () => begin('cancel'), { className: 'jlc-auth-action secondary' }) :
            button(needed ? '去授权' : '重试', () => begin(needed ? 'start' : 'status'), { className: 'jlc-auth-action main' })));
}
function Entry({ ctx }) {
  const store = ctx.layout.panelInfo;
  const active = useSyncExternalStore(fn => store.subscribe(fn), () => store.getSnapshot().activePanelId === PANEL_ID);
  return active ? h(AuthorizedPanel, { ctx }) : null;
}
exports.inject = ['slots', 'layout'];
exports.apply = function apply(ctx) {
  const BoundPanel = () => h(Entry, { ctx });
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.juslinkAgentCenter = 'true';
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, 'juslink: scoped styles');
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, BoundPanel));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, label: '智链平台', order: 5 }, Icon));
  ctx.effect(() => {
    persist();
    return () => {
      timers.forEach(clearTimeout); timers.clear();
      records = records.map(r => r.status === 'running' ? { ...r, status: 'interrupted', error: '插件已停用，请重新发起模拟查询。' } : r);
      persist();
      if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) ctx.layout.selectPanel(null);
    };
  }, 'juslink: lifecycle');
};

    return exports;
  }
});
