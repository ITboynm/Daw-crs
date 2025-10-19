<template>
  <section class="api-support-view">
    <n-card class="support-card" :bordered="false">
      <header class="card-header">
        <div>
          <h2>API 集成示例</h2>
          <p>快速复制粘贴即可调用 DawAPI，以下示例基于当前环境配置。</p>
        </div>
      </header>
      <div class="card-section">
        <h3>基础信息</h3>
        <ul class="meta-list">
          <li><strong>Base URL：</strong>{{ baseUrl }}</li>
          <li><strong>认证方式：</strong>Authorization: Bearer sk-XXXX</li>
          <li><strong>常用端点：</strong>/dashboard/status · /dashboard/bill · /v1/chat/completions</li>
        </ul>
      </div>
      <div class="code-grid">
        <article>
          <h4>cURL</h4>
          <pre><code>curl -X POST "{{ baseUrl }}/v1/chat/completions" \ 
  -H "Authorization: Bearer ${TOKEN}" \ 
  -H "Content-Type: application/json" \ 
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are DawAPI."},
      {"role": "user", "content": "Say hi"}
    ]
  }'</code></pre>
        </article>
        <article>
          <h4>JavaScript (fetch)</h4>
          <pre><code>const response = await fetch("{{ baseUrl }}/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are DawAPI." },
      { role: "user", content: "Say hi" }
    ]
  })
});
const data = await response.json();</code></pre>
        </article>
        <article>
          <h4>Python (requests)</h4>
          <pre><code>import requests

headers = {
  "Authorization": f"Bearer {TOKEN}",
  "Content-Type": "application/json"
}

payload = {
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are DawAPI."},
    {"role": "user", "content": "Say hi"}
  ]
}

resp = requests.post("{{ baseUrl }}/v1/chat/completions", json=payload, headers=headers)
print(resp.json())</code></pre>
        </article>
      </div>
    </n-card>
  </section>
</template>

<script setup>
import { NCard } from 'naive-ui';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.dawclaudecode.com';
</script>

<style scoped>
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

.meta-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
}

.code-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.code-grid article {
  background: rgba(246, 244, 255, 0.6);
  border: 1px solid rgba(94, 92, 230, 0.12);
  border-radius: 18px;
  padding: 18px;
}

.code-grid h4 {
  margin: 0 0 10px;
}

pre {
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.82rem;
  white-space: pre-wrap;
}

code {
  display: block;
}

@media (max-width: 720px) {
  .code-grid {
    grid-template-columns: 1fr;
  }
}
</style>
