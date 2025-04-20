<template>
  <div class="body-data">
    <h2>身體數據</h2>
    <div v-if="loadingBodyData">載入中...</div>
    <div v-else-if="bodyData.length > 0">
      <ul>
        <li v-for="data in bodyData" :key="data.id || data.date">
          日期：{{ data.date }}，體重：{{ data.weight }} kg，體脂率：{{
            data.bodyFat
          }}%
          <button @click="$emit('open-edit-body-data', data)">編輯</button>
          <button @click="$emit('delete-body-data', data.id)">刪除</button>
          <button @click="$emit('open-view-body-data', data)">查看</button>
        </li>
      </ul>
    </div>
    <div v-else>沒有身體數據。</div>
    <button @click="$emit('open-add-body-data')">新增身體數據</button>
    <div id="body-data-chart" style="width: 100%; height: 400px"></div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  bodyData: {
    type: Array,
    required: true,
  },
  loadingBodyData: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "open-add-body-data",
  "open-edit-body-data",
  "delete-body-data",
  "open-view-body-data",
]);
</script>

<style scoped>
.body-data button {
  margin-left: 5px;
}
</style>
