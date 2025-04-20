<template>
  <div class="fitness-container">
    <h1>健身追蹤</h1>

    <el-tabs type="border-card">
      <el-tab-pane label="運動記錄">
        <WorkoutRecordsManagement
          :workouts="workouts"
          :exercise-types="exerciseTypes"
          :workout-current-page="workoutCurrentPage"
          :workout-page-size="workoutPageSize"
          :workout-total="workoutTotal"
          @open-add-workout="openWorkoutDialog(null)"
          @open-edit-workout="openWorkoutDialog"
          @delete-workout="deleteWorkout"
          @workout-size-change="handleWorkoutSizeChange"
          @workout-current-change="handleWorkoutCurrentChange"
          @search-workouts="fetchWorkoutData"
          @reset-workout-search="resetWorkoutSearchForm"
        />
      </el-tab-pane>

      <el-tab-pane label="身體數據">
        <BodyDataManager
          :body-data="bodyData"
          :loading-body-data="loadingBodyData"
          @open-add-body-data="openAddBodyDataDialog"
          @open-edit-body-data="openEditBodyDataDialog"
          @delete-body-data="deleteBodyData"
          @open-view-body-data="openViewBodyDataDialog"
        />
        <div id="body-data-chart" style="width: 100%; height: 400px"></div>
      </el-tab-pane>

      <el-tab-pane label="概覽">
        <OverviewSection
          :overview-data="overviewData"
          :loading-overview-chart="loadingOverviewChart"
        />
        <div id="overview-chart" style="width: 100%; height: 300px"></div>
      </el-tab-pane>

      <el-tab-pane label="飲食記錄">
        <DietRecordsManagement
          :diet-data="dietRecordsData"
          :total="dietRecordsTotal"
          :current-page="dietRecordsCurrentPage"
          :page-size="dietRecordsPageSize"
          @search="fetchDietRecordsData"
          @reset-search="resetDietSearchForm"
          @open-edit-dialog="openDietEditDialog"
          @delete="deleteDietRecord"
          @update:currentPage="dietRecordsCurrentPage = $event"
          @update:pageSize="dietRecordsPageSize = $event"
        />
      </el-tab-pane>

      <el-tab-pane label="健身目標">
        <GoalsProgressManagement
          :goals-progress="goalsProgressData"
          :total="goalsProgressTotal"
          :current-page="goalsProgressCurrentPage"
          :page-size="goalsProgressPageSize"
          @search="fetchGoalsProgressData"
          @reset-search="resetGoalsSearchForm"
          @open-edit-dialog="openGoalsEditDialog"
          @delete="deleteGoalProgress"
          @update:currentPage="goalsProgressCurrentPage = $event"
          @update:pageSize="goalsProgressPageSize = $event"
        />
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
              v-for="type in exerciseTypes"
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
            v-model="workoutForm.startTime"
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
          <el-input-number v-model="bodyDataForm.weight" :min="1" :step="0.1" />
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
        <el-form-item label="臀圍 (公分)" v-if="viewBodyData.hipCircumference">
          <span>{{ viewBodyData.hipCircumference }}</span>
        </el-form-item>
        <el-form-item label="肌肉量 (公斤)" v-if="viewBodyData.muscleMass">
          <span>{{ viewBodyData.muscleMass }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewBodyDataDialogVisible = false">關閉</el-button>
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
          <el-input v-model="dietEditForm.foodName" type="textarea"></el-input>
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
          <el-button @click="confirmDeleteGoalVisible = false">取消</el-button>
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
          <el-button @click="confirmDeleteDietVisible = false">取消</el-button>
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
const goalsProgressData = ref([]);

// 載入狀態
const loadingWorkouts = ref(false);
const loadingBodyData = ref(false);
const loadingOverviewChart = ref(false);
const loadingWorkoutChart = ref(false);
const loadingBodyDataChart = ref(false);
const loadingDietRecords = ref(false);
const loadingGoalsProgress = ref(false);
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
const workoutForm = ref({
  id: null,
  type: "",
  duration: null,
  startTime: null,
  userId: authStore.user?.id,
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
  userId: authStore.user?.id,
});
const viewBodyDataDialogVisible = ref(false);
const viewBodyData = ref({});

// 其他數據
const exerciseTypes = ref([]);

// 飲食記錄相關
const dietRecordsTotal = ref(0);
const dietRecordsCurrentPage = ref(1);
const dietRecordsPageSize = ref(10);
const dietEditDialogVisible = ref(false);
const dietEditForm = reactive({
  recordId: null,
  userId: authStore.user?.id,
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
  userId: authStore.user?.id,
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
  () => authStore.user?.id,
  (newUserId) => {
    if (newUserId) {
      fetchWorkoutData();
      fetchBodyData();
      fetchOverviewData();
      fetchDietRecordsData();
      fetchGoalsProgressData();
    } else {
      // 如果用戶登出，清空數據
      workouts.value = [];
      bodyData.value = [];
      overviewData.value = null;
      dietRecordsData.value = [];
      goalsProgressData.value = [];
    }
  },
  { immediate: true }
);

// 獲取運動類型列表
const fetchExerciseTypes = async () => {
  try {
    const response = await axios.get("/api/tracking/exercise-types");
    exerciseTypes.value = response.data;
  } catch (error) {
    console.error("獲取運動類型失敗", error);
    ElMessage.error("獲取運動類型失敗");
  }
};

// 獲取運動數據
const fetchWorkoutData = async (searchParams = {}) => {
  if (!authStore.user?.id) return;
  loadingWorkouts.value = true;
  try {
    const params = {
      page: workoutCurrentPage.value - 1,
      size: workoutPageSize.value,
      userId: authStore.user.id,
      ...searchParams,
      startDate: searchParams.dateRange ? searchParams.dateRange[0] : undefined,
      endDate: searchParams.dateRange ? searchParams.dateRange[1] : undefined,
    };
    delete params.dateRange; // 移除 dateRange，因為 startDate 和 endDate 已經存在
    const response = await axios.get("/api/tracking/exercise-records", {
      params,
    });
    workouts.value = response.data.content;
    workoutTotal.value = response.data.totalElements;
  } catch (error) {
    console.error("獲取運動數據失敗", error);
    ElMessage.error("獲取運動數據失敗");
  } finally {
    loadingWorkouts.value = false;
  }
};

const handleWorkoutSizeChange = (newSize) => {
  workoutPageSize.value = newSize;
  fetchWorkoutData();
};

const handleWorkoutCurrentChange = (newPage) => {
  workoutCurrentPage.value = newPage;
  fetchWorkoutData();
};

const openWorkoutDialog = (row) => {
  if (row) {
    workoutDialogTitle.value = "編輯運動記錄";
    workoutForm.value = { ...row };
  } else {
    workoutDialogTitle.value = "新增運動記錄";
    workoutForm.value = {
      id: null,
      type: "",
      duration: null,
      startTime: new Date().toISOString().slice(0, 10),
      userId: authStore.user?.id,
    };
  }
  workoutDialogVisible.value = true;
};

const saveWorkout = async () => {
  try {
    if (workoutForm.value.id) {
      await axios.put(
        `/api/tracking/exercise-records/${workoutForm.value.id}`,
        workoutForm.value
      );
      ElMessage.success("運動記錄更新成功");
    } else {
      await axios.post("/api/tracking/exercise-records", workoutForm.value);
      ElMessage.success("運動記錄新增成功");
    }
    workoutDialogVisible.value = false;
    fetchWorkoutData();
  } catch (error) {
    console.error("保存運動記錄失敗", error);
    ElMessage.error("保存運動記錄失敗");
  }
};

const deleteWorkout = async (id) => {
  try {
    await axios.delete(`/api/tracking/exercise-records/${id}`);
    ElMessage.success("運動記錄刪除成功");
    fetchWorkoutData();
  } catch (error) {
    console.error("刪除運動記錄失敗", error);
    ElMessage.error("刪除運動記錄失敗");
  }
};

const resetWorkoutSearchForm = () => {
  workoutSearchForm.type = "";
  workoutSearchForm.dateRange = null;
  fetchWorkoutData();
};

// 獲取身體數據
const fetchBodyData = async () => {
  if (!authStore.user?.id) return;
  loadingBodyData.value = true;
  try {
    const response = await axios.get(
      `/api/tracking/body-metrics/user/${authStore.user.id}`
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
    userId: authStore.user?.id,
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
    if (bodyDataForm.value.id) {
      await axios.put(
        `/api/tracking/body-metrics/${bodyDataForm.value.id}`,
        bodyDataForm.value
      );
      ElMessage.success("身體數據更新成功");
    } else {
      await axios.post("/api/tracking/body-metrics", bodyDataForm.value);
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

const renderBodyDataChart = () => {
  const chartDom = document.getElementById("body-data-chart");
  if (chartDom) {
    bodyDataChartInstance = echarts.init(chartDom);
    const dates = bodyData.value.map((item) => item.date);
    const weights = bodyData.value.map((item) => item.weight);
    const bodyFats = bodyData.value.map((item) => item.bodyFat);

    const option = {
      title: {
        text: "身體數據變化",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["體重", "體脂率"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
      },
      yAxis: [
        {
          type: "value",
          name: "體重 (kg)",
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
          },
        },
        {
          type: "value",
          name: "體脂率 (%)",
          position: "right",
          alignTicks: true,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#91cc75",
            },
          },
          axisLabel: {
            formatter: "{value} %",
          },
        },
      ],
      series: [
        {
          name: "體重",
          type: "line",
          data: weights,
          markPoint: {
            data: [
              { type: "max", name: "Max" },
              { type: "min", name: "Min" },
            ],
          },
          markLine: {
            data: [{ type: "average", name: "Avg" }],
          },
          yAxisIndex: 0,
        },
        {
          name: "體脂率",
          type: "line",
          data: bodyFats,
          yAxisIndex: 1,
          markPoint: {
            data: [
              { type: "max", name: "Max" },
              { type: "min", name: "Min" },
            ],
          },
          markLine: {
            data: [{ type: "average", name: "Avg" }],
          },
        },
      ],
    };

    bodyDataChartInstance.setOption(option);
  }
};

// 獲取概覽數據
const fetchOverviewData = async () => {
  if (!authStore.user?.id) return;
  loadingOverviewChart.value = true;
  try {
    const response = await axios.get(
      `/api/tracking/overview/user/${authStore.user.id}`
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

// 獲取飲食記錄數據
const fetchDietRecordsData = async (searchParams = {}) => {
  if (!authStore.user?.id) return;
  loadingDietRecords.value = true;
  try {
    const params = {
      page: dietRecordsCurrentPage.value - 1,
      size: dietRecordsPageSize.value,
      userId: searchParams.userId || null,
      name: searchParams.name || null,
      startDate: searchParams.dateRange
        ? searchParams.dateRange[0] + "T00:00:00"
        : null,
      endDate: searchParams.dateRange
        ? searchParams.dateRange[1] + "T23:59:59"
        : null,
      mealtime: searchParams.mealtime || null,
    };
    const response = await axios.get(`/api/tracking/nutrition/search`, {
      params,
    });
    dietRecordsData.value = response.data.content;
    dietRecordsTotal.value = response.data.totalElements;
  } catch (error) {
    console.error("獲取飲食數據失敗", error);
    ElMessage.error("獲取飲食數據失敗");
  } finally {
    loadingDietRecords.value = false;
  }
};

const resetDietSearchForm = () => {
  fetchDietRecordsData();
};

const openDietEditDialog = (row) => {
  if (row) {
    Object.assign(dietEditForm, {
      ...row,
      recordDate: row.recordDate ? row.recordDate.replace(" ", "T") : null,
    });
  } else {
    Object.assign(dietEditForm, {
      recordId: null,
      userId: authStore.user?.id,
      name: "",
      mealtime: "",
      foodName: "",
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
      recordDate:
        new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
    });
  }
  dietEditDialogVisible.value = true;
};

const saveDietEdit = async () => {
  try {
    const payload = {
      userId: dietEditForm.userId,
      mealtime: dietEditForm.mealtime,
      foodName: dietEditForm.foodName,
      calories: dietEditForm.calories,
      protein: dietEditForm.protein,
      carbs: dietEditForm.carbs,
      fats: dietEditForm.fats,
      recordDate: dietEditForm.recordDate
        ? dietEditForm.recordDate.replace(" ", "T")
        : null,
    };
    const apiEndpoint = dietEditForm.recordId
      ? `/api/tracking/nutrition/${dietEditForm.recordId}`
      : "/api/tracking/nutrition/add";
    const httpMethod = dietEditForm.recordId ? "put" : "post";
    await axios[httpMethod](apiEndpoint, payload);
    ElMessage.success(`飲食記錄${dietEditForm.recordId ? "更新" : "新增"}成功`);
    dietEditDialogVisible.value = false;
    fetchDietRecordsData();
  } catch (error) {
    console.error(
      `飲食記錄${dietEditForm.recordId ? "更新" : "新增"}失敗`,
      error
    );
    ElMessage.error(`飲食記錄${dietEditForm.recordId ? "更新" : "新增"}失敗`);
  }
};

const deleteDietRecord = (id) => {
  deletingDietRecordId.value = id;
  confirmDeleteDietVisible.value = true;
};

const handleDeleteDietConfirmed = async () => {
  isDeletingDiet.value = true;
  try {
    await axios.delete(`/api/tracking/nutrition/${deletingDietRecordId.value}`);
    ElMessage.success("飲食記錄刪除成功");
    confirmDeleteDietVisible.value = false;
    fetchDietRecordsData();
  } catch (error) {
    console.error("刪除飲食記錄失敗", error);
    ElMessage.error("刪除飲食記錄失敗");
  } finally {
    isDeletingDiet.value = false;
    deletingDietRecordId.value = null;
  }
};

// 獲取健身目標數據
const fetchGoalsProgressData = async (searchParams = {}) => {
  if (!authStore.user?.id) return;
  loadingGoalsProgress.value = true;
  try {
    const params = {
      page: goalsProgressCurrentPage.value - 1,
      size: goalsProgressPageSize.value,
      userId: searchParams.userId || authStore.user.id,
      name: searchParams.name || null,
      startDate: searchParams.startDateRange
        ? searchParams.startDateRange[0]
        : null,
      endDate: searchParams.startDateRange
        ? searchParams.startDateRange[1]
        : null,
      goalType: searchParams.goalType || null,
      status: searchParams.status || null,
    };
    const response = await axios.get(`/api/tracking/fitnessgoals`, { params });
    goalsProgressData.value = response.data.content;
    goalsProgressTotal.value = response.data.totalElements;
  } catch (error) {
    console.error("獲取健身目標失敗", error);
    ElMessage.error("獲取健身目標失敗");
  } finally {
    loadingGoalsProgress.value = false;
  }
};

const resetGoalsSearchForm = () => {
  fetchGoalsProgressData();
};

const openGoalsEditDialog = (row) => {
  if (row) {
    Object.assign(goalsEditForm, row);
    goalsEditForm.useLatestData = !(
      row.startWeight !== null &&
      row.startWeight !== undefined &&
      row.startBodyFat !== null &&
      row.startBodyFat !== undefined &&
      row.startMuscleMass !== null &&
      row.startMuscleMass !== undefined
    );
  } else {
    Object.assign(goalsEditForm, {
      goalId: null,
      userId: authStore.user?.id,
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
  goalsEditDialogVisible.value = true;
};

const saveGoalsEdit = async () => {
  isSavingGoals.value = true;
  try {
    const payload = {
      userId: goalsEditForm.userId,
      goalType: goalsEditForm.goalType,
      targetValue: goalsEditForm.targetValue,
      unit: goalsEditForm.unit,
      currentProgress: goalsEditForm.currentProgress,
      startDate: goalsEditForm.startDate,
      endDate: goalsEditForm.endDate,
      status: goalsEditForm.status,
    };

    if (!goalsEditForm.useLatestData) {
      payload.startWeight = goalsEditForm.startWeight;
      payload.startBodyFat = goalsEditForm.startBodyFat;
      payload.startMuscleMass = goalsEditForm.startMuscleMass;
    }

    const apiEndpoint = goalsEditForm.goalId
      ? `/api/tracking/fitnessgoals/${goalsEditForm.goalId}`
      : "/api/tracking/fitnessgoals";
    const httpMethod = goalsEditForm.goalId ? "put" : "post";

    await axios[httpMethod](apiEndpoint, payload);
    ElMessage.success(`健身目標${goalsEditForm.goalId ? "更新" : "新增"}成功`);
    goalsEditDialogVisible.value = false;
    fetchGoalsProgressData();
  } catch (error) {
    console.error(
      `健身目標${goalsEditForm.goalId ? "更新" : "新增"}失敗`,
      error
    );
    ElMessage.error(`健身目標${goalsEditForm.goalId ? "更新" : "新增"}失敗`);
  } finally {
    isSavingGoals.value = false;
  }
};

const deleteGoalProgress = (id) => {
  deletingGoalId.value = id;
  confirmDeleteGoalVisible.value = true;
};

const handleDeleteGoalConfirmed = async () => {
  isDeletingGoal.value = true;
  try {
    await axios.delete(`/api/tracking/fitnessgoals/${deletingGoalId.value}`);
    ElMessage.success("健身目標已刪除");
    confirmDeleteGoalVisible.value = false;
    fetchGoalsProgressData();
  } catch (error) {
    console.error("刪除健身目標失敗", error);
    ElMessage.error("刪除健身目標失敗");
  } finally {
    isDeletingGoal.value = false;
    deletingGoalId.value = null;
  }
};

const handleDietSizeChange = (newSize) => {
  dietRecordsPageSize.value = newSize;
  fetchDietRecordsData();
};

const handleDietCurrentChange = (newPage) => {
  dietRecordsCurrentPage.value = newPage;
  fetchDietRecordsData();
};

const handleGoalsSizeChange = (newSize) => {
  goalsProgressPageSize.value = newSize;
  fetchGoalsProgressData();
};

const handleGoalsCurrentChange = (newPage) => {
  goalsProgressCurrentPage.value = newPage;
  fetchGoalsProgressData();
};

onMounted(() => {
  fetchExerciseTypes();
  // 數據在 authStore.user 變化時獲取
});
</script>

<style scoped>
.fitness-container {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.workouts-management,
.body-data,
.overview {
  margin-top: 20px;
}

.search-and-add {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-form {
  margin-right: 15px;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.body-data ul {
  list-style: none;
  padding: 0;
}

.body-data li {
  margin-bottom: 8px;
}

.body-data button {
  margin-left: 8px;
}
</style>
