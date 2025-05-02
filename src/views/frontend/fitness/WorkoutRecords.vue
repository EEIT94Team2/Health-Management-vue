<template>
  <div class="workout-chart-container">
    <h1>運動記錄</h1>

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

    <v-chart
      ref="chartRef"
      :option="chartOptions"
      :key="chartKey"
      autoresize
      class="echarts"
    />

    <div class="list-toggle">
      <button @click="toggleListVisible">
        {{ isListVisible ? "收起數據列表" : "查看數據列表" }}
      </button>
    </div>

    <div v-if="isListVisible && workouts.length > 0" class="workout-list">
      <h3>運動記錄列表</h3>
      <el-table
        :data="sortedWorkouts"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="exerciseType" label="運動類型" />
        <el-table-column prop="startTime" label="開始時間" />
        <el-table-column prop="exerciseDuration" label="持續時間 (分鐘)" />
        <el-table-column prop="caloriesBurned" label="消耗卡路里" />
        <el-table-column label="操作" width="205">
          <template #default="scope">
            <el-button :icon="'edit'" @click="editWorkout(scope.row)"
              >編輯</el-button
            >
            <el-button
              :icon="'delete'"
              type="danger"
              @click="deleteWorkout(scope.row)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else-if="isListVisible && workouts.length === 0" class="no-data">
      暫無運動記錄。
    </div>

    <el-dialog v-model="dialogVisible" title="編輯運動記錄">
      <el-form :model="workoutForm" label-width="120px">
        <el-form-item label="運動類型">
          <el-select
            v-model="workoutForm.exerciseType"
            :key="dialogVisible"
            ref="workoutTypeSelect"
          >
            <el-option
              v-for="type in exerciseTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="運動日期">
          <el-date-picker
            v-model="workoutForm.exerciseDate"
            type="date"
            placeholder="選擇日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="持續時間 (分鐘)">
          <el-input-number
            v-model="workoutForm.exerciseDuration"
            :min="1"
            :max="1440"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWorkoutForm">確認</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteConfirmVisible" title="確認刪除">
      <p>確定要刪除選中的運動記錄嗎？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteWorkoutRecord"
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
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  getMonth,
  getQuarter,
  addDays,
  isSameDay,
  isSameMonth,
  isSameQuarter,
  isSameYear,
  parseISO,
} from "date-fns";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
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

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent, // 添加工具箱組件
]);

const router = useRouter();
const workouts = ref([]);
const chartOptions = ref({});
const chartKey = ref(0);
const authStore = useAuthStore();
const currentTimeUnit = ref("week");
const hasBodyMetrics = ref(false);
const chartRef = ref(null);

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

// 新增/編輯彈窗相關
const isListVisible = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const workoutForm = ref({
  exerciseType: "",
  exerciseDate: new Date(),
  exerciseDuration: 30,
});
const editingWorkoutId = ref(null);

// 刪除確認彈窗相關
const deleteConfirmVisible = ref(false);
const selectedWorkouts = ref([]);
const selectedWorkout = ref(null); // 用於編輯和刪除單個選中的記錄

// 自訂日期範圍相關
const customDateRangeDialogVisible = ref(false);
const customStartDate = ref(null);
const customEndDate = ref(null);

// 數據排序 - 按日期排列
const sortedWorkouts = computed(() => {
  if (!workouts.value || workouts.value.length === 0) return [];

  const sortedData = [...workouts.value];

  return sortedData.sort((a, b) => {
    const dateA = new Date(a.startTime || a.exerciseDate);
    const dateB = new Date(b.startTime || b.exerciseDate);
    return dateB - dateA;
  });
});

const checkBodyMetrics = async () => {
  try {
    const response = await axios.get(
      `/api/tracking/body-metrics/user/${authStore.userInfo.id}/exists`,
      {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      }
    );
    hasBodyMetrics.value = response.data;
  } catch (error) {
    console.error("檢查身體數據是否存在失敗", error);
    ElMessage.error("無法檢查身體數據");
  }
};

const fetchWorkouts = async (
  unit = currentTimeUnit.value,
  startDate = null,
  endDate = null
) => {
  if (!authStore.userInfo?.id) {
    console.log("沒有用戶ID，無法獲取數據");
    return;
  }

  let apiUrl = `/api/tracking/exercise-records?userId=${authStore.userInfo.id}`;
  const headers = {
    Authorization: `Bearer ${authStore.getToken}`,
  };

  let start, end;

  switch (unit) {
    case "week":
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
      end = endOfWeek(new Date(), { weekStartsOn: 1 });
      apiUrl += `&startDate=${format(start, "yyyy-MM-dd")}&endDate=${format(
        end,
        "yyyy-MM-dd"
      )}`;
      break;
    case "month":
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
      apiUrl += `&startDate=${format(start, "yyyy-MM-dd")}&endDate=${format(
        end,
        "yyyy-MM-dd"
      )}`;
      break;
    case "quarter":
      start = startOfQuarter(new Date());
      end = endOfQuarter(new Date());
      apiUrl += `&startDate=${format(start, "yyyy-MM-dd")}&endDate=${format(
        end,
        "yyyy-MM-dd"
      )}`;
      break;
    case "year":
      start = startOfYear(new Date());
      end = endOfYear(new Date());
      apiUrl += `&startDate=${format(start, "yyyy-MM-dd")}&endDate=${format(
        end,
        "yyyy-MM-dd"
      )}`;
      break;
    case "custom":
      if (startDate && endDate) {
        start = startDate;
        end = endDate;
        apiUrl += `&startDate=${format(start, "yyyy-MM-dd")}&endDate=${format(
          end,
          "yyyy-MM-dd"
        )}`;
      }
      break;
    default: // 'day'
      const today = format(new Date(), "yyyy-MM-dd");
      start = new Date();
      end = new Date();
      apiUrl += `&startDate=${today}&endDate=${today}`;
      break;
  }

  try {
    const response = await axios.get(apiUrl, { headers });

    // 更健壯的數據處理
    let data = [];
    if (response.data && response.data.content) {
      data = Array.isArray(response.data.content) ? response.data.content : [];
    } else if (Array.isArray(response.data)) {
      data = response.data;
    }

    workouts.value = data.map((item) => ({
      ...item,
      caloriesBurned: item.caloriesBurned ? Math.floor(item.caloriesBurned) : 0,
      startTime: item.exerciseDate,
    }));

    generateChart(unit, start, end);
  } catch (error) {
    console.error("取得運動紀錄失敗", error);
    ElMessage.error("無法獲取運動記錄");
  }
};

const toggleListVisible = () => {
  isListVisible.value = !isListVisible.value;
};

const editWorkout = (workout) => {
  selectedWorkouts.value = [workout];
  openEditModal();
};

const deleteWorkout = (workout) => {
  selectedWorkouts.value = [workout];
  confirmDeleteRecord();
};

const generateChart = (timeUnit = "week", startDate = null, endDate = null) => {
  if (workouts.value.length === 0) {
    chartOptions.value = {
      backgroundColor: "rgba(0,0,0,0.1)",
      title: {
        text: `卡路里消耗 (${getTimeUnitLabel(timeUnit)})`,
        textStyle: { color: "white" },
      },
      // 添加工具箱配置，即使沒有數據也保留
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: "保存為圖片",
            name: `運動記錄圖表_${getTimeUnitLabel(timeUnit)}_${format(
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
      // 使用 graphic 元素顯示「暫無運動數據」
      graphic: [
        {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "暫無運動數據",
            fontSize: 20,
            fontWeight: "bold",
            fill: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
          },
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
      series: [],
    };
    chartKey.value++;
    return;
  }

  let xAxisData = [];
  let seriesData = [];

  switch (timeUnit) {
    case "week":
      // 週視圖：一週內每天的卡路里消耗
      if (!startDate || !endDate) {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      }

      const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
      xAxisData = weekDays.map((day) => format(day, "MM-dd"));

      seriesData = weekDays.map((day) => {
        const total = workouts.value
          .filter((w) => {
            const workoutDate = new Date(w.startTime);
            return isSameDay(workoutDate, day);
          })
          .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        return total;
      });
      break;

    case "month":
      // 月視圖：當月每天的卡路里消耗
      if (!startDate || !endDate) {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
      }

      const monthDays = eachDayOfInterval({ start: startDate, end: endDate });
      xAxisData = monthDays.map((day) => format(day, "dd"));

      seriesData = monthDays.map((day) => {
        const total = workouts.value
          .filter((w) => {
            const workoutDate = new Date(w.startTime);
            return isSameDay(workoutDate, day);
          })
          .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        return total;
      });
      break;

    case "quarter":
      // 季視圖：當季每月的卡路里消耗
      if (!startDate || !endDate) {
        startDate = startOfQuarter(new Date());
        endDate = endOfQuarter(new Date());
      }

      const quarterMonths = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      });
      xAxisData = quarterMonths.map((month) => format(month, "yyyy-MM"));

      seriesData = quarterMonths.map((month) => {
        const total = workouts.value
          .filter((w) => {
            const workoutDate = new Date(w.startTime);
            return isSameMonth(workoutDate, month);
          })
          .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        return total;
      });
      break;

    case "year":
      // 年視圖：今年每月的卡路里消耗
      if (!startDate || !endDate) {
        startDate = startOfYear(new Date());
        endDate = endOfYear(new Date());
      }

      const yearMonths = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      });
      xAxisData = yearMonths.map((month) => format(month, "MM"));

      seriesData = yearMonths.map((month) => {
        const total = workouts.value
          .filter((w) => {
            const workoutDate = new Date(w.startTime);
            return isSameMonth(workoutDate, month);
          })
          .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        return total;
      });
      break;

    case "custom":
      // 自訂視圖：根據日期範圍的大小決定顯示方式
      if (!startDate || !endDate) {
        ElMessage.warning("請先設定自訂時間範圍");
        return;
      }

      const daysDiff = Math.round(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 31) {
        // 顯示每一天
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        xAxisData = days.map((day) => format(day, "MM-dd"));

        seriesData = days.map((day) => {
          const total = workouts.value
            .filter((w) => {
              const workoutDate = new Date(w.startTime);
              return isSameDay(workoutDate, day);
            })
            .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          return total;
        });
      } else if (daysDiff <= 90) {
        // 顯示每週
        const weeks = eachWeekOfInterval(
          { start: startDate, end: endDate },
          { weekStartsOn: 1 }
        );
        xAxisData = weeks.map(
          (week) =>
            `${format(week, "MM-dd")}~${format(addDays(week, 6), "MM-dd")}`
        );

        seriesData = weeks.map((weekStart) => {
          const weekEnd = addDays(weekStart, 6);
          const total = workouts.value
            .filter((w) => {
              const workoutDate = new Date(w.startTime);
              return workoutDate >= weekStart && workoutDate <= weekEnd;
            })
            .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          return total;
        });
      } else {
        // 顯示每月
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        xAxisData = months.map((month) => format(month, "yyyy-MM"));

        seriesData = months.map((month) => {
          const total = workouts.value
            .filter((w) => {
              const workoutDate = new Date(w.startTime);
              return isSameMonth(workoutDate, month);
            })
            .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          return total;
        });
      }
      break;
  }

  // 獲取當前時間戳，用於設置導出文件名
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const exportFilename = `運動記錄圖表_${getTimeUnitLabel(
    timeUnit
  )}_${timestamp}`;

  // 創建圖表配置
  chartOptions.value = {
    backgroundColor: "rgba(0,0,0,0.1)",
    title: {
      text: `卡路里消耗 (${getTimeUnitLabel(timeUnit)})`,
      textStyle: { color: "white" },
    },
    // 添加工具箱配置，包含導出圖片功能
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: "保存為圖片",
          name: exportFilename,
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
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: function (params) {
        let tooltipText = params[0].name + "<br/>";
        params.forEach((param) => {
          tooltipText += `${param.seriesName}: ${param.value} 卡路里<br/>`;
        });
        return tooltipText;
      },
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        color: "white",
        rotate: timeUnit === "week" || timeUnit === "custom" ? 45 : 0,
        interval: 0,
        fontSize: timeUnit === "month" && xAxisData.length > 20 ? 10 : 12,
      },
      axisLine: { lineStyle: { color: "#eee" } },
    },
    yAxis: {
      type: "value",
      name: "卡路里",
      nameTextStyle: { color: "white" },
      axisLabel: { color: "white" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
    },
    series: [
      {
        name: "卡路里消耗",
        type: timeUnit === "day" ? "bar" : "line",
        data: seriesData,
        smooth: true,
        showSymbol: seriesData.length < 30,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#a0cfff" },
              { offset: 1, color: "#409eff" },
            ],
          },
        },
        label: {
          show: seriesData.length < 15,
          position: "top",
          color: "white",
          formatter: "{c} 卡",
        },
        areaStyle:
          timeUnit !== "day"
            ? {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(160, 207, 255, 0.5)" },
                    { offset: 1, color: "rgba(64, 158, 255, 0.1)" },
                  ],
                },
              }
            : undefined,
      },
    ],
  };

  chartKey.value++;
};

const formatDateForChart = (dateTimeStr, unit) => {
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (unit) {
    case "day":
      return `${year}-${month}-${day}`;
    case "week": {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(start, "yyyy-MM-dd")} ~ ${format(end, "yyyy-MM-dd")}`;
    }
    case "month":
      return `${year}-${month}`;
    case "quarter": {
      const quarter = Math.floor((date.getMonth() + 3) / 3);
      return `${year}-Q${quarter}`;
    }
    case "year":
      return `${year}`;
    case "custom":
      return `${year}-${month}-${day}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

const getTimeUnitLabel = (unit) => {
  switch (unit) {
    case "week":
      return "每週";
    case "month":
      return "每月";
    case "quarter":
      return "每季";
    case "year":
      return "每年";
    case "custom":
      return "自訂";
    default:
      return "每週";
  }
};

const changeTimeUnit = (unit) => {
  currentTimeUnit.value = unit;
  if (unit !== "custom") {
    fetchWorkouts(unit);
  }
};

const openAddModal = () => {
  if (hasBodyMetrics.value) {
    isEditing.value = false;
    workoutForm.value = {
      exerciseType: "",
      exerciseDate: new Date(),
      exerciseDuration: 30,
    };
    dialogVisible.value = true;
  } else {
    ElMessage.warning("請先填寫您的身體數據才能新增運動記錄。");
    router.push("/user/fitness?tab=body-data");
  }
};

const openEditModal = () => {
  if (selectedWorkouts.value.length === 1) {
    isEditing.value = true;
    const workoutToEdit = selectedWorkouts.value[0];
    editingWorkoutId.value = workoutToEdit.recordId;

    let exerciseDate;
    try {
      // 嘗試解析日期，如果是ISO字符串格式
      if (workoutToEdit.exerciseDate) {
        exerciseDate = parseISO(workoutToEdit.exerciseDate);
        if (isNaN(exerciseDate.getTime())) {
          exerciseDate = new Date(workoutToEdit.exerciseDate);
        }
      } else {
        // 如果沒有數據, 使用當前日期
        exerciseDate = new Date();
      }
    } catch (e) {
      console.error("日期解析錯誤:", e);
      exerciseDate = new Date();
    }

    workoutForm.value = {
      exerciseType: workoutToEdit.exerciseType,
      exerciseDate: exerciseDate,
      exerciseDuration: workoutToEdit.exerciseDuration,
    };

    nextTick(() => {
      dialogVisible.value = true;
    });
  } else {
    ElMessage.warning("請選擇一條紀錄");
  }
};

const submitWorkoutForm = async () => {
  if (!hasBodyMetrics.value) {
    ElMessage.warning("請先填寫您的身體數據才能新增運動記錄。");
    return;
  }
  try {
    const payload = {
      ...workoutForm.value,
      exerciseDate: format(workoutForm.value.exerciseDate, "yyyy-MM-dd"), // 使用 exerciseDate，並格式化為 'yyyy-MM-dd'
      userId: authStore.userInfo.id, // 確保 payload 包含 userId
    };
    const headers = { Authorization: `Bearer ${authStore.getToken}` };

    if (isEditing.value && editingWorkoutId.value) {
      await axios.put(
        `/api/tracking/exercise-records/${editingWorkoutId.value}`,
        payload,
        { headers }
      );
      ElMessage.success("運動記錄更新成功");
    } else {
      await axios.post(`/api/tracking/exercise-records`, payload, { headers });
      ElMessage.success("運動記錄新增成功");
    }
    dialogVisible.value = false;
    fetchWorkouts(currentTimeUnit.value); // 重新獲取當前時間單位的數據
  } catch (error) {
    console.error("新增/編輯運動記錄失敗", error);
    ElMessage.error(`新增/編輯運動記錄失敗: ${error.message}`);
  }
};

const confirmDeleteRecord = () => {
  if (selectedWorkouts.value.length >= 1) {
    deleteConfirmVisible.value = true;
  } else {
    ElMessage.warning("請選擇至少一條記錄進行刪除");
  }
};

const deleteWorkoutRecord = async () => {
  try {
    const idsToDelete = selectedWorkouts.value.map(
      (workout) => workout.recordId
    ); // 使用 recordId 刪除
    const headers = { Authorization: `Bearer ${authStore.getToken}` };
    await axios.delete(
      `/api/tracking/exercise-records?ids=${idsToDelete.join(",")}`,
      { headers }
    );
    ElMessage.success("運動記錄刪除成功");
    deleteConfirmVisible.value = false;
    fetchWorkouts(currentTimeUnit.value); // 重新獲取當前時間單位的數據
    selectedWorkouts.value = [];
    selectedWorkout.value = null;
  } catch (error) {
    console.error("刪除運動記錄失敗", error);
    ElMessage.error(`刪除運動記錄失敗: ${error.message}`);
  }
};

const openCustomDateRangeDialog = () => {
  customDateRangeDialogVisible.value = true;
};

const applyCustomDateRange = () => {
  if (customStartDate.value && customEndDate.value) {
    currentTimeUnit.value = "custom";
    fetchWorkouts("custom", customStartDate.value, customEndDate.value);
    customDateRangeDialogVisible.value = false;
  } else {
    ElMessage.warning("請選擇開始和結束日期");
  }
};

const handleSelectionChange = (selection) => {
  selectedWorkouts.value = selection;
};

watch(currentTimeUnit, (newUnit) => {
  if (newUnit !== "custom") {
    fetchWorkouts(newUnit);
  }
});

onMounted(() => {
  if (authStore.userInfo?.id) {
    fetchWorkouts();
    checkBodyMetrics();
  } else {
    ElMessage.warning("請先登入");
  }

  // 添加視窗尺寸變化監聽，確保圖表正確調整大小
  const handleResize = () => {
    if (chartRef.value && chartRef.value.echartsInstance) {
      chartRef.value.echartsInstance.resize();
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
  height: 400px; /* 明確設置高度 */
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
  justify-content: space-between; /* 將子元素分散對齊 */
  align-items: center; /* 垂直居中對齊 */
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
  background-color: #8caae7; /* 您想要的顏色 */
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

/* 對話框和表單樣式 */
:deep(.el-dialog) {
  background-color: #2c3e50 !important;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

:deep(.el-dialog__header) {
  color: #fff !important;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__title) {
  color: #fff !important;
  font-size: 1.5em !important;
}

:deep(.el-dialog__body) {
  background-color: #34495e !important;
  padding: 25px;
  color: #ecf0f1 !important;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: none !important;
  background-color: #34495e !important;
  text-align: center;
}

:deep(.el-dialog__footer .el-button) {
  font-size: 1.1rem;
  padding: 12px 25px;
  margin: 0 10px;
}

:deep(.el-form-item__label) {
  color: #ecf0f1 !important;
  font-weight: bold;
}

/* 輸入框樣式 */
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

/* 選擇器樣式 */
.el-select {
  width: 100%;
}

:deep(.el-select .el-input.is-focus .el-input__inner),
:deep(.el-select .el-input__inner:focus) {
  border-color: #409eff;
}

:deep(.el-select .el-input__inner) {
  border: none !important;
  background-color: #4a6572 !important;
  color: #eee !important;
  border-radius: 8px !important;
  padding: 0 10px !important;
  height: 40px !important;
  line-height: 40px !important;
  cursor: pointer !important;
  transition: background-color 0.3s ease, border-color 0.3s ease !important;
}

:deep(.el-select:hover .el-input__inner) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-select .el-input__suffix) {
  color: #eee;
}

:deep(.el-select .el-input.is-active .el-input__suffix) {
  color: #409eff;
}

/* 下拉選單樣式 */
:deep(.el-select-dropdown) {
  border: 1px solid #555;
  border-radius: 5px;
  background-color: #444;
  color: #eee;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 15px;
  cursor: pointer;
  color: #eee;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: #409eff;
  color: white;
}

/* 數字輸入框樣式 */
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: #4a6572 !important;
  color: #fff !important;
  border: 1px solid #607d8b;
}

/* 自訂日期範圍選擇器樣式 */
:deep(.el-date-editor.el-input .el-input__inner),
:deep(.el-date-editor.el-input .el-input__wrapper) {
  background-color: #4a6572 !important;
  color: #fff !important;
}

:deep(.el-date-table td.is-selected div span) {
  color: #000 !important;
  background-color: #00ff00 !important;
  font-size: 1.2em !important;
}

/* 表格樣式 */
:deep(.el-table) {
  background-color: transparent;
}

:deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, #10202b, #234567);
  color: #fff !important;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-table__body tr td.el-table__cell > div) {
  color: #fff !important;
}

:deep(
    .el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell
  ) {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 按鈕樣式 */
:deep(.el-button) {
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

:deep(.el-button--danger:hover) {
  background-color: #f78989;
  border-color: #f78989;
}

/* 圖表相關 */
.echarts-datazoom-slider text {
  display: none !important;
}
</style>
