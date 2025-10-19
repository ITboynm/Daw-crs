<template>
  <div class="app-sidebar">
    <div class="app-sidebar__brand" :class="{ 'app-sidebar__brand--collapsed': collapsed }">
      <div class="brand-icon">
        <img src="@/assets/logo.png" alt="DawAPI Logo" />
      </div>
      <div v-if="!collapsed" class="brand-title">
        <span class="brand-name">{{ appName }}</span>
        <span class="brand-tagline">Unified AI Control</span>
      </div>
    </div>
    <n-scrollbar class="app-sidebar__menu">
      <n-menu
        v-model:value="activeKey"
        :collapsed="collapsed"
        :options="menuOptions"
        :collapsed-width="64"
        :collapsed-icon-size="18"
        :root-indent="18"
        :indent="18"
        @update:value="handleSelect"
      />
    </n-scrollbar>
  </div>
</template>

<script setup>
import { computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { NMenu, NScrollbar } from 'naive-ui';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate']);
const route = useRoute();
const appName = import.meta.env.VITE_APP_NAME || 'DawAPI';

const groupedOptions = computed(() => {
  const groups = new Map();
  props.items.forEach((item) => {
    const groupKey = item.group || 'default';
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(item);
  });
  return groups;
});

const menuOptions = computed(() => {
  const options = [];
  groupedOptions.value.forEach((items, groupKey) => {
    const children = items.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon ? () => h(item.icon, { size: 20 }) : undefined,
      meta: item,
    }));
    if (groupKey === 'default') {
      options.push(...children);
    } else {
      options.push({
        key: `group-${groupKey}`,
        label: groupKey,
        type: 'group',
        children,
      });
    }
  });
  return options;
});

const activeKey = computed({
  get() {
    const current = props.items.find((item) => item.to?.name === route.name);
    return current?.key || null;
  },
  set(value) {
    if (!value) return;
    const target = props.items.find((item) => item.key === value);
    if (target) {
      emit('navigate', target);
    }
  },
});

function handleSelect(key, item) {
  const target = props.items.find((nav) => nav.key === key);
  if (target) {
    emit('navigate', target);
  }
}
</script>

<style scoped>
.app-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 18px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(14px);
  border-right: 1px solid rgba(226, 232, 240, 0.8);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding: 0 12px;
  transition: var(--daw-transition);
}

.app-sidebar__brand img {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: var(--daw-shadow-sm);
}

.app-sidebar__brand--collapsed {
  justify-content: center;
}

.brand-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-name {
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.01em;
}

.brand-tagline {
  font-size: 0.72rem;
  color: var(--daw-text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-sidebar__menu {
  flex: 1;
  padding-right: 6px;
}

:deep(.n-menu) {
  background: transparent;
}

:deep(.n-menu-item-content) {
  border-radius: 14px;
  transition: var(--daw-transition);
  padding: 10px 14px;
}

:deep(.n-menu-item-content::before) {
  display: none;
}

:deep(.n-menu-item-content:hover) {
  background: rgba(93, 95, 246, 0.12);
}

:deep(.n-menu-item-content.n-menu-item-content--active) {
  background: rgba(93, 95, 246, 0.18);
  color: var(--daw-primary);
  box-shadow: inset 0 0 0 1px rgba(93, 95, 246, 0.2);
}

:deep(.n-menu-item-group-title) {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--daw-text-secondary);
  margin: 16px 14px 6px;
}
</style>
