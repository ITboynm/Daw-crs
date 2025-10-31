<template>
  <div class="public-page-wrapper">
    <div class="public-header">
      <div class="brand-section">
        <img src="@/assets/logo.png" alt="DawAPI" class="logo" />
        <h1>DawAPI</h1>
      </div>
      <a href="/login" class="login-link">返回登录</a>
    </div>

    <section class="api-support-view">
      <n-card class="support-card" :bordered="false">
        <header class="card-header">
          <div>
            <h2>使用教程</h2>
            <p>快速开始使用 DawAPI，根据您的操作系统选择对应的配置教程。</p>
          </div>
        </header>

        <n-tabs type="segment" animated class="tutorial-tabs">
          <n-tab-pane name="windows" tab="Windows">
            <div class="tutorial-content">
              <h3>Windows 使用教程</h3>
              <p class="intro-text">跟着这个教程，你可以轻松在自己的电脑上安装并使用 Claude Code、Gemini、Codex。</p>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h4>安装 Node.js 环境</h4>
                </div>
                <p>Claude Code 需要 Node.js 环境才能运行。</p>
                
                <h5>方法一：官网下载（推荐）</h5>
                <ol class="step-list">
                  <li>打开浏览器访问 <a href="https://nodejs.org/" target="_blank">https://nodejs.org/</a></li>
                  <li>点击 "LTS" 版本进行下载（推荐长期支持版本）</li>
                  <li>下载完成后双击 .msi 文件</li>
                  <li>按照安装向导完成安装，保持默认设置即可</li>
                </ol>

                <h5>方法二：使用包管理器</h5>
                <p>如果你安装了 Chocolatey 或 Scoop，可以使用命令行安装：</p>
                <pre><code># 使用 Chocolatey
choco install nodejs
# 或使用 Scoop
scoop install nodejs</code></pre>

                <div class="alert-info">
                  <strong>Windows 注意事项</strong>
                  <ul>
                    <li>建议使用 PowerShell 而不是 CMD</li>
                    <li>如果遇到权限问题，尝试以管理员身份运行</li>
                    <li>某些杀毒软件可能会误报，需要添加白名单</li>
                  </ul>
                </div>

                <h5>验证安装是否成功</h5>
                <p>安装完成后，打开 PowerShell 或 CMD，输入以下命令：</p>
                <pre><code>node --version
npm --version</code></pre>
                <p>如果显示版本号，说明安装成功了！</p>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h4>安装 AI 开发工具</h4>
                </div>
                
                <h5>安装 Claude Code</h5>
                <p>打开 PowerShell 或 CMD，运行以下命令：</p>
                <pre><code># 全局安装 Claude Code
npm install -g @anthropic-ai/claude-code</code></pre>
                <p>这个命令会从 npm 官方仓库下载并安装最新版本的 Claude Code。</p>

                <div class="alert-tip">
                  <ul>
                    <li>建议使用 PowerShell 而不是 CMD，功能更强大</li>
                    <li>如果遇到权限问题，以管理员身份运行 PowerShell</li>
                  </ul>
                </div>

                <h5>验证 Claude Code 安装</h5>
                <p>安装完成后，输入以下命令检查是否安装成功：</p>
                <pre><code>claude --version</code></pre>
                <p>如果显示版本号，恭喜你！Claude Code 已经成功安装了。</p>

                <h5>安装 Gemini CLI（可选）</h5>
                <p>如果你想使用 Gemini 模型，可以安装 Gemini CLI：</p>
                <pre><code># 全局安装 Gemini CLI
npm install -g @google/generative-ai-cli</code></pre>

                <p>验证安装：</p>
                <pre><code>gemini --version</code></pre>

                <h5>安装 Codex（可选）</h5>
                <p>如果你想使用 OpenAI Codex，可以安装 Codex CLI：</p>
                <pre><code># 全局安装 Codex
npm install -g @openai/codex-cli</code></pre>

                <p>验证安装：</p>
                <pre><code>codex --version</code></pre>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <h4>设置环境变量</h4>
                </div>
                
                <h5>配置 Claude Code 环境变量</h5>
                <p>为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：</p>

                <h5>方法一：PowerShell 临时设置（当前会话）</h5>
                <p>在 PowerShell 中运行以下命令：</p>
                <pre><code>$env:ANTHROPIC_BASE_URL = "https://api.dawclaudecode.com"
$env:ANTHROPIC_AUTH_TOKEN = "sk-你的API密钥"</code></pre>
                <p class="hint">💡 记得将 "sk-你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。</p>

                <h5>方法二：PowerShell 永久设置（用户级）</h5>
                <p>在 PowerShell 中运行以下命令设置用户级环境变量：</p>
                <pre><code># 设置用户级环境变量（永久生效）
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.dawclaudecode.com", [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-你的API密钥", [System.EnvironmentVariableTarget]::User)</code></pre>

                <p>查看已设置的环境变量：</p>
                <pre><code># 查看用户级环境变量
[System.Environment]::GetEnvironmentVariable("ANTHROPIC_BASE_URL", [System.EnvironmentVariableTarget]::User)
[System.Environment]::GetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", [System.EnvironmentVariableTarget]::User)</code></pre>
                <p class="hint">💡 设置后需要重新打开 PowerShell 窗口才能生效。</p>

                <h5>VSCode Claude 插件配置</h5>
                <p>如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：</p>
                <p>配置文件位置：<code>C:\Users\你的用户名\.claude\config.json</code></p>
                <p class="hint">💡 如果该文件不存在，请手动创建。</p>
                <pre><code>{
  "primaryApiKey": "sk-你的API密钥"
}</code></pre>

                <h5>验证环境变量设置</h5>
                <p>设置完环境变量后，可以通过以下命令验证是否设置成功：</p>
                <p>在 PowerShell 中验证：</p>
                <pre><code>echo $env:ANTHROPIC_BASE_URL
echo $env:ANTHROPIC_AUTH_TOKEN</code></pre>
                <p>在 CMD 中验证：</p>
                <pre><code>echo %ANTHROPIC_BASE_URL%
echo %ANTHROPIC_AUTH_TOKEN%</code></pre>
                <p>预期输出示例：</p>
                <pre><code>https://api.dawclaudecode.com
sk-xxxxxxxxxxxxxxxxxx</code></pre>
                <p class="hint">💡 如果输出为空或显示变量名本身，说明环境变量设置失败，请重新设置。</p>

                <h5>配置 Gemini CLI 环境变量</h5>
                <p>如果你使用 Gemini CLI，需要设置以下环境变量：</p>
                <p>在 PowerShell 中运行以下命令：</p>
                <pre><code>$env:GOOGLE_GEMINI_BASE_URL = "https://api.dawclaudecode.com"
$env:GEMINI_API_KEY = "sk-你的API密钥"
$env:GEMINI_MODEL = "gemini-2.5-pro"</code></pre>
                <p class="hint">💡 使用与 Claude Code 相同的 API 密钥即可。</p>

                <p>PowerShell 永久设置（用户级）：</p>
                <pre><code># 设置用户级环境变量（永久生效）
[System.Environment]::SetEnvironmentVariable("GOOGLE_GEMINI_BASE_URL", "https://api.dawclaudecode.com", [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "sk-你的API密钥", [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("GEMINI_MODEL", "gemini-2.5-pro", [System.EnvironmentVariableTarget]::User)</code></pre>
                <p class="hint">💡 设置后需要重新打开 PowerShell 窗口才能生效。</p>

                <p>验证 Gemini CLI 环境变量：</p>
                <pre><code>echo $env:GOOGLE_GEMINI_BASE_URL
echo $env:GEMINI_API_KEY
echo $env:GEMINI_MODEL</code></pre>

                <h5>配置 Codex 环境变量</h5>
                <p>如果你使用支持 OpenAI API 的工具（如 Codex），需要配置以下文件：</p>
                <p>在 <code>~/.codex/config.toml</code> 文件开头添加以下配置：</p>
                <pre><code>model_provider = "daw"
model = "gpt-5-codex"
model_reasoning_effort = "high"
model_reasoning_summary = "detailed"
approval_policy = "never"
sandbox_mode = "danger-full-access"
network_access = true
preferred_auth_method = "apikey"

[shell_environment_policy]
inherit = "all"
ignore_default_excludes = false

[model_providers.daw]
name = "daw"
base_url = "https://api.dawclaudecode.com"
wire_api = "responses"
requires_openai_auth = true
env_key = "OPENAI_API_KEY"

[tools]
web_search = true</code></pre>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <h4>开始使用 Claude Code</h4>
                </div>
                <p>现在你可以开始使用 Claude Code 了！</p>
                
                <h5>启动 Claude Code</h5>
                <pre><code>claude</code></pre>

                <h5>在特定项目中使用</h5>
                <pre><code># 进入你的项目目录
cd C:\path\to\your\project
# 启动 Claude Code
claude</code></pre>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="macos" tab="macOS">
            <div class="tutorial-content">
              <h3>macOS 使用教程</h3>
              <p class="intro-text">跟着这个教程，你可以轻松在自己的电脑上安装并使用 Claude Code、Gemini、Codex。</p>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h4>安装 Node.js 环境</h4>
                </div>
                <p>Claude Code 需要 Node.js 环境才能运行。</p>
                
                <h5>方法一：使用 Homebrew（推荐）</h5>
                <p>如果你已经安装了 Homebrew，使用它安装 Node.js 会更方便：</p>
                <pre><code># 更新 Homebrew
brew update
# 安装 Node.js
brew install node</code></pre>

                <h5>方法二：官网下载</h5>
                <ol class="step-list">
                  <li>访问 <a href="https://nodejs.org/" target="_blank">https://nodejs.org/</a></li>
                  <li>下载适合 macOS 的 LTS 版本</li>
                  <li>打开下载的 .pkg 文件</li>
                  <li>按照安装程序指引完成安装</li>
                </ol>

                <div class="alert-info">
                  <strong>macOS 注意事项</strong>
                  <ul>
                    <li>如果遇到权限问题，可能需要使用 sudo</li>
                    <li>首次运行可能需要在系统偏好设置中允许</li>
                    <li>建议使用 Terminal 或 iTerm2</li>
                  </ul>
                </div>

                <h5>验证安装是否成功</h5>
                <p>安装完成后，打开 Terminal，输入以下命令：</p>
                <pre><code>node --version
npm --version</code></pre>
                <p>如果显示版本号，说明安装成功了！</p>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h4>安装 AI 开发工具</h4>
                </div>
                
                <h5>安装 Claude Code</h5>
                <p>打开 Terminal，运行以下命令：</p>
                <pre><code># 全局安装 Claude Code
npm install -g @anthropic-ai/claude-code</code></pre>
                <p>如果遇到权限问题，可以使用 sudo：</p>
                <pre><code>sudo npm install -g @anthropic-ai/claude-code</code></pre>

                <h5>验证 Claude Code 安装</h5>
                <p>安装完成后，输入以下命令检查是否安装成功：</p>
                <pre><code>claude --version</code></pre>
                <p>如果显示版本号，恭喜你！Claude Code 已经成功安装了。</p>

                <h5>安装 Gemini CLI（可选）</h5>
                <p>如果你想使用 Gemini 模型，可以安装 Gemini CLI：</p>
                <pre><code># 全局安装 Gemini CLI
npm install -g @google/generative-ai-cli</code></pre>

                <p>验证安装：</p>
                <pre><code>gemini --version</code></pre>

                <h5>安装 Codex（可选）</h5>
                <p>如果你想使用 OpenAI Codex，可以安装 Codex CLI：</p>
                <pre><code># 全局安装 Codex
npm install -g @openai/codex-cli</code></pre>

                <p>验证安装：</p>
                <pre><code>codex --version</code></pre>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <h4>设置环境变量</h4>
                </div>
                
                <h5>配置 Claude Code 环境变量</h5>
                <p>为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：</p>

                <h5>方法一：临时设置（当前会话）</h5>
                <p>在 Terminal 中运行以下命令：</p>
                <pre><code>export ANTHROPIC_BASE_URL="https://api.dawclaudecode.com"
export ANTHROPIC_AUTH_TOKEN="sk-你的API密钥"</code></pre>
                <p class="hint">💡 记得将 "sk-你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。</p>

                <h5>方法二：永久设置</h5>
                <p>编辑你的 shell 配置文件（根据你使用的 shell）：</p>
                <pre><code># 对于 zsh (默认)
echo 'export ANTHROPIC_BASE_URL="https://api.dawclaudecode.com"' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN="sk-你的API密钥"' >> ~/.zshrc
source ~/.zshrc

# 对于 bash
echo 'export ANTHROPIC_BASE_URL="https://api.dawclaudecode.com"' >> ~/.bash_profile
echo 'export ANTHROPIC_AUTH_TOKEN="sk-你的API密钥"' >> ~/.bash_profile
source ~/.bash_profile</code></pre>

                <h5>VSCode Claude 插件配置</h5>
                <p>如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：</p>
                <p>配置文件位置：<code>~/.claude/config.json</code></p>
                <p class="hint">💡 如果该文件不存在，请手动创建。</p>
                <pre><code>{
  "primaryApiKey": "sk-你的API密钥"
}</code></pre>

                <h5>配置 Gemini CLI 环境变量</h5>
                <p>如果你使用 Gemini CLI，需要设置以下环境变量：</p>
                <p>在 Terminal 中运行以下命令：</p>
                <pre><code>export GOOGLE_GEMINI_BASE_URL="https://user.dawclaudecode.com/"
export GEMINI_API_KEY="sk-你的API密钥"
export GEMINI_MODEL="gemini-2.5-pro"</code></pre>
                <p class="hint">💡 使用与 Claude Code 相同的 API 密钥即可。</p>

                <p>永久设置方法：</p>
                <pre><code># 对于 zsh (默认)
echo 'export GOOGLE_GEMINI_BASE_URL="https://user.dawclaudecode.com/"' >> ~/.zshrc
echo 'export GEMINI_API_KEY="sk-你的API密钥"' >> ~/.zshrc
echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.zshrc
source ~/.zshrc

# 对于 bash
echo 'export GOOGLE_GEMINI_BASE_URL="https://user.dawclaudecode.com/"' >> ~/.bash_profile
echo 'export GEMINI_API_KEY="sk-你的API密钥"' >> ~/.bash_profile
echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.bash_profile
source ~/.bash_profile</code></pre>

                <p>验证 Gemini CLI 环境变量：</p>
                <pre><code>echo $GOOGLE_GEMINI_BASE_URL
echo $GEMINI_API_KEY
echo $GEMINI_MODEL</code></pre>

                <h5>配置 Codex 环境变量</h5>
                <p>如果你使用支持 OpenAI API 的工具（如 Codex），需要配置以下文件：</p>
                <p>在 <code>~/.codex/config.toml</code> 文件开头添加以下配置：</p>
                <pre><code>model_provider = "daw"
model = "gpt-5-codex"
model_reasoning_effort = "high"
model_reasoning_summary = "detailed"
approval_policy = "never"
sandbox_mode = "danger-full-access"
network_access = true
preferred_auth_method = "apikey"

[shell_environment_policy]
inherit = "all"
ignore_default_excludes = false

[model_providers.daw]
name = "daw"
base_url = "https://api.dawclaudecode.com"
wire_api = "responses"
requires_openai_auth = true
env_key = "OPENAI_API_KEY"

[tools]
web_search = true</code></pre>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <h4>开始使用 Claude Code</h4>
                </div>
                <p>现在你可以开始使用 Claude Code 了！</p>
                
                <h5>启动 Claude Code</h5>
                <pre><code>claude</code></pre>

                <h5>在特定项目中使用</h5>
                <pre><code># 进入你的项目目录
cd /path/to/your/project
# 启动 Claude Code
claude</code></pre>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="linux" tab="Linux/WSL2">
            <div class="tutorial-content">
              <h3>Linux/WSL2 使用教程</h3>
              <p class="intro-text">跟着这个教程，你可以轻松在自己的电脑上安装并使用 Claude Code、Gemini、Codex。</p>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h4>安装 Node.js 环境</h4>
                </div>
                <p>Claude Code 需要 Node.js 环境才能运行。</p>
                
                <h5>方法一：使用官方仓库（推荐）</h5>
                <pre><code># 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
# 安装 Node.js
sudo apt-get install -y nodejs</code></pre>

                <h5>方法二：使用系统包管理器</h5>
                <p>虽然版本可能不是最新的，但对于基本使用已经足够：</p>
                <pre><code># Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL/Fedora
sudo dnf install nodejs npm</code></pre>

                <div class="alert-info">
                  <strong>Linux 注意事项</strong>
                  <ul>
                    <li>某些发行版可能需要安装额外的依赖</li>
                    <li>如果遇到权限问题，使用 sudo</li>
                    <li>确保你的用户在 npm 的全局目录有写权限</li>
                  </ul>
                </div>

                <h5>验证安装是否成功</h5>
                <p>安装完成后，打开终端，输入以下命令：</p>
                <pre><code>node --version
npm --version</code></pre>
                <p>如果显示版本号，说明安装成功了！</p>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h4>安装 AI 开发工具</h4>
                </div>
                
                <h5>安装 Claude Code</h5>
                <p>打开终端，运行以下命令：</p>
                <pre><code># 全局安装 Claude Code
npm install -g @anthropic-ai/claude-code</code></pre>
                <p>如果遇到权限问题，可以使用 sudo：</p>
                <pre><code>sudo npm install -g @anthropic-ai/claude-code</code></pre>

                <h5>验证 Claude Code 安装</h5>
                <p>安装完成后，输入以下命令检查是否安装成功：</p>
                <pre><code>claude --version</code></pre>
                <p>如果显示版本号，恭喜你！Claude Code 已经成功安装了。</p>

                <h5>安装 Gemini CLI（可选）</h5>
                <p>如果你想使用 Gemini 模型，可以安装 Gemini CLI：</p>
                <pre><code># 全局安装 Gemini CLI
npm install -g @google/generative-ai-cli</code></pre>

                <p>验证安装：</p>
                <pre><code>gemini --version</code></pre>

                <h5>安装 Codex（可选）</h5>
                <p>如果你想使用 OpenAI Codex，可以安装 Codex CLI：</p>
                <pre><code># 全局安装 Codex
npm install -g @openai/codex-cli</code></pre>

                <p>验证安装：</p>
                <pre><code>codex --version</code></pre>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <h4>设置环境变量</h4>
                </div>
                
                <h5>配置 Claude Code 环境变量</h5>
                <p>为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：</p>

                <h5>方法一：临时设置（当前会话）</h5>
                <p>在终端中运行以下命令：</p>
                <pre><code>export ANTHROPIC_BASE_URL="https://api.dawclaudecode.com"
export ANTHROPIC_AUTH_TOKEN="sk-你的API密钥"</code></pre>
                <p class="hint">💡 记得将 "sk-你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。</p>

                <h5>方法二：永久设置</h5>
                <p>编辑你的 shell 配置文件：</p>
                <pre><code># 对于 bash (默认)
echo 'export ANTHROPIC_BASE_URL="https://api.dawclaudecode.com"' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN="sk-你的API密钥"' >> ~/.bashrc
source ~/.bashrc

# 对于 zsh
echo 'export ANTHROPIC_BASE_URL="https://api.dawclaudecode.com"' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN="sk-你的API密钥"' >> ~/.zshrc
source ~/.zshrc</code></pre>

                <h5>VSCode Claude 插件配置</h5>
                <p>如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：</p>
                <p>配置文件位置：<code>~/.claude/config.json</code></p>
                <p class="hint">💡 如果该文件不存在，请手动创建。</p>
                <pre><code>{
  "primaryApiKey": "sk-你的API密钥"
}</code></pre>

                <h5>配置 Gemini CLI 环境变量</h5>
                <p>如果你使用 Gemini CLI，需要设置以下环境变量：</p>
                <p>在终端中运行以下命令：</p>
                <pre><code>export GOOGLE_GEMINI_BASE_URL="https://user.dawclaudecode.com/"
export GEMINI_API_KEY="sk-你的API密钥"
export GEMINI_MODEL="gemini-2.5-pro"</code></pre>
                <p class="hint">💡 使用与 Claude Code 相同的 API 密钥即可。</p>

                <p>永久设置方法：</p>
                <pre><code># 对于 bash (默认)
echo 'export GOOGLE_GEMINI_BASE_URL="https://user.dawclaudecode.com/"' >> ~/.bashrc
echo 'export GEMINI_API_KEY="sk-你的API密钥"' >> ~/.bashrc
echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.bashrc
source ~/.bashrc

# 对于 zsh
echo 'export GOOGLE_GEMINI_BASE_URL="https://user.dawclaudecode.com/"' >> ~/.zshrc
echo 'export GEMINI_API_KEY="sk-你的API密钥"' >> ~/.zshrc
echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.zshrc
source ~/.zshrc</code></pre>

                <p>验证 Gemini CLI 环境变量：</p>
                <pre><code>echo $GOOGLE_GEMINI_BASE_URL
echo $GEMINI_API_KEY
echo $GEMINI_MODEL</code></pre>

                <h5>配置 Codex 环境变量</h5>
                <p>如果你使用支持 OpenAI API 的工具（如 Codex），需要配置以下文件：</p>
                <p>在 <code>~/.codex/config.toml</code> 文件开头添加以下配置：</p>
                <pre><code>model_provider = "daw"
model = "gpt-5-codex"
model_reasoning_effort = "high"
model_reasoning_summary = "detailed"
approval_policy = "never"
sandbox_mode = "danger-full-access"
network_access = true
preferred_auth_method = "apikey"

[shell_environment_policy]
inherit = "all"
ignore_default_excludes = false

[model_providers.daw]
name = "daw"
base_url = "https://api.dawclaudecode.com"
wire_api = "responses"
requires_openai_auth = true
env_key = "OPENAI_API_KEY"

[tools]
web_search = true</code></pre>
              </div>

              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <h4>开始使用 Claude Code</h4>
                </div>
                <p>现在你可以开始使用 Claude Code 了！</p>
                
                <h5>启动 Claude Code</h5>
                <pre><code>claude</code></pre>

                <h5>在特定项目中使用</h5>
                <pre><code># 进入你的项目目录
cd /path/to/your/project
# 启动 Claude Code
claude</code></pre>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </section>
  </div>
</template>

<script setup>
import { NCard, NTabs, NTabPane } from 'naive-ui';
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

.api-support-view {
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
}

.card-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
}

.tutorial-tabs {
  margin-bottom: 24px;
}

.tutorial-tabs :deep(.n-tabs-tab) {
  font-weight: 500;
  transition: all 0.3s ease;
}

.tutorial-content {
  padding: 32px 0;
  min-height: 300px;
  max-width: 900px;
  margin: 0 auto;
}

.tutorial-content h3 {
  margin: 0 0 16px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

.tutorial-content .intro-text {
  margin: 0 0 40px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(93, 95, 246, 0.08) 0%, rgba(124, 126, 248, 0.05) 100%);
  border-left: 4px solid #5d5ff6;
  border-radius: 12px;
  color: #475569;
  line-height: 1.8;
  font-size: 1.05rem;
  box-shadow: 0 2px 8px rgba(93, 95, 246, 0.06);
  text-align: center;
}

.tutorial-content p {
  margin: 0 0 14px;
  color: #475569;
  line-height: 1.8;
  font-size: 0.95rem;
}

.tutorial-content a {
  color: #5d5ff6;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.tutorial-content a:hover {
  border-bottom-color: #5d5ff6;
}

.step-section {
  margin-bottom: 48px;
  padding: 28px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.step-section:hover {
  box-shadow: 0 8px 24px rgba(93, 95, 246, 0.08);
  border-color: rgba(93, 95, 246, 0.2);
}

.step-section:last-child {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(93, 95, 246, 0.1);
}

.step-number {
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
  transition: all 0.3s ease;
}

.step-section:hover .step-number {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(93, 95, 246, 0.4);
}

.step-header h4 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.tutorial-content h5 {
  margin: 28px 0 14px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tutorial-content h5::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  border-radius: 2px;
}

.tutorial-content h5:first-of-type {
  margin-top: 20px;
}

.step-list {
  margin: 14px 0;
  padding-left: 28px;
  color: #475569;
  line-height: 1.9;
}

.step-list li {
  margin-bottom: 10px;
  position: relative;
}

.step-list li::marker {
  color: #5d5ff6;
  font-weight: 600;
}

.tutorial-content pre {
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

.tutorial-content pre code {
  color: #e2e8f0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  display: block;
}

.tutorial-content p code,
.tutorial-content li code {
  background: linear-gradient(135deg, rgba(93, 95, 246, 0.1) 0%, rgba(124, 126, 248, 0.08) 100%);
  padding: 3px 10px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875em;
  color: #5d5ff6;
  font-weight: 500;
  border: 1px solid rgba(93, 95, 246, 0.15);
}

.alert-info,
.alert-tip {
  background: linear-gradient(135deg, rgba(93, 95, 246, 0.08) 0%, rgba(124, 126, 248, 0.05) 100%);
  border-left: 4px solid #5d5ff6;
  border-radius: 12px;
  padding: 20px 22px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(93, 95, 246, 0.08);
  backdrop-filter: blur(10px);
}

.alert-info strong {
  display: block;
  margin-bottom: 10px;
  color: #1e293b;
  font-weight: 700;
  font-size: 1.02rem;
}

.alert-info ul,
.alert-tip ul {
  margin: 10px 0 0;
  padding-left: 24px;
  color: #475569;
  line-height: 1.8;
}

.alert-info li,
.alert-tip li {
  margin-bottom: 6px;
}

.alert-info li::marker,
.alert-tip li::marker {
  color: #5d5ff6;
}

.hint {
  display: block;
  margin: 16px 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fef9e7 0%, #fefcf3 100%);
  border-left: 4px solid #f39c12;
  border-radius: 12px;
  color: #8b5e3c;
  font-size: 0.95rem;
  line-height: 1.7;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.08);
  position: relative;
  overflow: hidden;
}

.hint::before {
  content: '💡';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  opacity: 0.3;
}

@media (max-width: 768px) {
  .public-page-wrapper {
    padding: 16px;
  }

  .public-header {
    padding: 16px 20px;
    margin-bottom: 20px;
  }

  .brand-section h1 {
    font-size: 1.5rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }
}
</style>

