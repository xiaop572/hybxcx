# 小程序 API 对接说明

本文档只说明小程序调用接口及本次返回协议调整。接口前缀为 `/api/web-api/miniapp`，具体域名由部署环境提供。

## 公共请求信息

所有接口使用 JSON 或 `multipart/form-data`，并携带以下请求头：

| Header | 必填 | 说明 |
| --- | --- | --- |
| `x-api-key` | 否 | 不传时使用服务器部署配置中的默认 API Key。只有服务器明确要求调用方提供独立 Key 时才传；不要把服务端代持的 Key 写进小程序包。 |
| `x-miniapp-openid` | 推荐 | 当前微信用户标识，用于隔离会话。 |
| `x-miniapp-test-user-id` | 否 | 测试用户标识；没有 `x-miniapp-openid` 时使用。 |

服务器配置默认 API Key 时，小程序请求可不带 `x-api-key`，由服务端代持并转发。若请求中带 `x-api-key`，它会覆盖服务器默认 Key。会话属于实际使用的 API Key 和用户标识；小程序应保存 `conversationId`，后续消息、历史恢复和轮询都使用同一个会话及用户身份。

## 推荐流程：一次提交图片并分析

调用 `POST /api/web-api/miniapp/chat/analyze`，以 `multipart/form-data` 上传图片和文字。`files` 可重复传入多张图片；大图应使用文件上传，不建议转成 Base64。

```js
function analyzeImage(filePath, conversationId) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}/web-api/miniapp/chat/analyze`,
      filePath,
      name: "files",
      formData: {
        conversationId: conversationId || "",
        title: "小程序图文咨询",
        message: "请观察这张面部照片中的外观特点",
        workflow: "chat",
        async: "true",
      },
      header: {
        "x-api-key": API_KEY,
        "x-miniapp-openid": OPENID,
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(res.data || "{}"));
        } else {
          reject(JSON.parse(res.data || "{}"));
        }
      },
      fail: reject,
    });
  });
}
```

异步受理返回任务标识；此时还没有最终回复或视觉分析结果：

```json
{
  "accepted": true,
  "async": true,
  "jobKey": "conv_xxx:web_xxx",
  "conversation": {
    "conversationId": "conv_xxx",
    "title": "小程序图文咨询"
  },
  "uploads": [
    {
      "fileName": "face.jpg",
      "mimeType": "image/jpeg",
      "size": 456789,
      "relativePath": "2026-10-12/face.jpg",
      "resourceId": "img_xxx",
      "sortOrder": 1,
      "uploadedAt": "2026-10-12T03:00:00.000Z"
    }
  ],
  "messageRequest": {
    "clientMessageId": "web_xxx",
    "message": "请观察这张面部照片中的外观特点"
  },
  "workflow": { "conversationId": "conv_xxx", "status": "queued" },
  "workflowPollUrl": "/web-api/miniapp/conversations/conv_xxx/workflow",
  "resultPollUrl": "/web-api/miniapp/chat/analyze/result?conversationId=conv_xxx&clientMessageId=web_xxx"
}
```

保存 `conversation.conversationId` 和 `messageRequest.clientMessageId`，然后轮询：

```text
GET /api/web-api/miniapp/chat/analyze/result?conversationId=conv_xxx&clientMessageId=web_xxx&compact=1
```

`compact=1` 轮询可能返回以下状态：

- `ready:false, found:false, status:"pending"`：暂时还没找到任务，稍后重试。
- `ready:false, found:true, status:"queued"` 或 `"running"`：任务处理中。
- `ready:false, found:true, status:"failed"`：任务执行失败，读取 `error`。
- `ready:true, status:"completed"`：任务结束；读取顶层 `faceVisionAnalysis`。随后可省略 `compact` 再请求一次拿完整结果。

完成时的精简结果示例：

```json
{
  "ready": true,
  "found": true,
  "compact": true,
  "status": "completed",
  "conversationId": "conv_xxx",
  "clientMessageId": "web_xxx",
  "faceVisionAnalysis": {
    "status": "completed",
    "provider": "qwen",
    "model": "qwen3-vl-plus",
    "issues": [
      {
        "category": "眉眼",
        "title": "眉形略平直、眉尾轻微下垂",
        "description": "双侧眉毛整体形态较平直，眉峰不明显。",
        "severity": "轻度",
        "priority": "中",
        "confidence": 0.75,
        "box": [276, 573, 537, 659],
        "possibleOptions": ["纹绣修饰眉形（如野生眉）"]
      }
    ],
    "caveats": [],
    "imageSize": { "width": 1080, "height": 1440 }
  }
}
```

`issues: []` 且 `status:"completed"` 表示模型没有列出外观问题，不代表分析失败。任务完成但视觉子分析失败时，读取视觉对象中的 `status:"failed"` 和 `error`；聊天主回复仍可能成功。

## 文字消息和连续追问

已有会话可直接调用 `POST /api/web-api/miniapp/conversations/{conversationId}/messages`：

```json
{
  "message": "请具体解释刚才提到的眉眼观察",
  "clientMessageId": "miniapp_msg_001",
  "autoFillImageContext": true
}
```

如果要引用先前上传图片，可传 `resourceIds`；多张补充分析图可传 `analysisResourceIds`。也可用 `imagePaths` / `analysisImagePaths` 兼容已有路径调用。

消息响应包含 `reply`、`model`、`connected`、`meta`、`disclaimer` 和 `followupQuestions`。带图分析时，脸部视觉结果会同时出现在顶层 `faceVisionAnalysis` 和 `meta.faceVisionAnalysis`：

```json
{
  "conversationId": "conv_xxx",
  "clientMessageId": "miniapp_msg_001",
  "messageId": "msg_xxx",
  "reply": "从照片可见眉眼区域有轻微外观特点……",
  "model": "豆包 2.0",
  "connected": true,
  "meta": { "faceVisionAnalysis": { "status": "completed", "provider": "qwen", "model": "qwen3-vl-plus", "issues": [], "caveats": [], "imageSize": { "width": 1080, "height": 1440 } } },
  "faceVisionAnalysis": { "status": "completed", "provider": "qwen", "model": "qwen3-vl-plus", "issues": [], "caveats": [], "imageSize": { "width": 1080, "height": 1440 } },
  "disclaimer": "图片结果仅供外观观察和咨询参考，不构成医疗诊断。",
  "followupQuestions": []
}
```

`model` 是文本回复模型名，可能是豆包；图片识别模型应读取 `faceVisionAnalysis.model`。`connected` 表示整体聊天调用状态，不等同于视觉分析成功状态。

## 分步上传（可选）

需要先创建会话再逐步上传时，可调用：

1. `POST /api/web-api/miniapp/conversations`，请求体 `{ "title": "小程序咨询" }`，保存响应中的 `conversationId`。
2. `POST /api/web-api/miniapp/conversations/{conversationId}/images/upload`，用 multipart 字段 `file` 上传图片。
3. 调用消息接口，传上传响应中的 `resourceId`，或传 `relativePath` 对应的 `imagePaths`。

创建会话响应：

```json
{
  "conversationId": "conv_xxx",
  "title": "小程序咨询",
  "createdAt": "2026-10-12T03:00:00.000Z",
  "updatedAt": "2026-10-12T03:00:00.000Z"
}
```

上传响应包含 `fileName`、`mimeType`、`size`、`relativePath`、`resourceId`、`sortOrder` 和 `uploadedAt`。统一上传接口不返回原图 Base64。

## 历史恢复与工作流状态

- `GET /api/web-api/miniapp/conversations/{conversationId}`：恢复消息历史。每条助手消息的视觉结果从 `messages[].meta.faceVisionAnalysis` 读取。
- `GET /api/web-api/miniapp/conversations/{conversationId}/workflow`：查询当前工作流阶段。
- `POST /api/web-api/miniapp/conversations/{conversationId}/context/clear`：保留会话并清空上下文。

轮询结果可能从会话历史恢复。此时 `found` 可能为 `false` 且 `recovered:true`；紧凑响应仍会在顶层带 `faceVisionAnalysis`。完整恢复结果优先从 `result.messageResponse.meta.faceVisionAnalysis` 读取。

## 视觉结果字段

```ts
type FaceVisionAnalysis = {
  status: "completed" | "failed";
  provider: "qwen";
  model: string;
  displayName?: string;
  issues: Array<{
    category: string;
    title: string;
    description: string;
    severity: string;
    priority: string;
    confidence: number;
    box: [number, number, number, number];
    possibleOptions: string[];
  }>;
  caveats: string[];
  imageSize: { width: number; height: number };
  error?: string;
};
```

`box` 是相对于 `imageSize` 的原图像素坐标 `[x1,y1,x2,y2]`，不是 0 到 1000 的归一化坐标。无裁剪显示时，可按显示宽高与原图宽高比例缩放。若图片使用 contain 留白、裁剪或旋转，绘制前还需处理偏移或相应坐标变换。

## 本次接口调整

- 脸部外观问题改由千问视觉模型返回，统一放在 `faceVisionAnalysis`；文字回复仍由 API 配置的聊天模型生成。
- 问题结果包含类别、标题、描述、程度、优先级、置信度、原图像素框和可咨询方向。
- 同步消息/分析响应增加顶层 `faceVisionAnalysis` 便捷字段，`meta.faceVisionAnalysis` 仍保留；历史结果放在助手消息的 `meta` 中。
- 异步精简轮询完成时直接返回 `faceVisionAnalysis`，处理中不返回最终视觉结果。
- 小程序统一 API 不再恢复或返回 68 点关键点、点位引用、点位卡片和 68 点总图；旧客户端应移除对这些字段的依赖。
- 图片子分析失败和主回复状态分离：检查 `faceVisionAnalysis.status`，不要仅依据 `connected` 或任务状态判断识别成功。

千问视觉提供商已在当前服务器启用，并配置为 `qwen3-vl-plus`。如果后续配置被停用或调用失败，视觉字段会标记为 `failed`。
