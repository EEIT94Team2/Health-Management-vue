<template>
  <div class="workout-chart-container">
    <h1>健身目標</h1>

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
      <button class="add-record-button" @click="openEditDialog(null)">
        新增目標
      </button>
    </div>

    <v-chart
      ref="chartRef"
      :option="chartOptions"
      :key="chartKey"
      autoresize
      class="echarts"
    />

    <div class="chart-actions">
      <button @click="downloadChart">匯出圖片</button>
    </div>

    <div class="list-toggle">
      <button @click="toggleListVisible">
        {{ isListVisible ? "收起數據列表" : "查看數據列表" }}
      </button>
    </div>

    <div v-if="isListVisible && goalsProgress.length > 0" class="workout-list">
      <h3>健身目標列表</h3>
      <el-table :data="goalsProgress" border style="width: 100%">
        <el-table-column prop="goalType" label="目標類型"></el-table-column>
        <el-table-column prop="targetValue" label="目標值"></el-table-column>
        <el-table-column prop="unit" label="單位"></el-table-column>
        <el-table-column prop="currentProgress" label="目前進度">
          <template #default="{ row }">
            {{ formatProgress(row.currentProgress) }}%
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="開始日期"></el-table-column>
        <el-table-column prop="endDate" label="結束日期"></el-table-column>
        <el-table-column prop="status" label="狀態"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button :icon="Edit" @click="openEditDialog(scope.row)"
              >編輯</el-button
            >
            <el-button
              :icon="Delete"
              type="danger"
              @click="confirmDelete(scope.row.goalId)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      v-else-if="isListVisible && goalsProgress.length === 0"
      class="no-data"
    >
      暫無健身目標。
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.goalId ? '編輯目標' : '新增目標'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="目標類型">
          <el-select v-model="editForm.goalType" placeholder="選擇目標類型">
            <el-option label="減重" value="減重"></el-option>
            <el-option label="增肌" value="增肌"></el-option>
            <el-option label="減脂" value="減脂"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目標值">
          <el-input-number
            v-model="editForm.targetValue"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="單位">
          <el-select v-model="editForm.unit" placeholder="選擇單位">
            <el-option
              v-for="item in filteredUnitOptions"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="開始日期">
          <el-date-picker
            v-model="editForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="結束日期">
          <el-date-picker
            v-model="editForm.endDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="editForm.status">
            <el-option label="進行中" value="進行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用最近數據">
          <el-checkbox v-model="editForm.useLatestData"></el-checkbox>
        </el-form-item>
        <el-form-item
          v-if="!editForm.useLatestData && editForm.goalType === '減重'"
          label="起始體重 (公斤)"
        >
          <el-input-number v-model="editForm.startWeight"></el-input-number>
        </el-form-item>
        <el-form-item
          v-if="!editForm.useLatestData && editForm.goalType === '減脂'"
          label="起始體脂率 (%)"
        >
          <el-input-number v-model="editForm.startBodyFat"></el-input-number>
        </el-form-item>
        <el-form-item
          v-if="!editForm.useLatestData && editForm.goalType === '增肌'"
          label="起始肌肉量 (公斤)"
        >
          <el-input-number v-model="editForm.startMuscleMass"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="isSaving"
            >儲存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="confirmDeleteVisible" title="確認刪除">
      <span>您確定要刪除此目標嗎？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDeleteVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="handleDeleteConfirmed"
            :loading="isDeleting"
            >確認</el-button
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
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  parseISO,
  addDays,
} from "date-fns";
import { ref, reactive, onMounted, computed, watch } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { Edit, Delete } from "@element-plus/icons-vue";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const authStore = useAuthStore();
const chartKey = ref(0);
const chartRef = ref(null);
const chartOptions = ref({});

// 列表顯示控制
const isListVisible = ref(false);
const toggleListVisible = () => {
  isListVisible.value = !isListVisible.value;
};

// 健身目標數據
const goalsProgress = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表單
const searchForm = reactive({
  startDateRange: null,
  goalType: "",
  status: "",
});

// 編輯表單
const editDialogVisible = ref(false);
const editForm = reactive({
  goalId: null,
  userId: null,
  goalType: "",
  targetValue: null,
  unit: "",
  currentProgress: null,
  startDate: null,
  endDate: null,
  status: "進行中",
  useLatestData: true,
  startWeight: null,
  startBodyFat: null,
  startMuscleMass: null,
});

// 刪除確認
const confirmDeleteVisible = ref(false);
const deletingGoalId = ref(null);
const isDeleting = ref(false);
const isSaving = ref(false);

// 單位選項
const unitOptions = ref(["公斤", "%"]);
const filteredUnitOptions = computed(() => {
  if (editForm.goalType === "增肌") {
    return ["公斤"];
  }
  return unitOptions.value;
});

// 時間單位控制
const currentTimeUnit = ref("week");
const customDateRangeDialogVisible = ref(false);
const customStartDate = ref(null);
const customEndDate = ref(null);

// 格式化進度顯示
const formatProgress = (value) => {
  if (value === null || value === undefined) {
    return "0";
  }
  return Math.floor(value);
};

// 監聽目標類型變化，自動設置單位
watch(
  () => editForm.goalType,
  (newGoalType) => {
    if (newGoalType === "減重") {
      editForm.unit = "公斤";
    } else if (newGoalType === "減脂") {
      editForm.unit = "%";
    } else if (newGoalType === "增肌") {
      editForm.unit = "公斤";
    } else {
      editForm.unit = "";
    }
    editForm.startWeight = null;
    editForm.startBodyFat = null;
    editForm.startMuscleMass = null;
  }
);

// 監聽用戶ID變化
watch(
  () => authStore.userInfo?.id,
  (newUserId) => {
    if (newUserId) {
      fetchGoalsProgress();
    }
  }
);

// 監聽時間單位變化
watch(currentTimeUnit, (newUnit) => {
  if (newUnit !== "custom") {
    fetchGoalsProgress();
  }
});

// 獲取健身目標數據
const fetchGoalsProgress = async () => {
  const currentUserId = authStore.userInfo?.id;
  if (!currentUserId) {
    console.log("沒有用戶ID，無法獲取數據");
    return;
  }

  let startDate, endDate;

  switch (currentTimeUnit.value) {
    case "week":
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      break;
    case "month":
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      break;
    case "quarter":
      startDate = startOfQuarter(new Date());
      endDate = endOfQuarter(new Date());
      break;
    case "year":
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
      break;
    case "custom":
      startDate = customStartDate.value;
      endDate = customEndDate.value;
      break;
    default:
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
  }

  const params = {
    page: currentPage.value - 1,
    size: pageSize.value,
    startDate: searchForm.startDateRange
      ? searchForm.startDateRange[0]
      : format(startDate, "yyyy-MM-dd"),
    endDate: searchForm.startDateRange
      ? searchForm.startDateRange[1]
      : format(endDate, "yyyy-MM-dd"),
    goalType: searchForm.goalType || null,
    status: searchForm.status || null,
  };

  try {
    const response = await axios.get(
      `/api/tracking/fitnessgoals/user/${currentUserId}`,
      {
        params,
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      }
    );
    goalsProgress.value = response.data.content;
    total.value = response.data.totalElements;
    generateChart();
  } catch (error) {
    console.error("獲取健身目標失敗", error);
    ElMessage.error("獲取健身目標失敗");
  }
};

// 重置搜索表單
const resetSearchForm = () => {
  searchForm.startDateRange = null;
  searchForm.goalType = "";
  searchForm.status = "";
  currentPage.value = 1;
  fetchGoalsProgress();
};

// 打開編輯對話框
const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
    editForm.useLatestData = !(
      row.startWeight !== null &&
      row.startWeight !== undefined &&
      row.startBodyFat !== null &&
      row.startBodyFat !== undefined &&
      row.startMuscleMass !== null &&
      row.startMuscleMass !== undefined
    );
  } else {
    Object.assign(editForm, {
      goalId: null,
      userId: authStore.userInfo?.id,
      goalType: "",
      targetValue: null,
      unit: "",
      currentProgress: null,
      startDate: null,
      endDate: null,
      status: "進行中",
      useLatestData: true,
      startWeight: null,
      startBodyFat: null,
      startMuscleMass: null,
    });
  }
  editDialogVisible.value = true;
};

// 保存編輯
const saveEdit = async () => {
  isSaving.value = true;
  try {
    const payload = {
      userId: editForm.userId,
      goalType: editForm.goalType,
      targetValue: editForm.targetValue,
      unit: editForm.unit,
      currentProgress: editForm.currentProgress,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      status: editForm.status,
    };

    if (!editForm.useLatestData) {
      payload.startWeight = editForm.startWeight;
      payload.startBodyFat = editForm.startBodyFat;
      payload.startMuscleMass = editForm.startMuscleMass;
    }

    const apiEndpoint = editForm.goalId
      ? `/api/tracking/fitnessgoals/${editForm.goalId}`
      : "/api/tracking/fitnessgoals";
    const httpMethod = editForm.goalId ? "put" : "post";

    await axios[httpMethod](apiEndpoint, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.getToken}`,
      },
    });

    ElMessage.success(`健身目標${editForm.goalId ? "更新" : "新增"}成功`);
    editDialogVisible.value = false;
    fetchGoalsProgress();
  } catch (error) {
    console.error(`健身目標${editForm.goalId ? "更新" : "新增"}失敗`, error);
    ElMessage.error(`健身目標${editForm.goalId ? "更新" : "新增"}失敗`);
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    }
  } finally {
    isSaving.value = false;
  }
};

// 確認刪除
const confirmDelete = (id) => {
  deletingGoalId.value = id;
  confirmDeleteVisible.value = true;
};

// 執行刪除
const handleDeleteConfirmed = async () => {
  isDeleting.value = true;
  try {
    await axios.delete(`/api/tracking/fitnessgoals/${deletingGoalId.value}`, {
      headers: { Authorization: `Bearer ${authStore.getToken}` },
    });
    ElMessage.success("健身目標已刪除");
    confirmDeleteVisible.value = false;
    fetchGoalsProgress();
  } catch (error) {
    console.error("刪除健身目標失敗", error);
    ElMessage.error("刪除健身目標失敗");
  } finally {
    isDeleting.value = false;
    deletingGoalId.value = null;
  }
};

// 分頁控制
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchGoalsProgress();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchGoalsProgress();
};

// 生成圖表
const generateChart = () => {
  if (goalsProgress.value.length === 0) {
    chartOptions.value = {
      title: { text: "暫無目標數據", textStyle: { color: "white" } },
    };
    chartKey.value++;
    return;
  }

  const goalTypes = [];
  const targetValues = [];
  const currentValues = [];
  const progressPercentages = [];

  // 篩選最多5個目標來顯示，優先顯示進行中的目標
  const activeGoals = goalsProgress.value
    .filter((goal) => goal.status === "進行中")
    .slice(0, 5);

  const displayGoals =
    activeGoals.length < 5
      ? [
          ...activeGoals,
          ...goalsProgress.value
            .filter((goal) => goal.status !== "進行中")
            .slice(0, 5 - activeGoals.length),
        ]
      : activeGoals;

  displayGoals.forEach((goal) => {
    goalTypes.push(goal.goalType + (goal.unit ? `(${goal.unit})` : ""));

    // 計算目標值
    targetValues.push(goal.targetValue);

    // 計算當前值 (根據目標進度和目標值計算)
    const currentValue = goal.currentProgress
      ? (goal.targetValue * goal.currentProgress) / 100
      : 0;
    currentValues.push(parseFloat(currentValue.toFixed(1)));

    // 進度百分比
    progressPercentages.push(goal.currentProgress || 0);
  });

  chartOptions.value = {
    backgroundColor: "rgba(0,0,0,0.1)",
    title: {
      text: "健身目標進度",
      textStyle: { color: "white" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: function (params) {
        const targetParams = params[0];
        const currentParams = params[1];
        const index = targetParams.dataIndex;
        const progressPercent = progressPercentages[index];

        return (
          `${targetParams.name}<br/>` +
          `${targetParams.seriesName}: ${targetParams.value}<br/>` +
          `${currentParams.seriesName}: ${currentParams.value}<br/>` +
          `完成進度: ${progressPercent.toFixed(0)}%`
        );
      },
    },
    legend: {
      data: ["目標值", "當前值"],
      textStyle: { color: "white" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: { color: "white" },
      axisLine: { lineStyle: { color: "#eee" } },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    yAxis: {
      type: "category",
      data: goalTypes,
      axisLabel: {
        color: "white",
        interval: 0,
        formatter: function (value) {
          if (value.length > 10) {
            return value.substring(0, 10) + "...";
          }
          return value;
        },
      },
      axisLine: { lineStyle: { color: "#eee" } },
    },
    series: [
      {
        name: "目標值",
        type: "bar",
        data: targetValues,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "rgba(160, 207, 255, 0.7)" },
              { offset: 1, color: "rgba(100, 150, 230, 0.7)" },
            ],
          },
        },
        label: {
          show: true,
          position: "insideRight",
          color: "#fff",
          formatter: "{c}",
        },
        z: 1,
      },
      {
        name: "當前值",
        type: "bar",
        data: currentValues,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#91cc75" },
              { offset: 1, color: "#67c23a" },
            ],
          },
        },
        label: {
          show: true,
          position: "insideRight",
          color: "#fff",
          formatter: "{c}",
        },
        z: 2,
      },
    ],
  };

  chartKey.value++;
};

// 變更時間單位
const changeTimeUnit = (unit) => {
  currentTimeUnit.value = unit;
  if (unit !== "custom") {
    fetchGoalsProgress();
  }
};

// 打開自訂日期範圍對話框
const openCustomDateRangeDialog = () => {
  customDateRangeDialogVisible.value = true;
};

// 應用自訂日期範圍
const applyCustomDateRange = () => {
  if (customStartDate.value && customEndDate.value) {
    currentTimeUnit.value = "custom";
    fetchGoalsProgress();
    customDateRangeDialogVisible.value = false;
  } else {
    ElMessage.warning("請選擇開始和結束日期");
  }
};

// 下載圖表為圖片
const downloadChart = () => {
  setTimeout(() => {
    if (chartRef.value && chartRef.value.echartsInstance) {
      const chartInstance = chartRef.value.echartsInstance;
      chartInstance.downloadAsImage({
        name: `健身目標圖表_${currentTimeUnit.value}`,
        type: "png",
        background: "white",
      });
    } else {
      ElMessage.warning("圖表尚未準備好，請稍後再試。");
    }
  }, 500);
};

// 組件掛載時加載數據
onMounted(() => {
  if (authStore.userInfo?.id) {
    fetchGoalsProgress();
  }
});
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
}

.workout-chart-container {
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.workout-chart-container h1 {
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
  background-color: #409eff;
  color: white;
  border-color: #409eff;
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
