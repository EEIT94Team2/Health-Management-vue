<template>
  <div class="diet-chart-container">
    <h1>飲食記錄</h1>

    <div class="chart-header">
      <div class="chart-controls">
        <button
          @click="changeTimeUnit('week')"
          :class="{ active: currentTimeUnit === 'week' }"
        >
          週
        </button>
        <button
          @click="changeTimeUnit('month')"
          :class="{ active: currentTimeUnit === 'month' }"
        >
          月
        </button>
        <button
          @click="changeTimeUnit('quarter')"
          :class="{ active: currentTimeUnit === 'quarter' }"
        >
          季
        </button>
        <button
          @click="changeTimeUnit('year')"
          :class="{ active: currentTimeUnit === 'year' }"
        >
          年
        </button>
        <button
          @click="openCustomDateRangeDialog"
          :class="{ active: currentTimeUnit === 'custom' }"
        >
          自訂
        </button>
      </div>
      <button class="add-record-button" @click="openAddModal">新增記錄</button>
    </div>

    <div class="chart-container">
      <div class="chart-section">
        <h3>營養成分分佈</h3>
        <v-chart
          ref="nutritionPieChartRef"
          :option="nutritionPieChartOptions"
          :key="nutritionPieChartKey"
          autoresize
          class="echarts pie-chart"
        />
      </div>
      <div class="chart-section">
        <h3>餐別熱量分佈</h3>
        <v-chart
          ref="mealTimePieChartRef"
          :option="mealTimePieChartOptions"
          :key="mealTimePieChartKey"
          autoresize
          class="echarts pie-chart"
        />
      </div>
    </div>

    <div class="list-toggle">
      <button @click="toggleListVisible">
        {{ isListVisible ? "收起數據列表" : "查看數據列表" }}
      </button>
    </div>

    <div v-if="isListVisible && dietData.length > 0" class="diet-list">
      <h3>飲食記錄列表</h3>
      <el-table
        :data="sortedDietData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="mealtime" label="餐別" />
        <el-table-column
          prop="foodName"
          label="食物內容"
          show-overflow-tooltip
        />
        <el-table-column prop="calories" label="總熱量 (大卡)" />
        <el-table-column prop="protein" label="蛋白質 (克)" />
        <el-table-column prop="carbs" label="碳水化合物 (克)" />
        <el-table-column prop="fats" label="脂肪 (克)" />
        <el-table-column label="記錄時間">
          <template #default="scope">
            {{ formatDate(scope.row.recordDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="205">
          <template #default="scope">
            <el-button :icon="'edit'" @click="editDietRecord(scope.row)"
              >編輯</el-button
            >
            <el-button
              :icon="'delete'"
              type="danger"
              @click="deleteDietRecord(scope.row)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else-if="isListVisible && dietData.length === 0" class="no-data">
      暫無飲食記錄。
    </div>

    <el-dialog v-model="dialogVisible" title="編輯飲食記錄">
      <el-form :model="dietForm" label-width="120px">
        <el-form-item label="食物名稱" placeholder="填寫食物名稱">
          <el-input v-model="dietForm.foodName"></el-input>
        </el-form-item>
        <el-form-item label="餐別">
          <el-select v-model="dietForm.mealtime" placeholder="選擇餐別">
            <el-option label="早餐" value="早餐"></el-option>
            <el-option label="午餐" value="午餐"></el-option>
            <el-option label="晚餐" value="晚餐"></el-option>
            <el-option label="點心" value="點心"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="記錄日期">
          <el-date-picker
            v-model="dietForm.recordDate"
            type="date"
            placeholder="選擇日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="總熱量 (大卡)">
          <el-input-number
            v-model="dietForm.calories"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="蛋白質 (克)">
          <el-input-number
            v-model="dietForm.protein"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="碳水化合物 (克)">
          <el-input-number v-model="dietForm.carbs" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="脂肪 (克)">
          <el-input-number v-model="dietForm.fats" :min="0"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDietForm">確認</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteConfirmVisible" title="確認刪除">
      <p>確定要刪除選中的飲食記錄嗎？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteDietRecordConfirmed"
            >確認刪除</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="customDateRangeDialogVisible" title="自訂時間範圍">
      <el-form label-width="120px">
        <el-form-item label="開始日期">
          <el-date-picker
            v-model="customStartDate"
            type="date"
            placeholder="選擇開始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="結束日期">
          <el-date-picker
            v-model="customEndDate"
            type="date"
            placeholder="選擇結束日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="customDateRangeDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="applyCustomDateRange"
            >應用</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns";
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent, // 添加工具箱組件，包含導出圖片功能
} from "echarts/components";
import { useAuthStore } from "@/stores/auth";
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElInputNumber,
  ElTable,
  ElTableColumn,
  ElButton,
  ElMessage,
  ElSelect,
  ElOption,
} from "element-plus";
import { useRouter } from "vue-router";
import { bottom, left } from "@popperjs/core";

use([
  CanvasRenderer,
  PieChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent, // 添加工具箱組件
]);

const router = useRouter();
const dietData = ref([]);
const nutritionPieChartOptions = ref({});
const mealTimePieChartOptions = ref({});
const nutritionPieChartKey = ref(0);
const mealTimePieChartKey = ref(0);
const authStore = useAuthStore();
const currentTimeUnit = ref("week");
const nutritionPieChartRef = ref(null);
const mealTimePieChartRef = ref(null);

// 列表相關
const isListVisible = ref(false);

// 新增/編輯彈窗相關
const dialogVisible = ref(false);
const isEditing = ref(false);
const dietForm = ref({
  recordId: null,
  foodName: "",
  mealtime: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  recordDate: new Date(),
});
const editingRecordId = ref(null);

// 刪除確認彈窗相關
const deleteConfirmVisible = ref(false);
const selectedRecords = ref([]);
const selectedRecord = ref(null); // 用於編輯和刪除單個選中的記錄

// 自訂日期範圍相關
const customDateRangeDialogVisible = ref(false);
const customStartDate = ref(null);
const customEndDate = ref(null);

// 數據排序 - 按日期排列
const sortedDietData = computed(() => {
  if (!dietData.value || dietData.value.length === 0) return [];

  const sortedData = [...dietData.value];

  return sortedData.sort((a, b) => {
    const dateA = new Date(a.startTime || a.exerciseDate);
    const dateB = new Date(b.startTime || b.exerciseDate);
    return dateB - dateA;
  });
});

const fetchDietData = async (
  unit = currentTimeUnit.value,
  startDate = null,
  endDate = null
) => {
  if (!authStore.userInfo?.id) {
    console.log("沒有用戶ID，無法獲取數據");
    return;
  }

  let apiUrl = `/api/tracking/nutrition/user/${authStore.userInfo.id}/date-range`; // 修改 API URL
  const headers = {
    Authorization: `Bearer ${authStore.getToken}`,
  };

  let start, end;

  switch (unit) {
    case "week":
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
      end = endOfWeek(new Date(), { weekStartsOn: 1 });
      apiUrl += `?startDate=${format(
        start,
        "yyyy-MM-dd"
      )}T00:00:00&endDate=${format(end, "yyyy-MM-dd")}T23:59:59`; // 包含時間
      break;
    case "month":
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
      apiUrl += `?startDate=${format(
        start,
        "yyyy-MM-dd"
      )}T00:00:00&endDate=${format(end, "yyyy-MM-dd")}T23:59:59`; // 包含時間
      break;
    case "quarter":
      start = startOfQuarter(new Date());
      end = endOfQuarter(new Date());
      apiUrl += `?startDate=${format(
        start,
        "yyyy-MM-dd"
      )}T00:00:00&endDate=${format(end, "yyyy-MM-dd")}T23:59:59`; // 包含時間
      break;
    case "year":
      start = startOfYear(new Date());
      end = endOfYear(new Date());
      apiUrl += `?startDate=${format(
        start,
        "yyyy-MM-dd"
      )}T00:00:00&endDate=${format(end, "yyyy-MM-dd")}T23:59:59`; // 包含時間
      break;
    case "custom":
      if (startDate && endDate) {
        apiUrl += `?startDate=${format(
          startDate,
          "yyyy-MM-dd"
        )}T00:00:00&endDate=${format(endDate, "yyyy-MM-dd")}T23:59:59`;
      }
      break;
    default:
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
      end = endOfWeek(new Date(), { weekStartsOn: 1 });
      apiUrl += `?startDate=${format(
        start,
        "yyyy-MM-dd"
      )}T00:00:00&endDate=${format(end, "yyyy-MM-dd")}T23:59:59`;
      break;
  }

  try {
    const response = await axios.get(apiUrl, { headers });

    // 更健壯的數據處理
    let data = [];
    if (response.data && Array.isArray(response.data)) {
      data = response.data;
    } else if (
      response.data &&
      response.data.content &&
      Array.isArray(response.data.content)
    ) {
      data = response.data.content;
    }

    dietData.value = data;
    generateCharts(unit, start, end);
  } catch (error) {
    console.error("取得飲食記錄失敗 (date-range)", error);
    ElMessage.error("無法獲取飲食記錄");
  }
};

const toggleListVisible = () => {
  isListVisible.value = !isListVisible.value;
};

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection;
};

const editDietRecord = (record) => {
  selectedRecords.value = [record];
  openEditModal();
};

const deleteDietRecord = (record) => {
  selectedRecords.value = [record];
  confirmDeleteRecord();
};

const generateCharts = (
  timeUnit = "week",
  startDate = null,
  endDate = null
) => {
  if (dietData.value.length === 0) {
    // 空數據時，設置統一風格的空數據提示
    const noDataOption = {
      backgroundColor: "rgba(0,0,0,0.1)",
      title: {
        text: `營養素分佈 (${getTimeUnitLabel(timeUnit)})`,
        textStyle: { color: "white" },
        left: "center",
      },
      // 添加工具箱配置，即使沒有數據也保留
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: "保存為圖片",
            name: `營養素分佈_${getTimeUnitLabel(timeUnit)}_${format(
              new Date(),
              "yyyyMMdd_HHmmss"
            )}`,
            pixelRatio: 2,
          },
        },
        iconStyle: {
          color: "#fff",
          borderColor: "#fff",
        },
        emphasis: {
          iconStyle: {
            color: "#5470c6",
          },
        },
      },
      // 使用 graphic 元素顯示「暫無飲食數據」
      graphic: [
        {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "暫無飲食數據",
            fontSize: 20,
            fontWeight: "bold",
            fill: "rgba(255, 255, 255, 0.7)", // 白色半透明文字
            textAlign: "center",
          },
        },
        {
          type: "image",
          z: -1,
          style: {
            image:
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNXY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0ydi00Ij48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz0iMTcgOCAxMiAzIDcgOCI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIzIiB4Mj0iMTIiIHkyPSIxNSI+PC9saW5lPjwvc3ZnPg==",
            width: 48,
            height: 48,
            x: "center",
            y: "center",
            opacity: 0.3, // 半透明圖標
          },
          position: [0, -60], // 將圖標上移相對於文字的位置
        },
      ],
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      // 保留坐標軸但隱藏標籤
      xAxis: {
        type: "category",
        data: [],
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.2)" } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.2)" } },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      series: [], // 空系列
    };

    // 設置兩個圖表的選項
    nutritionPieChartOptions.value = {
      ...noDataOption,
      title: {
        ...noDataOption.title,
        text: `營養素分佈 (${getTimeUnitLabel(timeUnit)})`,
      },
      toolbox: {
        ...noDataOption.toolbox,
        feature: {
          saveAsImage: {
            ...noDataOption.toolbox.feature.saveAsImage,
            name: `營養素分佈_${getTimeUnitLabel(timeUnit)}_${format(
              new Date(),
              "yyyyMMdd_HHmmss"
            )}`,
          },
        },
      },
    };

    mealTimePieChartOptions.value = {
      ...noDataOption,
      title: {
        ...noDataOption.title,
        text: `餐別熱量分佈 (${getTimeUnitLabel(timeUnit)})`,
      },
      toolbox: {
        ...noDataOption.toolbox,
        feature: {
          saveAsImage: {
            ...noDataOption.toolbox.feature.saveAsImage,
            name: `餐別熱量分佈_${getTimeUnitLabel(timeUnit)}_${format(
              new Date(),
              "yyyyMMdd_HHmmss"
            )}`,
          },
        },
      },
    };

    nutritionPieChartKey.value++;
    mealTimePieChartKey.value++;
    return;
  }

  // 計算營養素總量
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  // 計算不同餐別的熱量分佈
  let breakfastCalories = 0;
  let lunchCalories = 0;
  let dinnerCalories = 0;
  let snackCalories = 0;

  dietData.value.forEach((item) => {
    totalProtein += item.protein || 0;
    totalCarbs += item.carbs || 0;
    totalFats += item.fats || 0;

    switch (item.mealtime) {
      case "早餐":
        breakfastCalories += item.calories || 0;
        break;
      case "午餐":
        lunchCalories += item.calories || 0;
        break;
      case "晚餐":
        dinnerCalories += item.calories || 0;
        break;
      case "點心":
        snackCalories += item.calories || 0;
        break;
    }
  });

  // 獲取當前時間戳，用於設置導出文件名
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const nutritionExportFilename = `營養素分佈_${getTimeUnitLabel(
    timeUnit
  )}_${timestamp}`;
  const mealTimeExportFilename = `餐別熱量分佈_${getTimeUnitLabel(
    timeUnit
  )}_${timestamp}`;

  // 配置營養素分佈圓餅圖
  nutritionPieChartOptions.value = {
    backgroundColor: "rgba(0,0,0,0.1)",
    title: {
      text: `營養素分佈 (${getTimeUnitLabel(timeUnit)})`,
      textStyle: { color: "white" },
      left: "center",
    },
    // 添加工具箱配置，包含導出圖片功能
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: "保存為圖片",
          name: nutritionExportFilename,
          pixelRatio: 2,
        },
      },
      iconStyle: {
        color: "#fff",
        borderColor: "#fff",
      },
      emphasis: {
        iconStyle: {
          color: "#5470c6",
        },
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c}克 ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: ["蛋白質", "碳水化合物", "脂肪"],
      textStyle: { color: "white" },
    },
    series: [
      {
        name: "營養素",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c}克 ({d}%)",
          color: "white",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: true,
        },
        data: [
          {
            value: Math.round(totalProtein * 10) / 10,
            name: "蛋白質",
            itemStyle: { color: "#FF6384" },
          },
          {
            value: Math.round(totalCarbs * 10) / 10,
            name: "碳水化合物",
            itemStyle: { color: "#36A2EB" },
          },
          {
            value: Math.round(totalFats * 10) / 10,
            name: "脂肪",
            itemStyle: { color: "#FFCE56" },
          },
        ],
      },
    ],
  };

  // 配置餐別熱量分佈圓餅圖
  mealTimePieChartOptions.value = {
    backgroundColor: "rgba(0,0,0,0.1)",
    title: {
      text: `餐別熱量分佈 (${getTimeUnitLabel(timeUnit)})`,
      textStyle: { color: "white" },
      left: "center",
    },
    // 添加工具箱配置，包含導出圖片功能
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: "保存為圖片",
          name: mealTimeExportFilename,
          pixelRatio: 2,
        },
      },
      iconStyle: {
        color: "#fff",
        borderColor: "#fff",
      },
      emphasis: {
        iconStyle: {
          color: "#5470c6",
        },
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c}大卡 ({d}%)",
      enterable: false,
      confine: true,
    },
    legend: {
      left: "left",
      orient: "vertical",
      data: ["早餐", "午餐", "晚餐", "點心"],
      textStyle: { color: "white" },
    },
    series: [
      {
        name: "餐別熱量",
        type: "pie",
        radius: "55%",
        center: ["50%", "60%"],
        label: {
          show: true,
          formatter: "{b}: {c}大卡 ({d}%)",
          color: "white",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        data: [
          {
            value: Math.round(breakfastCalories),
            name: "早餐",
            itemStyle: { color: "#4BC0C0" },
          },
          {
            value: Math.round(lunchCalories),
            name: "午餐",
            itemStyle: { color: "#FF9F40" },
          },
          {
            value: Math.round(dinnerCalories),
            name: "晚餐",
            itemStyle: { color: "#9966FF" },
          },
          {
            value: Math.round(snackCalories),
            name: "點心",
            itemStyle: { color: "#FF6384" },
          },
        ],
      },
    ],
  };

  nutritionPieChartKey.value++;
  mealTimePieChartKey.value++;
};

const formatDate = (dateTimeString) => {
  if (!dateTimeString) {
    return "";
  }
  try {
    const date = new Date(dateTimeString);
    return format(date, "yyyy/MM/dd HH:mm");
  } catch (error) {
    console.error("日期格式化錯誤", error);
    return dateTimeString;
  }
};

const getTimeUnitLabel = (unit) => {
  switch (unit) {
    case "week":
      return "本週";
    case "month":
      return "本月";
    case "quarter":
      return "本季";
    case "year":
      return "本年";
    case "custom":
      return "自訂時間";
    default:
      return "本週";
  }
};

const changeTimeUnit = (unit) => {
  currentTimeUnit.value = unit;
  if (unit !== "custom") {
    fetchDietData(unit);
  }
};

const openAddModal = () => {
  isEditing.value = false;
  dietForm.value = {
    recordId: null,
    foodName: "",
    mealtime: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    recordDate: new Date(),
  };
  dialogVisible.value = true;
};

const openEditModal = () => {
  if (selectedRecords.value.length === 1) {
    isEditing.value = true;
    const recordToEdit = selectedRecords.value[0];
    editingRecordId.value = recordToEdit.recordId;
    dietForm.value = {
      recordId: recordToEdit.recordId,
      foodName: recordToEdit.foodName,
      mealtime: recordToEdit.mealtime,
      calories: recordToEdit.calories || 0,
      protein: recordToEdit.protein || 0,
      carbs: recordToEdit.carbs || 0,
      fats: recordToEdit.fats || 0,
      recordDate: new Date(recordToEdit.recordDate),
    };
    dialogVisible.value = true;
  } else if (selectedRecords.value.length > 1) {
    ElMessage.warning("請選擇一條記錄進行編輯");
  } else {
    ElMessage.warning("請選擇一條記錄");
  }
};

const submitDietForm = async () => {
  try {
    const payload = {
      ...dietForm.value,
      recordDate: format(dietForm.value.recordDate, "yyyy-MM-dd HH:mm:ss"),
      userId: authStore.userInfo.id,
    };
    const headers = { Authorization: `Bearer ${authStore.getToken}` };

    if (isEditing.value && editingRecordId.value) {
      await axios.put(
        `/api/tracking/nutrition/${editingRecordId.value}`,
        payload,
        { headers }
      );
      ElMessage.success("飲食記錄更新成功");
    } else {
      await axios.post(`/api/tracking/nutrition/add`, payload, { headers });
      ElMessage.success("飲食記錄新增成功");
    }
    dialogVisible.value = false;
    fetchDietData(currentTimeUnit.value); // 重新獲取當前時間單位的數據
  } catch (error) {
    console.error("新增/編輯飲食記錄失敗", error);
    ElMessage.error(`新增/編輯飲食記錄失敗: ${error.message}`);
  }
};

const confirmDeleteRecord = () => {
  if (selectedRecords.value.length >= 1) {
    deleteConfirmVisible.value = true;
  } else {
    ElMessage.warning("請選擇至少一條記錄進行刪除");
  }
};

const deleteDietRecordConfirmed = async () => {
  try {
    const idToDelete = selectedRecords.value[0].recordId;
    const headers = { Authorization: `Bearer ${authStore.getToken}` };
    await axios.delete(`/api/tracking/nutrition/${idToDelete}`, { headers });
    ElMessage.success("飲食記錄刪除成功");
    deleteConfirmVisible.value = false;
    fetchDietData(currentTimeUnit.value); // 重新獲取當前時間單位的數據
    selectedRecords.value = [];
    selectedRecord.value = null;
  } catch (error) {
    console.error("刪除飲食記錄失敗", error);
    ElMessage.error(`刪除飲食記錄失敗: ${error.message}`);
  }
};

const openCustomDateRangeDialog = () => {
  customDateRangeDialogVisible.value = true;
};

const applyCustomDateRange = () => {
  if (customStartDate.value && customEndDate.value) {
    currentTimeUnit.value = "custom";
    fetchDietData("custom", customStartDate.value, customEndDate.value);
    customDateRangeDialogVisible.value = false;
  } else {
    ElMessage.warning("請選擇開始和結束日期");
  }
};

watch(currentTimeUnit, (newUnit) => {
  if (newUnit !== "custom") {
    fetchDietData(newUnit);
  }
});

onMounted(() => {
  if (authStore.userInfo?.id) {
    fetchDietData();
  } else {
    ElMessage.warning("請先登入");
  }

  // 添加視窗尺寸變化監聽，確保圖表正確調整大小
  const handleResize = () => {
    if (
      nutritionPieChartRef.value &&
      nutritionPieChartRef.value.echartsInstance
    ) {
      nutritionPieChartRef.value.echartsInstance.resize();
    }
    if (
      mealTimePieChartRef.value &&
      mealTimePieChartRef.value.echartsInstance
    ) {
      mealTimePieChartRef.value.echartsInstance.resize();
    }
  };

  window.addEventListener("resize", handleResize);

  // 保存函數引用以便卸載時使用
  window._chartResizeHandler = handleResize;
});

// 在組件卸載時清除監聽器
onUnmounted(() => {
  if (window._chartResizeHandler) {
    window.removeEventListener("resize", window._chartResizeHandler);
    delete window._chartResizeHandler;
  }
});
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
}

.pie-chart {
  width: 100%;
  height: 500;
}

.chart-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
  flex-wrap: wrap;
}

.chart-section {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 15px;
}

.chart-section h3 {
  color: white;
  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
}

.diet-chart-container {
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.diet-chart-container h1 {
  color: white;
  margin-bottom: 20px;
  text-align: center;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-controls button {
  padding: 8px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  border-radius: 5px;
}

.chart-controls button.active {
  background-color: #8caae7;
  color: white;
  border-color: #8caae7;
}

.chart-controls button:hover {
  background-color: #e0e0e0;
}

.add-record-button {
  padding: 10px 20px;
  border: none;
  background-color: #8caae7;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}

.add-record-button:hover {
  background-color: #67c23a;
}

.chart-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.chart-actions button {
  padding: 10px 20px;
  border: none;
  background-color: #3376b8;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}

.chart-actions button:hover {
  background-color: #67c23a;
}

.list-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.list-toggle button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}

.list-toggle button:hover {
  background-color: #eee;
}

.workout-list {
  margin-top: 20px;
  color: white;
}

.no-data {
  color: white;
  text-align: center;
  padding: 20px;
}
</style>
