const demo = '请使用演示样例，明确标注演示数据和业务快照时间，不查询真实系统、不执行命令、不生成文件。';
export const TOOL_ENTRIES = [
  { id: 'shipment', title: '货物追踪', description: '查询运输状态、当前路线、船名及最近动态。', icon: 'box', tool: 'juslink_shipment_lookup', prompt: '查询演示单号 DEMO-SH-001 的运输状态，请调用 juslink_shipment_lookup。' + demo },
  { id: 'milestones', title: '运输节点', description: '按时间查看离港、在途和预计到港等关键节点。', icon: 'route', tool: 'juslink_milestones_lookup', prompt: '查看 DEMO-SH-001 的运输节点，请调用 juslink_milestones_lookup，区分已发生和预计节点。' + demo },
  { id: 'arrival', title: '到港时间', description: '核对计划与预计到港时间，了解时间差异。', icon: 'clock', tool: 'juslink_arrival_lookup', prompt: '核对 DEMO-SH-001 的计划和预计到港时间，请调用 juslink_arrival_lookup。说明时间差，不要把预计晚到说成实际延误。' + demo },
  { id: 'customs', title: '关务状态', description: '查看模拟申报状态、单证准备情况及待办事项。', icon: 'document', tool: 'juslink_customs_lookup', prompt: '查询 DEMO-SH-001 的演示关务状态，请调用 juslink_customs_lookup，说明尚待处理的事项。' + demo },
  { id: 'port', title: '港口情况', description: '查看港口模拟作业情况、等待时间与更新时间。', icon: 'port', tool: 'juslink_port_lookup', prompt: '查看新加坡港的演示作业情况，请调用 juslink_port_lookup，port 填新加坡港，说明数据只是固定演示快照。' + demo },
  { id: 'risk', title: '运输风险', description: '识别预计到港偏差，查看风险依据和跟进建议。', icon: 'shield', tool: 'juslink_risk_lookup', prompt: '检查 DEMO-SH-001 的演示运输风险，请调用 juslink_risk_lookup，区分已知事实和待确认信息。' + demo },
];
export const EXPERT_ENTRIES = [
  { id: 'logistics', title: '物流综合分析', description: '综合运输、到港、关务和港口信息，形成一票货的整体分析。', action: '开始分析', prompt: '请作为智链平台的“物流综合分析”场景专家，分析 DEMO-SH-001。先调用 juslink_shipment_lookup、juslink_arrival_lookup、juslink_customs_lookup，再调用 juslink_port_lookup 查询新加坡港；按需要补充运输节点与风险工具。基于各工具返回内容给出结论、依据、信息缺口与建议，避免把预计节点当作实际发生。' + demo },
  { id: 'exceptions', title: '运输异常跟进', description: '核对时间偏差和风险信号，整理需要确认的问题与后续行动。', action: '开始跟进', prompt: '请作为智链平台的“运输异常跟进”场景专家，跟进 DEMO-SH-001。调用 juslink_risk_lookup 和 juslink_milestones_lookup，必要时用 juslink_arrival_lookup 核对时间。先说明异常是否已确认，再整理跟进清单；不能编造延误原因或声称已发送通知。' + demo },
];
