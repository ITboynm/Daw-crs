<template>
  <div class="public-page-wrapper">
    <div class="public-header">
      <div class="brand-section">
        <img src="@/assets/logo.png" alt="DawAPI" class="logo" />
        <h1>DawAPI</h1>
      </div>
      <a href="/login" class="login-link">返回登录</a>
    </div>

    <section class="troubleshooting-view">
    <n-card class="support-card" :bordered="false">
      <header class="card-header">
        <div>
          <h2>常见问题排除</h2>
          <p>Claude Code 使用指南与故障排除 - 使用前记得先做好代码备份或者版本控制！</p>
        </div>
      </header>

      <div class="troubleshooting-content">
        <n-alert type="warning" :bordered="false" style="margin-bottom: 32px;">
          <template #icon>
            <span style="font-size: 1.2rem;">⚠️</span>
          </template>
          <strong>重要提醒：</strong>使用前记得先做好代码备份或者版本控制！
        </n-alert>

        <!-- 问题1 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">1</span>
            <h3>Missing API Key / 403 报错</h3>
          </div>
          <div class="problem-content">
            <div class="error-box">
              <strong>错误信息：</strong>
              <code>API Error: 403 {"error":{"type":"forbidden","message":"Request not allowed"}}</code>
            </div>
            <p><strong>原因：</strong>环境变量没配置好</p>
            
            <h4>Windows 配置：</h4>
            <ol class="solution-list">
              <li>
                <strong>打开环境变量设置</strong>
                <ul>
                  <li>按 <code>Win + R</code>，输入 <code>sysdm.cpl</code>，按回车</li>
                  <li>点击"高级"选项卡，然后点击"环境变量"</li>
                </ul>
              </li>
              <li>
                <strong>添加系统变量：</strong>
                <ul>
                  <li>在"系统变量"区域点击"新建"</li>
                  <li>变量名：<code>ANTHROPIC_AUTH_TOKEN</code>，变量值：您的 API Key</li>
                  <li>变量名：<code>ANTHROPIC_API_KEY</code>，变量值：您的 API Key</li>
                  <li>变量名：<code>ANTHROPIC_BASE_URL</code>，变量值：您的 API 端点 URL</li>
                </ul>
              </li>
              <li><strong>重新打开 CMD 运行 Claude Code</strong></li>
            </ol>

            <h4>macOS 配置：</h4>
            <pre><code># 编辑配置文件
vi ~/.zshrc  # 或 vi ~/.bashrc

# 添加以下内容
export ANTHROPIC_AUTH_TOKEN="您的API Key"
export ANTHROPIC_API_KEY="您的API Key"
export ANTHROPIC_BASE_URL="您的API端点URL"

# 保存后重新加载
source ~/.zshrc</code></pre>
          </div>
        </div>

        <!-- 问题2 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">2</span>
            <h3>401 无效的令牌错误</h3>
          </div>
          <div class="problem-content">
            <p><strong>原因：</strong>IDE 或者 MCP 修改了 settings.json 配置文件</p>
            
            <h4>Windows 解决方案：</h4>
            <ol class="solution-list">
              <li>设置环境变量（同上述 Windows 配置）</li>
              <li>
                添加额外变量：
                <ul>
                  <li>变量名：<code>CLAUDE_CODE_MAX_OUTPUT_TOKENS</code>，变量值：<code>32000</code></li>
                </ul>
              </li>
              <li>删除配置文件：删除 <code>C:\Users\用户名\.claude</code> 目录下的 <code>settings.json</code></li>
              <li>重新打开 CMD 运行 Claude Code</li>
              <li>配置都对还是出现 401：删除 <code>C:\Users\用户名\.claude.json</code></li>
            </ol>

            <h4>macOS 解决方案：</h4>
            <p>配置都对还是出现 401：删除 <code>~/.claude.json</code></p>
            <pre><code>rm ~/.claude.json</code></pre>
          </div>
        </div>

        <!-- 问题3 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">3</span>
            <h3>更新 Claude Code 版本</h3>
          </div>
          <div class="problem-content">
            <h4>Windows：</h4>
            <pre><code>npm update -g @anthropic-ai/claude-code</code></pre>

            <h4>macOS：</h4>
            <pre><code>npm update -g @anthropic-ai/claude-code
# 或使用 sudo
sudo npm update -g @anthropic-ai/claude-code</code></pre>
          </div>
        </div>

        <!-- 问题4 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">4</span>
            <h3>网络连接错误</h3>
          </div>
          <div class="problem-content">
            <p><strong>原因：</strong>网络连接问题</p>
            
            <h4>排查步骤：</h4>
            <ol class="solution-list">
              <li>
                检查网络连通性：
                <pre><code>ping 域名地址</code></pre>
              </li>
              <li>
                清除代理设置：
                <p>Windows：</p>
                <pre><code>set HTTP_PROXY=
set HTTPS_PROXY=
set http_proxy=
set https_proxy=</code></pre>
                <p>macOS/Linux：</p>
                <pre><code>unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy</code></pre>
              </li>
              <li>尝试备用端点（如果有）</li>
            </ol>
          </div>
        </div>

        <!-- 问题5 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">5</span>
            <h3>API Error (Request timed out)</h3>
          </div>
          <div class="problem-content">
            <h4>可能原因：</h4>
            <ul class="solution-list">
              <li><strong>网络超时</strong> - 参考上述连接错误解决方案</li>
              <li><strong>上下文过长</strong> - 使用 <code>/clear</code> 清理上下文或重新启动 Claude Code</li>
              <li><strong>IDE 插件冲突</strong> - 检查 IDE 插件是否包含过多内置 prompt</li>
            </ul>
          </div>
        </div>

        <!-- 问题6 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">6</span>
            <h3>API Error 400: tool_use 报错</h3>
          </div>
          <div class="problem-content">
            <h4>解决方案：</h4>
            <ul class="solution-list">
              <li>重新请求几次，使用 <code>ESC</code> 后发送 <code>continue</code></li>
              <li>修改对话内容，避免异常参数</li>
              <li>使用 <code>/compact</code> 压缩上下文</li>
              <li>重新开始对话</li>
            </ul>
          </div>
        </div>

        <!-- 问题7 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">7</span>
            <h3>官方服务状态错误</h3>
          </div>
          <div class="problem-content">
            <ul class="solution-list">
              <li><strong>500 错误：</strong>官方服务问题</li>
              <li><strong>Overloaded：</strong>访问 <a href="https://status.anthropic.com" target="_blank">https://status.anthropic.com</a> 查看 Claude 官方服务状态</li>
            </ul>
          </div>
        </div>

        <!-- 问题8 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">8</span>
            <h3>Command timed out after 2m 0.0s</h3>
          </div>
          <div class="problem-content">
            <p><strong>原因：</strong>Claude Code 与系统交互超时，与 API 请求无关</p>
            <p><strong>解决方案：</strong>手动执行相关命令可能更快</p>
          </div>
        </div>

        <!-- 问题9 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">9</span>
            <h3>API Error 413/400 Invalid model name</h3>
          </div>
          <div class="problem-content">
            <ul class="solution-list">
              <li><strong>413 错误：</strong>请求体过大，需要清理上下文（<code>/clear</code> 或重启）</li>
              <li><strong>400 Invalid model name：</strong>官方模型并发不足</li>
            </ul>
          </div>
        </div>

        <!-- 问题10 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">10</span>
            <h3>API Error: response exceeded the 32000</h3>
          </div>
          <div class="problem-content">
            <p><strong>解决方案：</strong>设置环境变量 <code>CLAUDE_CODE_MAX_OUTPUT_TOKENS=32000</code></p>
          </div>
        </div>

        <!-- 问题11 -->
        <div class="problem-section">
          <div class="problem-header">
            <span class="problem-number">11</span>
            <h3>清除旧配置</h3>
          </div>
          <div class="problem-content">
            <h4>Windows 用户：</h4>
            <ol class="solution-list">
              <li>打开环境变量设置</li>
              <li>删除以下变量：旧的 API 相关环境变量</li>
              <li>删除 <code>C:\Users\用户名\.claude</code> 下的配置文件</li>
            </ol>

            <h4>macOS 用户：</h4>
            <pre><code># 编辑配置文件
vi ~/.zshrc  # 或 vi ~/.bashrc

# 删除相关环境变量配置
# 保存后重新打开终端</code></pre>
          </div>
        </div>

        <!-- 优化建议 -->
        <div class="tips-section">
          <h2>💡 使用技巧与优化建议</h2>
          
          <div class="tip-card">
            <h3>配额使用优化</h3>
            <p><strong>消耗因素：</strong></p>
            <ul>
              <li>请求次数取决于任务复杂度</li>
              <li>简单提问：3-8 个请求</li>
              <li>复杂任务：请求数成倍增长</li>
            </ul>
            <p><strong>优化建议：</strong></p>
            <ul>
              <li>将大需求拆分为小任务</li>
              <li>逐步提问而非一次性大需求</li>
            </ul>
          </div>

          <div class="tip-card">
            <h3>提升效率的使用技巧</h3>
            <h4>精确提问</h4>
            <p>直接指定要修改的文件/函数/页面，避免全项目扫描</p>
            
            <h4>任务分解</h4>
            <p>大需求分解为小步骤，逐步完成</p>
            
            <h4>上下文管理</h4>
            <p>使用 <code>/compact</code> 命令减少上下文，提升响应速度</p>
          </div>

          <div class="tip-card">
            <h3>激活"自动执行"模式</h3>
            <p><strong>默认行为：</strong>Claude Code 会在执行操作前请求确认</p>
            <p><strong>自动模式：</strong>跳过权限检查，自动执行</p>
            <pre><code>claude --dangerously-skip-permissions</code></pre>
            <n-alert type="error" :bordered="false" style="margin-top: 12px;">
              ⚠️ <strong>注意：</strong>此模式会自动执行所有操作，请谨慎使用
            </n-alert>
          </div>

          <div class="tip-card">
            <h3>模型选择说明</h3>
            <p>不同模型有不同的特点和适用场景：</p>
            <ul>
              <li><strong>Sonnet：</strong>平衡性能与成本，适合日常开发</li>
              <li><strong>Opus：</strong>更强能力但资源消耗更高，适合复杂任务</li>
            </ul>
            <p>模型可用性取决于 API 配置和当前负载情况。</p>
          </div>
        </div>

        <!-- 资源推荐 -->
        <div class="resources-section">
          <h2>📚 优秀项目资源</h2>
          
          <div class="resource-category">
            <h3>MCP 服务器项目</h3>
            <table class="resource-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>链接</th>
                  <th>功能描述</th>
                  <th>推荐指数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>modelcontextprotocol/servers</td>
                  <td><a href="https://github.com/modelcontextprotocol/servers" target="_blank">GitHub</a></td>
                  <td>官方 MCP 服务器集合</td>
                  <td>⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td>docker/mcp-servers</td>
                  <td><a href="https://github.com/docker/mcp-servers" target="_blank">GitHub</a></td>
                  <td>Docker 官方 MCP 服务器</td>
                  <td>⭐⭐⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="resource-category">
            <h3>数据库 MCP</h3>
            <table class="resource-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>链接</th>
                  <th>功能描述</th>
                  <th>推荐指数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TheRaLabs/legion-mcp</td>
                  <td><a href="https://github.com/TheRaLabs/legion-mcp" target="_blank">GitHub</a></td>
                  <td>支持多种数据库</td>
                  <td>⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td>executeautomation/mcp-database-server</td>
                  <td><a href="https://github.com/executeautomation/mcp-database-server" target="_blank">GitHub</a></td>
                  <td>多数据库连接支持</td>
                  <td>⭐⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="resource-category">
            <h3>SubAgent 集合项目</h3>
            <table class="resource-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>链接</th>
                  <th>描述</th>
                  <th>Agent 数量</th>
                  <th>推荐指数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>VoltAgent/awesome-claude-code-subagents</td>
                  <td><a href="https://github.com/VoltAgent/awesome-claude-code-subagents" target="_blank">GitHub</a></td>
                  <td>专业 Agent 集合</td>
                  <td>100+</td>
                  <td>⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td>wshobson/agents</td>
                  <td><a href="https://github.com/wshobson/agents" target="_blank">GitHub</a></td>
                  <td>智能路由 Agent</td>
                  <td>50+</td>
                  <td>⭐⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 教程资源 -->
        <div class="tutorial-section">
          <h2>📖 相关教程资源</h2>
          
          <div class="tutorial-category">
            <h3>官方文档</h3>
            <ul class="link-list">
              <li>
                <a href="https://docs.anthropic.com/zh-CN/docs/claude-code/tutorials" target="_blank">
                  Claude Code 官方教程
                </a>
              </li>
            </ul>
          </div>

          <div class="tutorial-category">
            <h3>MCP (Model Context Protocol)</h3>
            <ul class="link-list">
              <li>
                <a href="https://modelcontextprotocol.io/docs/getting-started/intro" target="_blank">
                  官方快速入门
                </a>
              </li>
              <li>
                <a href="https://docs.anthropic.com/en/docs/claude-code/mcp" target="_blank">
                  Anthropic MCP 文档
                </a>
              </li>
            </ul>
          </div>

          <div class="tutorial-category">
            <h3>Agent/Subagent</h3>
            <ul class="link-list">
              <li>
                <a href="https://docs.anthropic.com/en/docs/claude-code/sub-agents" target="_blank">
                  官方 Subagents 文档
                </a>
              </li>
              <li>实用 Subagent 模板集合</li>
            </ul>
          </div>
        </div>

        <!-- 快速索引 -->
        <div class="quick-index">
          <h2>🔍 常见问题快速索引</h2>
          <ul class="index-list">
            <li>连接问题 → 参考第 4 章节</li>
            <li>认证失败 → 参考第 1、2 章节</li>
            <li>超时错误 → 参考第 5 章节</li>
            <li>配额优化 → 参考使用技巧部分</li>
            <li>自动执行 → 参考使用技巧部分</li>
          </ul>
          <p class="support-note">
            <strong>技术支持：</strong>遇到问题时，请先检查环境变量配置，然后参考对应章节的解决方案。
          </p>
        </div>
      </div>
    </n-card>
  </section>
  </div>
</template>

<script setup>
import { NCard, NAlert } from 'naive-ui';
</script>

<style scoped>
.public-page-wrapper {
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  padding: 24px;
}

.public-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 32px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.brand-section h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.login-link {
  padding: 10px 24px;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(93, 95, 246, 0.3);
}

.troubleshooting-view {
  max-width: 1200px;
  margin: 0 auto;
}

.support-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--daw-shadow-md);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.card-header p {
  margin: 8px 0 0;
  color: var(--daw-text-secondary);
  line-height: 1.6;
}

.troubleshooting-content {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.problem-section {
  margin-bottom: 40px;
  padding: 28px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.problem-section:hover {
  box-shadow: 0 8px 24px rgba(93, 95, 246, 0.08);
  border-color: rgba(93, 95, 246, 0.2);
}

.problem-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(93, 95, 246, 0.1);
}

.problem-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(93, 95, 246, 0.3);
}

.problem-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.problem-content {
  color: #475569;
  line-height: 1.8;
}

.problem-content h4 {
  margin: 24px 0 12px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.problem-content h4::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  border-radius: 2px;
}

.error-box {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%);
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.error-box code {
  display: block;
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

.solution-list {
  margin: 12px 0;
  padding-left: 24px;
  line-height: 1.9;
}

.solution-list li {
  margin-bottom: 12px;
}

.solution-list code {
  background: linear-gradient(135deg, rgba(93, 95, 246, 0.1) 0%, rgba(124, 126, 248, 0.08) 100%);
  padding: 3px 10px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875em;
  color: #5d5ff6;
  font-weight: 500;
  border: 1px solid rgba(93, 95, 246, 0.15);
}

.problem-content pre {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid rgba(93, 95, 246, 0.2);
  border-radius: 14px;
  padding: 20px;
  margin: 16px 0;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.problem-content pre code {
  color: #e2e8f0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  display: block;
  background: none;
  padding: 0;
  border: none;
  border-radius: 0;
}

.tips-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid rgba(93, 95, 246, 0.1);
}

.tips-section h2 {
  margin: 0 0 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.tip-card {
  background: linear-gradient(135deg, rgba(93, 95, 246, 0.05) 0%, rgba(124, 126, 248, 0.02) 100%);
  border-left: 4px solid #5d5ff6;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(93, 95, 246, 0.06);
}

.tip-card h3 {
  margin: 0 0 16px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.tip-card h4 {
  margin: 16px 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.tip-card p {
  margin: 8px 0;
  color: #475569;
  line-height: 1.7;
}

.tip-card ul {
  margin: 8px 0;
  padding-left: 24px;
  color: #475569;
  line-height: 1.8;
}

.resources-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid rgba(93, 95, 246, 0.1);
}

.resources-section h2,
.tutorial-section h2 {
  margin: 0 0 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.resource-category,
.tutorial-category {
  margin-bottom: 32px;
}

.resource-category h3,
.tutorial-category h3 {
  margin: 0 0 16px;
  font-size: 1.15rem;
  font-weight: 600;
  color: #334155;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.resource-table thead {
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  color: white;
}

.resource-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
}

.resource-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  color: #475569;
}

.resource-table tr:last-child td {
  border-bottom: none;
}

.resource-table tr:hover {
  background: rgba(93, 95, 246, 0.03);
}

.resource-table a {
  color: #5d5ff6;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.resource-table a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.tutorial-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid rgba(93, 95, 246, 0.1);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.link-list li {
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
}

.link-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #5d5ff6;
  font-weight: 700;
}

.link-list a {
  color: #5d5ff6;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.link-list a:hover {
  border-bottom-color: #5d5ff6;
}

.quick-index {
  margin-top: 48px;
  padding: 28px;
  background: linear-gradient(135deg, rgba(250, 204, 21, 0.08) 0%, rgba(251, 191, 36, 0.05) 100%);
  border-left: 4px solid #f59e0b;
  border-radius: 12px;
}

.quick-index h2 {
  margin: 0 0 16px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.index-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 20px;
}

.index-list li {
  margin-bottom: 10px;
  padding-left: 24px;
  position: relative;
  color: #475569;
  font-weight: 500;
}

.index-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #f59e0b;
  font-weight: 700;
}

.support-note {
  margin: 20px 0 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  color: #475569;
  line-height: 1.7;
}

.support-note strong {
  color: #1e293b;
}

@media (max-width: 768px) {
  .resource-table {
    font-size: 0.875rem;
  }

  .resource-table th,
  .resource-table td {
    padding: 10px 12px;
  }
}
</style>

