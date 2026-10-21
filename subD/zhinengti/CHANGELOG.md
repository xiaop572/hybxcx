# 智能体页面更新日志

## 2026-10-20 更新

### 主要变更

1. **启用历史记录功能**
   - 将 `ENABLE_DIAGNOSIS_HISTORY_RESTORE` 从 `false` 改为 `true`
   - 将 `SHOW_DIAGNOSIS_HISTORY_BUTTON` 从 `false` 改为 `true`
   - 增加历史记录消息数量限制从 12 条到 20 条 (`HISTORY_RESTORE_MESSAGE_LIMIT`)

2. **优化历史记录恢复接口调用**
   - 修改 `restoreDiagnosisHistory` 方法中的 `getConversation` 调用
   - 将 `compact: true` 改为 `compact: false`,以获取完整的历史记录数据
   - 这样可以确保恢复历史时能获取到完整的 `faceVisionAnalysis` 和其他元数据

### API 对接说明

根据最新的 `miniapp-api-integration.md` 文档:

- 历史记录接口: `GET /api/web-api/miniapp/conversations/{conversationId}`
- 支持参数:
  - `compact`: 设为 false 获取完整数据
  - `limit`: 限制返回的消息数量
  - `timeout`: 请求超时时间

### 视觉分析结果结构

新的 `faceVisionAnalysis` 包含:
```javascript
{
  status: "completed" | "failed",
  provider: "qwen",
  model: "qwen3-vl-plus",
  issues: [{
    category: "眉眼",
    title: "眉形略平直、眉尾轻微下垂",
    description: "双侧眉毛整体形态较平直...",
    severity: "轻度",
    priority: "中",
    confidence: 0.75,
    box: [x1, y1, x2, y2],  // 原图像素坐标
    possibleOptions: ["纹绣修饰眉形（如野生眉）"]
  }],
  caveats: [],
  imageSize: { width: 1080, height: 1440 }
}
```

### 功能说明

- 用户可以点击页面底部的"历史记录"按钮恢复之前的对话
- 历史记录包含文本消息、图片消息和完整的诊断报告
- 自动在页面加载时尝试恢复历史记录(如果存在会话 ID)
- 支持"开启新对话"功能清空历史上下文

### 测试建议

1. 上传图片进行面部分析
2. 发送几条追问消息
3. 关闭并重新打开小程序
4. 点击"历史记录"按钮,验证能否正确恢复对话内容
5. 验证图片、文本和诊断报告是否完整显示
