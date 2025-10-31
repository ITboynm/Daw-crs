<template>
  <section class="account-tools-view">
    <!-- 返回顶部按钮 -->
    <BackToTop />
    
    <!-- 顶部操作栏 -->
    <n-card class="header-card" :bordered="false">
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 class="page-title">子账户管理</h3>
          <n-input v-model:value="searchName" placeholder="搜索用户名" clearable style="width: 120px">
            <template #prefix><n-icon size="14"><SearchOutline /></n-icon></template>
          </n-input>
          <n-input v-model:value="searchEmail" placeholder="搜索邮箱" clearable style="width: 140px">
            <template #prefix><n-icon size="14"><SearchOutline /></n-icon></template>
          </n-input>
          <n-input v-model:value="searchId" placeholder="ID" clearable style="width: 100px">
            <template #prefix><n-icon size="14"><SearchOutline /></n-icon></template>
          </n-input>
          <n-input-number v-model:value="filterForm.level" :min="0" :max="9" placeholder="Level" clearable style="width: 100px" />
          <n-input v-model:value="filterForm.identifier" placeholder="特殊过滤器（L2/G1/R3等）" clearable style="width: 200px">
            <template #suffix>
              <n-popover trigger="hover" placement="top">
                <template #trigger><n-icon size="14" style="cursor: help"><InformationCircleOutline /></n-icon></template>
                <div style="max-width: 280px; font-size: 12px">
                  <p style="margin: 0 0 6px 0; font-weight: 600">支持的特殊过滤器:</p>
                  <ul style="margin: 0; padding-left: 16px">
                    <li>L{n} - Level (如: L2)</li>
                    <li>G{n} - Gear (如: G1)</li>
                    <li>R{n} - Role (如: R3)</li>
                    <li>T{n} - Tier (如: T2)</li>
                    <li>F{n} - Factor (如: F1.5)</li>
                    <li>.{dna} - DNA 路径 (如: .1.42.)</li>
                  </ul>
                </div>
              </n-popover>
            </template>
          </n-input>
        </div>
        <div class="toolbar-right">
          <n-button type="primary" @click="applyFilters" :loading="loading">查询</n-button>
          <n-button @click="resetFilters">重置</n-button>
          <n-button type="primary" @click="openCreateModal">新增子账户</n-button>
          <n-button secondary @click="refreshList" :loading="loading">刷新</n-button>
        </div>
      </div>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card" :bordered="false">
      <div class="table-content">
        <n-data-table
          :columns="columns"
          :data="filteredAccounts"
          :loading="loading"
          :pagination="false"
          :bordered="false"
          :single-line="false"
          :scroll-x="1640"
          striped
        />
      </div>
      
      <!-- 分页 -->
      <div v-if="totalCount > 0" class="table-footer">
        <span class="footer-total">共 {{ totalCount }} 条</span>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="totalCount"
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
        />
      </div>
    </n-card>

    <!-- 创建子账户模态框 -->
    <n-modal
      v-model:show="createModalVisible"
      preset="card"
      title="创建子账户"
      size="large"
      :mask-closable="false"
      style="max-width: 600px"
    >
      <n-form ref="createFormRef" :model="createForm" label-placement="left" label-width="120">
        <n-form-item label="用户名" required>
          <n-input v-model:value="createForm.name" placeholder="4-63个字符，允许字母/数字/连字符" />
        </n-form-item>
        <n-form-item label="邮箱" required>
          <n-input v-model:value="createForm.email" placeholder="用户邮箱" />
        </n-form-item>
        <n-form-item label="赠送额度 (USD)" required>
          <n-input-number
            v-model:value="createForm.credit"
            :min="2"
            :step="5"
            style="width: 100%"
            placeholder="赠送额度"
          />
          <template #feedback>
            <span style="font-size: 0.85rem; color: var(--daw-text-secondary)">子账户充值额度大于100刀的时候将拥有创建后代的权限</span>
          </template>
        </n-form-item>
        <n-form-item label="显示别名">
          <n-input v-model:value="createForm.alias" placeholder="可选，控制台展示名称" />
        </n-form-item>
        <n-form-item label="账单通知邮箱">
          <n-input v-model:value="createForm.billingEmail" placeholder="可选" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="createModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCreate">
            创建子账户
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 编辑子账户模态框 -->
    <n-modal
      v-model:show="editModalVisible"
      preset="card"
      size="huge"
      :mask-closable="false"
      style="max-width: 1100px"
      class="edit-account-modal"
    >
      <template #header>
        <div class="modal-header-content">
          <div class="header-left">
            <h3 class="modal-main-title">编辑子账户</h3>
            <div class="header-account-info">
              <span class="account-name">{{ currentAccount?.Name || currentAccount?.name }}</span>
              <span class="account-email">{{ currentAccount?.Email || currentAccount?.email }}</span>
            </div>
          </div>
          <n-button v-if="isRoot" size="small" type="warning" ghost @click="openPackageModal()">
            <template #icon><n-icon><TimeOutline /></n-icon></template>
            变更套餐
          </n-button>
        </div>
      </template>

      <!-- Tab 内容区域 -->
      <n-tabs type="line" animated class="edit-tabs">
        <!-- 基础信息 Tab -->
        <n-tab-pane name="basic">
          <template #tab>
            <div class="tab-title">
              <n-icon size="16"><CreateOutline /></n-icon>
              <span>基础信息</span>
            </div>
          </template>
          <div class="tab-content">
            <n-form :model="editForm" label-placement="left" label-width="100">
              <!-- 账户信息分组 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">👤</span>
                  <h4>账户信息</h4>
                </div>
                <div class="form-row-2">
                  <n-form-item label="显示别名">
                    <n-input v-model:value="editForm.alias" placeholder="控制台展示名称" />
                  </n-form-item>
                  <n-form-item label="账户状态">
                    <n-select
                      v-model:value="editForm.status"
                      :options="[
                        { label: '不修改', value: null },
                        { label: '启用', value: true },
                        { label: '禁用', value: false }
                      ]"
                    />
                  </n-form-item>
                </div>
                <div class="form-row-2">
                  <n-form-item label="账户邮箱">
                    <n-input v-model:value="editForm.email" placeholder="用于登录的邮箱地址" />
                  </n-form-item>
                  <n-form-item label="账单邮箱">
                    <n-input v-model:value="editForm.billingEmail" placeholder="接收账单通知的邮箱" />
                  </n-form-item>
                </div>
              </div>

              <!-- 权限配置分组 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">🔐</span>
                  <h4>权限配置</h4>
                </div>
                <div class="form-row-3">
                  <n-form-item label="允许的分组">
                    <n-input-number v-model:value="editForm.level" :min="0" style="width: 100%" placeholder="Level" />
                  </n-form-item>
                  <n-form-item label="角色权限">
                    <n-input-number v-model:value="editForm.role" :min="0" style="width: 100%" placeholder="Role" />
                  </n-form-item>
                  <n-form-item label="档位配置">
                    <n-input-number v-model:value="editForm.gear" :min="0" style="width: 100%" placeholder="Gear" />
                  </n-form-item>
                </div>
                <div class="form-row-2">
                  <n-form-item label="费率倍数">
                    <n-input-number v-model:value="editForm.rates" :min="0" :step="0.1" style="width: 100%" placeholder="计费倍率" />
                  </n-form-item>
                  <n-form-item label="计费因子">
                    <n-input-number v-model:value="editForm.factor" :min="0" :step="0.1" style="width: 100%" placeholder="Factor" />
                  </n-form-item>
                </div>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 额度限制 Tab -->
        <n-tab-pane name="limits">
          <template #tab>
            <div class="tab-title">
              <n-icon size="16"><CashOutline /></n-icon>
              <span>额度限制</span>
            </div>
          </template>
          <div class="tab-content">
            <n-form :model="editForm" label-placement="left" label-width="120">
              <!-- 消费限额 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">💰</span>
                  <h4>消费限额</h4>
                </div>
                <div class="form-row-2">
                  <n-form-item label="每月限额">
                    <n-input-number v-model:value="editForm.hardLimit" :min="0" style="width: 100%" placeholder="月度最高花费">
                      <template #suffix>USD</template>
                    </n-input-number>
                  </n-form-item>
                  <n-form-item label="每日限额">
                    <n-input-number v-model:value="editForm.dailyLimit" :min="0" style="width: 100%" placeholder="每日最高花费">
                      <template #suffix>USD</template>
                    </n-input-number>
                  </n-form-item>
                </div>
                <div class="form-row-2">
                  <n-form-item label="预警额度">
                    <n-input-number v-model:value="editForm.softLimit" :min="0" style="width: 100%" placeholder="预警额度">
                      <template #suffix>USD</template>
                    </n-input-number>
                  </n-form-item>
                  <n-form-item label="自动充值额度">
                    <n-input-number v-model:value="editForm.autoQuota" :min="0" style="width: 100%" placeholder="自动充值额度">
                      <template #suffix>USD</template>
                    </n-input-number>
                  </n-form-item>
                </div>
              </div>

              <!-- 子账户配额 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">👥</span>
                  <h4>子账户配额</h4>
                </div>
                <n-form-item label="子账户数量限制">
                  <n-input-number v-model:value="editForm.childLimit" :min="0" style="width: 100%" placeholder="最多可创建的子账户数量">
                    <template #suffix>个</template>
                  </n-input-number>
                </n-form-item>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 速率限制 Tab -->
        <n-tab-pane name="rate">
          <template #tab>
            <div class="tab-title">
              <n-icon size="16"><FlashOutline /></n-icon>
              <span>速率控制</span>
            </div>
          </template>
          <div class="tab-content">
            <n-form :model="editForm" label-placement="left" label-width="100">
              <!-- 全局请求速率 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">⚡</span>
                  <h4>请求速率限制</h4>
                </div>
                <div class="form-row-3">
                  <n-form-item label="每分钟请求数">
                    <n-input-number v-model:value="editForm.rpm" :min="0" style="width: 100%" placeholder="RPM">
                      <template #suffix>次</template>
                    </n-input-number>
                  </n-form-item>
                  <n-form-item label="每小时请求数">
                    <n-input-number v-model:value="editForm.rph" :min="0" style="width: 100%" placeholder="RPH">
                      <template #suffix>次</template>
                    </n-input-number>
                  </n-form-item>
                  <n-form-item label="每天请求数">
                    <n-input-number v-model:value="editForm.rpd" :min="0" style="width: 100%" placeholder="RPD">
                      <template #suffix>次</template>
                    </n-input-number>
                  </n-form-item>
                </div>
              </div>

              <!-- Token 速率 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">🔷</span>
                  <h4>Token 速率限制</h4>
                </div>
                <div class="form-row-3">
                  <n-form-item label="每分钟 Token">
                    <n-input-number v-model:value="editForm.tpm" :min="0" style="width: 100%" placeholder="TPM">
                      <template #suffix>tokens</template>
                    </n-input-number>
                  </n-form-item>
                  <n-form-item label="每小时 Token">
                    <n-input-number v-model:value="editForm.tph" :min="0" style="width: 100%" placeholder="TPH">
                      <template #suffix>tokens</template>
                    </n-input-number>
                  </n-form-item>
                  <n-form-item label="每天 Token">
                    <n-input-number v-model:value="editForm.tpd" :min="0" style="width: 100%" placeholder="TPD">
                      <template #suffix>tokens</template>
                    </n-input-number>
                  </n-form-item>
                </div>
              </div>

              <!-- 单个模型速率 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">🎯</span>
                  <h4>单个模型速率限制</h4>
                </div>
                <div class="model-limits-list">
                  <div v-for="(item, index) in editForm.modelLimitsList" :key="index" class="model-limit-row">
                    <div class="model-limit-field">
                      <label>模型名称</label>
                      <n-input
                        v-model:value="item.model"
                        placeholder="例如: gpt-4, claude-3-opus"
                      />
                    </div>
                    <div class="model-limit-field">
                      <label>每分钟请求</label>
                      <n-input-number
                        v-model:value="item.rpm"
                        :min="0"
                        placeholder="RPM"
                        style="width: 100%"
                      >
                        <template #suffix>次/分</template>
                      </n-input-number>
                    </div>
                    <div class="model-limit-field">
                      <label>每分钟Token</label>
                      <n-input-number
                        v-model:value="item.tpm"
                        :min="0"
                        placeholder="TPM"
                        style="width: 100%"
                      >
                        <template #suffix>tokens/分</template>
                      </n-input-number>
                    </div>
                    <n-button text type="error" @click="removeModelLimit(index)" class="remove-btn">
                      <template #icon><n-icon><TrashOutline /></n-icon></template>
                    </n-button>
                  </div>
                  <n-button dashed block @click="addModelLimit">
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    添加模型限制
                  </n-button>
                </div>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 访问控制 Tab -->
        <n-tab-pane name="access">
          <template #tab>
            <div class="tab-title">
              <n-icon size="16"><KeyOutline /></n-icon>
              <span>访问控制</span>
            </div>
          </template>
          <div class="tab-content">
            <n-form :model="editForm" label-placement="top">
              <div class="access-control-section">
                <n-alert type="info" :bordered="false" style="margin-bottom: 20px;">
                  通过白名单控制用户的访问权限，留空表示不限制
                </n-alert>
                <div class="access-grid">
                  <div class="access-card">
                    <div class="access-card-header">
                      <span class="access-icon">🌐</span>
                      <h5>IP 白名单</h5>
                    </div>
                    <n-dynamic-tags v-model:value="editForm.allowIPsList" />
                    <p class="access-hint">限制只允许这些IP地址访问</p>
                  </div>

                  <div class="access-card">
                    <div class="access-card-header">
                      <span class="access-icon">🤖</span>
                      <h5>模型白名单</h5>
                    </div>
                    <n-dynamic-tags v-model:value="editForm.allowModelsList" />
                    <p class="access-hint">只允许使用这些模型，支持通配符如 gpt-4*</p>
                  </div>

                  <div class="access-card">
                    <div class="access-card-header">
                      <span class="access-icon">📦</span>
                      <h5>允许的分组</h5>
                    </div>
                    <n-dynamic-tags v-model:value="editForm.allowLevelsList" />
                    <p class="access-hint">限制只能访问这些分组的Provider</p>
                  </div>

                  <div class="access-card">
                    <div class="access-card-header">
                      <span class="access-icon">🔌</span>
                      <h5>API 路径白名单</h5>
                    </div>
                    <n-dynamic-tags v-model:value="editForm.resourcesList" />
                    <p class="access-hint">只允许访问这些API路径，如 /v1/chat/completions</p>
                  </div>
                </div>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- 高级配置 Tab -->
        <n-tab-pane name="advanced">
          <template #tab>
            <div class="tab-title">
              <n-icon size="16"><SwapHorizontalOutline /></n-icon>
              <span>高级配置</span>
            </div>
          </template>
          <div class="tab-content">
            <n-form :model="editForm" label-placement="top">
              <n-alert type="warning" :bordered="false" style="margin-bottom: 20px;">
                高级配置项，如不了解请勿随意修改
              </n-alert>

              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">📱</span>
                  <h4>其他配置</h4>
                </div>
                <n-form-item label="二维码数据">
                  <n-input v-model:value="editForm.qrcode" placeholder="可选，用于生成二维码" />
                </n-form-item>
              </div>

              <!-- 模型映射 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">🔄</span>
                  <h4>模型映射配置</h4>
                </div>
                <p class="section-desc">将用户请求的模型名称映射到实际调用的模型，例如将 gpt-4 映射到 gpt-4-turbo</p>
                <div class="mapper-list">
                  <div v-for="(item, index) in editForm.modelMapperList" :key="index" class="mapper-row">
                    <div class="mapper-field">
                      <label>用户请求的模型名</label>
                      <n-input
                        v-model:value="item.key"
                        placeholder="例如: gpt-4"
                      />
                    </div>
                    <div class="mapper-arrow">
                      <n-icon size="20" color="#2080f0"><ArrowForwardOutline /></n-icon>
                    </div>
                    <div class="mapper-field">
                      <label>实际调用的模型名</label>
                      <n-input
                        v-model:value="item.value"
                        placeholder="例如: gpt-4-turbo"
                      />
                    </div>
                    <n-button text type="error" @click="removeModelMapper(index)" class="remove-btn">
                      <template #icon><n-icon><TrashOutline /></n-icon></template>
                    </n-button>
                  </div>
                  <n-button dashed block @click="addModelMapper">
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    添加模型映射
                  </n-button>
                </div>
              </div>

              <!-- 分组路由 -->
              <div class="form-section">
                <div class="section-header">
                  <span class="section-icon">🔀</span>
                  <h4>分组路由配置</h4>
                </div>
                <p class="section-desc">配置模型到分组的路由规则，例如将gpt-4模型路由到分组1，将claude-3模型路由到分组2</p>
                <div class="mapper-list">
                  <div v-for="(item, index) in editForm.levelMapperList" :key="index" class="mapper-row">
                    <div class="mapper-field">
                      <label>模型名 (支持通配符*)</label>
                      <n-input
                        v-model:value="item.key"
                        placeholder="例如: gpt-4* 或 claude-*"
                      />
                    </div>
                    <div class="mapper-arrow">
                      <n-icon size="20" color="#10b981"><ArrowForwardOutline /></n-icon>
                    </div>
                    <div class="mapper-field">
                      <label>分组号</label>
                      <n-input
                        v-model:value="item.value"
                        placeholder="例如: 1"
                      />
                    </div>
                    <n-button text type="error" @click="removeLevelMapper(index)" class="remove-btn">
                      <template #icon><n-icon><TrashOutline /></n-icon></template>
                    </n-button>
                  </div>
                  <n-button dashed block @click="addLevelMapper">
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    添加分组路由
                  </n-button>
                </div>
              </div>
            </n-form>
          </div>
        </n-tab-pane>
      </n-tabs>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="editModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleUpdate">
            <template #icon><n-icon><CreateOutline /></n-icon></template>
            保存修改
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 快速充值/扣钱模态框 -->
    <n-modal
      v-model:show="creditModalVisible"
      preset="card"
      title="充值新卡"
      size="medium"
      :mask-closable="false"
      style="max-width: 500px"
    >
      <div class="account-info-banner">
        <div class="info-item">
          <span class="label">账户：</span>
          <span class="value">{{ currentAccount?.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前余额：</span>
          <span class="value">{{ formatCurrency(calculateBalance(currentAccount || {})) }}</span>
        </div>
      </div>
      <n-form ref="creditFormRef" :model="creditForm" label-placement="left" label-width="100">
        <n-form-item label="调整额度" required>
          <n-input-number
            v-model:value="creditForm.amount"
            :step="5"
            style="width: 100%"
            placeholder="正数充值，负数扣减"
          >
            <template #suffix>USD</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="有效期" required>
          <n-input-number
            v-model:value="creditForm.days"
            :min="1"
            :step="1"
            style="width: 100%"
            placeholder="充值有效期天数"
          >
            <template #suffix>天</template>
          </n-input-number>
          <template #feedback>
            <span style="font-size: 0.85rem; color: var(--daw-text-secondary)">充值金额将在指定天数后过期，默认365天（1年）</span>
          </template>
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="creditForm.memo"
            type="textarea"
            placeholder="可选，写入操作日志"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
        <n-alert type="info" :show-icon="false" style="margin-top: 12px">
          <template v-if="creditForm.amount > 0">
            本次操作将为账户充值 <strong>{{ formatCurrency(creditForm.amount) }}</strong>，有效期 <strong>{{ creditForm.days }} 天</strong>
          </template>
          <template v-else-if="creditForm.amount < 0">
            本次操作将从账户扣减 <strong>{{ formatCurrency(Math.abs(creditForm.amount)) }}</strong>
          </template>
          <template v-else>
            请输入调整额度
          </template>
        </n-alert>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="creditModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleCredit">
            确认调整
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 套餐到期调整模态框（仅 root 可见） -->
    <n-modal
      v-if="isRoot"
      v-model:show="packageModalVisible"
      preset="card"
      title="调整余额 / 套餐"
      size="huge"
      :mask-closable="false"
      style="max-width: 900px"
    >
      <div class="account-info-banner">
        <div class="info-item">
          <span class="label">账户：</span>
          <span class="value">{{ currentAccount?.name || currentAccount?.Name }}</span>
        </div>
        <div class="info-item">
          <span class="label">标识：</span>
          <span class="value">{{ currentAccount?.ID || currentAccount?.id || '--' }}</span>
        </div>
      </div>
      <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
        请选择需要调整的余额明细卡片，然后选择操作类型生成 XCredit 指令。
      </n-alert>
      <div class="xcredit-modal-layout">
        <div class="xcredit-credit-list">
          <template v-if="creditEntries.length">
            <div
              v-for="(credit, idx) in creditEntries"
              :key="credit.Reference || credit.reference || idx"
              :class="['credit-manage-item', { active: credit === selectedCredit }]"
            >
              <div class="credit-manage-info">
                <div class="credit-row">
                  <span class="label">Reference</span>
                  <span class="value">{{ credit.Reference || credit.reference || '--' }}</span>
                </div>
                <div class="credit-row">
                  <span class="label">余额</span>
                  <span class="value">{{ formatCurrency((credit.Balance || credit.balance || credit.Amount || credit.amount) || 0) }}</span>
                </div>
                <div class="credit-row">
                  <span class="label">到期</span>
                  <span class="value">{{ formatDateTime((credit.ExpiresAt || credit.expires_at), 'YYYY-MM-DD') || '--' }}</span>
                </div>
                <div class="credit-row" v-if="credit.Memo || credit.memo">
                  <span class="label">备注</span>
                  <span class="value">{{ credit.Memo || credit.memo }}</span>
                </div>
              </div>
              <n-button size="small" type="primary" ghost @click="selectCredit(credit)">
                选择调整
              </n-button>
            </div>
          </template>
          <n-alert v-else type="warning" :show-icon="false">
            当前账户暂无余额明细可调整。
          </n-alert>
        </div>

        <div v-if="selectedCredit" class="xcredit-form-panel">
          <n-form :model="xCreditForm" label-placement="left" label-width="120">
            <n-form-item label="Reference">
              <n-input :value="selectedReference" disabled />
            </n-form-item>
            <n-form-item label="操作类型">
              <n-select
                v-model:value="xCreditForm.mode"
                :options="xCreditModeOptions"
                style="width: 100%"
              />
            </n-form-item>

            <n-form-item v-if="xCreditForm.mode === 'expiry'" label="到期调整">
              <div class="xcredit-inline">
                <n-select
                  v-model:value="xCreditForm.direction"
                  :options="directionOptions"
                  style="width: 160px"
                />
                <n-input-number
                  v-model:value="xCreditForm.value"
                  :min="1"
                  style="width: 140px"
                  placeholder="数值"
                />
                <n-select
                  v-model:value="xCreditForm.unit"
                  :options="expiryUnitOptions"
                  style="width: 140px"
                />
              </div>
              <template #feedback>
                使用 +d / -d / d+ / d- 语法，如 +30 天、+1 月、+1 年等。
              </template>
            </n-form-item>

            <n-form-item v-if="xCreditForm.mode === 'balance'" label="余额调整">
              <div class="xcredit-inline">
                <n-select
                  v-model:value="xCreditForm.direction"
                  :options="directionOptions"
                  style="width: 160px"
                />
                <n-input-number
                  v-model:value="xCreditForm.amount"
                  :min="0"
                  style="width: 200px"
                  placeholder="金额 (USD)"
                >
                  <template #suffix>USD</template>
                </n-input-number>
              </div>
              <template #feedback>
                使用 +b / -b / b+ / b- 语法直接调整余额。
              </template>
            </n-form-item>

            <n-form-item v-if="xCreditForm.mode === 'rename'" label="新 Reference">
              <n-input
                v-model:value="xCreditForm.newReference"
                placeholder="输入新的 reference 名称"
              />
            </n-form-item>

            <n-alert
              v-if="xCreditForm.mode === 'delete'"
              type="warning"
              :show-icon="false"
              style="margin-bottom: 8px"
            >
              将删除整个余额卡片，谨慎操作。
            </n-alert>

            <n-form-item v-if="xCreditForm.mode === 'custom'" label="自定义指令">
              <n-input
                v-model:value="xCreditForm.raw"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="完整的 XCredit 指令，例如：InitialFunding from parent+d30"
              />
            </n-form-item>
          </n-form>

          <n-alert
            v-if="generatedXCredit"
            type="info"
            :show-icon="false"
            class="xcredit-preview"
          >
            将发送指令：
            <code>{{ generatedXCredit }}</code>
          </n-alert>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="packageModalVisible = false">取消</n-button>
          <n-button type="warning" :disabled="!canSubmitXCredit" :loading="xCreditSubmitting" @click="handleXCreditSubmit">
            确认执行
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 查看详情模态框 -->
    <n-modal
      v-model:show="detailModalVisible"
      preset="card"
      title="账户详情"
      size="large"
      style="max-width: 700px"
    >
      <div v-if="currentAccount" class="detail-content">
        <n-descriptions :column="2" bordered size="small">
          <n-descriptions-item label="ID">{{ currentAccount.ID || currentAccount.id }}</n-descriptions-item>
          <n-descriptions-item label="用户名">{{ currentAccount.Name || currentAccount.name }}</n-descriptions-item>
          <n-descriptions-item label="邮箱">{{ currentAccount.Email || currentAccount.email }}</n-descriptions-item>
          <n-descriptions-item label="别名">{{ currentAccount.Alias || currentAccount.alias || '--' }}</n-descriptions-item>
          <n-descriptions-item label="账单邮箱">{{ currentAccount.BillingEmail || currentAccount.billing_email || '--' }}</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="(currentAccount.Status ?? currentAccount.status) === false ? 'error' : 'success'" size="small">
              {{ (currentAccount.Status ?? currentAccount.status) === false ? '已禁用' : '正常' }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="余额">{{ formatCurrency(calculateBalance(currentAccount || {})) }}</n-descriptions-item>
          <n-descriptions-item label="额度已用">{{ formatCurrency((currentAccount.CreditUsed || currentAccount.credit_used) || 0) }}</n-descriptions-item>
          <n-descriptions-item label="总额度">{{ formatCurrency(calculateTotalCredit(currentAccount || {})) }}</n-descriptions-item>
          <n-descriptions-item label="DNA">{{ currentAccount.DNA || currentAccount.dna || '--' }}</n-descriptions-item>

          <n-descriptions-item label="Level">{{ currentAccount.Level || currentAccount.level || '--' }}</n-descriptions-item>
          <n-descriptions-item label="Role">{{ currentAccount.Role || currentAccount.role || '--' }}</n-descriptions-item>
          <n-descriptions-item label="Gear">{{ currentAccount.Gear || currentAccount.gear || '--' }}</n-descriptions-item>
          <n-descriptions-item label="Tier">{{ currentAccount.Tier || currentAccount.tier || '--' }}</n-descriptions-item>
          <n-descriptions-item label="Rates">{{ currentAccount.Rates || currentAccount.rates || '--' }}</n-descriptions-item>
          <n-descriptions-item label="Factor">{{ currentAccount.Factor || currentAccount.factor || '--' }}</n-descriptions-item>
          <n-descriptions-item label="子级数量">{{ currentAccount.Child || currentAccount.child || 0 }}</n-descriptions-item>

          <n-descriptions-item label="每月限额">
            {{ formatCurrency((currentAccount.HardLimit ?? currentAccount.hard_limit) || 0) }}
          </n-descriptions-item>
          <n-descriptions-item label="每日限额">
            {{ formatCurrency((currentAccount.DailyLimit ?? currentAccount.daily_limit) || 0) }}
          </n-descriptions-item>
          <n-descriptions-item label="预警额度">
            {{ formatCurrency((currentAccount.SoftLimit ?? currentAccount.soft_limit) || 0) }}
          </n-descriptions-item>
          <n-descriptions-item label="自动充值额度">
            {{ formatCurrency((currentAccount.AutoQuota ?? currentAccount.auto_quota) || 0) }}
          </n-descriptions-item>
          <n-descriptions-item label="子账户数量限制">{{ currentAccount.ChildLimit || currentAccount.child_limit || '--' }}</n-descriptions-item>

          <n-descriptions-item label="RPM">{{ currentAccount.RPM || currentAccount.rpm || '--' }}</n-descriptions-item>
          <n-descriptions-item label="RPH">{{ currentAccount.RPH || currentAccount.rph || '--' }}</n-descriptions-item>
          <n-descriptions-item label="RPD">{{ currentAccount.RPD || currentAccount.rpd || '--' }}</n-descriptions-item>
          <n-descriptions-item label="TPM">{{ currentAccount.TPM || currentAccount.tpm || '--' }}</n-descriptions-item>
          <n-descriptions-item label="TPH">{{ currentAccount.TPH || currentAccount.tph || '--' }}</n-descriptions-item>
          <n-descriptions-item label="TPD">{{ currentAccount.TPD || currentAccount.tpd || '--' }}</n-descriptions-item>

          <n-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentAccount.CreatedAt || currentAccount.create_at) }}
          </n-descriptions-item>
          <n-descriptions-item label="QR Code" :span="2" v-if="currentAccount.QRCode || currentAccount.qrcode || currentAccount.qr_code">
            {{ currentAccount.QRCode || currentAccount.qrcode || currentAccount.qr_code }}
          </n-descriptions-item>
        </n-descriptions>

        <div v-if="(currentAccount.AllowIPs || currentAccount.allow_ips)?.length" class="extra-section">
          <h4>允许 IP</h4>
          <n-tag v-for="ip in (currentAccount.AllowIPs || currentAccount.allow_ips)" :key="ip" type="info" style="margin: 4px" size="small">
            {{ ip }}
          </n-tag>
        </div>

        <div v-if="(currentAccount.AllowModels || currentAccount.allow_models)?.length" class="extra-section">
          <h4>允许模型</h4>
          <n-tag v-for="model in (currentAccount.AllowModels || currentAccount.allow_models)" :key="model" type="success" style="margin: 4px" size="small">
            {{ model }}
          </n-tag>
        </div>

        <div v-if="(currentAccount.AllowLevels || currentAccount.allow_levels)?.length" class="extra-section">
          <h4>允许的分组</h4>
          <n-tag v-for="level in (currentAccount.AllowLevels || currentAccount.allow_levels)" :key="level" type="warning" style="margin: 4px" size="small">
            {{ level }}
          </n-tag>
        </div>

        <div v-if="(currentAccount.Resources || currentAccount.resources)?.length" class="extra-section">
          <h4>Resources</h4>
          <n-tag v-for="res in (currentAccount.Resources || currentAccount.resources)" :key="res" type="default" style="margin: 4px" size="small">
            {{ res }}
          </n-tag>
        </div>

        <div v-if="currentAccount.ModelMapper || currentAccount.model_mapper" class="extra-section">
          <h4>Model Mapper</h4>
          <pre class="json-display">{{ JSON.stringify((currentAccount.ModelMapper || currentAccount.model_mapper), null, 2) }}</pre>
        </div>

        <div v-if="currentAccount.LevelMapper || currentAccount.level_mapper" class="extra-section">
          <h4>Level Mapper</h4>
          <pre class="json-display">{{ JSON.stringify((currentAccount.LevelMapper || currentAccount.level_mapper), null, 2) }}</pre>
        </div>

        <div v-if="currentAccount.ModelLimits || currentAccount.model_limits" class="extra-section">
          <h4>Model Limits</h4>
          <pre class="json-display">{{ JSON.stringify((currentAccount.ModelLimits || currentAccount.model_limits), null, 2) }}</pre>
        </div>

        <div v-if="(currentAccount.CreditBalance || currentAccount.credit_balance)?.length" class="extra-section">
          <div class="credit-balance-header">
            <h4>充值卡明细</h4>
            <div class="credit-balance-summary">
              <span class="summary-item">
                <span class="summary-label">总额度：</span>
                <span class="summary-value">{{ formatCurrency(getAccountTotalAmount(currentAccount)) }}</span>
              </span>
              <span class="summary-item">
                <span class="summary-label">当前余额：</span>
                <span class="summary-value primary">{{ formatCurrency(calculateBalance(currentAccount)) }}</span>
              </span>
            </div>
          </div>
          <div class="credit-list">
            <div 
              v-for="(credit, idx) in getProcessedCredits(currentAccount)" 
              :key="idx" 
              class="credit-item-card"
              :class="{
                'is-active': credit.isActive,
                'is-expired': credit.isExpired,
                'is-depleted': credit.isDepleted
              }"
            >
              <div class="credit-card-header">
                <div class="credit-card-title">
                  <span class="label">Reference</span>
                  <span class="value">{{ credit.reference || '--' }}</span>
                </div>
                <div class="credit-card-badges">
                  <span v-if="credit.isActive" class="status-badge status-active">使用中</span>
                  <span v-if="credit.isExpired" class="status-badge status-expired">已过期</span>
                  <span v-if="credit.isDepleted && !credit.isExpired" class="status-badge status-depleted">已用完</span>
                </div>
              </div>

              <div class="credit-card-amount">
                <span class="amount-label">余额</span>
                <span class="amount-value">{{ formatCurrency(credit.balance) }}</span>
                <span class="amount-total">/ {{ formatCurrency(credit.amount) }}</span>
              </div>

              <!-- 进度条 -->
              <div class="credit-card-progress">
                <div 
                  class="progress-bar" 
                  :class="{
                    'progress-depleted': credit.isDepleted && !credit.isExpired,
                    'progress-expired': credit.isExpired,
                    'progress-active': credit.isActive
                  }"
                >
                  <div 
                    class="progress-fill" 
                    :style="{ width: credit.usagePercentage + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ credit.usagePercentage.toFixed(1) }}%</span>
              </div>

              <div class="credit-card-footer">
                <div class="credit-item-row">
                  <span class="label">到期时间</span>
                  <span class="value" :class="{ 'text-warning': credit.isExpiringSoon && !credit.isExpired }">
                    {{ formatDateTime(credit.expiresAt, 'YYYY-MM-DD HH:mm') }}
                  </span>
                </div>
                <div v-if="credit.memo" class="credit-item-row">
                  <span class="label">备注</span>
                  <span class="value">{{ credit.memo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="detailModalVisible = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 创建成功结果模态框 -->
    <n-modal
      v-model:show="createResultModalVisible"
      preset="card"
      title="子账户创建成功"
      size="medium"
      :mask-closable="false"
      style="max-width: 600px"
    >
      <div class="create-result-content">
        <n-alert type="success" title="账户创建成功">
          子账户已创建，请妥善保存以下密钥。密钥仅显示一次，关闭后无法再次查看。
        </n-alert>

        <div class="key-display-section">
          <div class="key-label">新账户密钥</div>
          <div class="key-display-value">{{ newCreatedKey }}</div>
          <n-button type="primary" @click="copyNewKey" style="margin-top: 12px">
            <template #icon>
              <n-icon><CashOutline /></n-icon>
            </template>
            复制密钥
          </n-button>
        </div>

        <n-alert type="warning" :show-icon="false" style="margin-top: 20px">
          <ul style="margin: 8px 0; padding-left: 20px">
            <li>请立即复制并保存此密钥</li>
            <li>密钥关闭后无法再次查看</li>
            <li>请勿将密钥分享给他人</li>
          </ul>
        </n-alert>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button type="primary" @click="closeCreateResultModal">
            我已保存，关闭窗口
          </n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup>
import { h, ref, computed, onMounted, watch } from 'vue';
import {
  NCard,
  NButton,
  NInput,
  NInputNumber,
  NIcon,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NAlert,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NPopconfirm,
  NDivider,
  NSelect,
  NTabs,
  NTabPane,
  NDynamicTags,
  NPopover,
  useMessage,
} from 'naive-ui';
import BackToTop from '@/components/common/BackToTop.vue';
import {
  SearchOutline,
  AddOutline,
  RefreshOutline,
  CreateOutline,
  CashOutline,
  TrashOutline,
  EyeOutline,
  FlashOutline,
  PulseOutline,
  SwapHorizontalOutline,
  GitNetworkOutline,
  ArrowForwardOutline,
  InformationCircleOutline,
  TimeOutline,
  CubeOutline,
} from '@vicons/ionicons5';
import {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getDescendants,
  getDescendant,
  postUserXCredit,
} from '@/api/accounts';
import { getLiveStatusWithKey } from '@/api/dashboard';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useAuthStore } from '@/store/auth';

const message = useMessage();
const authStore = useAuthStore();
const isRoot = computed(() => authStore.isRoot);

// 当前用户自己的配置信息（用于校验子账户不能超过父账户的限制）
const parentLimits = ref(null);

// 数据状态
const allAccountsData = ref([]); // 所有账户数据
const loading = ref(false);
const submitting = ref(false);
const searchName = ref('');
const searchEmail = ref('');
const searchId = ref('');

// 筛选条件
const filterForm = ref({
  level: null,
  identifier: '', // 支持特殊路径过滤器 (L{n}, G{n}, R{n}, T{n}, F{n}, .{dna})
});

// 模态框状态
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const creditModalVisible = ref(false);
const packageModalVisible = ref(false);
const detailModalVisible = ref(false);
const createResultModalVisible = ref(false);
const currentAccount = ref(null);
const newCreatedKey = ref('');

// 表单数据
const createForm = ref({
  name: '',
  email: '',
  credit: 10,
  alias: '',
  billingEmail: '',
});

const editForm = ref({
  alias: '',
  email: '',
  billingEmail: '',
  status: null,
  level: null,
  role: null,
  gear: null,
  rates: null,
  factor: null,
  hardLimit: null,
  softLimit: null,
  autoQuota: null,
  childLimit: null,
  rpm: null,
  rph: null,
  rpd: null,
  tpm: null,
  tph: null,
  tpd: null,
  allowIPsList: [],
  allowModelsList: [],
  allowLevelsList: [],
  resourcesList: [],
  modelMapperList: [],
  levelMapperList: [],
  modelLimitsList: [],  // 单个模型速率限制列表
  qrcode: '',
});

// 保存表单初始值，用于对比是否修改
const initialEditForm = ref({});

const creditForm = ref({
  amount: 10,
  memo: '',
  days: 365, // 默认有效期365天（1年）
});
const selectedCredit = ref(null);
const xCreditSubmitting = ref(false);
const xCreditForm = ref({
  mode: 'expiry',
  unit: 'd',
  direction: 'add',
  value: 30,
  amount: 100,
  newReference: '',
  raw: '',
});

const xCreditModeOptions = [
  { label: '调整有效期', value: 'expiry' },
  { label: '调整余额', value: 'balance' },
  { label: '修改名称', value: 'rename' },
  { label: '删除卡片', value: 'delete' },
  { label: '自定义指令', value: 'custom' },
];

const expiryUnitOptions = [
  { label: '天 (d)', value: 'd' },
  { label: '月 (m)', value: 'm' },
  { label: '年 (y)', value: 'y' },
];

const directionOptions = [
  { label: '延长 / 增加', value: 'add' },
  { label: '缩短 / 减少', value: 'subtract' },
];

const creditEntries = computed(() => {
  const account = currentAccount.value;
  if (!account) return [];
  const credits = account.CreditBalance || account.credit_balance;
  return Array.isArray(credits) ? credits : [];
});

const selectedReference = computed(() => {
  if (!selectedCredit.value) return '';
  return selectedCredit.value.Reference || selectedCredit.value.reference || '';
});

const generatedXCredit = computed(() => {
  const reference = selectedReference.value;
  if (!reference) {
    return (xCreditForm.value.mode === 'custom' ? (xCreditForm.value.raw || '').trim() : '');
  }

  switch (xCreditForm.value.mode) {
    case 'expiry': {
      const rawValue = Number(xCreditForm.value.value);
      if (!rawValue || Number.isNaN(rawValue)) return '';
      const absValue = Math.abs(Math.trunc(rawValue));
      if (!absValue) return '';
      const unit = xCreditForm.value.unit || 'd';
      const direction = xCreditForm.value.direction === 'subtract' ? 'subtract' : 'add';
      if (unit === 'd') {
        const prefix = direction === 'add' ? '+d' : '-d';
        return `${reference}${prefix}${absValue}`;
      }
      const signed = direction === 'add' ? absValue : -absValue;
      return `${reference}+d${signed}${unit}`;
    }
    case 'balance': {
      const amount = Number(xCreditForm.value.amount);
      if (!amount || Number.isNaN(amount)) return '';
      const absAmount = Math.abs(amount);
      if (!absAmount) return '';
      const prefix = xCreditForm.value.direction === 'subtract' ? '-b' : '+b';
      return `${reference}${prefix}${absAmount}`;
    }
    case 'rename': {
      const newName = (xCreditForm.value.newReference || '').trim();
      if (!newName) return '';
      return `${reference}=${newName}`;
    }
    case 'delete': {
      return reference;
    }
    case 'custom': {
      return (xCreditForm.value.raw || '').trim();
    }
    default:
      return '';
  }
});

const canSubmitXCredit = computed(() => Boolean(generatedXCredit.value));

const currentPage = ref(1);
const pageSize = ref(20);

// 前端筛选后的账户列表
const allAccounts = computed(() => {
  let result = [...allAccountsData.value];
  
  // 按 level 筛选
  if (filterForm.value.level !== null && filterForm.value.level !== undefined && filterForm.value.level !== '') {
    result = result.filter(account => {
      const level = account.Level || account.level;
      return level === filterForm.value.level;
    });
  }
  
  // 按用户名搜索
  if (searchName.value?.trim()) {
    const term = searchName.value.trim().toLowerCase();
    result = result.filter(account => {
      const name = account.Name || account.name || '';
      return name.toLowerCase().includes(term);
    });
  }
  
  // 按邮箱搜索
  if (searchEmail.value?.trim()) {
    const term = searchEmail.value.trim().toLowerCase();
    result = result.filter(account => {
      const email = account.Email || account.email || '';
      return email.toLowerCase().includes(term);
    });
  }
  
  // 按 ID 搜索
  if (searchId.value?.trim()) {
    const id = parseInt(searchId.value.trim(), 10);
    if (!isNaN(id)) {
      result = result.filter(account => {
        const accountId = account.ID || account.id;
        return accountId === id;
      });
    }
  }
  
  return result;
});

// 当前页显示的账户
const filteredAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allAccounts.value.slice(start, end);
});

// 总数
const totalCount = computed(() => allAccounts.value.length);

// 监听分页变化，滚动到顶部
watch([currentPage, pageSize], () => {
  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) {
    tableWrapper.scrollTop = 0;
  }
});

// 计算账户余额（累加CreditBalance数组的balance）
function calculateBalance(account) {
  const creditBalance = account.CreditBalance || account.credit_balance || [];
  if (!Array.isArray(creditBalance)) return 0;

  return creditBalance.reduce((sum, item) => {
    return sum + (item.balance || item.Balance || 0);
  }, 0);
}

// 计算总额度（累加CreditBalance数组的amount）
function calculateTotalCredit(account) {
  const creditBalance = account.CreditBalance || account.credit_balance || [];
  if (!Array.isArray(creditBalance)) return 0;

  return creditBalance.reduce((sum, item) => {
    return sum + (item.amount || item.Amount || 0);
  }, 0);
}

// 获取账户充值卡总额（amount字段的总和）
function getAccountTotalAmount(account) {
  const creditBalance = account.CreditBalance || account.credit_balance || [];
  if (!Array.isArray(creditBalance)) return 0;

  return creditBalance.reduce((sum, item) => {
    const amount = item.amount || item.Amount || item.balance || item.Balance || 0;
    return sum + amount;
  }, 0);
}

// 处理充值卡数据，添加进度条相关信息
function getProcessedCredits(account) {
  const creditBalance = account.CreditBalance || account.credit_balance || [];
  if (!Array.isArray(creditBalance)) return [];

  const now = new Date();

  const processedCredits = creditBalance.map(credit => {
    const expiresAt = credit.ExpiresAt || credit.expires_at;
    const balance = credit.Balance || credit.balance || 0;
    const amount = credit.Amount || credit.amount || balance;
    const reference = credit.Reference || credit.reference || '';
    const memo = credit.Memo || credit.memo || '';

    const expiresDate = new Date(expiresAt);
    const isExpired = expiresDate <= now;

    // 判断是否即将过期（7天内且未过期）
    const daysUntilExpiry = (expiresDate - now) / (1000 * 60 * 60 * 24);
    const isExpiringSoon = !isExpired && daysUntilExpiry <= 7;

    // 判断是否正在使用（balance 小于 amount）
    const isActive = balance < amount && balance > 0 && !isExpired;

    // 判断是否余额已用完
    const isDepleted = balance <= 0;

    // 计算使用百分比
    const usagePercentage = amount > 0 ? ((amount - balance) / amount) * 100 : 0;

    return {
      reference,
      balance,
      amount,
      expiresAt,
      memo,
      isExpired,
      isExpiringSoon,
      isActive,
      isDepleted,
      usagePercentage: Math.min(Math.max(usagePercentage, 0), 100),
    };
  });

  // 排序：使用中的在最前面，然后是有效的，最后是失效的；同类按到期时间排序
  return processedCredits.sort((a, b) => {
    // 优先级1：使用中的卡片排在最前面
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // 优先级2：有效的在前，失效的在后
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? 1 : -1;
    }
    
    // 优先级3：同类按到期时间排序
    return new Date(a.expiresAt) - new Date(b.expiresAt);
  });
}

// 表格列配置
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: { tooltip: true },
    render: (row) => row.ID || row.id || '--',
  },
  {
    title: '用户名',
    key: 'name',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row) => row.Name || row.name || '--',
  },
  {
    title: '邮箱',
    key: 'email',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => row.Email || row.email || '--',
  },
  {
    title: '余额',
    key: 'balance',
    width: 120,
    render: (row) => formatCurrency(calculateBalance(row), { scientific: true }),
  },
  {
    title: '额度已用',
    key: 'credit_used',
    width: 120,
    render: (row) => formatCurrency((row.CreditUsed ?? row.credit_used) || 0, { scientific: true }),
  },
  {
    title: '总额度',
    key: 'credit_granted',
    width: 120,
    render: (row) => formatCurrency(calculateTotalCredit(row), { scientific: true }),
  },
  {
    title: '每月限额',
    key: 'hard_limit',
    width: 120,
    render: (row) => {
      const limit = row.HardLimit ?? row.hard_limit;
      return limit !== undefined && limit !== null ? formatCurrency(limit, { scientific: true }) : '--';
    },
  },
  {
    title: '每日限额',
    key: 'daily_limit',
    width: 120,
    render: (row) => {
      const limit = row.DailyLimit ?? row.daily_limit;
      return limit !== undefined && limit !== null ? formatCurrency(limit, { scientific: true }) : '--';
    },
  },
  {
    title: 'Level',
    key: 'level',
    width: 80,
    render: (row) => (row.Level ?? row.level) || '--',
  },
  {
    title: '创建时间',
    key: 'create_at',
    width: 160,
    render: (row) => formatDateTime((row.CreatedAt || row.create_at), 'YYYY-MM-DD HH:mm'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 240,
    fixed: 'right',
    render: (row) => {
      const buttons = [
        h(
          NButton,
          {
            size: 'small',
            secondary: true,
            onClick: () => openDetailModal(row),
            title: '查看详情',
            style: 'margin: 0;'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(EyeOutline) }),
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => openEditModal(row),
            title: '编辑配置',
            style: 'margin: 0;'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
          }
        ),
      ];

      if (authStore.isRoot) {
        buttons.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'warning',
              ghost: true,
              onClick: () => openPackageModal(row),
              title: '变更套餐到期时间',
              style: 'margin: 0;'
            },
            {
              icon: () => h(NIcon, null, { default: () => h(TimeOutline) }),
            }
          )
        );
      }

      buttons.push(
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            ghost: true,
            onClick: () => openCreditModal(row),
            title: '充值/扣款',
            style: 'margin: 0;'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CashOutline) }),
          }
        )
      );

      buttons.push(
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row),
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  ghost: true,
                  title: '删除账户',
                  style: 'margin: 0;'
                },
                {
                  icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
                }
              ),
            default: () => '确定删除该子账户？此操作不可恢复！',
          }
        )
      );

      return h('div', { class: 'action-buttons', style: 'display: flex; gap: 6px;' }, buttons);
    },
  },
];

// 生命周期
onMounted(() => {
  refreshList();
  fetchParentLimits();
});

// 监听搜索关键词变化，自动触发搜索
watch([searchName, searchEmail, searchId], () => {
  currentPage.value = 1;
  refreshList();
});

// 获取当前用户的限制配置（用于校验子账户）
async function fetchParentLimits() {
  try {
    const response = await getLiveStatusWithKey(authStore.apiKey);
    parentLimits.value = response.data;
  } catch (error) {
    console.error('获取父账户限制失败:', error);
  }
}

// 刷新列表 - 使用后端分页
// 前端分页：一次性获取所有数据
async function refreshList() {
  loading.value = true;
  try {
    const params = {
      page: 1,
      size: 9999, // 获取大量数据
    };

    // 支持特殊路径过滤器
    if (filterForm.value.identifier && filterForm.value.identifier.trim()) {
      const identifier = filterForm.value.identifier.trim();
      // 使用路径参数方式调用，支持 L{n}, G{n}, R{n}, T{n}, F{n}, .{dna} 等特殊过滤器
      const response = await getDescendant(identifier, params);
      // 如果使用了特殊路径过滤器，返回的可能是单个用户或用户列表
      if (response.data.users) {
        allAccountsData.value = response.data.users || [];
      } else if (Array.isArray(response.data)) {
        allAccountsData.value = response.data;
      } else {
        // 单个用户
        allAccountsData.value = [response.data];
      }
    } else {
      // 普通列表查询
      const response = await getDescendants(params);
      allAccountsData.value = response.data.users || response.data || [];
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '获取子账户列表失败';
    message.error(errorMessage);
    allAccountsData.value = [];
  } finally {
    loading.value = false;
  }
}

// 重置筛选条件（前端分页，不需要重新加载数据）
function resetFilters() {
  filterForm.value = {
    level: null,
    identifier: '',
  };
  searchName.value = '';
  searchEmail.value = '';
  searchId.value = '';
  currentPage.value = 1;
}

// 应用筛选条件（前端分页，identifier变化需要重新加载）
function applyFilters() {
  currentPage.value = 1;
  // 如果使用了特殊过滤器，需要重新加载
  if (filterForm.value.identifier && filterForm.value.identifier.trim()) {
    refreshList();
  }
}

// 打开创建模态框
function openCreateModal() {
  createForm.value = {
    name: '',
    email: '',
    credit: 10,
    alias: '',
    billingEmail: '',
  };
  createModalVisible.value = true;
}

// 打开编辑模态框
function openEditModal(account) {
  currentAccount.value = account;

  // JSON对象转键值对数组
  const modelMapper = account.ModelMapper || account.model_mapper;
  const levelMapper = account.LevelMapper || account.level_mapper;
  const modelLimits = account.ModelLimits || account.model_limits;

  // 辅助函数：确保字段是数组（处理API返回空对象{}的情况）
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      return Object.keys(value);
    }
    return [];
  };

  // 将 ModelLimits 对象转换为列表
  // 格式: { "gpt-4": { "rpm": 30, "tpm": 90000 } } => [{ model: "gpt-4", rpm: 30, tpm: 90000 }]
  const modelLimitsList = modelLimits && typeof modelLimits === 'object'
    ? Object.entries(modelLimits).map(([model, limits]) => ({
        model,
        rpm: limits.rpm || limits.RPM || null,
        tpm: limits.tpm || limits.TPM || null,
      }))
    : [];

  const formData = {
    alias: account.Alias || account.alias || '',
    email: account.Email || account.email || '',
    billingEmail: account.BillingEmail || account.billing_email || '',
    status: account.Status === undefined ? null : account.Status,
    level: account.Level || account.level || null,
    role: account.Role || account.role || null,
    gear: account.Gear || account.gear || null,
    rates: account.Rates || account.rates || null,
    factor: account.Factor || account.factor || null,
    hardLimit: account.HardLimit || account.hard_limit || null,
    dailyLimit: account.DailyLimit || account.daily_limit || null,
    softLimit: account.SoftLimit || account.soft_limit || null,
    autoQuota: account.AutoQuota || account.auto_quota || null,
    childLimit: account.ChildLimit || account.child_limit || null,
    rpm: account.RPM || account.rpm || null,
    rph: account.RPH || account.rph || null,
    rpd: account.RPD || account.rpd || null,
    tpm: account.TPM || account.tpm || null,
    tph: account.TPH || account.tph || null,
    tpd: account.TPD || account.tpd || null,
    allowIPsList: toArray(account.AllowIPs || account.allow_ips),
    allowModelsList: toArray(account.AllowModels || account.allow_models),
    allowLevelsList: toArray(account.AllowLevels || account.allow_levels),
    resourcesList: toArray(account.Resources || account.resources),
    modelMapperList: modelMapper ? Object.entries(modelMapper).map(([key, value]) => ({ key, value })) : [],
    levelMapperList: levelMapper ? Object.entries(levelMapper).map(([key, value]) => ({ key, value })) : [],
    modelLimitsList: modelLimitsList,
    qrcode: account.QRCode || account.qrcode || account.qr_code || '',
  };

  editForm.value = { ...formData };
  // 深拷贝初始值用于对比
  initialEditForm.value = JSON.parse(JSON.stringify(formData));

  editModalVisible.value = true;
}

// Mapper 辅助函数
function addModelMapper() {
  editForm.value.modelMapperList.push({ key: '', value: '' });
}

function removeModelMapper(index) {
  editForm.value.modelMapperList.splice(index, 1);
}

function addLevelMapper() {
  editForm.value.levelMapperList.push({ key: '', value: '' });
}

function addModelLimit() {
  editForm.value.modelLimitsList.push({ model: '', rpm: null, tpm: null });
}

function removeModelLimit(index) {
  editForm.value.modelLimitsList.splice(index, 1);
}

function removeLevelMapper(index) {
  editForm.value.levelMapperList.splice(index, 1);
}

// 打开充值模态框
function openCreditModal(account) {
  currentAccount.value = account;
  creditForm.value = {
    amount: 10,
    memo: '',
    days: 365, // 默认有效期365天（1年）
  };
  creditModalVisible.value = true;
}

function resetXCreditForm() {
  xCreditForm.value = {
    mode: 'expiry',
    unit: 'd',
    direction: 'add',
    value: 30,
    amount: 100,
    newReference: '',
    raw: '',
  };
}

function selectCredit(credit) {
  selectedCredit.value = credit;
  resetXCreditForm();
  if (!credit) return;
  // 默认余额调整数值使用当前余额
  const balanceValue =
    credit.Balance ??
    credit.balance ??
    credit.Amount ??
    credit.amount ??
    0;
  xCreditForm.value.amount = Math.abs(Number(balanceValue)) || 100;
}

// 打开余额到期调整模态框（仅 root）
async function openPackageModal(account) {
  if (!authStore.isRoot) {
    message.error('仅 root 用户可执行该操作');
    return;
  }

  if (account) {
    currentAccount.value = account;
  }

  if (!currentAccount.value) {
    message.error('无法获取账户信息');
    return;
  }

  if (!creditEntries.value.length) {
    try {
      const identifier =
        currentAccount.value.ID ||
        currentAccount.value.id ||
        currentAccount.value.Name ||
        currentAccount.value.name;
      if (identifier) {
        const response = await getUser(identifier);
        currentAccount.value = response.data || currentAccount.value;
      }
    } catch (error) {
      console.error('获取账户余额明细失败:', error);
      message.error('获取账户余额明细失败，请稍后重试');
      return;
    }
  }

  packageModalVisible.value = true;
  const credits = creditEntries.value;
  if (credits.length > 0) {
    selectCredit(credits[0]);
  } else {
    selectedCredit.value = null;
  }
}

// 打开详情模态框
function openDetailModal(account) {
  currentAccount.value = account;
  detailModalVisible.value = true;
}

// 创建子账户
async function handleCreate() {
  if (!createForm.value.name || !createForm.value.email) {
    message.error('请填写用户名和邮箱');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      Name: createForm.value.name.trim(),
      Email: createForm.value.email.trim(),
      CreditGranted: Number(createForm.value.credit) || 0,
    };
    if (createForm.value.alias) payload.Alias = createForm.value.alias.trim();
    if (createForm.value.billingEmail) payload.BillingEmail = createForm.value.billingEmail.trim();

    const response = await createUser(payload);

    // 提取新密钥
    const secretKey =
      response?.data?.User?.SecretKey ||
      response?.data?.SecretKey ||
      response?.data?.secret_key ||
      response?.data?.Key ||
      response?.data?.key ||
      response?.data?.data?.SecretKey ||
      response?.data?.data?.secret_key ||
      '';

    if (secretKey) {
      newCreatedKey.value = secretKey;
      createModalVisible.value = false;
      createResultModalVisible.value = true;
      // 不立即刷新列表，等用户确认关闭结果弹窗后再刷新
    } else {
      message.success('子账户创建成功');
      createModalVisible.value = false;
      refreshList();
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '创建失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

// 更新子账户
async function handleUpdate() {
  if (!currentAccount.value) return;

  const payload = {};

  // Name 字段必传,不进入变动校验
  const accountName = currentAccount.value.Name || currentAccount.value.name;
  if (accountName) {
    payload.Name = accountName;
  }

  // 辅助函数：对比两个数组是否相同
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  // 辅助函数：对比两个对象数组是否相同（用于 modelMapperList/levelMapperList）
  const mapperListsEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const aMap = new Map(a.map(item => [item.key, item.value]));
    const bMap = new Map(b.map(item => [item.key, item.value]));
    if (aMap.size !== bMap.size) return false;
    for (const [key, value] of aMap) {
      if (bMap.get(key) !== value) return false;
    }
    return true;
  };

  // 基础信息 - 只有修改过且非空的才添加
  if (editForm.value.alias?.trim() && editForm.value.alias !== initialEditForm.value.alias) {
    payload.Alias = editForm.value.alias.trim();
  }
  if (editForm.value.email?.trim() && editForm.value.email !== initialEditForm.value.email) {
    payload.Email = editForm.value.email.trim();
  }
  if (editForm.value.billingEmail?.trim() && editForm.value.billingEmail !== initialEditForm.value.billingEmail) {
    payload.BillingEmail = editForm.value.billingEmail.trim();
  }
  if (editForm.value.status !== initialEditForm.value.status && editForm.value.status !== null) {
    payload.Status = editForm.value.status;
  }

  // 等级与权限 - 只有修改过且有效的才添加
  if (editForm.value.level !== initialEditForm.value.level &&
      editForm.value.level !== null && editForm.value.level !== undefined && editForm.value.level !== '') {
    payload.Level = Number(editForm.value.level);
  }
  if (editForm.value.role !== initialEditForm.value.role &&
      editForm.value.role !== null && editForm.value.role !== undefined && editForm.value.role !== '') {
    payload.Role = Number(editForm.value.role);
  }
  if (editForm.value.gear !== initialEditForm.value.gear &&
      editForm.value.gear !== null && editForm.value.gear !== undefined && editForm.value.gear !== '') {
    payload.Gear = Number(editForm.value.gear);
  }
  if (editForm.value.rates !== initialEditForm.value.rates &&
      editForm.value.rates !== null && editForm.value.rates !== undefined && editForm.value.rates !== '') {
    payload.Rates = Number(editForm.value.rates);
  }
  if (editForm.value.factor !== initialEditForm.value.factor &&
      editForm.value.factor !== null && editForm.value.factor !== undefined && editForm.value.factor !== '') {
    payload.Factor = Number(editForm.value.factor);
  }

  // 额度限制
  if (editForm.value.hardLimit !== initialEditForm.value.hardLimit &&
      editForm.value.hardLimit !== null && editForm.value.hardLimit !== undefined && editForm.value.hardLimit !== '') {
    payload.HardLimit = Number(editForm.value.hardLimit);
  }
  if (editForm.value.dailyLimit !== initialEditForm.value.dailyLimit &&
      editForm.value.dailyLimit !== null && editForm.value.dailyLimit !== undefined && editForm.value.dailyLimit !== '') {
    payload.DailyLimit = Number(editForm.value.dailyLimit);
  }
  if (editForm.value.softLimit !== initialEditForm.value.softLimit &&
      editForm.value.softLimit !== null && editForm.value.softLimit !== undefined && editForm.value.softLimit !== '') {
    payload.SoftLimit = Number(editForm.value.softLimit);
  }
  if (editForm.value.autoQuota !== initialEditForm.value.autoQuota &&
      editForm.value.autoQuota !== null && editForm.value.autoQuota !== undefined && editForm.value.autoQuota !== '') {
    payload.AutoQuota = Number(editForm.value.autoQuota);
  }
  if (editForm.value.childLimit !== initialEditForm.value.childLimit &&
      editForm.value.childLimit !== null && editForm.value.childLimit !== undefined && editForm.value.childLimit !== '') {
    payload.ChildLimit = Number(editForm.value.childLimit);
  }

  // 速率限制
  if (editForm.value.rpm !== initialEditForm.value.rpm &&
      editForm.value.rpm !== null && editForm.value.rpm !== undefined && editForm.value.rpm !== '') {
    payload.RPM = Number(editForm.value.rpm);
  }
  if (editForm.value.rph !== initialEditForm.value.rph &&
      editForm.value.rph !== null && editForm.value.rph !== undefined && editForm.value.rph !== '') {
    payload.RPH = Number(editForm.value.rph);
  }
  if (editForm.value.rpd !== initialEditForm.value.rpd &&
      editForm.value.rpd !== null && editForm.value.rpd !== undefined && editForm.value.rpd !== '') {
    payload.RPD = Number(editForm.value.rpd);
  }
  if (editForm.value.tpm !== initialEditForm.value.tpm &&
      editForm.value.tpm !== null && editForm.value.tpm !== undefined && editForm.value.tpm !== '') {
    payload.TPM = Number(editForm.value.tpm);
  }
  if (editForm.value.tph !== initialEditForm.value.tph &&
      editForm.value.tph !== null && editForm.value.tph !== undefined && editForm.value.tph !== '') {
    payload.TPH = Number(editForm.value.tph);
  }
  if (editForm.value.tpd !== initialEditForm.value.tpd &&
      editForm.value.tpd !== null && editForm.value.tpd !== undefined && editForm.value.tpd !== '') {
    payload.TPD = Number(editForm.value.tpd);
  }

  // 访问控制（数组类型） - 转为逗号分隔的字符串格式
  if (!arraysEqual(editForm.value.allowIPsList, initialEditForm.value.allowIPsList) && editForm.value.allowIPsList?.length) {
    payload.AllowIPs = editForm.value.allowIPsList.join(',');
  }
  if (!arraysEqual(editForm.value.allowModelsList, initialEditForm.value.allowModelsList) && editForm.value.allowModelsList?.length) {
    payload.AllowModels = editForm.value.allowModelsList.join(',');
  }
  if (!arraysEqual(editForm.value.allowLevelsList, initialEditForm.value.allowLevelsList) && editForm.value.allowLevelsList?.length) {
    payload.AllowLevels = editForm.value.allowLevelsList.join(',');
  }
  if (!arraysEqual(editForm.value.resourcesList, initialEditForm.value.resourcesList) && editForm.value.resourcesList?.length) {
    payload.Resources = editForm.value.resourcesList.join(',');
  }

  // 高级配置 - 转为字符串格式
  if (!mapperListsEqual(editForm.value.modelMapperList, initialEditForm.value.modelMapperList) && editForm.value.modelMapperList?.length) {
    const mappedEntries = editForm.value.modelMapperList
      .filter(item => item.key && item.value)
      .map(item => `${item.key}=${item.value}`);
    if (mappedEntries.length > 0) {
      payload.ModelMapper = mappedEntries.join(',');
    }
  }

  if (!mapperListsEqual(editForm.value.levelMapperList, initialEditForm.value.levelMapperList) && editForm.value.levelMapperList?.length) {
    const mappedEntries = editForm.value.levelMapperList
      .filter(item => item.key && item.value)
      .map(item => `${item.key}=${item.value}`);
    if (mappedEntries.length > 0) {
      payload.LevelMapper = mappedEntries.join(',');
    }
  }

  // 单个模型速率限制 - 转为对象格式
  // 格式: [{ model: "gpt-4", rpm: 30, tpm: 90000 }] => { "gpt-4": { "rpm": 30, "tpm": 90000 } }
  if (!mapperListsEqual(editForm.value.modelLimitsList, initialEditForm.value.modelLimitsList) && editForm.value.modelLimitsList?.length) {
    const modelLimitsObj = {};
    editForm.value.modelLimitsList
      .filter(item => item.model && item.model.trim())
      .forEach(item => {
        const limits = {};
        if (item.rpm !== null && item.rpm !== undefined && item.rpm !== '') {
          limits.rpm = Number(item.rpm);
        }
        if (item.tpm !== null && item.tpm !== undefined && item.tpm !== '') {
          limits.tpm = Number(item.tpm);
        }
        if (Object.keys(limits).length > 0) {
          modelLimitsObj[item.model.trim()] = limits;
        }
      });
    if (Object.keys(modelLimitsObj).length > 0) {
      payload.ModelLimits = modelLimitsObj;
    }
  }

  if (editForm.value.qrcode?.trim() && editForm.value.qrcode !== initialEditForm.value.qrcode) {
    payload.QRCode = editForm.value.qrcode.trim();
  }

  // Name 字段必传,所以不需要检查是否为空
  // if (Object.keys(payload).length === 0) {
  //   message.error('没有修改任何字段');
  //   return;
  // }

  // Root 用户可以跳过限制校验
  if (!authStore.isRoot && parentLimits.value) {
    const parent = parentLimits.value;

    // 校验每月限额
    if (payload.HardLimit !== undefined && parent.hard_limit !== undefined && parent.hard_limit !== null) {
      if (payload.HardLimit > parent.hard_limit) {
        message.error(`每月限额不能超过当前用户的每月限额 (${formatCurrency(parent.hard_limit)})`);
        return;
      }
    }

    // 校验每日限额
    if (payload.DailyLimit !== undefined && parent.daily_limit !== undefined && parent.daily_limit !== null) {
      if (payload.DailyLimit > parent.daily_limit) {
        message.error(`每日限额不能超过当前用户的每日限额 (${formatCurrency(parent.daily_limit)})`);
        return;
      }
    }

    // 校验 RPM
    if (payload.RPM !== undefined && parent.rpm !== undefined && parent.rpm !== null) {
      if (payload.RPM > parent.rpm) {
        message.error(`RPM 不能超过当前用户的 RPM (${parent.rpm})`);
        return;
      }
    }

    // 校验 RPH
    if (payload.RPH !== undefined && parent.rph !== undefined && parent.rph !== null) {
      if (payload.RPH > parent.rph) {
        message.error(`RPH 不能超过当前用户的 RPH (${parent.rph})`);
        return;
      }
    }

    // 校验 RPD
    if (payload.RPD !== undefined && parent.rpd !== undefined && parent.rpd !== null) {
      if (payload.RPD > parent.rpd) {
        message.error(`RPD 不能超过当前用户的 RPD (${parent.rpd})`);
        return;
      }
    }

    // 校验 TPM
    if (payload.TPM !== undefined && parent.tpm !== undefined && parent.tpm !== null) {
      if (payload.TPM > parent.tpm) {
        message.error(`TPM 不能超过当前用户的 TPM (${parent.tpm})`);
        return;
      }
    }

    // 校验 TPH
    if (payload.TPH !== undefined && parent.tph !== undefined && parent.tph !== null) {
      if (payload.TPH > parent.tph) {
        message.error(`TPH 不能超过当前用户的 TPH (${parent.tph})`);
        return;
      }
    }

    // 校验 TPD
    if (payload.TPD !== undefined && parent.tpd !== undefined && parent.tpd !== null) {
      if (payload.TPD > parent.tpd) {
        message.error(`TPD 不能超过当前用户的 TPD (${parent.tpd})`);
        return;
      }
    }
  }

  submitting.value = true;
  try {
    const identifier = currentAccount.value.ID || currentAccount.value.id || currentAccount.value.Name || currentAccount.value.name;
    if (!identifier) {
      message.error('无法获取账户标识符');
      submitting.value = false;
      return;
    }
    await updateUser(identifier, payload);
    message.success('设置更新成功');
    editModalVisible.value = false;
    refreshList();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '更新失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

// 调整额度
async function handleCredit() {
  if (!currentAccount.value) return;
  if (!creditForm.value.amount) {
    message.error('请输入调整额度');
    return;
  }
  if (!creditForm.value.days || creditForm.value.days < 1) {
    message.error('请输入有效的有效期天数');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      CreditGranted: Number(creditForm.value.amount) || 0,
      Days: Number(creditForm.value.days) || 365,
    };
    if (creditForm.value.memo) {
      payload.Memo = creditForm.value.memo.trim();
    }

    const identifier = currentAccount.value.ID || currentAccount.value.id || currentAccount.value.Name || currentAccount.value.name;
    if (!identifier) {
      message.error('无法获取账户标识符');
      submitting.value = false;
      return;
    }
    await updateUser(identifier, payload);
    message.success('额度调整成功');
    creditModalVisible.value = false;
    refreshList();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '调整失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

// 发送 XCredit 指令（仅 root）
async function handleXCreditSubmit() {
  if (!authStore.isRoot) {
    message.error('仅 root 用户可执行该操作');
    return;
  }

  if (!currentAccount.value) {
    message.error('未选中任何账户');
    return;
  }

  if (!selectedCredit.value) {
    message.error('请选择需要调整的余额明细');
    return;
  }

  const xCreditValue = generatedXCredit.value;
  if (!xCreditValue) {
    message.error('请输入有效的 XCredit 指令');
    return;
  }

  xCreditSubmitting.value = true;
  try {
    const identifier =
      currentAccount.value.ID ||
      currentAccount.value.id ||
      currentAccount.value.Name ||
      currentAccount.value.name;
    if (!identifier) {
      message.error('无法获取账户标识符');
      xCreditSubmitting.value = false;
      return;
    }

    await postUserXCredit(identifier, { XCredit: xCreditValue });
    message.success('操作已提交');
    packageModalVisible.value = false;
    // 刷新列表以同步最新额度信息
    refreshList();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '操作失败';
    message.error(errorMessage);
  } finally {
    xCreditSubmitting.value = false;
  }
}

// 删除子账户
async function handleDelete(account) {
  submitting.value = true;
  try {
    // 优先使用 ID，其次使用 Name
    const identifier = account.ID || account.id || account.Name || account.name;
    if (!identifier) {
      message.error('无法获取账户标识符');
      return;
    }
    await deleteUser(identifier);
    message.success('子账户已删除');
    refreshList();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '删除失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

// 工具函数
function splitMulti(value) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

// 复制创建的密钥
async function copyNewKey() {
  if (!newCreatedKey.value) {
    message.warning('暂无可复制的密钥');
    return;
  }
  try {
    await navigator.clipboard.writeText(newCreatedKey.value);
    message.success('密钥已复制到剪贴板');
  } catch (err) {
    message.error('复制失败，请手动复制');
  }
}

// 关闭创建结果弹窗
function closeCreateResultModal() {
  createResultModalVisible.value = false;
  newCreatedKey.value = '';
  // 用户确认后刷新列表
  refreshList();
}
</script>

<style scoped>
.account-tools-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-card {
  flex-shrink: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}

.header-card :deep(.n-card__content) {
  padding: 16px 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

.table-card {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.n-card__content) {
  padding: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.table-content :deep(.n-data-table-thead) {
  position: sticky;
  top: 0;
  z-index: 3;
}

.table-content :deep(.n-data-table-th) {
  background: #ffffff !important;
}

.table-card :deep(.n-data-table-th) {
  background: #ffffff !important;
  font-weight: 700;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb !important;
  padding: 16px 12px !important;
}

.table-card :deep(.n-data-table-td) {
  padding: 14px 12px !important;
  border-bottom: 1px solid #f3f4f6 !important;
}

.table-card :deep(.n-data-table-tr) {
  transition: all 0.2s ease;
}

.table-card :deep(.n-data-table-tr:hover) {
  background: #f9fafb !important;
  box-shadow: 0 2px 8px rgba(90, 86, 246, 0.08);
}

.table-card :deep(.n-data-table .n-data-table-tr--striped) {
  background: rgba(249, 250, 251, 0.5) !important;
}

.table-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
  min-height: 64px;
}

.footer-total {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1.5;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.header-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-info p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-section {
  margin-top: 4px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 0.9rem;
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.filter-row .n-form-item {
  margin-bottom: 0;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

.action-buttons :deep(.n-button) {
  min-width: 32px;
  padding: 0 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  height: 26px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-right: 0 !important;
}

.action-buttons :deep(.n-button:not(:last-child)) {
  margin-right: 8px;
}

.action-buttons :deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.action-buttons :deep(.n-button:active) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-buttons :deep(.n-button .n-button__icon) {
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.account-info-banner {
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.08), rgba(247, 114, 182, 0.08));
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.root-package-action {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.xcredit-modal-layout {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.xcredit-credit-list {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
}

.credit-manage-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(90, 86, 246, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.credit-manage-item .n-button {
  align-self: center;
  flex-shrink: 0;
}

.credit-manage-item:hover {
  border-color: rgba(90, 86, 246, 0.4);
}

.credit-manage-item.active {
  border-color: rgba(90, 86, 246, 0.6);
  box-shadow: 0 0 0 2px rgba(90, 86, 246, 0.15);
  background: rgba(240, 242, 255, 0.6);
}

.credit-manage-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}

.credit-row {
  display: flex;
  gap: 8px;
  align-items: center;
  line-height: 1.4;
}

.credit-row .label {
  min-width: 72px;
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.credit-row .value {
  color: var(--daw-text-primary);
  font-weight: 600;
  word-break: break-all;
}

.xcredit-form-panel {
  flex: 1 1 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.xcredit-inline {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.xcredit-preview {
  font-size: 0.9rem;
}

.xcredit-preview code {
  display: inline-block;
  margin-left: 6px;
  padding: 4px 8px;
  background: rgba(90, 86, 246, 0.1);
  border-radius: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.85rem;
}

.info-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.info-item .label {
  color: var(--daw-text-secondary);
  font-size: 0.9rem;
}

.info-item .value {
  font-weight: 600;
  font-size: 1rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.extra-section {
  margin-top: 16px;
}

.extra-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: var(--daw-text-secondary);
}

.credit-balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.credit-balance-header h4 {
  margin: 0;
}

.credit-balance-summary {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.9rem;
}

.summary-label {
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.summary-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: var(--daw-text-primary);
}

.summary-value.primary {
  color: var(--daw-primary);
}

.credit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.credit-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.credit-item-card {
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  gap: 12px;
  transition: all 0.3s ease;
}

.credit-item-card:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(90, 86, 246, 0.12);
  border-color: rgba(90, 86, 246, 0.3);
  transform: translateY(-2px);
}

/* 使用中的卡片 */
.credit-item-card.is-active {
  border-color: rgba(90, 86, 246, 0.5);
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.06), rgba(147, 51, 234, 0.04));
  box-shadow: 0 2px 12px rgba(90, 86, 246, 0.15);
}

.credit-item-card.is-active:hover {
  border-color: rgba(90, 86, 246, 0.6);
  box-shadow: 0 4px 16px rgba(90, 86, 246, 0.25);
}

/* 已过期的卡片 */
.credit-item-card.is-expired {
  opacity: 0.6;
  background: rgba(148, 163, 184, 0.08);
  border-color: rgba(148, 163, 184, 0.4);
}

.credit-item-card.is-expired:hover {
  opacity: 0.75;
  transform: translateY(0);
}

/* 已用完的卡片 */
.credit-item-card.is-depleted:not(.is-expired) {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.04);
}

.credit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.credit-card-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.credit-card-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-expired {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.status-depleted {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.credit-card-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.amount-label {
  font-size: 0.7rem;
  color: var(--daw-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.amount-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--daw-primary);
}

.is-expired .amount-value {
  color: var(--daw-text-secondary);
}

.amount-total {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--daw-text-secondary);
}

.credit-card-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 10px;
  border-radius: 10px;
  background: rgba(226, 232, 240, 0.5);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.progress-active .progress-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

.progress-depleted .progress-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}

.progress-expired .progress-fill {
  background: linear-gradient(90deg, #94a3b8, #cbd5e1);
  box-shadow: none;
}

.progress-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--daw-text-secondary);
  min-width: 45px;
  text-align: right;
}

.is-expired .progress-text {
  color: var(--daw-text-secondary);
  opacity: 0.7;
}

.credit-card-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.credit-item-row {
  display: flex;
  gap: 8px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.credit-item-row .label {
  min-width: 72px;
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.credit-item-row .value {
  color: var(--daw-text-primary);
  font-weight: 600;
  word-break: break-all;
}

.credit-item-row .value.text-warning {
  color: #f59e0b;
}

.json-display {
  background: rgba(15, 23, 42, 0.85);
  border-radius: 12px;
  padding: 16px;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
}

/* 编辑弹窗样式优化 - 美观版 */
.edit-account-modal :deep(.n-card) {
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.edit-account-modal :deep(.n-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  background: linear-gradient(to bottom, #ffffff, #fafbfc);
}

.edit-account-modal :deep(.n-card__content) {
  padding: 0;
}

.edit-account-modal :deep(.n-card__footer) {
  padding: 16px 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(249, 250, 251, 0.6);
}

.modal-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.modal-main-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--daw-text-primary);
  letter-spacing: -0.02em;
}

.header-account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.account-name {
  font-weight: 600;
  color: var(--daw-primary);
}

.account-email {
  color: var(--daw-text-secondary);
}

.account-email::before {
  content: "·";
  margin: 0 8px;
  color: var(--daw-text-secondary);
}

.edit-tabs :deep(.n-tabs-nav) {
  padding: 12px 24px 0;
  background: linear-gradient(to bottom, rgba(249, 250, 251, 0.3), rgba(255, 255, 255, 0));
}

.edit-tabs :deep(.n-tabs-tab) {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.tab-title {
  display: flex;
  align-items: center;
  gap: 7px;
}

.tab-content {
  padding: 24px;
  max-height: 580px;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: rgba(90, 86, 246, 0.25);
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(90, 86, 246, 0.4);
}

/* Form Section */
.form-section {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.section-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--daw-text-primary);
  margin: 0;
}

.section-desc {
  font-size: 0.875rem;
  color: var(--daw-text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* Form Rows */
.form-row-2,
.form-row-3 {
  display: grid;
  gap: 14px;
  margin-bottom: 10px;
}

.form-row-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-row-3 {
  grid-template-columns: repeat(3, 1fr);
}

.form-row-2:last-child,
.form-row-3:last-child {
  margin-bottom: 0;
}

/* Model Limits List */
.model-limits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-limit-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.03), rgba(147, 51, 234, 0.02));
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  transition: all 0.25s ease;
}

.model-limit-row:hover {
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.06), rgba(147, 51, 234, 0.04));
  border-color: rgba(90, 86, 246, 0.3);
  box-shadow: 0 4px 12px rgba(90, 86, 246, 0.1);
  transform: translateY(-1px);
}

.model-limit-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.model-limit-field:first-child {
  flex: 2;
}

.model-limit-field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--daw-text-secondary);
}

/* Access Control Section */
.access-control-section {
  width: 100%;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.access-card {
  padding: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.9));
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  transition: all 0.25s ease;
}

.access-card:hover {
  background: #ffffff;
  border-color: rgba(90, 86, 246, 0.3);
  box-shadow: 0 6px 16px rgba(90, 86, 246, 0.08);
  transform: translateY(-2px);
}

.access-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.access-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.access-card-header h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--daw-text-primary);
  margin: 0;
}

.access-hint {
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
  margin: 8px 0 0 0;
  line-height: 1.4;
}

/* Mapper List */
.mapper-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapper-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.9));
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  transition: all 0.25s ease;
}

.mapper-row:hover {
  background: #ffffff;
  border-color: rgba(90, 86, 246, 0.3);
  box-shadow: 0 4px 12px rgba(90, 86, 246, 0.1);
  transform: translateY(-1px);
}

.mapper-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mapper-field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--daw-text-secondary);
}

.mapper-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
  opacity: 0.6;
}

/* Remove Button */
.remove-btn {
  align-self: center;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.model-limit-row:hover .remove-btn,
.mapper-row:hover .remove-btn {
  opacity: 1;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .modal-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-account-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .account-email::before {
    display: none;
  }

  .form-row-2,
  .form-row-3,
  .access-grid {
    grid-template-columns: 1fr;
  }

  .model-limit-row,
  .mapper-row {
    flex-direction: column;
    align-items: stretch;
  }

  .model-limit-field:first-child {
    flex: 1;
  }

  .mapper-arrow {
    transform: rotate(90deg);
    padding: 0;
  }

  .tab-content {
    max-height: 520px;
    padding: 16px;
  }
}


.create-result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.key-display-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.05), rgba(147, 51, 234, 0.05));
  border-radius: 16px;
  border: 1px dashed rgba(90, 86, 246, 0.3);
}

.key-label {
  font-size: 0.9rem;
  color: var(--daw-text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.key-display-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--daw-primary);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(90, 86, 246, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  word-break: break-all;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 8px rgba(90, 86, 246, 0.08);
}

@media (max-width: 900px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions > * {
    width: 100%;
  }
}
</style>
