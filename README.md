# 智链平台 DSH 插件 0.2.0

通过 DSH 官方 Plugin/Bundle 与 UI Slots 扩展，新增左侧「智链平台」入口、模拟货物查询工具和运输分析 Skill。独立安装和停用，不修改 DSH 应用安装包。

## 在新对话中使用

安装并启用后，新建 DSH 对话，输入：

> /juslink-transport-analysis 查询 DEMO-SH-001，分析预计到港时间和需要跟进的信息。

也可以直接说「查询演示单号 DEMO-SH-001 的运输情况」。工具名为 `juslink_shipment_lookup`，参数为 `reference`。Skill 名为 `juslink-transport-analysis`，随插件注册，可由用户显式调用或由模型根据请求选择。

工具返回固定的演示数据：上海港到新加坡港、运输途中、计划到港 2026-11-20 10:00 +08:00、预计到港 14:00 +08:00。分析应明确“预计晚于计划 4 小时”，实际到港和原因未知。其他单号返回未找到。每次结果都标注演示数据、业务快照时间与查询时间。

**未连接真实业务系统。** 不需要业务账号、接口密钥或额外网络权限。模型回答仍使用安装者在 DSH 中配置的模型。当前没有实现自动调度、专家编排、个人 Skill 编辑或动态 HTML 成果中心保存。

## 安装

在 DSH「插件 → 添加插件」粘贴本仓库 Git 地址：

```text
https://github.com/Easton2026/juslink-dsh-agent-center.git
```

建议使用分享页中包含 `#提交标识` 的完整地址，固定到已验证版本。若已有旧版，先在插件页卸载旧插件再添加新版，启用并按提示重启。插件卸载不会删除 DSH 原有会话；页面的模拟记录保留在各自客户端。

## 页面与对话的关系

左侧页面提供能力目录、模拟查询、任务回看、成果中心/场景专家说明和工作方法介绍。页面本机模拟记录使用 localStorage；新对话的工具调用与回答由 DSH 保存至该对话，两者尚未合并成一个任务列表。

## 兼容与验证

兼容声明：`0.2.1-rc.5 || >=0.2.2-rc.1 <0.3.0`。macOS 官方 DSH 0.2.2-rc.3 上验证工具注册、原生执行管线、Skill 注册、无数据/缺参数/取消处理和停用清理。本机新对话已验证 Skill 上下文注入、工具真实调用与最终分析，耗时 8 秒。0.2.1-rc.5 与 0.2.2-rc.1 官方 npm 接口声明已核对；旧版完整桌面与 Windows 实测尚未完成。不承诺未来版本自动兼容。

## 开发

运行 `node build.mjs` 重新生成 `client.js`，再执行 `node --check index.js` 与 `node --check client.js`。运行包只需要 package.json、index.js、demo-data.js、client.js、cordis.patch.yml、README.md；无安装脚本和第三方运行依赖，React 由 DSH 注入。

通过官方 DSH CLI 的 `dsh plugin --profile desktop add <本地目录>` 可进行本地开发安装。
