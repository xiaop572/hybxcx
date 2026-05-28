# AGENTS.MD

本文件给后续在本仓库工作的 AI/开发者使用。项目是一个原生微信小程序，目录和页面很多，改动前先确认业务归属和入口配置，尽量小范围修改。

## 项目概览

- 技术栈：原生微信小程序，使用 `Page`、`Component`、WXML、WXSS、JS、JSON。
- 项目入口：`app.js`、`app.json`、`app.wxss`。
- 微信开发者工具配置：`project.config.json`，当前 `libVersion` 为 `3.8.8`，`tabSize` 为 2。
- npm 依赖很少，`package.json` 只有 `wxa-plugin-canvas`；仓库内已有 `miniprogram_npm/`。
- 业务域名集中在 `utils/util.js`：
  - `baseUrl = "https://wx.pmc-wz.com"`
  - `imgBaseUrl = "https://wx.pmc-wz.com/hyb/images/"`
  - `externalUrl = "https://wx.pmc-wz.com/materials"`

## 主要目录

- `pages/`：主包页面，包含首页、我的、登录、商品、报告、活动、医疗服务、健康节等核心页面。
- `subpackages/`：较早的一批业务分包，包含企业、积分、礼券、体检、报名、PDF、视频等页面。
- `huodongpage/`：活动专题分包，活动页非常多，新增/修改活动页通常在这里。
- `subpackagesB/`：会议、行程、AI/诊疗相关页面。
- `subpackagesC/`：AI、面诊、体检、结算、拍照、人脸/面相相关页面。
- `subpackagesDDD/`：近期新增业务分包，包含 `aimxzd/aimxzd` 等页面。
- `component/`：普通组件。
- `custom-tab-bar/`：主 tabbar 组件；页面 `onShow` 中通常需要调用 `this.getTabBar().setData({ selected })`。
- `utils/`：公共工具、请求封装、二维码、地图、时间工具。
- `images/`、`pages/assign/` 等：图片资源。
- `calendar/`、`cpjp/`：仓库内相对独立的小程序/模块，除非任务明确涉及，否则不要顺手改。

## 页面登记规则

- 新增主包页面必须加入 `app.json` 的 `pages`。
- 新增分包页面必须加入 `app.json` 的 `subPackages` 对应 `root.pages`。
- 页面路径保持微信小程序格式，不带扩展名，例如 `subpackagesDDD/aimxzd/aimxzd`。
- 如果页面是 tab 页，需同步检查：
  - `app.json` 的 `tabBar.list`
  - `custom-tab-bar/index.js` 的 `list`
  - 对应页面 `onShow` 中的 selected 索引

## 请求与登录

- 优先使用 `utils/request.js` 导出的 `req`，不要在业务页重复写 token header。

```js
const { req } = require('../../utils/request')
const util = require('../../utils/util')

req({
  url: util.baseUrl + '/newapi/api/xxx',
  method: 'POST',
  data: {},
  success: res => {}
})
```

- `req` 会自动带 `Authorization: Bearer ${wx.getStorageSync('token')}`。
- `req` 对后端 `code == 14007` 会弹登录提示并跳转 `/pages/login/login`。
- `app.js` 在启动时会：
  - 初始化云环境 `cloud1-0ghzwmvh6f1ef56d`
  - 调用 `wx.login` 获取并缓存 `loginCode`、`openid`、`sessionKey`
  - 如果存在分享来源，缓存 `sponsor`
  - 通过 `wx.onAppRoute` 上报页面访问到 `/newapi/api/hd/jlpageview`
- 登录拦截导航工具在 `utils/util.js` 的 `util.init()` 中挂到 `wx`：
  - `wx.myNavigateTo`
  - `wx.myRedirectTo`
  - `wx.myNavigateToz`
- 需要登录才能访问的页面，优先复用这些封装或保持现有页面模式。

## 全局状态与缓存

- `app.js` 的 `globalData` 包含体检预约、搜索结果、商品/套餐临时数据等：
  - `tjyy`
  - `searchList`
  - `searchKey`
  - `tuiItem`
  - `yxpat_id`
  - `jumpurl`
  - `pttc`
  - `tjtjxm`
- 项目大量使用 `wx.getStorageSync` / `wx.setStorageSync`，常见 key 包括：
  - `token`
  - `openid`
  - `userInfo`
  - `realInfo`
  - `qrinfo`
  - `sponsor`
  - `sessionKey`
- 修改登录、支付、预约、分享链路时，先搜索这些 key 的调用点。

## 编码与中文

- 仓库里大量中文在 PowerShell 输出中可能显示成乱码，这是终端编码问题，不一定是文件坏了。
- 不要因为终端乱码就整文件重写；优先做小范围补丁。
- 修改含中文的 WXML/JS/WXSS 时，尽量使用现有文件编码和局部替换。
- 避免批量格式化旧文件，页面很多且历史风格不统一，批量改动会制造无关 diff。

## 样式与页面实现习惯

- 每个页面一般由同名四件套组成：
  - `xxx.js`
  - `xxx.wxml`
  - `xxx.wxss`
  - `xxx.json`
- WXSS 多用 `rpx`，页面样式通常局部写在同目录 `.wxss`，全局样式很少。
- 现有 UI 风格偏活动页/营销页/医疗服务页混合，改老页面时优先贴近当前页面风格，不引入新的设计体系。
- 图片资源大量引用线上地址 `https://wx.pmc-wz.com/materials/...` 或本地 `pages/assign/...`。
- 涉及图片预览通常使用 `wx.previewImage`。
- 涉及拍照/人脸检测可参考 `subpackagesC/mianzhenxiangji/mianzhenxiangji`，其中使用 `wx.createCameraContext` 和 `wx.createVKSession`。

## 近期重点页面：面相分析

- `subpackagesDDD/aimxzd/aimxzd` 是 AI 面相诊断/聊天式分析页。
- 该页通过 `util.baseUrl + '/newapi/api/topic/faceanalysissimple'` 请求后端。
- 页面内部有较多接口兼容解析函数，例如：
  - `unwrapPayload`
  - `extractPartMap`
  - `getPartValue`
  - `buildReportFromPayload`
  - `buildAnalysisResultSections`
- 当前接口结构约定：
  - `part1`：识别判断
  - `part2`：小慧AI面相分析
  - `part3`：痣相娱乐解读
  - `part4`：娱乐性解读
  - `part5`：面部关注点
  - `part6`：医美建议
  - `part7`：后续建议
  - `part8_1` 到 `part8_12`：底部“面相分析结果”展开卡片的 12 点详情
- 该页接口返回里可能包含图片 URL 或 base64，处理前先看 `wrapBase64Image` 和 `findImageValue`。

## 验证方式

- 这个项目没有可用自动化测试脚本，`npm test` 是占位命令。
- JS 语法检查可用：

```bash
node --check path/to/page.js
```

- 小程序运行效果需要用微信开发者工具打开项目验证。
- 修改 WXML/WXSS 后重点检查：
  - 微信开发者工具是否编译通过
  - 页面是否在 `app.json` 中正确登记
  - 页面路径跳转是否正确
  - 图片、接口、登录态和分享参数是否仍正常

## 开发注意事项

- 优先用 `rg` 查找页面、接口、storage key 和路由。
- 修改公共文件前先确认影响面：
  - `app.js`
  - `app.json`
  - `utils/request.js`
  - `utils/util.js`
  - `custom-tab-bar/index.js`
- 不要删除或重命名历史页面，除非任务明确要求；`app.json` 中仍可能引用。
- 新增接口请求时优先放在页面本身或已有业务工具中，不要新建大而全的公共层。
- 新增页面时遵循同目录四件套，并在 `app.json` 登记。
- 对用户已有未提交改动保持谨慎，只改任务相关文件。
- 不要提交 `project.private.config.json` 的个人配置改动，除非用户明确要求。
- 大体积临时文件如 `test.docx`、解压目录等不要纳入业务改动。

## 常用命令

```bash
rg "keyword" .
rg --files -g "*.js" -g "*.wxml" -g "*.wxss" -g "*.json"
node --check subpackagesDDD/aimxzd/aimxzd.js
git status --short
```
