<script setup>
import { NButton, NForm, NFormItem, NImage, NInput, NInputNumber, NPopconfirm } from 'naive-ui'
import { h, onMounted, ref } from 'vue'

import api from '@/api'
import CommonPage from '@/components/common/CommonPage.vue'
import CrudModal from '@/components/crud/CrudModal.vue'
import CrudTable from '@/components/crud/CrudTable.vue'

import QueryItem from '@/components/crud/QueryItem.vue'
import UploadOne from '@/components/UploadOne.vue'
import { useCRUD } from '@/composables'
import { convertImgUrl, formatDate, IMG_PLACEHOLDER } from '@/utils'

defineOptions({ name: '项目管理' })

const $table = ref(null)
const queryItems = ref({
  keyword: '', // 项目名称 | 简介 | 技术栈
})

const {
  modalVisible,
  modalTitle,
  modalLoading,
  handleAdd,
  handleDelete,
  handleEdit,
  handleSave,
  modalForm,
  modalFormRef,
} = useCRUD({
  name: '项目',
  initForm: { sort: 0 },
  doCreate: api.saveOrUpdateProject,
  doDelete: api.deleteProjects,
  doUpdate: api.saveOrUpdateProject,
  refresh: () => $table.value?.handleSearch(),
})

onMounted(() => {
  $table.value?.handleSearch()
})

// 技术栈存的是逗号分隔字符串, 表格里渲染成小标签
function renderTechStack(stack) {
  return stack
    ? stack.split(',').map(t => t.trim()).filter(Boolean).map(t =>
        h('span', { class: 'mr-1 inline-block rounded bg-gray-100 px-1.5 text-xs dark:bg-gray-700' }, t))
    : '-'
}

const columns = [
  { type: 'selection', width: 15, fixed: 'left' },
  {
    title: '封面',
    key: 'cover',
    width: 60,
    align: 'center',
    render(row) {
      return h(NImage, {
        'height': 40,
        'imgProps': { style: { 'border-radius': '3px', 'object-fit': 'cover' } },
        'src': convertImgUrl(row.cover),
        'fallback-src': IMG_PLACEHOLDER,
        'show-toolbar-tooltip': true,
      })
    },
  },
  {
    title: '项目名',
    key: 'name',
    width: 80,
    align: 'center',
    ellipsis: { tooltip: true },
  },
  {
    title: '技术栈',
    key: 'tech_stack',
    minWidth: 100,
    align: 'center',
    render(row) {
      return renderTechStack(row.tech_stack)
    },
  },
  {
    title: '简介',
    key: 'intro',
    width: 140,
    align: 'center',
    ellipsis: { tooltip: true },
  },
  {
    title: '排序',
    key: 'sort',
    width: 40,
    align: 'center',
  },
  {
    title: '创建日期',
    key: 'created_at',
    width: 80,
    align: 'center',
    render(row) {
      return h(
        NButton,
        { size: 'small', type: 'text', ghost: true },
        {
          default: () => formatDate(row.created_at),
          icon: () => h('i', { class: 'i-mdi:clock-time-three-outline' }),
        },
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          { size: 'small', type: 'primary', onClick: () => handleEdit(row) },
          { default: () => '编辑', icon: () => h('i', { class: 'i-material-symbols:edit-outline' }) },
        ),
        h(
          NPopconfirm,
          { onPositiveClick: () => handleDelete([row.id], false) },
          {
            trigger: () => h(
              NButton,
              { size: 'small', type: 'error', style: 'margin-left: 15px;' },
              { default: () => '删除', icon: () => h('i', { class: 'i-material-symbols:delete-outline' }) },
            ),
            default: () => h('div', {}, '确定删除该项目吗?'),
          },
        ),
      ]
    },
  },
]
</script>

<template>
  <CommonPage title="项目管理">
    <template #action>
      <NButton type="primary" @click="handleAdd">
        <template #icon>
          <span class="i-material-symbols:add" />
        </template>
        新建项目
      </NButton>
      <NButton
        type="error"
        :disabled="!$table?.selections.length"
        @click="handleDelete($table?.selections)"
      >
        <template #icon>
          <span class="i-material-symbols:playlist-remove" />
        </template>
        批量删除
      </NButton>
    </template>

    <CrudTable
      ref="$table"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="api.getProjects"
    >
      <template #queryBar>
        <QueryItem label="项目名 | 简介 | 技术栈" :label-width="150">
          <NInput
            v-model:value="queryItems.keyword"
            clearable
            type="text"
            placeholder="搜索关键字"
            @keydown.enter="$table?.handleSearch()"
          />
        </QueryItem>
      </template>
    </CrudTable>

    <CrudModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :loading="modalLoading"
      @save="handleSave"
    >
      <NForm
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <NFormItem
          label="项目名称"
          path="name"
          :rule="{ required: true, message: '请输入项目名称', trigger: ['input', 'blur'] }"
        >
          <NInput v-model:value="modalForm.name" placeholder="请输入项目名称" />
        </NFormItem>
        <NFormItem label="项目封面" path="cover">
          <UploadOne v-model:preview="modalForm.cover" :width="160" />
        </NFormItem>
        <NFormItem label="在线地址" path="url">
          <NInput v-model:value="modalForm.url" placeholder="项目演示地址 (选填)" />
        </NFormItem>
        <NFormItem label="源码地址" path="repo_url">
          <NInput v-model:value="modalForm.repo_url" placeholder="GitHub 仓库地址 (选填)" />
        </NFormItem>
        <NFormItem label="技术栈" path="tech_stack">
          <NInput v-model:value="modalForm.tech_stack" placeholder="逗号分隔, 如: Vue3,Gin,MySQL" />
        </NFormItem>
        <NFormItem label="项目简介" path="intro">
          <NInput
            v-model:value="modalForm.intro"
            type="textarea"
            :rows="3"
            placeholder="一句话介绍这个项目"
          />
        </NFormItem>
        <NFormItem label="展示顺序" path="sort">
          <NInputNumber v-model:value="modalForm.sort" :min="0" class="w-full" />
        </NFormItem>
      </NForm>
    </CrudModal>
  </CommonPage>
</template>
