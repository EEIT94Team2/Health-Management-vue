<template>
  <div class="fitness-view">
    <div class="fitness-container">
      <div class="page-header">
        <h1>健身追蹤</h1>
      </div>

      <el-tabs type="border-card">
        <el-tab-pane label="運動記錄">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h2>運動記錄</h2>
              </div>
            </template>
            <WorkoutRecordsManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="身體數據">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h2>身體數據</h2>
              </div>
            </template>
            <BodyDataManager
              :body-data="bodyData"
              :loading-body-data="loadingBodyData"
              @open-add-body-data="openAddBodyDataDialog"
              @open-edit-body-data="openEditBodyDataDialog"
              @delete-body-data="deleteBodyData"
              @open-view-body-data="openViewBodyDataDialog"
            />
            <div id="body-data-chart" class="chart-container"></div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="概覽">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h2>概覽</h2>
              </div>
            </template>
            <OverviewSection
              :overview-data="overviewData"
              :loading-overview-chart="loadingOverviewChart"
            />
            <div id="overview-chart" class="chart-container"></div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="飲食記錄">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h2>飲食記錄</h2>
              </div>
            </template>
            <DietRecordsManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="健身目標">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h2>健身目標</h2>
              </div>
            </template>
            <GoalsProgressManagement />
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
              v-model="bodyDataForm.date"
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

      <el-dialog
        :title="dietEditForm.recordId ? '編輯飲食數據' : '新增飲食數據'"
        v-model="dietEditDialogVisible"
      >
        <el-form :model="dietEditForm" label-width="120px">
          <el-form-item label="用戶 ID">
            <el-input
              v-model="dietEditForm.userId"
              :disabled="dietEditForm.recordId"
            ></el-input>
          </el-form-item>
          <el-form-item label="餐別">
            <el-select v-model="dietEditForm.mealtime" placeholder="請選擇餐別">
              <el-option label="早餐" value="早餐"></el-option>
              <el-option label="午餐" value="午餐"></el-option>
              <el-option label="晚餐" value="晚餐"></el-option>
              <el-option label="點心" value="點心"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="食物內容">
            <el-input
              v-model="dietEditForm.foodName"
              type="textarea"
            ></el-input>
          </el-form-item>
          <el-form-item label="總熱量 (大卡)">
            <el-input-number
              v-model="dietEditForm.calories"
              :min="0"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="蛋白質 (克)">
            <el-input-number
              v-model="dietEditForm.protein"
              :min="0"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="碳水化合物 (克)">
            <el-input-number
              v-model="dietEditForm.carbs"
              :min="0"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="脂肪 (克)">
            <el-input-number
              v-model="dietEditForm.fats"
              :min="0"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="記錄日期時間">
            <el-date-picker
              v-model="dietEditForm.recordDate"
              type="datetime"
              placeholder="選擇日期時間"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm"
            ></el-date-picker>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dietEditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveDietEdit">儲存</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog
        v-model="goalsEditDialogVisible"
        :title="goalsEditForm.goalId ? '編輯目標' : '新增目標'"
      >
        <el-form :model="goalsEditForm" label-width="120px">
          <el-form-item label="用戶 ID">
            <el-input v-model="goalsEditForm.userId"></el-input>
          </el-form-item>
          <el-form-item label="目標類型">
            <el-select
              v-model="goalsEditForm.goalType"
              placeholder="選擇目標類型"
            >
              <el-option label="減重" value="減重"></el-option>
              <el-option label="增肌" value="增肌"></el-option>
              <el-option label="減脂" value="減脂"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="目標值">
            <el-input-number
              v-model="goalsEditForm.targetValue"
              :min="0"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="單位">
            <el-select v-model="goalsEditForm.unit" placeholder="選擇單位">
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
              v-model="goalsEditForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="結束日期">
            <el-date-picker
              v-model="goalsEditForm.endDate"
              type="date"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="狀態">
            <el-select v-model="goalsEditForm.status">
              <el-option label="進行中" value="進行中"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
              <el-option label="已取消" value="已取消"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="使用最近數據">
            <el-checkbox v-model="goalsEditForm.useLatestData"></el-checkbox>
          </el-form-item>

          <el-form-item
            v-if="
              !goalsEditForm.useLatestData && goalsEditForm.goalType === '減重'
            "
            label="起始體重 (公斤)"
          >
            <el-input-number
              v-model="goalsEditForm.startWeight"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            v-if="
              !goalsEditForm.useLatestData && goalsEditForm.goalType === '減脂'
            "
            label="起始體脂率 (%)"
          >
            <el-input-number
              v-model="goalsEditForm.startBodyFat"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            v-if="
              !goalsEditForm.useLatestData && goalsEditForm.goalType === '增肌'
            "
            label="起始肌肉量 (公斤)"
          >
            <el-input-number
              v-model="goalsEditForm.startMuscleMass"
            ></el-input-number>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="goalsEditDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="saveGoalsEdit"
              :loading="isSavingGoals"
              >儲存</el-button
            >
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="confirmDeleteGoalVisible" title="確認刪除">
        <span>您確定要刪除此目標嗎？</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="confirmDeleteGoalVisible = false"
              >取消</el-button
            >
            <el-button
              type="danger"
              @click="handleDeleteGoalConfirmed"
              :loading="isDeletingGoal"
              >確認</el-button
            >
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="confirmDeleteDietVisible" title="確認刪除">
        <span>您確定要刪除此飲食記錄嗎？</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="confirmDeleteDietVisible = false"
              >取消</el-button
            >
            <el-button
              type="danger"
              @click="handleDeleteDietConfirmed"
              :loading="isDeletingDiet"
              >確認</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, reactive, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

// 導入分離出的組件
import WorkoutRecordsManagement from "./WorkoutRecords.vue";
import BodyDataManager from "./BodyData.vue";
import OverviewSection from "./OverviewSection.vue";
import DietRecordsManagement from "./DietRecords.vue";
import GoalsProgressManagement from "./GoalsProgress.vue";

const authStore = useAuthStore();

// 反應式數據
const workouts = ref([]);
const bodyData = ref([]);
const overviewData = ref(null);
const dietRecordsData = ref([]);
// 添加這些響應式變數
const loadingDiet = ref(false);
const errorDiet = ref(null);
const dietRecords = ref([]);

const errorGoals = ref(null);
const goalsProgress = ref([]);
const errorWorkouts = ref(null);

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
let overviewChartInstance = null;

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

// 其他數據
const exerciseTypes = ref([
  "跑步",
  "游泳",
  "騎自行車",
  "跳繩",
  "瑜珈",
  "健身房器械",
  "徒手健身",
  "高強度間歇訓練 (HIIT)",
  "快走",
  "爬山",
  "滑雪",
  "舞蹈",
  "划船機",
  "重訓",
  "橢圓機",
  "腳踏車競賽",
  "打籃球",
  "踢足球",
  "攀岩",
  "健走",
]);

// 飲食記錄相關
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
  fats: null, // 確保這裡有逗號
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
      fetchOverviewData();
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
    nextTick(renderBodyDataChart);
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
    date: new Date().toISOString().slice(0, 10),
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
      dateRecorded: bodyDataForm.value.date, // 將前端的 'date' 映射到後端的 'dateRecorded'
    };
    delete payload.date; // 移除前端的 'date' 欄位 (可選)

    let response;
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

const deleteBodyData = async (id) => {
  try {
    await axios.delete(`/api/tracking/body-metrics/${id}`);
    ElMessage.success("身體數據刪除成功");
    fetchBodyData();
  } catch (error) {
    console.error("刪除身體數據失敗", error);
    ElMessage.error("刪除身體數據失敗");
  }
};

const openViewBodyDataDialog = (data) => {
  viewBodyData.value = { ...data };
  viewBodyDataDialogVisible.value = true;
};
// 修改圖表容器樣式
const chartStyles = `
  .chart-container {
    width: 100%;
    height: 500px !important; /* 增加高度 */
    margin-top: 30px;
    margin-bottom: 30px;
    padding: 20px;
    overflow: visible !important; /* 確保內容不被截斷 */
  }
  
  /* 確保圖表元素不被其他元素遮擋 */
  .echarts-tooltip {
    z-index: 1000 !important;
  }
`;

// 在 head 中插入樣式
const styleElement = document.createElement("style");
styleElement.textContent = chartStyles;
document.head.appendChild(styleElement);

// 改進後的圖表渲染函數
const renderBodyDataChart = () => {
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

  // 等待 DOM 更新後再初始化圖表
  setTimeout(() => {
    bodyDataChartInstance = echarts.init(chartDom);

    if (bodyData.value && bodyData.value.length > 0) {
      const dates = bodyData.value.map((item) => item.date);
      const weights = bodyData.value.map((item) => item.weight);
      const bodyFats = bodyData.value.map((item) => item.bodyFat);
      const muscleMasses = bodyData.value.map((item) => item.muscleMass);

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
          },
        },
        tooltip: {
          trigger: "axis",
          confine: false,
          appendToBody: true, // 將提示框添加到 body 上，避免被其他元素限制
          position: function (point, params, dom, rect, size) {
            // 提示框放在鼠標右側，確保不超出視窗
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
            // 只處理有數據的點
            if (params[0].axisValue === "") return "";

            let result = `<div style="font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:5px">
              ${params[0].axisValue}
            </div>`;

            params.forEach((param) => {
              // 跳過空值
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
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px"></span>
                  ${param.seriesName}:
                </span>
                <span style="font-weight:bold">${param.value}${unit}</span>
              </div>`;
            });

            return result;
          },
        },
        legend: {
          data: ["體重", "體脂率", "肌肉量"],
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
          },
        ],
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: true,
          axisLabel: {
            interval: 0,
            rotate: 45,
            margin: 15,
            fontSize: 12,
            formatter: function (value) {
              return value === "" ? "" : value; // 不顯示空字符串
            },
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
              },
            },
            axisLabel: {
              formatter: "{value} kg",
              margin: 10,
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
              },
            },
            axisLabel: {
              formatter: "{value} %",
              margin: 10,
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
              },
            },
            axisLabel: {
              formatter: "{value} kg",
              margin: 10,
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
            connectNulls: true, // 連接空數據點
            markPoint: {
              label: {
                formatter: function (param) {
                  return param.name + ": " + param.value + " kg";
                },
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
      setTimeout(() => {
        bodyDataChartInstance.resize();
      }, 200);
    }
  }, 100);

  // 響應窗口大小變化
  window.addEventListener("resize", function () {
    if (bodyDataChartInstance) {
      bodyDataChartInstance.resize();
    }
  });
};

// 獲取概覽數據
const fetchOverviewData = async () => {
  if (!authStore.userInfo?.id) return;
  loadingOverviewChart.value = true;
  try {
    const response = await axios.get(
      `/api/tracking/overview/user/${authStore.userInfo?.id}`
    );
    overviewData.value = response.data;
    nextTick(renderOverviewChart);
  } catch (error) {
    console.error("獲取概覽數據失敗", error);
    ElMessage.error("獲取概覽數據失敗");
  } finally {
    loadingOverviewChart.value = false;
  }
};

const renderOverviewChart = () => {
  const chartDom = document.getElementById("overview-chart");
  if (chartDom && overviewData.value) {
    overviewChartInstance = echarts.init(chartDom);
    const option = {
      title: {
        text: "運動概覽",
      },
      tooltip: {},
      legend: {
        data: ["總時間", "總卡路里", "運動次數", "連續天數"],
      },
      xAxis: {
        data: [""],
      },
      yAxis: {},
      series: [
        {
          name: "總時間",
          type: "bar",
          data: [overviewData.value.totalWorkoutTime || 0],
        },
        {
          name: "總卡路里",
          type: "bar",
          data: [overviewData.value.totalCaloriesBurned || 0],
        },
        {
          name: "運動次數",
          type: "bar",
          data: [overviewData.value.workoutCount || 0],
        },
        {
          name: "連續天數",
          type: "bar",
          data: [overviewData.value.consecutiveDays || 0],
        },
      ],
    };
    overviewChartInstance.setOption(option);
  }
};

onMounted(() => {
  console.log("Initial workouts:", workouts.value);
  console.log("Initial userId:", userId.value);
  console.log("Initial token:", token.value);
  if (userId.value) {
    fetchBodyData();
    fetchOverviewData();
  } else {
    console.warn("User ID is not available yet, skipping data fetching.");
    // 可以添加一些處理邏輯，例如顯示載入中狀態或在用戶 ID 可用後再觸發數據獲取
  }
});
</script>

<style lang="scss" scoped>
.fitness-view {
  min-height: 100vh;
  padding: 100px 0 50px;
  background-color: var(--bg-primary, #f5f7fa);
  color: var(--text-primary, #333);
}

.fitness-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    color: var(--text-primary, #333);
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
      // 增加卡片內部的高度
      min-height: 550px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary, #333);
  }
}

// 修改圖表容器的樣式
.chart-container {
  width: 100%;
  height: 500px !important; // 增加高度
  margin-top: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: visible !important; // 確保內容不被截斷

  // 確保 ECharts 容器可以完整顯示
  :deep(.echarts) {
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }

  // 確保圖例顯示正確
  :deep(.echarts-legend) {
    overflow: visible !important;
    z-index: 100;
  }

  // 確保提示框顯示正確
  :deep(.echarts-tooltip) {
    z-index: 9999 !important;
    pointer-events: none;
  }
}

/* 其他樣式保持不變 */
/* ElForm、ElInput 等組件的樣式 */
.el-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    color: var(--text-primary, #333);
    font-size: 1rem;
    margin-bottom: 5px;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner),
  :deep(.el-select .el-input__inner),
  :deep(.el-input-number .el-input__inner),
  :deep(.el-date-editor .el-input__inner) {
    background-color: #fff !important;
    border: 1px solid var(--highlight-color, #10b981);
    color: #333;
    border-radius: 8px;
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
    color: var(--text-secondary, #666);
  }

  :deep(.el-input__inner:focus),
  :deep(.el-textarea__inner:focus),
  :deep(.el-select .el-input__inner:focus),
  :deep(.el-input-number .el-input__inner:focus),
  :deep(.el-date-editor .el-input__inner:focus) {
    border-color: var(--highlight-color, #10b981);
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;

  .el-button {
    margin-left: 10px;
  }
}

@media (max-width: 767px) {
  .fitness-container {
    padding: 0 15px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  // 在移動端增加圖表高度
  .chart-container {
    height: 400px !important;
  }

  .el-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 15px;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }

    :deep(.el-tabs__nav-wrap::after) {
      background-color: transparent; /* 移除底部陰影 */
    }

    :deep(.el-tabs__item) {
      color: var(--text-secondary, #666);
      padding: 15px 20px;
      font-size: 1rem;

      &:hover {
        color: var(--highlight-color, #10b981);
      }

      &.is-active {
        color: var(--highlight-color, #10b981);
      }
    }

    :deep(.el-tabs__active-line) {
      background-color: var(--highlight-color, #10b981);
      height: 3px;
      border-radius: 3px 3px 0 0;
      margin-bottom: -1px; /* 與底部邊框對齊 */
    }

    :deep(.el-tabs__content) {
      /* 可以根據需要調整內容區域的樣式 */
    }

    /* 可以根據需要進一步調整 el-tab-pane 的樣式 */
    .el-tab-pane {
      padding: 10px; /* 可以添加一些內邊距 */
    }
  }
}
</style>
