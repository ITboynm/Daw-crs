<template>
  <div class="public-page-wrapper">
    <div class="public-header">
      <div class="brand-section">
        <img src="@/assets/logo.png" alt="DawAPI" class="logo" />
        <h1>DawAPI</h1>
      </div>
      <a href="/login" class="login-link">返回登录</a>
    </div>

    <section class="pricing-view">
    <n-card class="pricing-card" :bordered="false">
      <header class="pricing-header">
        <h1>套餐定价</h1>
        <p class="subtitle">选择适合您的套餐方案，灵活满足不同需求</p>
      </header>

      <n-tabs v-model:value="activeTab" type="line" size="large" justify-content="center" class="pricing-tabs">
        <n-tab-pane name="claudecode" tab="Claude Code 套餐">
          <div class="pricing-grid">
        <!-- 基础套餐 -->
        <div class="pricing-item">
          <div class="pricing-badge">基础版</div>
          <div class="pricing-content">
            <div class="pricing-title">
              <h3>月卡套餐</h3>
              <p class="pricing-desc">适合个人开发者和小型项目</p>
            </div>
            <div class="pricing-price">
              <span class="currency">¥</span>
              <span class="amount">499</span>
              <span class="period">/月</span>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>每日额度：<strong>60 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>月度总额度：<strong>~1,800 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>仅支持 <strong>Claude Code</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>API 密钥管理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>基础技术支持</span>
              </div>
              <div class="feature-item warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>⚠️ 禁止分发</strong></span>
              </div>
            </div>
            <n-button type="primary" size="large" block class="subscribe-btn" @click="openQrcodeModal">
              选择套餐
            </n-button>
          </div>
        </div>

        <!-- 进阶套餐 -->
        <div class="pricing-item featured">
          <div class="pricing-badge popular">推荐</div>
          <div class="pricing-content">
            <div class="pricing-title">
              <h3>进阶套餐</h3>
              <p class="pricing-desc">适合中小型团队和高频使用场景</p>
            </div>
            <div class="pricing-price">
              <span class="currency">¥</span>
              <span class="amount">819</span>
              <span class="period">/月</span>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>每日额度：<strong>100 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>月度总额度：<strong>~3,000 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>仅支持 <strong>Claude Code</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级 API 密钥管理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>优先技术支持</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>使用数据统计</span>
              </div>
              <div class="feature-item warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>⚠️ 禁止分发</strong></span>
              </div>
            </div>
            <n-button type="primary" size="large" block class="subscribe-btn featured-btn" @click="openQrcodeModal">
              选择套餐
            </n-button>
          </div>
        </div>

        <!-- 专业套餐 -->
        <div class="pricing-item">
          <div class="pricing-badge">专业版</div>
          <div class="pricing-content">
            <div class="pricing-title">
              <h3>专业套餐</h3>
              <p class="pricing-desc">适合大型团队和企业级应用</p>
            </div>
            <div class="pricing-price">
              <span class="currency">¥</span>
              <span class="amount">1,599</span>
              <span class="period">/月</span>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>每日额度：<strong>200 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>月度总额度：<strong>~6,000 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>仅支持 <strong>Claude Code</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>企业级 API 管理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>7×24 技术支持</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级数据分析</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>专属客户经理</span>
              </div>
              <div class="feature-item warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>⚠️ 禁止分发</strong></span>
              </div>
            </div>
            <n-button type="primary" size="large" block class="subscribe-btn" @click="openQrcodeModal">
              选择套餐
            </n-button>
          </div>
        </div>

        <!-- 专业套餐进阶版 -->
        <div class="pricing-item premium">
          <div class="pricing-badge premium-badge">旗舰版</div>
          <div class="pricing-content">
            <div class="pricing-title">
              <h3>专业套餐进阶版</h3>
              <p class="pricing-desc">适合需要分发权限的专业团队</p>
            </div>
            <div class="pricing-price">
              <span class="currency">¥</span>
              <span class="amount">1,999</span>
              <span class="period">/月</span>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>每日额度：<strong>200 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>月度总额度：<strong>~6,000 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>仅支持 <strong>Claude Code</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>企业级 API 管理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>7×24 技术支持</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级数据分析</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>专属客户经理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>优先级支持响应</span>
              </div>
              <div class="feature-item success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2"/>
                </svg>
                <span><strong>✓ 有限的分发权限</strong></span>
              </div>
            </div>
            <n-button type="primary" size="large" block class="subscribe-btn premium-btn" @click="openQrcodeModal">
              选择套餐
            </n-button>
          </div>
        </div>

        <!-- 代理套餐 -->
        <div class="pricing-item ultimate">
          <div class="pricing-badge ultimate-badge">💎 代理版</div>
          <div class="pricing-content">
            <div class="pricing-title">
              <h3>代理套餐</h3>
              <p class="pricing-desc">完整代理权限，适合中小型服务商</p>
            </div>
            <div class="pricing-price">
              <span class="currency">¥</span>
              <span class="amount">3,999</span>
              <span class="period">/月</span>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>每日额度：<strong>350 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>月度总额度：<strong>~10,500 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>仅支持 <strong>Claude Code</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>企业级 API 管理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>7×24 专属技术支持</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级数据分析与报表</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>专属客户经理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>优先级响应（2小时内）</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>白标定制服务</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>多账户管理系统</span>
              </div>
              <div class="feature-item ultimate-highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8b5cf6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>💎 完整的代理权限</strong></span>
              </div>
              <div class="feature-item ultimate-highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8b5cf6" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>🚀 自主分发服务</strong></span>
              </div>
            </div>
            <n-button type="primary" size="large" block class="subscribe-btn ultimate-btn" @click="openQrcodeModal">
              联系我们
            </n-button>
          </div>
        </div>

        <!-- 高级代理套餐 -->
        <div class="pricing-item ultimate-pro featured">
          <div class="pricing-badge ultimate-pro-badge">👑 高级代理版</div>
          <div class="pricing-content">
            <div class="pricing-title">
              <h3>高级代理套餐</h3>
              <p class="pricing-desc">旗舰级代理权限，适合大型服务商</p>
            </div>
            <div class="pricing-price">
              <span class="currency">¥</span>
              <span class="amount">5,499</span>
              <span class="period">/月</span>
            </div>
            <div class="pricing-features">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>每日额度：<strong>500 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>月度总额度：<strong>~15,000 美元</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>仅支持 <strong>Claude Code</strong></span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>企业级 API 管理</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>7×24 VIP 技术支持</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级数据分析与实时报表</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>专属客户经理团队</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>VIP 优先响应（1小时内）</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级白标定制服务</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>高级多账户管理系统</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>API 性能优先通道</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>技术顾问服务</span>
              </div>
              <div class="feature-item ultimate-pro-highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#dc2626" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>👑 完整的代理权限</strong></span>
              </div>
              <div class="feature-item ultimate-pro-highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#dc2626" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>🚀 无限制自主分发</strong></span>
              </div>
              <div class="feature-item ultimate-pro-highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#dc2626" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><strong>💰 更优惠的单价</strong></span>
              </div>
            </div>
            <n-button type="primary" size="large" block class="subscribe-btn ultimate-pro-btn" @click="openQrcodeModal">
              立即咨询
            </n-button>
          </div>
        </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="codex" tab="Codex 套餐">
          <div class="pricing-grid single-plan">
            <!-- Codex 月卡套餐 -->
            <div class="pricing-item featured">
              <div class="pricing-badge popular">限时优惠</div>
              <div class="pricing-content">
                <div class="pricing-title">
                  <h3>Codex 月卡</h3>
                  <p class="pricing-desc">专注 gpt-5-codex 模型的专业套餐</p>
                </div>
                <div class="pricing-price">
                  <span class="currency">¥</span>
                  <span class="amount">150</span>
                  <span class="period">/月</span>
                </div>
                <div class="pricing-features">
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>每日额度：<strong>100 美元</strong></span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>月度总额度：<strong>~3,000 美元</strong></span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>仅支持 <strong>gpt-5-codex</strong> 模型</span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>API 密钥管理</span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>优先技术支持</span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>使用数据统计</span>
                  </div>
                  <div class="feature-item warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span><strong>⚠️ 禁止分发</strong></span>
                  </div>
                </div>
                <n-button type="primary" size="large" block class="subscribe-btn featured-btn" @click="openQrcodeModal">
                  选择套餐
                </n-button>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="payasyougo" tab="按量套餐">
          <div class="pricing-grid payg-grid">
            <!-- Claude Code 按量 -->
            <div class="pricing-item">
              <div class="pricing-badge">按需付费</div>
              <div class="pricing-content">
                <div class="pricing-title">
                  <h3>Claude Code 按量</h3>
                  <p class="pricing-desc">Claude Code 模型，灵活按需付费</p>
                </div>
                <div class="pricing-price">
                  <span class="payg-label">100 美元</span>
                  <span class="payg-price">
                    <span class="currency">¥</span>
                    <span class="amount">100</span>
                  </span>
                </div>
                <div class="pricing-features">
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>购买额度：<strong>100 美元</strong></span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>仅需：<strong>¥100</strong></span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span><strong>1元1刀</strong> 超值汇率</span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>支持 <strong>Claude Code</strong></span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>按实际使用计费</span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>无有效期限制</span>
                  </div>
                  <div class="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>API 密钥管理</span>
                  </div>
                </div>
                <n-button type="primary" size="large" block class="subscribe-btn" @click="openQrcodeModal">
                  立即购买
                </n-button>
              </div>
            </div>

            <!-- Codex 按量（已售完） -->
            <div class="pricing-item sold-out">
              <div class="pricing-badge sold-out-badge">已售完</div>
              <div class="pricing-content">
                <div class="pricing-title">
                  <h3>Codex 按量</h3>
                  <p class="pricing-desc">gpt-5-codex 模型，暂时缺货</p>
                </div>
                <div class="pricing-price disabled">
                  <span class="payg-label">100 美元</span>
                  <span class="payg-price">
                    <span class="currency">¥</span>
                    <span class="amount">--</span>
                  </span>
                </div>
                <div class="pricing-features">
                  <div class="feature-item disabled">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>暂时缺货</span>
                  </div>
                  <div class="feature-item disabled">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>仅支持 gpt-5-codex 模型</span>
                  </div>
                  <div class="feature-item disabled">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>按实际使用计费</span>
                  </div>
                  <div class="feature-item disabled">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>无有效期限制</span>
                  </div>
                  <div class="feature-item disabled">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>API 密钥管理</span>
                  </div>
                </div>
                <n-button disabled size="large" block class="subscribe-btn">
                  暂时缺货
                </n-button>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>

      <div class="pricing-footer">
        <n-alert type="info" :bordered="false">
          <template #icon>
            <span style="font-size: 1.2rem;">ℹ️</span>
          </template>
          <div class="footer-content">
            <p><strong>关于计费说明：</strong></p>
            <ul>
              <li>所有价格均为人民币，按月订阅</li>
              <li>每日额度在当日有效，不累积到次日</li>
              <li>支持多种支付方式：支付宝、微信支付、银行转账</li>
              <li>企业用户可联系客服获取定制化方案</li>
            </ul>
          </div>
        </n-alert>

        <div class="contact-section">
          <h3>需要更多帮助？</h3>
          <p>如有任何疑问，请联系我们的客服团队</p>
          <div class="contact-buttons">
            <!-- <n-button secondary size="large">
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </template>
              在线咨询
            </n-button> -->
            <a href="mailto:zwnb666@foxmail.com" style="text-decoration: none;">
              <n-button secondary size="large">
                <template #icon>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </template>
                邮件咨询
              </n-button>
            </a>
          </div>
        </div>
      </div>
    </n-card>

    <!-- 微信二维码模态框 -->
    <n-modal
      v-model:show="showQrcodeModal"
      preset="card"
      title="联系客服开通套餐"
      style="width: 500px;"
      :bordered="false"
      size="huge"
    >
      <div class="qrcode-modal-content">
        <p class="qrcode-description">扫码添加客服开通套餐</p>
        <div class="qrcode-wrapper">
          <img src="/images/wechat-qrcode.jpg" alt="微信二维码" class="qrcode-image" />
        </div>
        <p class="qrcode-hint">微信扫一扫，联系客服开通</p>
      </div>
    </n-modal>
  </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { NCard, NButton, NAlert, NTabs, NTabPane, NModal } from 'naive-ui';

const activeTab = ref('claudecode');
const showQrcodeModal = ref(false);

function openQrcodeModal() {
  showQrcodeModal.value = true;
}
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
  max-width: 1400px;
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

.pricing-view {
  max-width: 1400px;
  margin: 0 auto;
}

.pricing-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--daw-shadow-md);
  padding: 48px 32px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 32px;
}

.pricing-tabs {
  margin-bottom: 36px;
}

.pricing-tabs :deep(.n-tabs-tab) {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 28px;
}

.pricing-tabs :deep(.n-tabs-bar) {
  border-color: rgba(93, 95, 246, 0.2);
}

.pricing-header h1 {
  margin: 0 0 12px;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 400;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.pricing-grid.single-plan {
  grid-template-columns: 1fr;
  max-width: 420px;
}

.pricing-grid.payg-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  max-width: 800px;
}

.pricing-item {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 24px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  transition: all 0.3s ease;
}

.pricing-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(93, 95, 246, 0.15);
  border-color: rgba(93, 95, 246, 0.3);
}

.pricing-item.featured {
  border-color: #5d5ff6;
  box-shadow: 0 8px 24px rgba(93, 95, 246, 0.2);
}

.pricing-item.featured:hover {
  box-shadow: 0 16px 40px rgba(93, 95, 246, 0.3);
}

.pricing-item.premium {
  border-color: #f59e0b;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
}

.pricing-item.premium:hover {
  box-shadow: 0 16px 40px rgba(245, 158, 11, 0.3);
}

.pricing-item.ultimate {
  border-color: #8b5cf6;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
  background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
}

.pricing-item.ultimate:hover {
  box-shadow: 0 16px 40px rgba(139, 92, 246, 0.35);
  transform: translateY(-10px);
}

.pricing-item.ultimate-pro {
  border-color: #dc2626;
  box-shadow: 0 12px 32px rgba(220, 38, 38, 0.3);
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.pricing-item.ultimate-pro:hover {
  box-shadow: 0 20px 48px rgba(220, 38, 38, 0.4);
  transform: translateY(-12px);
}

.pricing-item.sold-out {
  opacity: 0.6;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
  pointer-events: none;
}

.pricing-item.sold-out:hover {
  transform: none;
  box-shadow: none;
}

.pricing-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #475569;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pricing-badge.popular {
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(93, 95, 246, 0.3);
}

.pricing-badge.premium-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.pricing-badge.ultimate-badge {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  font-size: 0.95rem;
}

.pricing-badge.ultimate-pro-badge {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
  font-size: 0.95rem;
  font-weight: 700;
}

.pricing-badge.sold-out-badge {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
}

.pricing-content {
  padding: 32px;
}

.pricing-title h3 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.pricing-desc {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.pricing-price {
  margin: 32px 0;
  text-align: center;
  padding: 24px 0;
  border-top: 2px solid rgba(93, 95, 246, 0.1);
  border-bottom: 2px solid rgba(93, 95, 246, 0.1);
}

.pricing-price.disabled {
  opacity: 0.5;
  border-top: 2px solid rgba(148, 163, 184, 0.2);
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
}

.payg-label {
  display: block;
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.payg-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.currency {
  font-size: 1.5rem;
  color: #64748b;
  font-weight: 600;
  vertical-align: top;
  margin-right: 4px;
}

.amount {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.period {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  margin-left: 4px;
}

.pricing-features {
  margin: 28px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
}

.feature-item svg {
  flex-shrink: 0;
}

.feature-item strong {
  color: #1e293b;
  font-weight: 600;
}

.feature-item.disabled {
  color: #94a3b8;
  opacity: 0.7;
}

.feature-item.disabled strong {
  color: #94a3b8;
}

.feature-item.warning {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%);
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid #ef4444;
  margin-top: 8px;
}

.feature-item.warning strong {
  color: #dc2626;
  font-weight: 700;
}

.feature-item.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%);
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid #10b981;
  margin-top: 8px;
}

.feature-item.success strong {
  color: #059669;
  font-weight: 700;
}

.feature-item.ultimate-highlight {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(167, 139, 250, 0.08) 100%);
  padding: 12px 14px;
  border-radius: 10px;
  border-left: 4px solid #8b5cf6;
  margin-top: 12px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

.feature-item.ultimate-highlight strong {
  color: #7c3aed;
  font-weight: 700;
  font-size: 1.05rem;
}

.feature-item.ultimate-pro-highlight {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
  padding: 14px 16px;
  border-radius: 12px;
  border-left: 5px solid #dc2626;
  margin-top: 12px;
  box-shadow: 0 3px 12px rgba(220, 38, 38, 0.2);
}

.feature-item.ultimate-pro-highlight strong {
  color: #dc2626;
  font-weight: 800;
  font-size: 1.08rem;
}

.subscribe-btn {
  margin-top: 28px;
  height: 52px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 12px;
}

.featured-btn {
  background: linear-gradient(135deg, #5d5ff6 0%, #7c7ef8 100%);
  box-shadow: 0 4px 16px rgba(93, 95, 246, 0.3);
}

.featured-btn:hover {
  box-shadow: 0 6px 20px rgba(93, 95, 246, 0.4);
}

.premium-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

.premium-btn:hover {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.ultimate-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  font-weight: 700;
}

.ultimate-btn:hover {
  box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.ultimate-pro-btn {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ultimate-pro-btn:hover {
  box-shadow: 0 8px 28px rgba(220, 38, 38, 0.6);
  transform: translateY(-3px);
}

.pricing-footer {
  max-width: 900px;
  margin: 0 auto;
}

.footer-content p {
  margin: 0 0 12px;
  font-weight: 600;
  color: #1e293b;
}

.footer-content ul {
  margin: 12px 0 0;
  padding-left: 24px;
  color: #475569;
  line-height: 1.8;
}

.footer-content li {
  margin-bottom: 8px;
}

.contact-section {
  margin-top: 40px;
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(93, 95, 246, 0.05) 0%, rgba(124, 126, 248, 0.02) 100%);
  border-radius: 20px;
}

.contact-section h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.contact-section p {
  margin: 0 0 24px;
  color: #64748b;
  font-size: 1rem;
}

.contact-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .pricing-header h1 {
    font-size: 2rem;
  }

  .pricing-card {
    padding: 32px 20px;
  }

  .pricing-content {
    padding: 24px 20px;
  }

  .amount {
    font-size: 2.5rem;
  }

  .contact-buttons {
    flex-direction: column;
  }

  .contact-buttons :deep(.n-button) {
    width: 100%;
  }
}

/* 微信二维码模态框样式 */
.qrcode-modal-content {
  text-align: center;
  padding: 20px;
}

.qrcode-description {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 24px;
}

.qrcode-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
}

.qrcode-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: white;
  padding: 12px;
}

.qrcode-hint {
  font-size: 14px;
  color: #666;
  margin-top: 20px;
  margin-bottom: 0;
}
</style>

