<template>
  <div class="fitness-view">
    <div class="fitness-container">
      <div class="page-header">
        <h1>成效追蹤</h1>
      </div>

      <el-tabs
        type="border-card"
        v-model="activeTab"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="身體指標" name="body-data">
          <el-card class="content-card">
            <template #header> <div class="card-header"></div> </template>
            <BodyDataManager
              :body-data="bodyData"
              :loading-body-data="loadingBodyData"
              @open-add-body-data="openAddBodyDataDialog"
              @open-edit-body-data="openEditBodyDataDialog"
              @delete-body-data="openDeleteConfirmation"
              @change-time-unit="handleTimeGranularityChange"
              @apply-custom-date-range="fetchBodyDataByDateRange"
            />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="運動紀錄" name="workout-records">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <WorkoutRecordsManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="飲食追蹤" name="diet-records">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <DietRecordsManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="目標設定" name="goals-progress">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <GoalsProgressManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="概覽" name="overview">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <OverviewSection />
          </el-card>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="workoutDialogVisible" :title="workoutDialogTitle">
        <el-form :model="workoutForm" label-width="120px">
          <el-form-item label="用戶 ID">
            <el-input
              v-model="workoutForm.userId"
              :disabled="!!workoutForm.id"
            ></el-input>
          </el-form-item>
          <el-form-item label="運動類型">
            <el-select v-model="workoutForm.type" placeholder="請選擇運動類型">
              <el-option
                v-for="type in exerciseTypes.value"
                :key="type"
                :label="type"
                :value="type"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="持續時間 (分鐘)">
            <el-input-number v-model="workoutForm.duration" :min="1" />
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="workoutForm.value.startTime"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="workoutDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveWorkout">儲存</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="bodyDataDialogVisible" :title="bodyDataDialogTitle">
        <el-form :model="bodyDataForm" label-width="120px">
          <el-form-item label="日期">
            <el-date-picker
              v-model="bodyDataForm.dateRecorded"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="體重 (kg)">
            <el-input-number
              v-model="bodyDataForm.weight"
              :min="1"
              :step="0.1"
            />
          </el-form-item>
          <el-form-item label="體脂率 (%)">
            <el-input-number
              v-model="bodyDataForm.bodyFat"
              :min="0"
              :max="100"
              :step="0.1"
            />
          </el-form-item>
          <el-form-item label="身高 (公分)">
            <el-input-number v-model="bodyDataForm.height" :min="0" :step="1" />
          </el-form-item>
          <el-form-item label="腰圍 (公分)">
            <el-input-number
              v-model="bodyDataForm.waistCircumference"
              :min="0"
              :step="0.1"
            />
          </el-form-item>
          <el-form-item label="臀圍 (公分)">
            <el-input-number
              v-model="bodyDataForm.hipCircumference"
              :min="0"
              :step="0.1"
            />
          </el-form-item>
          <el-form-item label="肌肉量 (公斤)">
            <el-input-number
              v-model="bodyDataForm.muscleMass"
              :min="0"
              :step="0.1"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="bodyDataDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveBodyData">儲存</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog
        v-model="viewBodyDataDialogVisible"
        title="查看身體數據"
        width="30%"
      >
        <el-form :model="viewBodyData" label-width="120px">
          <el-form-item label="日期">
            <span>{{ viewBodyData.date }}</span>
          </el-form-item>
          <el-form-item label="體重 (kg)">
            <span>{{ viewBodyData.weight }}</span>
          </el-form-item>
          <el-form-item label="體脂率 (%)">
            <span>{{ viewBodyData.bodyFat }}</span>
          </el-form-item>
          <el-form-item label="身高 (公分)" v-if="viewBodyData.height">
            <span>{{ viewBodyData.height }}</span>
          </el-form-item>
          <el-form-item
            label="腰圍 (公分)"
            v-if="viewBodyData.waistCircumference"
          >
            <span>{{ viewBodyData.waistCircumference }}</span>
          </el-form-item>
          <el-form-item
            label="臀圍 (公分)"
            v-if="viewBodyData.hipCircumference"
          >
            <span>{{ viewBodyData.hipCircumference }}</span>
          </el-form-item>
          <el-form-item label="肌肉量 (公斤)" v-if="viewBodyData.muscleMass">
            <span>{{ viewBodyData.muscleMass }}</span>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="viewBodyDataDialogVisible = false"
              >關閉</el-button
            >
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="confirmDeleteBodyDataVisible" title="確認刪除">
        <span>您確定要刪除此身體數據嗎？</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="confirmDeleteBodyDataVisible = false"
              >取消</el-button
            >
            <el-button
              type="danger"
              @click="handleDeleteBodyDataConfirmed"
              :loading="isDeletingBodyData"
            >
              確認
            </el-button>
          </span>
        </template>
      </el-dialog>
      <div class="chatbot-container-wrapper">
        <Chatbot />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  watch,
  nextTick,
  reactive,
  computed,
  onBeforeUnmount,
} from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import * as echarts from "echarts";
import {
  ElMessage,
  ElTabs,
  ElTabPane,
  ElCard,
  ElSelect,
  ElOption,
} from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { Edit, Delete, Search } from "@element-plus/icons-vue";

// 導入分離出的組件
import WorkoutRecordsManagement from "./WorkoutRecords.vue";
import BodyDataManager from "./BodyData.vue";
import OverviewSection from "./OverviewSection.vue";
import DietRecordsManagement from "./DietRecords.vue";
import GoalsProgressManagement from "./GoalsProgress.vue";
import Chatbot from "./Chatbot.vue";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const activeTab = ref(route.query.tab || "body-data");

// 反應式數據
const workouts = ref([]);
const bodyData = ref([]);
const chartData = ref([]);
const dietRecordsData = ref([]);
const loadingDiet = ref(false);
const errorDiet = ref(null);
const dietRecords = ref([]);

const errorGoals = ref(null);
const goalsProgress = ref([]);
const errorWorkouts = ref(null);
const showDataTable = ref(false);

// 載入狀態
const loadingWorkouts = ref(false);
const loadingBodyData = ref(false);
const loadingOverviewChart = ref(false);
const loadingWorkoutChart = ref(false);
const loadingBodyDataChart = ref(false);
const loadingDietRecords = ref(false);
const isSavingGoals = ref(false);
const isDeletingGoal = ref(false);
const isDeletingDiet = ref(false);

// 圖表實例
let workoutChartInstance = null;
let bodyDataChartInstance = null;

// 運動記錄相關
const workoutTotal = ref(0);
const workoutCurrentPage = ref(1);
const workoutPageSize = ref(10);
const workoutDialogVisible = ref(false);
const workoutDialogTitle = ref("");
const userId = computed(() => authStore.userInfo?.id);
console.log("Computed userId:", userId.value);
const token = computed(() => authStore.getToken);
const workoutForm = ref({
  id: null,
  type: "",
  duration: null,
  startTime: null,
  userId: authStore.userInfo?.id,
});

// 身體數據相關
const bodyDataDialogVisible = ref(false);
const bodyDataDialogTitle = ref("");
const bodyDataForm = ref({
  id: null,
  date: null,
  weight: null,
  bodyFat: null,
  height: null,
  waistCircumference: null,
  hipCircumference: null,
  muscleMass: null,
  userId: authStore.userInfo?.id,
});
const viewBodyDataDialogVisible = ref(false);
const viewBodyData = ref({});

// 飲食記錄相關
const confirmDeleteBodyDataVisible = ref(false);
const deletingBodyDataId = ref(null);
const isDeletingBodyData = ref(false);
const dietRecordsTotal = ref(0);
const dietRecordsCurrentPage = ref(1);
const dietRecordsPageSize = ref(10);
const dietEditDialogVisible = ref(false);
const dietEditForm = reactive({
  recordId: null,
  userId: authStore.userInfo?.id,
  name: "",
  mealtime: "",
  foodName: "",
  calories: null,
  protein: null,
  carbs: null,
  fats: null,
  recordDate: new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
});
const confirmDeleteDietVisible = ref(false);
const deletingDietRecordId = ref(null);

// 健身目標相關
const goalsProgressTotal = ref(0);
const goalsProgressCurrentPage = ref(1);
const goalsProgressPageSize = ref(10);
const goalsEditDialogVisible = ref(false);
const goalsEditForm = reactive({
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
const confirmDeleteGoalVisible = ref(false);
const deletingGoalId = ref(null);
const unitOptions = ref(["公斤", "%"]);

const filteredUnitOptions = computed(() => {
  if (goalsEditForm.goalType === "增肌") {
    return ["公斤"];
  }
  return unitOptions.value;
});

watch(
  () => goalsEditForm.goalType,
  (newGoalType) => {
    if (newGoalType === "減重") {
      goalsEditForm.unit = "公斤";
    } else if (newGoalType === "減脂") {
      goalsEditForm.unit = "%";
    } else if (newGoalType === "增肌") {
      goalsEditForm.unit = "公斤";
    } else {
      goalsEditForm.unit = "";
    }
    goalsEditForm.startWeight = null;
    goalsEditForm.startBodyFat = null;
    goalsEditForm.startMuscleMass = null;
  }
);

// 監聽 authStore.user 的變化，以便在用戶 ID 可用時獲取數據
watch(
  () => authStore.userInfo?.id,
  (newUserInfo) => {
    if (newUserInfo?.id) {
      console.log("userInfo became available in FitnessView:", newUserInfo.id);
      fetchBodyData();
    } else if (authStore.isAuthenticated) {
      console.warn(
        "userInfo is still null or undefined after auth is authenticated."
      );
      // 可以嘗試再次觸發刷新用戶資訊的操作
      authStore.refreshUserInfo();
    }
  },
  { immediate: true }
);

const fetchBodyData = async () => {
  if (!authStore.userInfo?.id) return;
  loadingBodyData.value = true;
  try {
    const response = await axios.get(
      `/api/tracking/body-metrics/user/${authStore.userInfo?.id}`,
      {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      }
    );
    bodyData.value = response.data;
    console.log("fetchBodyData 成功:", bodyData.value);
  } catch (error) {
    console.error("獲取身體數據失敗", error);
    ElMessage.error("獲取身體數據失敗");
  } finally {
    loadingBodyData.value = false;
  }
};

const openAddBodyDataDialog = () => {
  bodyDataDialogTitle.value = "新增身體數據";
  bodyDataForm.value = {
    id: null,
    dateRecorded: new Date().toISOString().slice(0, 10),
    weight: null,
    bodyFat: null,
    height: null,
    waistCircumference: null,
    hipCircumference: null,
    muscleMass: null,
    userId: authStore.userInfo?.id,
  };
  bodyDataDialogVisible.value = true;
};

const openEditBodyDataDialog = (data) => {
  bodyDataDialogTitle.value = "編輯身體數據";
  bodyDataForm.value = { ...data };
  bodyDataDialogVisible.value = true;
};

const saveBodyData = async () => {
  try {
    const payload = {
      ...bodyDataForm.value,
    };
    if (bodyDataForm.value.id) {
      await axios.put(
        `/api/tracking/body-metrics/${bodyDataForm.value.id}`,
        payload
      );
      ElMessage.success("身體數據更新成功");
    } else {
      await axios.post("/api/tracking/body-metrics", payload);
      ElMessage.success("身體數據新增成功");
    }
    bodyDataDialogVisible.value = false;
    fetchBodyData();
  } catch (error) {
    console.error("保存身體數據失敗", error);
    ElMessage.error("保存身體數據失敗");
  }
};

const handleDeleteBodyDataConfirmed = async () => {
  isDeletingBodyData.value = true;
  try {
    await axios.delete(
      `/api/tracking/body-metrics/${deletingBodyDataId.value}`,
      {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      }
    );
    ElMessage.success("身體數據刪除成功");
    confirmDeleteBodyDataVisible.value = false;
    // 重新獲取身體數據以更新列表
    fetchBodyData();
  } catch (error) {
    console.error("刪除身體數據失敗", error);
    ElMessage.error("刪除身體數據失敗");
  } finally {
    isDeletingBodyData.value = false;
    deletingBodyDataId.value = null;
  }
};
const openDeleteConfirmation = (id) => {
  deletingBodyDataId.value = id;
  confirmDeleteBodyDataVisible.value = true;
};

const openViewBodyDataDialog = (data) => {
  viewBodyData.value = { ...data };
  viewBodyDataDialogVisible.value = true;
};

const selectedTimeGranularity = ref("month");
const customDateRange = ref(null);

const handleTimeGranularityChange = (granularity) => {
  selectedTimeGranularity.value = granularity;
  if (granularity !== "custom") {
    const expandedRange = calculateExpandedDateRange(granularity);
    fetchBodyDataByDateRange(
      granularity,
      expandedRange.startDate,
      expandedRange.endDate
    );
    customDateRange.value = null; // 清空自訂日期範圍
  }
};

// 修復 calculateExpandedDateRange 函數缺少閉合括號的問題
const calculateExpandedDateRange = (granularity) => {
  const now = new Date();
  let startDate, endDate;

  switch (granularity) {
    case "week":
      // 獲取包含本週的整個月
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "month":
      // 獲取包含本月的整個季度
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    case "quarter":
      // 獲取包含本季度的前後各一個月
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3 - 1, 1);
      endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3 + 1, 0);
      break;
    case "year":
      // 獲取整個年度的數據
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      // 默認獲取最近三個月的數據
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // 格式化為YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

const handleCustomDateRangeChange = (value) => {
  customDateRange.value = value;
};
const handleDeleteBodyData = (id) => {
  console.log("刪除身體數據，ID:", id);
};

const handleTabChange = (tabName) => {
  console.log("切換到 Tab:", tabName);
  activeTab.value = tabName;
  router.push({ query: { tab: tabName } });
};

const fetchCustomDateRangeData = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    const startDate = customDateRange.value[0];
    const endDate = customDateRange.value[1];
    fetchBodyDataByDateRange("custom", startDate, endDate);
  } else {
    ElMessage.warning("請選擇開始和結束日期");
  }
};

const fetchBodyDataByDateRange = async (
  granularity = selectedTimeGranularity.value,
  startDate = null,
  endDate = null
) => {
  if (!authStore.userInfo?.id) return;
  loadingBodyDataChart.value = true;
  let calculatedStartDate, calculatedEndDate;

  if (granularity === "custom" && startDate && endDate) {
    calculatedStartDate = startDate;
    calculatedEndDate = endDate;
  } else {
    const range = calculateDateRange(granularity);
    calculatedStartDate = range.startDate;
    calculatedEndDate = range.endDate;
  }

  try {
    const response = await axios.get(`/api/tracking/body-metrics/search`, {
      headers: { Authorization: `Bearer ${authStore.getToken}` },
      params: {
        userId: authStore.userInfo?.id,
        startDate: calculatedStartDate,
        endDate: calculatedEndDate,
        page: 0,
        size: 1000,
      },
    });
    bodyData.value = response.data.content;
    console.log("獲取到的原始身體數據:", bodyData.value.length, "筆");
  } catch (error) {
    console.error("依日期範圍獲取身體數據失敗", error);
    ElMessage.error("依日期範圍獲取身體數據失敗");
  } finally {
    loadingBodyDataChart.value = false;
  }
};

const calculateDateRange = (granularity) => {
  const now = new Date();
  let startDate, endDate;

  if (granularity === "week") {
    const dayOfWeek = now.getDay(); // 0 (Sunday) - 6 (Saturday)
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 計算這週的第一天
    startDate = new Date(now.setDate(diff));
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
  } else if (granularity === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (granularity === "quarter") {
    const month = now.getMonth();
    const startMonth = Math.floor(month / 3) * 3;
    startDate = new Date(now.getFullYear(), startMonth, 1);
    endDate = new Date(now.getFullYear(), startMonth + 3, 0);
  } else if (granularity === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }

  // 格式化為YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

// 圖表渲染函數
const renderBodyDataChart = (data, granularity) => {
  const chartDom = document.getElementById("body-data-chart");

  if (!chartDom) return;

  // 確保容器有足夠的大小
  chartDom.style.width = "100%";
  chartDom.style.height = "500px";
  chartDom.style.overflow = "visible";

  // 銷毀可能存在的舊實例
  if (bodyDataChartInstance) {
    bodyDataChartInstance.dispose();
  }

  nextTick(() => {
    bodyDataChartInstance = echarts.init(chartDom);
    console.log("ECharts instance initialized:", bodyDataChartInstance); // 追蹤 ECharts 實例

    if (data && data.length > 0) {
      const dates = data.map((item) => item.dateRecorded);
      const weights = data.map((item) => item.weight);
      const bodyFats = data.map((item) => item.bodyFat);
      const muscleMasses = data.map((item) => item.muscleMass);

      // 如果數據少於 2 個，新增一些空數據點以展開圖表
      if (dates.length < 2) {
        // 填充前後數據點，確保圖表有足夠空間
        dates.unshift(""); // 添加空的前置日期
        dates.push(""); // 添加空的後置日期
        weights.unshift(null);
        weights.push(null);
        bodyFats.unshift(null);
        bodyFats.push(null);
        muscleMasses.unshift(null);
        muscleMasses.push(null);
      }

      const option = {
        title: {
          text: "身體數據變化",
          left: "center",
          top: 0,
          textStyle: {
            fontSize: 18,
            color: "white",
          },
        },
        tooltip: {
          trigger: "axis",
          confine: false,
          appendToBody: true,
          position: function (point, params, dom, rect, size) {
            return [
              Math.min(
                point[0] + 10,
                window.innerWidth - size.contentSize[0] - 20
              ),
              Math.min(
                point[1] - 10,
                window.innerHeight - size.contentSize[1] - 20
              ),
            ];
          },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          textStyle: {
            color: "#333",
          },
          formatter: function (params) {
            if (params[0].axisValue === "") return "";

            let result = `<div style="font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:5px">
      ${params[0].axisValue}
    </div>`;

            params.forEach((param) => {
              if (param.value === null || param.value === undefined) return;

              let unit = "";
              if (
                param.seriesName === "體重" ||
                param.seriesName === "肌肉量"
              ) {
                unit = " kg";
              } else if (param.seriesName === "體脂率") {
                unit = " %";
              }

              result += `<div style="display:flex;justify-content:space-between;align-items:center;margin:3px 0">
        <span style="display:inline-block;margin-right:5px">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.markerColor};margin-right:5px"></span>
          ${param.seriesName}:
        </span>
        <span style="font-weight:bold">${param.value}${unit}</span>
      </div>`;
            });

            return result;
          },
        },
        legend: {
          data: [
            {
              name: "體重",
              textStyle: {
                color: "#5470c6",
              },
            },
            {
              name: "體脂率",
              textStyle: {
                color: "#91cc75",
              },
            },
            {
              name: "肌肉量",
              textStyle: {
                color: "#FFA500",
              },
            },
          ],
          orient: "horizontal",
          left: "center",
          top: 30,
          itemGap: 40,
          itemWidth: 20,
          itemHeight: 10,
          textStyle: {
            fontSize: 14,
          },
        },
        grid: {
          left: 60,
          right: 100,
          bottom: 80,
          top: 80,
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {
              title: "保存圖片",
            },
            dataZoom: {
              title: {
                zoom: "縮放",
                back: "還原",
              },
            },
            restore: {
              title: "重置",
            },
          },
          right: 20,
          top: 20,
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
          },
          {
            type: "slider",
            start: 0,
            end: 100,
            bottom: 10,
            xAxisIndex: 0,
            labelFormatter: function () {
              return "";
            },
          },
        ],
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: true,
          axisLabel: {
            interval: "auto",
            rotate: 0,
            margin: 15,
            fontSize: 12,
            formatter: function (value) {
              if (value === "") return "";
              const date = new Date(value);
              let formattedDate = "";
              if (granularity === "week") {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const firstDayOfYear = new Date(year, 0, 1);
                const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                const weekNumber = Math.ceil(
                  (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
                );
                formattedDate = `${year}年 第${weekNumber}週 (${month}-${day})`;
              } else if (granularity === "month") {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                formattedDate = `${year}年 ${month}月`;
              } else if (granularity === "quarter") {
                const year = date.getFullYear();
                const month = date.getMonth();
                const quarter = Math.floor(month / 3) + 1;
                let startMonth = (quarter - 1) * 3 + 1;
                let endMonth = quarter * 3;
                formattedDate = `${year}年 第${quarter}季(${startMonth}月-${endMonth}月)`;
              } else if (granularity === "year") {
                formattedDate = `${date.getFullYear()}年`;
              } else if (granularity === "custom") {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                formattedDate = `${year}-${month}-${day}`;
              } else {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                formattedDate = `${year}-${month}-${day}`;
              }
              return formattedDate;
            },
            color: "#00b51a",
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              opacity: 0.3,
            },
          },
        },
        yAxis: [
          {
            type: "value",
            name: "體重 (kg)",
            nameLocation: "middle",
            nameGap: 40,
            position: "left",
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#5470c6",
                fontSize: 20,
              },
            },
            axisLabel: {
              formatter: "{value} kg",
              margin: 5,
              rotate: 0,
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed",
                opacity: 0.3,
              },
            },
          },
          {
            type: "value",
            name: "體脂率 (%)",
            nameLocation: "middle",
            nameGap: 40,
            position: "right",
            alignTicks: true,
            offset: 0,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#91cc75",
                fontSize: 20,
              },
            },
            axisLabel: {
              formatter: "{value} %",
              margin: 5,
              rotate: 0,
            },
            splitLine: {
              show: false,
            },
          },
          {
            type: "value",
            name: "肌肉量 (kg)",
            nameLocation: "middle",
            nameGap: 80,
            position: "right",
            alignTicks: true,
            offset: 80,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#74add1",
                fontSize: 30,
              },
            },
            axisLabel: {
              formatter: "{value} kg",
              margin: 5,
              rotate: 0,
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: "體重",
            type: "line",
            data: weights,
            yAxisIndex: 0,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: {
              width: 3,
            },
            connectNulls: true,
            markPoint: {
              label: {
                formatter: function (param) {
                  return param.name + ": " + param.value + " kg";
                },
                color: "white",
              },
              data: [
                { type: "max", name: "最高" },
                { type: "min", name: "最低" },
              ],
              symbolSize: 60,
            },
            markLine: {
              label: {
                formatter: "{b}: {c} kg",
                color: "#ff9800",
                position: "insideStart",
              },
              data: [{ type: "average", name: "平均" }],
            },
            emphasis: {
              focus: "series",
              scale: 1.1,
            },
          },
          {
            name: "體脂率",
            type: "line",
            data: bodyFats,
            yAxisIndex: 1,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: {
              width: 3,
            },
            connectNulls: true,
            markPoint: {
              label: {
                formatter: function (param) {
                  return param.name + ": " + param.value + " %";
                },
                color: "white",
              },
              data: [
                { type: "max", name: "最高" },
                { type: "min", name: "最低" },
              ],
              symbolSize: 60,
            },
            markLine: {
              label: {
                formatter: "{b}: {c} %",
                color: "#ff9800",
                position: "insideStart",
              },
              data: [{ type: "average", name: "平均" }],
            },
            emphasis: {
              focus: "series",
              scale: 1.1,
            },
          },
          {
            name: "肌肉量",
            type: "line",
            data: muscleMasses,
            yAxisIndex: 2,
            symbol: "circle",
            symbolSize: 10,
            lineStyle: {
              width: 3,
            },
            connectNulls: true,
            markPoint: {
              label: {
                formatter: function (param) {
                  return param.name + ": " + param.value + " kg";
                },
                color: "white",
              },
              data: [
                { type: "max", name: "最高" },
                { type: "min", name: "最低" },
              ],
              symbolSize: 60,
            },
            markLine: {
              label: {
                formatter: "{b}: {c} kg",
                color: "#ff9800",
                position: "insideStart",
              },
              data: [{ type: "average", name: "平均" }],
            },
            emphasis: {
              focus: "series",
              scale: 1.1,
            },
          },
        ],
      };

      // 設置圖表選項
      bodyDataChartInstance.setOption(option);

      // 確保圖表正確渲染
      bodyDataChartInstance.resize(); // 直接調整大小
    } else {
      bodyDataChartInstance.clear();
      console.log("ECharts cleared due to no data"); // 追蹤無資料時清除圖表
    }
  });
  // 響應窗口大小變化
  window.addEventListener("resize", function () {
    if (bodyDataChartInstance) {
      bodyDataChartInstance.resize();
    }
  });
};

onBeforeUnmount(() => {
  if (bodyDataChartInstance) {
    bodyDataChartInstance.dispose();
    bodyDataChartInstance = null;
  }
});

onMounted(() => {
  console.log("Initial workouts:", workouts.value);
  console.log("Initial userId:", userId.value);
  console.log("Initial token:", token.value);
  if (userId.value) {
    fetchBodyData(); // 初始載入所有數據，用於列表顯示
    fetchBodyDataByDateRange(); // 初始載入預設月份的圖表數據
    console.log(
      "onMounted -> fetchBodyData and fetchBodyDataByDateRange called"
    ); // 追蹤資料獲取
  } else {
    console.warn("User ID is not available yet, skipping data fetching.");
    // 可以添加一些處理邏輯，例如顯示載入中狀態或在用戶 ID 可用後再觸發數據獲取
  }
});

watch(selectedTimeGranularity, (newGranularity) => {
  if (newGranularity !== "custom" || customDateRange.value === null) {
    fetchBodyDataByDateRange(newGranularity);
  }
});
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab;
    } else {
      activeTab.value = "body-data";
    }
  }
);

watch(customDateRange, (newRange) => {
  if (
    selectedTimeGranularity.value === "custom" &&
    newRange &&
    newRange.length === 2
  ) {
    fetchCustomDateRangeData();
  }
});
</script>

<style scoped>
.fitness-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  color: white;
}

.content-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  min-height: 400px; /* 確保圖表容器有足夠的高度 */
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: white;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: white;
}
</style>
<style lang="scss" scoped>
.fitness-view {
  min-height: 100vh;
  padding: 100px 0 50px;
  background-color: var(--bg-primary, #f5f7fa);
  color: var(--text-primary, #333);
}

.fitness-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    color: var(--text-primary, #f5eeee);
    margin-bottom: 10px;
  }
}

.el-card {
  border-radius: 12px;
  background-color: var(--card-bg, #fff);
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  &.content-card {
    :deep(.el-card__header) {
      padding: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    :deep(.el-card__body) {
      padding: 25px;
      min-height: 550px;
    }
  }
}

/* 修改頂部欄位樣式 */
:deep(.el-tabs__nav-wrap),
:deep(.el-tabs__header) {
  background-color: #1e293b !important;
  border-radius: 8px 8px 0 0;
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
}

:deep(.el-tabs__item) {
  text-align: center !important;
  padding: 30px 73px !important;
  margin: 0 !important;
  background-color: transparent !important;
  color: #fff !important;
  border: none !important;
  flex-grow: 0 !important;
  flex-shrink: 0 !important;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-size: 1.3rem !important;
  font-weight: bold !important;

  &:hover {
    background-color: rgba(16, 185, 129, 0.15);
    color: #66ccff;
  }

  &.is-active {
    color: #fff;
    background-color: #2c3e50 !important;
    border-bottom: 2px solid #3a8ee6 !important;
  }
}

:deep(.el-tabs__active-line) {
  background-color: #fff;
}

.chart-container {
  width: 100%;
  height: 500px !important;
  margin-top: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: visible !important;

  :deep(.echarts) {
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }

  :deep(.echarts-legend) {
    overflow: visible !important;
    z-index: 100;
  }

  :deep(.echarts-tooltip) {
    z-index: 9999 !important;
    pointer-events: none;
  }
}

/* 表格通用樣式 */
:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: var(--card-bg, #fff);
  color: var(--text-primary, #e9e0e0);
  margin-top: 15px;
}

:deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, #10202b, #234567);
  color: #fff !important;
}

:deep(.el-table thead th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.el-table thead th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.el-table__body-wrapper) {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  overflow: hidden;
}

:deep(.el-table__body tr td.el-table__cell > div) {
  color: #333 !important;
  font-weight: bold !important;
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  color: var(--text-secondary, #666);
}

.loading {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  color: #999;
}

.el-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    color: #ecf0f1 !important;
    font-size: 1rem;
    margin-bottom: 5px;
    font-weight: bold;
  }

  /* 統一修改所有輸入框樣式 */
  :deep(.el-input__wrapper),
  :deep(.el-textarea__wrapper),
  :deep(.el-select .el-input__wrapper),
  :deep(.el-input-number .el-input__wrapper),
  :deep(.el-date-editor .el-input__wrapper) {
    background-color: #4a6572 !important;
    color: #fff !important;
    border-radius: 8px;
    border: none !important;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner),
  :deep(.el-select .el-input__inner),
  :deep(.el-input-number .el-input__inner),
  :deep(.el-date-editor .el-input__inner) {
    color: #fff !important;
    background-color: #4a6572 !important;
    border: none !important;
    height: 40px;
    line-height: 40px;
    padding-left: 12px;
  }

  :deep(.el-textarea__inner) {
    min-height: 80px;
    padding-top: 12px;
  }

  :deep(.el-select .el-input .el-select__caret),
  :deep(.el-date-editor .el-input .el-input__icon) {
    color: #fff !important;
  }

  :deep(.el-input__inner:focus),
  :deep(.el-textarea__inner:focus),
  :deep(.el-select .el-input__inner:focus),
  :deep(.el-input-number .el-input__inner:focus),
  :deep(.el-date-editor .el-input__inner:focus) {
    color: #00ff00 !important;
    font-size: 1.2em !important;
    border-color: var(--highlight-color, #10b981) !important;
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
  }

  :deep(.el-input__inner:focus::placeholder),
  :deep(.el-textarea__inner:focus::placeholder) {
    color: #00ff00;
    font-size: 1.2em;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;

  .el-button {
    margin-left: 10px;
    font-size: 1.1rem;
    padding: 12px 25px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  color: #fff !important;
}

:deep(.el-pagination__total),
:deep(.el-pagination__jump),
:deep(.el-pagination__pager li),
:deep(.el-pagination__text) {
  color: #fff !important;
}

@media (max-width: 767px) {
  .fitness-container {
    padding: 0 15px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .chart-container {
    height: 400px !important;
  }

  .el-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 15px;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }

    :deep(.el-tabs__nav-wrap::after) {
      background-color: transparent;
    }

    :deep(.el-tabs__active-line) {
      background-color: #fff;
      height: 3px;
      border-radius: 3px 3px 0 0;
      margin-bottom: -1px;
    }

    :deep(.el-tabs__content) {
      padding: 10px;
    }
  }
}

:deep(.el-dialog) {
  background-color: #2c3e50 !important;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* 修改 el-dialog 的標題文字顏色 */
:deep(.el-dialog__header) {
  color: #fff !important;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 修改 el-dialog 的內容區域背景色和文字顏色 */
:deep(.el-dialog__body) {
  background-color: #34495e !important;
  padding: 25px;
  color: #ecf0f1 !important;
}

:deep(.el-form-item__label) {
  color: #ecf0f1 !important;
  font-weight: bold;
}
:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper),
:deep(.el-select .el-input__wrapper),
:deep(.el-input-number .el-input__wrapper),
:deep(.el-date-editor .el-input__wrapper) {
  background-color: #4a6572 !important;
  color: #fff !important;
  border-radius: 8px;
  border: none !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__inner),
:deep(.el-input-number .el-input__inner),
:deep(.el-date-editor .el-input__inner) {
  color: #fff !important;
  background-color: #4a6572 !important;
  border: none !important;
  height: 40px;
  line-height: 40px;
  padding-left: 12px;
}

:deep(.el-date-editor.el-input .el-input__inner),
:deep(.el-date-editor.el-input .el-input__wrapper) {
  background-color: #4a6572 !important;
  color: #fff !important;
}

:deep(.el-select .el-input .el-input__wrapper) {
  background-color: #4a6572 !important;
  color: #fff !important;
  border: none !important;
}

:deep(.el-select .el-input .el-input__inner) {
  color: #fff !important;
  background-color: #4a6572 !important;
}

/* 修改 el-input-number 的控制按鈕樣式 */
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: #4a6572 !important;
  color: #fff !important;
  border: 1px solid #607d8b;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: none !important;
  background-color: #34495e !important;
  text-align: center;

  .el-button {
    font-size: 1.3rem;
    padding: 12px 25px;
  }
}

:deep(.el-input-number .el-input__inner:focus),
:deep(.el-textarea__inner:focus),
:deep(.el-select .el-input__inner:focus),
:deep(.el-date-editor .el-input__inner:focus) {
  color: #00ff00 !important;
  font-size: 1.2em !important;
  border-color: var(--highlight-color, #10b981) !important;
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
}

:deep(.el-input__inner:focus::placeholder),
:deep(.el-textarea__inner:focus::placeholder) {
  color: #00ff00;
  font-size: 1.2em;
}

:deep(.el-select-dropdown__item.selected) {
  color: #00ff00 !important;
  font-size: 1.2em !important;
  font-weight: bold;
  background-color: rgba(0, 255, 0, 0.1);
}

:deep(.el-date-table td.is-selected div span) {
  color: #000 !important;
  background-color: #00ff00 !important;
  font-size: 1.2em !important;
}

:deep(.el-dialog__title) {
  color: #fff !important;
  font-size: 1.5em !important;
}
.echarts-datazoom-slider text {
  display: none !important;
}
.chatbot-container-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  width: calc(100% - 20px);
}
</style>
