<template>
  <div class="fitness-view">
    <div class="fitness-container">
      <div class="page-header">
        <h1>健身追蹤</h1>
      </div>

      <el-tabs type="border-card" @tab-change="handleTabChange">
        <el-tab-pane label="身體數據">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
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
            <div style="margin-top: 20px; text-align: right">
              <el-button
                style="margin-top: 20px"
                @click="showDataTable = !showDataTable"
              >
                {{ showDataTable ? "隱藏數據列表" : "查看數據列表" }}
              </el-button>
            </div>
            <el-table
              v-if="showDataTable"
              :data="bodyData"
              border
              style="width: 100%; margin-top: 15px"
              sort-by="dateRecorded"
              sort-order="descending"
            >
              <el-table-column
                prop="weight"
                label="體重 (公斤)"
              ></el-table-column>
              <el-table-column
                prop="bodyFat"
                label="體脂率 (%)"
              ></el-table-column>
              <el-table-column
                prop="height"
                label="身高 (公分)"
              ></el-table-column>
              <el-table-column
                prop="waistCircumference"
                label="腰圍 (公分)"
              ></el-table-column>
              <el-table-column
                prop="hipCircumference"
                label="臀圍 (公分)"
              ></el-table-column>
              <el-table-column
                prop="muscleMass"
                label="肌肉量 (公斤)"
              ></el-table-column>
              <el-table-column
                prop="dateRecorded"
                label="測量日期"
              ></el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button
                    size="small"
                    @click="openEditBodyDataDialog(scope.row)"
                    >編輯</el-button
                  >
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteBodyData(scope.row.id)"
                    >刪除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div
              class="no-data"
              v-if="!loadingBodyData && bodyData.length === 0 && !showDataTable"
            >
              <el-empty description="暫無身體數據，請新增"></el-empty>
            </div>
            <div v-if="loadingBodyData" class="loading">載入身體數據中...</div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="運動記錄">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <WorkoutRecordsManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="飲食記錄">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <DietRecordsManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="健身目標">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <GoalsProgressManagement />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="概覽">
          <el-card class="content-card">
            <template #header>
              <div class="card-header"></div>
            </template>
            <OverviewSection
              :overview-data="overviewData"
              :loading-overview-chart="loadingOverviewChart"
            />
            <div id="overview-chart" class="chart-container"></div>
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
  } catch (error) {
    console.error("獲取身體數據失敗", error);
    ElMessage.error("獲取身體數據失敗");
  } finally {
    loadingBodyData.value = false;
    nextTick(renderBodyDataChart);
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

const handleDeleteBodyDataConfirmed = async () => {
  isDeletingBodyData.value = true;
  try {
    await axios.delete(`/api/tracking/body-data/${deletingBodyDataId.value}`, {
      headers: { Authorization: `Bearer ${authStore.getToken}` },
    });
    ElMessage.success("身體數據刪除成功");
    confirmDeleteBodyDataVisible.value = false;
    // 重新獲取身體數據以更新列表
    fetchBodyData(); // 確保你有名為 fetchBodyData 的方法來獲取身體數據
  } catch (error) {
    console.error("刪除身體數據失敗", error);
    ElMessage.error("刪除身體數據失敗");
  } finally {
    isDeletingBodyData.value = false;
    deletingBodyDataId.value = null;
  }
};

const openViewBodyDataDialog = (data) => {
  viewBodyData.value = { ...data };
  viewBodyDataDialogVisible.value = true;
};

// 圖表渲染函數
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

  nextTick(() => {
    bodyDataChartInstance = echarts.init(chartDom);

    if (bodyData.value && bodyData.value.length > 0) {
      const dates = bodyData.value.map((item) => item.dateRecorded);
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
            color: "white",
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
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:$lightgreen;margin-right:5px"></span>
                  ${param.seriesName}:
                </span>
                <span style="font-weight:white">${param.value}${unit}</span>
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
          },
        ],
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: true,
          axisLabel: {
            interval: "auto",
            rotate: 90,
            margin: 15,
            fontSize: 12,
            formatter: function (value) {
              return value === "" ? "" : value; // 不顯示空字符串
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
              },
            },
            axisLabel: {
              formatter: "{value} kg",
              margin: 5,
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
              margin: 5,
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
              margin: 5,
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
    }
  });
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
const handleTabChange = (tabName) => {
  if (tabName === "身體數據") {
    nextTick(() => {
      renderBodyDataChart();
      setTimeout(() => {
        if (bodyDataChartInstance) {
          bodyDataChartInstance.resize();
        }
      }, 300); // 增加一個小的延遲
    });
  }
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
  width: 100%; /* 確保在小螢幕上佔滿寬度 */
  max-width: 1200px; /* 設定最大寬度為 1200px */
  margin: 0 auto; /* 水平居中 */
  padding: 0 40px; /* 左右留白 40px */
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
      min-height: 550px; /* 增加卡片內部的高度 */
    }
  }
}

/* 修改頂部欄位樣式 */
:deep(.el-tabs__nav-wrap),
:deep(.el-tabs__header) {
  background-color: #1e293b !important;
  border-radius: 8px 8px 0 0;
}

:deep(.el-tabs__item) {
  background-color: #1e293b !important;
  color: #fff !important;
  border: none !important;

  &.is-active {
    background-color: #2c3e50 !important;
    border-bottom: 2px solid #3a8ee6 !important;
  }
}
:deep(.el-tabs--border-card) {
  background-color: #1e293b !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item) {
  background-color: #1e293b !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;

  &:hover {
    background-color: #2a3b52 !important;
    color: #66ccff !important;
  }

  &.is-active {
    background-color: #5ab2a6 !important;
    border-bottom-color: transparent !important;
    color: #3a8ee6 !important;
  }
}
:deep(.el-tabs) {
  border-radius: 8px;
  overflow: hidden;
}

.el-card.content-card {
  background-color: #1e293b !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
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
  color: var(--text-primary, #333);
  margin-top: 15px; /* 確保與上方元素間距 */
}

/* 表格標頭文字顏色改為白色 */
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

/* 強制修改表格數據文字顏色為深灰色並加粗 */
:deep(.el-table td.el-table__cell) {
  color: #333 !important;
  font-weight: bold !important;
}

/* 更進一步確保表格數據文字顏色 */
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

  /* 修改 "運動類型" 和 "日期範圍" 標籤文字顏色為白色 */
  :deep(.el-form-item__label) {
    color: #fff !important;
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
    color: var(--text-primary, #333) !important; /* 確保表單輸入框內文字顏色 */
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  color: #fff !important; /* 修改 "Total" 和 "Go to" 的文字顏色為白色 */
}

/* 修改分頁組件的數字顏色為白色 */
:deep(.el-pagination__total),
:deep(.el-pagination__jump),
:deep(.el-pagination__pager li),
:deep(.el-pagination__text) {
  color: #fff !important;
}

/* 切換標籤 hover 效果 */
:deep(.el-tabs__header) {
  /* 可以根據需要調整標頭的整體樣式 */
}

:deep(.el-tabs__item) {
  color: #fff; /* 預設標籤文字顏色為白色 */
  transition: background-color 0.3s ease, color 0.3s ease; /* 添加過渡效果 */
  background-color: transparent; /* 預設背景透明 */

  &:hover {
    background-color: rgba(
      16,
      185,
      129,
      0.15
    ); /* 淡淡的綠色背景，調整 alpha 值控制透明度 */
    color: #66ccff; /* 移入時的文字顏色，淺藍色 */
  }

  &.is-active {
    color: #fff; /* 激活標籤的文字顏色 */
    /* 可以根據需要添加激活標籤的樣式 */
  }
}

:deep(.el-tabs__active-line) {
  background-color: #fff; /* 激活指示線顏色 */
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
      border-bottom: 1px solid var(--border-color, #e0e0e0); /* 可能需要調整 */
    }

    :deep(.el-tabs__nav-wrap::after) {
      background-color: transparent; /* 移除底部陰影 */
    }

    :deep(.el-tabs__item) {
      color: #fff;
      padding: 15px 20px;
      font-size: 1rem;

      &:hover {
        /* 可以根據需要添加 hover 效果 */
      }

      &.is-active {
        color: #fff;
      }
    }

    :deep(.el-tabs__active-line) {
      background-color: #fff;
      height: 3px;
      border-radius: 3px 3px 0 0;
      margin-bottom: -1px; /* 與底部邊框對齊 */
    }

    :deep(.el-tabs__content) {
      padding: 10px;
    }
  }
}
</style>
