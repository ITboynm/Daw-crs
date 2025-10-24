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
            v-model:value="searchName"
            placeholder="搜索用户名"
            clearable
            style="width: 160px"
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          <n-input
            v-model:value="searchEmail"
            placeholder="搜索邮箱"
            clearable
            style="width: 180px"
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          <n-input
            v-model:value="searchId"
            placeholder="搜索ID"
            clearable
            style="width: 120px"
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

      <!-- 筛选条件 -->
      <n-divider style="margin: 20px 0" />
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">Level 筛选</span>
            <n-input-number
              v-model:value="filterForm.level"
              :min="0"
              :max="9"
              placeholder="0-9"
              clearable
              style="width: 120px"
            />
          </div>
          <div class="filter-item">
            <span class="filter-label">特殊过滤器</span>
            <n-input
              v-model:value="filterForm.identifier"
              placeholder="L2, G1, R3, T2, F1.5, .1.42., email等"
              clearable
              style="width: 320px"
            >
              <template #suffix>
                <n-popover trigger="hover" placement="top">
                  <template #trigger>
                    <n-icon style="cursor: help"><InformationCircleOutline /></n-icon>
                  </template>
                  <div style="max-width: 300px">
                    <p style="margin: 0 0 8px 0; font-weight: 600">支持的特殊过滤器:</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem">
                      <li>L{n} - 按 Level 筛选 (如: L2)</li>
                      <li>G{n} - 按 Gear 筛选 (如: G1)</li>
                      <li>R{n} - 按 Role 筛选 (如: R3)</li>
                      <li>T{n} - 按 Tier 筛选 (如: T2)</li>
                      <li>F{n} - 按 Factor 筛选 (如: F1.5)</li>
                      <li>.{dna} - 按 DNA 路径筛选 (如: .1.42.)</li>
                      <li>{email} - 按邮箱筛选</li>
                      <li>{id} - 按 ID 筛选</li>
                      <li>{name} - 按用户名筛选</li>
                    </ul>
                  </div>
                </n-popover>
              </template>
            </n-input>
          </div>
          <div class="filter-buttons">
            <n-button type="primary" @click="applyFilters" :loading="loading">
              应用筛选
            </n-button>
            <n-button @click="resetFilters">
              重置
            </n-button>
          </div>
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
      <div v-if="isRoot" class="root-package-action">
        <n-button size="small" type="warning" ghost @click="openPackageModal()">
          <template #icon>
            <n-icon><TimeOutline /></n-icon>
          </template>
          变更套餐到期时间
        </n-button>
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
                配置模型到分组的路由规则，例如将gpt-4模型路由到分组1，将claude-3模型路由到分组2
              </n-alert>
              <div v-for="(item, index) in editForm.levelMapperList" :key="index" class="mapper-item">
                <div class="mapper-inputs">
                  <n-input
                    v-model:value="item.key"
                    placeholder="模型名 (支持通配符*)"
                    size="medium"
                  />
                  <div class="mapper-arrow">
                    <n-icon size="20" color="#2080f0"><ArrowForwardOutline /></n-icon>
                  </div>
                  <n-input
                    v-model:value="item.value"
                    placeholder="分组号"
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
const allAccounts = ref([]); // 当前页的数据
const loading = ref(false);
const submitting = ref(false);
const searchName = ref('');
const searchEmail = ref('');
const searchId = ref('');
const totalCount = ref(0);

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

// 后端分页配置
const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  itemCount: totalCount.value, // 使用后端返回的总数
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }) => `共 ${itemCount} 条`,
  onUpdatePage: (page) => {
    currentPage.value = page;
    refreshList(); // 后端分页,需要重新加载数据
  },
  onUpdatePageSize: (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    refreshList(); // 后端分页,需要重新加载数据
  },
}));

const currentPage = ref(1);
const pageSize = ref(20);

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

  // 排序：有效的在前，失效的在后
  return processedCredits.sort((a, b) => {
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? 1 : -1;
    }
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
                },
                {
                  icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
                }
              ),
            default: () => '确定删除该子账户？此操作不可恢复！',
          }
        )
      );

      return h('div', { class: 'action-buttons' }, buttons);
    },
  },
];

// 表格数据 - 直接使用后端返回的当前页数据
const filteredAccounts = computed(() => {
  return allAccounts.value;
});

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
async function refreshList() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    };

    // 如果有 level 筛选
    if (filterForm.value.level !== null && filterForm.value.level !== undefined && filterForm.value.level !== '') {
      params.level = filterForm.value.level;
    }

    // 添加搜索参数
    if (searchName.value?.trim()) {
      params.name = searchName.value.trim();
    }
    if (searchEmail.value?.trim()) {
      params.email = searchEmail.value.trim();
    }
    if (searchId.value?.trim()) {
      const id = parseInt(searchId.value.trim(), 10);
      if (!isNaN(id)) {
        params.id = id;
      }
    }

    // 支持特殊路径过滤器
    let endpoint = '/x-dna';
    if (filterForm.value.identifier && filterForm.value.identifier.trim()) {
      const identifier = filterForm.value.identifier.trim();
      // 使用路径参数方式调用，支持 L{n}, G{n}, R{n}, T{n}, F{n}, .{dna} 等特殊过滤器
      const response = await getDescendant(identifier);
      // 如果使用了特殊路径过滤器，返回的可能是单个用户或用户列表
      if (response.data.users) {
        allAccounts.value = response.data.users || [];
        // 从响应头获取总数
        const headers = response.headers || {};
        const headerTotal = headers['x-total-count'] || headers['X-Total-Count'];
        totalCount.value = headerTotal ? parseInt(headerTotal, 10) : (response.data.total || allAccounts.value.length);
      } else if (Array.isArray(response.data)) {
        allAccounts.value = response.data;
        const headers = response.headers || {};
        const headerTotal = headers['x-total-count'] || headers['X-Total-Count'];
        totalCount.value = headerTotal ? parseInt(headerTotal, 10) : response.data.length;
      } else {
        // 单个用户
        allAccounts.value = [response.data];
        totalCount.value = 1;
      }
    } else {
      // 普通列表查询
      const response = await getDescendants(params);
      allAccounts.value = response.data.users || response.data || [];

      // 从响应头获取总数
      const headers = response.headers || {};
      const headerTotal = headers['x-total-count'] || headers['X-Total-Count'];
      totalCount.value = headerTotal ? parseInt(headerTotal, 10) : (response.data.total || allAccounts.value.length);
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '获取子账户列表失败';
    message.error(errorMessage);
    allAccounts.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

// 重置筛选条件
function resetFilters() {
  filterForm.value = {
    level: null,
    identifier: '',
  };
  currentPage.value = 1;
  refreshList();
}

// 应用筛选条件
function applyFilters() {
  currentPage.value = 1;
  refreshList();
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
