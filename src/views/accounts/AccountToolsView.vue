<template>
  <section class="account-tools-view">
    <!-- 顶部操作栏 -->
    <n-card class="header-card" :bordered="false">
      <div class="header-content">
        <div class="header-info">
          <h2>子账户管理</h2>
          <p>统一管理所有子账户，支持创建、编辑、充值/扣钱、删除等操作</p>
        </div>
        <div class="header-actions">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索用户名、邮箱、ID"
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          <n-button type="primary" @click="openCreateModal">
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            新增子账户
          </n-button>
          <n-button secondary @click="refreshList" :loading="loading">
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            刷新
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- 账户列表 -->
    <n-card class="table-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="filteredAccounts"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        :scroll-x="1640"
        striped
      />
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
        <n-form-item label="初始额度 (USD)" required>
          <n-input-number
            v-model:value="createForm.credit"
            :min="2"
            :step="5"
            style="width: 100%"
            placeholder="初始额度"
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
      title="编辑子账户设置"
      size="huge"
      :mask-closable="false"
      style="max-width: 900px"
    >
      <div style="margin-bottom: 16px">
        <n-alert type="info" :show-icon="false">
          账户: <strong>{{ currentAccount?.Name || currentAccount?.name }}</strong> ({{ currentAccount?.Email || currentAccount?.email }})
        </n-alert>
      </div>

      <n-tabs type="line" animated>
        <!-- 基础信息 Tab -->
        <n-tab-pane name="basic" tab="基础信息">
          <n-form :model="editForm" label-placement="left" label-width="100" style="padding: 16px 0">
            <div class="form-grid-2">
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
            <n-form-item label="账户邮箱">
              <n-input v-model:value="editForm.email" placeholder="用于登录的邮箱地址" />
            </n-form-item>
            <n-form-item label="账单邮箱">
              <n-input v-model:value="editForm.billingEmail" placeholder="接收账单通知的邮箱" />
            </n-form-item>
            <div class="form-grid-3">
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
            <div class="form-grid-2">
              <n-form-item label="费率倍数">
                <n-input-number v-model:value="editForm.rates" :min="0" :step="0.1" style="width: 100%" placeholder="计费倍率" />
              </n-form-item>
              <n-form-item label="计费因子">
                <n-input-number v-model:value="editForm.factor" :min="0" :step="0.1" style="width: 100%" placeholder="Factor" />
              </n-form-item>
            </div>
          </n-form>
        </n-tab-pane>

        <!-- 额度限制 Tab -->
        <n-tab-pane name="limits" tab="额度与限制">
          <n-form :model="editForm" label-placement="left" label-width="120" style="padding: 16px 0">
            <div class="form-grid-2">
              <n-form-item label="每月限额">
                <n-input-number v-model:value="editForm.hardLimit" :min="0" style="width: 100%" placeholder="月度最高花费 (USD)" />
              </n-form-item>
              <n-form-item label="每日限额">
                <n-input-number v-model:value="editForm.dailyLimit" :min="0" style="width: 100%" placeholder="每日最高花费 (USD)" />
              </n-form-item>
            </div>
            <div class="form-grid-2">
              <n-form-item label="预警额度">
                <n-input-number v-model:value="editForm.softLimit" :min="0" style="width: 100%" placeholder="预警额度 (USD)" />
              </n-form-item>
              <n-form-item label="自动充值额度">
                <n-input-number v-model:value="editForm.autoQuota" :min="0" style="width: 100%" placeholder="USD" />
              </n-form-item>
            </div>
            <div class="form-grid-2">
              <n-form-item label="子账户数量">
                <n-input-number v-model:value="editForm.childLimit" :min="0" style="width: 100%" placeholder="最多可创建" />
              </n-form-item>
            </div>
          </n-form>
        </n-tab-pane>

        <!-- 速率限制 Tab -->
        <n-tab-pane name="rate" tab="速率控制">
          <n-form :model="editForm" label-placement="left" label-width="100" style="padding: 16px 0">
            <n-alert type="info" :bordered="false" style="margin-bottom: 20px">
              设置用户的请求和Token使用速率限制，留空或0表示不限制
            </n-alert>

            <div class="rate-limit-group">
              <div class="rate-limit-header">
                <n-icon size="18" color="#18a058"><FlashOutline /></n-icon>
                <span>请求速率限制</span>
              </div>
              <div class="rate-limit-inputs">
                <n-form-item label="每分钟">
                  <n-input-number v-model:value="editForm.rpm" :min="0" style="width: 100%" placeholder="RPM">
                    <template #suffix>次</template>
                  </n-input-number>
                </n-form-item>
                <n-form-item label="每小时">
                  <n-input-number v-model:value="editForm.rph" :min="0" style="width: 100%" placeholder="RPH">
                    <template #suffix>次</template>
                  </n-input-number>
                </n-form-item>
                <n-form-item label="每天">
                  <n-input-number v-model:value="editForm.rpd" :min="0" style="width: 100%" placeholder="RPD">
                    <template #suffix>次</template>
                  </n-input-number>
                </n-form-item>
              </div>
            </div>

            <n-divider style="margin: 24px 0" />

            <div class="rate-limit-group">
              <div class="rate-limit-header">
                <n-icon size="18" color="#2080f0"><PulseOutline /></n-icon>
                <span>Token 速率限制</span>
              </div>
              <div class="rate-limit-inputs">
                <n-form-item label="每分钟">
                  <n-input-number v-model:value="editForm.tpm" :min="0" style="width: 100%" placeholder="TPM">
                    <template #suffix>tokens</template>
                  </n-input-number>
                </n-form-item>
                <n-form-item label="每小时">
                  <n-input-number v-model:value="editForm.tph" :min="0" style="width: 100%" placeholder="TPH">
                    <template #suffix>tokens</template>
                  </n-input-number>
                </n-form-item>
                <n-form-item label="每天">
                  <n-input-number v-model:value="editForm.tpd" :min="0" style="width: 100%" placeholder="TPD">
                    <template #suffix>tokens</template>
                  </n-input-number>
                </n-form-item>
              </div>
            </div>
          </n-form>
        </n-tab-pane>

        <!-- 访问控制 Tab -->
        <n-tab-pane name="access" tab="访问控制">
          <n-form :model="editForm" label-placement="top" style="padding: 16px 0">
            <n-alert type="warning" :bordered="false" style="margin-bottom: 20px">
              通过白名单控制用户的访问权限，留空表示不限制
            </n-alert>

            <div class="access-control-grid">
              <n-form-item label="IP 白名单">
                <n-dynamic-tags v-model:value="editForm.allowIPsList" size="medium" />
                <template #feedback>
                  限制只允许这些IP地址访问
                </template>
              </n-form-item>

              <n-form-item label="模型白名单">
                <n-dynamic-tags v-model:value="editForm.allowModelsList" size="medium" />
                <template #feedback>
                  只允许使用这些模型，支持通配符如 gpt-4*
                </template>
              </n-form-item>
            </div>

            <div class="access-control-grid">
              <n-form-item label="允许的分组">
                <n-dynamic-tags v-model:value="editForm.allowLevelsList" size="medium" />
                <template #feedback>
                  限制只能访问这些分组的Provider
                </template>
              </n-form-item>

              <n-form-item label="API 路径白名单">
                <n-dynamic-tags v-model:value="editForm.resourcesList" size="medium" />
                <template #feedback>
                  只允许访问这些API路径，如 /v1/chat/completions
                </template>
              </n-form-item>
            </div>
          </n-form>
        </n-tab-pane>

        <!-- 高级配置 Tab -->
        <n-tab-pane name="advanced" tab="高级配置">
          <n-form :model="editForm" label-placement="top" style="padding: 16px 0">
            <n-alert type="info" :bordered="false" style="margin-bottom: 20px">
              高级配置项，如不了解请勿随意修改
            </n-alert>

            <n-form-item label="二维码数据">
              <n-input v-model:value="editForm.qrcode" placeholder="可选，用于生成二维码" />
            </n-form-item>

            <n-divider style="margin: 28px 0 20px 0">
              <n-icon size="16"><SwapHorizontalOutline /></n-icon>
              <span style="margin-left: 8px">模型映射配置</span>
            </n-divider>
            <div class="mapper-section">
              <n-alert type="default" :bordered="false" style="margin-bottom: 16px">
                将用户请求的模型名称映射到实际调用的模型，例如将 gpt-4 映射到 gpt-4-turbo
              </n-alert>
              <div v-for="(item, index) in editForm.modelMapperList" :key="index" class="mapper-item">
                <div class="mapper-inputs">
                  <n-input
                    v-model:value="item.key"
                    placeholder="用户请求的模型名"
                    size="medium"
                  />
                  <div class="mapper-arrow">
                    <n-icon size="20" color="#2080f0"><ArrowForwardOutline /></n-icon>
                  </div>
                  <n-input
                    v-model:value="item.value"
                    placeholder="实际调用的模型名"
                    size="medium"
                  />
                </div>
                <n-button quaternary circle type="error" @click="removeModelMapper(index)" class="mapper-delete">
                  <template #icon><n-icon size="18"><TrashOutline /></n-icon></template>
                </n-button>
              </div>
              <n-button dashed block @click="addModelMapper" size="medium">
                <template #icon><n-icon><AddOutline /></n-icon></template>
                添加模型映射
              </n-button>
            </div>

            <n-divider style="margin: 28px 0 20px 0">
              <n-icon size="16"><GitNetworkOutline /></n-icon>
              <span style="margin-left: 8px">分组路由配置</span>
            </n-divider>
            <div class="mapper-section">
              <n-alert type="default" :bordered="false" style="margin-bottom: 16px">
                配置不同分组使用的Provider，例如分组1使用OpenAI，分组2使用Azure
              </n-alert>
              <div v-for="(item, index) in editForm.levelMapperList" :key="index" class="mapper-item">
                <div class="mapper-inputs">
                  <n-input
                    v-model:value="item.key"
                    placeholder="分组 (Level)"
                    size="medium"
                  />
                  <div class="mapper-arrow">
                    <n-icon size="20" color="#2080f0"><ArrowForwardOutline /></n-icon>
                  </div>
                  <n-input
                    v-model:value="item.value"
                    placeholder="Provider 名称"
                    size="medium"
                  />
                </div>
                <n-button quaternary circle type="error" @click="removeLevelMapper(index)" class="mapper-delete">
                  <template #icon><n-icon size="18"><TrashOutline /></n-icon></template>
                </n-button>
              </div>
              <n-button dashed block @click="addLevelMapper" size="medium">
                <template #icon><n-icon><AddOutline /></n-icon></template>
                添加分组路由
              </n-button>
            </div>
          </n-form>
        </n-tab-pane>
      </n-tabs>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="editModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleUpdate">
            保存修改
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 快速充值/扣钱模态框 -->
    <n-modal
      v-model:show="creditModalVisible"
      preset="card"
      title="调整账户额度"
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
            本次操作将为账户充值 <strong>{{ formatCurrency(creditForm.amount) }}</strong>
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
          <h4>余额明细</h4>
          <div class="credit-list">
            <div v-for="(credit, idx) in (currentAccount.CreditBalance || currentAccount.credit_balance)" :key="idx" class="credit-item">
              <span class="amount">{{ formatCurrency((credit.Balance || credit.balance || credit.Amount || credit.amount) || 0) }}</span>
              <span class="expires">到期: {{ formatDateTime((credit.ExpiresAt || credit.expires_at), 'YYYY-MM-DD') }}</span>
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
import { h, ref, computed, onMounted } from 'vue';
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
  useMessage,
} from 'naive-ui';
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
} from '@vicons/ionicons5';
import {
  createUser,
  updateUser,
  deleteUser,
  getDescendants,
  getDescendant,
} from '@/api/accounts';
import { getLiveStatusWithKey } from '@/api/dashboard';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useAuthStore } from '@/store/auth';

const message = useMessage();
const authStore = useAuthStore();

// 当前用户自己的配置信息（用于校验子账户不能超过父账户的限制）
const parentLimits = ref(null);

// 数据状态
const accounts = ref([]);
const loading = ref(false);
const submitting = ref(false);
const searchKeyword = ref('');

// 模态框状态
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const creditModalVisible = ref(false);
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
  qrcode: '',
});

// 保存表单初始值，用于对比是否修改
const initialEditForm = ref({});

const creditForm = ref({
  amount: 10,
  memo: '',
});

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }) => `共 ${itemCount} 条`,
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
    width: 200,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'action-buttons' }, [
        h(
          NButton,
          {
            size: 'small',
            secondary: true,
            onClick: () => openDetailModal(row),
            title: '查看详情',
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
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            ghost: true,
            onClick: () => openCreditModal(row),
            title: '充值/扣款',
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CashOutline) }),
          }
        ),
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
                },
                {
                  icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
                }
              ),
            default: () => '确定删除该子账户？此操作不可恢复！',
          }
        ),
      ]);
    },
  },
];

// 过滤后的账户列表
const filteredAccounts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return accounts.value;

  return accounts.value.filter((account) => {
    const searchText = [
      account.id?.toString(),
      account.name,
      account.email,
      account.alias,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchText.includes(keyword);
  });
});

// 生命周期
onMounted(() => {
  refreshList();
  fetchParentLimits();
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

// 刷新列表
async function refreshList() {
  loading.value = true;
  try {
    const response = await getDescendants({ size: 500 });
    accounts.value = response.data.users || response.data || [];
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '获取子账户列表失败';
    message.error(errorMessage);
  } finally {
    loading.value = false;
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

  // 辅助函数：确保字段是数组（处理API返回空对象{}的情况）
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      return Object.keys(value);
    }
    return [];
  };

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

function removeLevelMapper(index) {
  editForm.value.levelMapperList.splice(index, 1);
}

// 打开充值模态框
function openCreditModal(account) {
  currentAccount.value = account;
  creditForm.value = {
    amount: 10,
    memo: '',
  };
  creditModalVisible.value = true;
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

  submitting.value = true;
  try {
    const payload = {
      CreditGranted: Number(creditForm.value.amount) || 0,
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-card,
.table-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 12px rgba(90, 86, 246, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 28px 32px;
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

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

.action-buttons .n-button {
  min-width: 32px;
  padding: 0 8px;
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

.credit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.credit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.credit-item .amount {
  font-weight: 600;
  color: var(--daw-primary);
}

.credit-item .expires {
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
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

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.mapper-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.mapper-section p {
  margin: 0 0 8px 0;
}

/* 速率限制组样式 */
.rate-limit-group {
  margin-bottom: 24px;
}

.rate-limit-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.rate-limit-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* 访问控制网格样式 */
.access-control-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* Mapper 样式优化 */
.mapper-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(240, 242, 255, 0.3);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mapper-item:hover {
  background: rgba(240, 242, 255, 0.5);
}

.mapper-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mapper-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mapper-delete {
  flex-shrink: 0;
  margin-top: 4px;
}

.mapper-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mapper-row .n-input {
  flex: 1;
}

.rate-limit-section {
  margin-bottom: 24px;
}

.rate-limit-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: var(--daw-text-secondary);
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
