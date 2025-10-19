# DawAPI Frontend

基于 Vue 3 + Vite 实现的 DawAPI 控制台，统一面向 TOC 用户、管理账号与系统管理员的操作体验。整体视觉参考 Claude 官网的柔和渐变风格，并围绕以下原则重新设计：

- **单一入口**：使用 API Key 登录后，根据 `admin/manage` 权限动态展示功能模块。
- **组件化**：导航框架、统计卡片、图表、表单均拆分为可复用组件，样式由公共 tokens 管理。
- **封装请求**：所有接口通过 `src/api` 下的 axios 实例调用，自动附带 Authorization，可复写用于跨账号查询。

## 功能概览

- 仪表盘：余额、今日/本月用量、近 7 天趋势、模型消耗、余额到期提醒、快捷操作。
- 用量分析：支持今日/指定日期/时间范围查询，含模型明细与每日趋势图。
- API Key 速查：批量粘贴密钥，立即返回额度、限速、创建时间等信息并支持历史记录。
- 子账户工具：在一个页面完成创建、调额、查询、更新和删除操作，响应 JSON 可复制备份。
- 操作日志：关键词+动作筛选，查看详细 JSON。
- 系统配置：读取 `/x-config` 并支持 JSON 批量更新与删除，附运行状态 `/x-conf`。
- Provider 密钥：列出密钥、快速启停、创建新密钥。
- 广播通知：以 DNA 维度推送公告，展示历史记录并可删除。
- API 参考：根据当前环境生成 cURL/JS/Python 示例。

## 目录结构

```
src/
  api/            # axios 封装与接口调用
  components/     # 导航、布局、通用组件
  layouts/        # 页面骨架
  plugins/        # ECharts 注册
  router/         # 路由与权限守卫
  store/          # Pinia 身份状态
  styles/         # 全局主题与基础样式
  utils/          # 格式化工具
  views/          # 各大功能页面
```

## 本地运行

```bash
pnpm install    # 或 npm install / yarn
pnpm dev        # 启动开发服务器，默认 http://localhost:5173
pnpm build      # 产出生产构建
```

### 环境变量

复制 `.env.example` 为 `.env` 并按需修改：

```
VITE_API_BASE_URL=https://api.dawclaudecode.com
VITE_APP_NAME=DawAPI
```

前端会自动读取 `VITE_API_BASE_URL` 作为 axios `baseURL`。

## 设计要点

- **主题统一**：`src/styles/theme.css` 定义核心颜色、圆角、阴影，可在此调整品牌配色。
- **权限分流**：`src/store/auth.js` 在登录后保存 `admin/manage`，路由守卫根据 meta 控制访问。
- **图表**：依赖 ECharts + vue-echarts，集中在 `plugins/echarts.js` 注册常用组件。
- **异常处理**：axios 响应统一处理 401 并回退到登录页，界面层通过 `useMessage` 提示。

## 后续可拓展

- 接入 i18n，实现中英双语切换。
- 在 Provider 页面加入更详尽的配置表单（Vertex、Azure）。
- 引入单元测试 / e2e（Vitest + Playwright）。

欢迎根据 DawAPI 产品规划继续演进。
