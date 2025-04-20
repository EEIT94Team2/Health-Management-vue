<template>
  <div class="workouts-management">
    <div class="search-and-add">
      <el-form :inline="true" :model="workoutSearchForm" class="search-form">
        <el-form-item label="運動類型">
          <el-select
            v-model="workoutSearchForm.type"
            placeholder="請選擇運動類型"
            style="width: 200px"
          >
            <el-option
              v-for="type in exerciseTypes"
              :key="type"
              :label="type"
              :value="type"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期範圍">
          <el-date-picker
            v-model="workoutSearchForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="$emit('search-workouts', workoutSearchForm)"
            >查詢</el-button
          >
          <el-button @click="$emit('reset-workout-search')">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="info" @click="$emit('open-add-workout')"
        >新增運動記錄</el-button
      >
    </div>

    <el-table :data="workouts" border style="width: 100%">
      <el-table-column prop="type" label="運動類型" />
      <el-table-column prop="duration" label="持續時間 (分鐘)" />
      <el-table-column prop="startTime" label="開始時間" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="$emit('open-edit-workout', scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="$emit('delete-workout', scope.row.id)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="workoutCurrentPage"
        :page-size="workoutPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="workoutTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('workout-size-change', $event)"
        @current-change="$emit('workout-current-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, defineProps, defineEmits } from "vue";

const props = defineProps({
  workouts: {
    type: Array,
    required: true,
  },
  exerciseTypes: {
    type: Array,
    required: true,
  },
  workoutCurrentPage: {
    type: Number,
    required: true,
  },
  workoutPageSize: {
    type: Number,
    required: true,
  },
  workoutTotal: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "open-add-workout",
  "open-edit-workout",
  "delete-workout",
  "workout-size-change",
  "workout-current-change",
  "search-workouts",
  "reset-workout-search",
]);

const workoutSearchForm = reactive({ type: "", dateRange: null });
</script>
