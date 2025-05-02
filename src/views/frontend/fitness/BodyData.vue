<template>
  <div class="body-data-manager">
    <h1>身體數據</h1>

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
      <button class="add-record-button" @click="$emit('open-add-body-data')">
        新增數據
      </button>
    </div>

    <div class="body-data-chart"></div>

    <div class="list-toggle">
      <button @click="toggleListVisible">
        {{ isListVisible ? "收起數據列表" : "查看數據列表" }}
      </button>
    </div>

    <div
      v-if="isListVisible && bodyData && bodyData.length > 0"
      class="body-data-list"
    >
      <h3>身體數據列表</h3>
      <el-table :data="sortedBodyData" border style="width: 100%">
        <el-table-column prop="weight" label="體重 (公斤)"></el-table-column>
        <el-table-column prop="bodyFat" label="體脂率 (%)"></el-table-column>
        <el-table-column prop="height" label="身高 (公分)"></el-table-column>
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
        <el-table-column prop="dateRecorded" label="測量日期"></el-table-column>
        <el-table-column label="操作" width="205">
          <template #default="scope">
            <el-button
              @click="$emit('open-edit-body-data', scope.row)"
              :icon="'edit'"
              >編輯</el-button
            >
            <el-button
              :icon="'delete'"
              type="danger"
              @click="$emit('delete-body-data', scope.row.id)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      v-else-if="isListVisible && (!bodyData || bodyData.length === 0)"
      class="no-data"
    >
      暫無身體數據
    </div>

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
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import * as echarts from "echarts";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  getWeek,
  getYear,
  getMonth,
  isWithinInterval,
} from "date-fns";
import _ from "lodash";

const props = defineProps({
  bodyData: {
    type: Array,
    required: true,
  },
  loadingBodyData: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "open-add-body-data",
  "open-edit-body-data",
  "delete-body-data",
  "change-time-unit",
  "apply-custom-date-range",
]);

// 列表顯示控制
const isListVisible = ref(false);
const toggleListVisible = () => {
  isListVisible.value = !isListVisible.value;
};

// 時間單位控制
const currentTimeUnit = ref("month");
const customDateRangeDialogVisible = ref(false);
const customStartDate = ref(null);
const customEndDate = ref(null);

// 處理後的圖表數據
const processedChartData = ref([]);

// 數據排序 - 按日期排列
const sortedBodyData = computed(() => {
  if (!props.bodyData || props.bodyData.length === 0) return [];

  const sortedData = [...props.bodyData];

  // 根據日期排序，最新的日期在前面
  return sortedData.sort((a, b) => {
    const dateA = new Date(a.dateRecorded);
    const dateB = new Date(b.dateRecorded);
    return dateB - dateA; // 降序排列，最新的日期在前
  });
});

// 獲取時間單位的顯示文字
const getTimeUnitText = (unit) => {
  switch (unit) {
    case "week":
      return "週視圖";
    case "month":
      return "月視圖";
    case "quarter":
      return "季視圖";
    case "year":
      return "年視圖";
    case "custom":
      return "自訂時間範圍";
    default:
      return "";
  }
};

// 格式化顯示日期
const formatDisplayDate = (dateKey, timeUnit) => {
  switch (timeUnit) {
    case "week":
      // 日期格式為 "yyyy-MM-dd"
      if (dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateKey.split("-");
        return `${month}/${day}`;
      }
      return dateKey;
    case "month":
      if (dateKey.includes("W")) {
        // 週格式 "yyyy-Wxx"
        const [year, week] = dateKey.split("-W");
        return `第${week}週`;
      }
      return dateKey;
    case "quarter":
      // 月份格式 "yyyy-MM"
      if (dateKey.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateKey.split("-");
        return `${month}月`;
      }
      return dateKey;
    case "year":
      // 季度格式 "yyyy-Qx"
      if (dateKey.includes("-Q")) {
        const [yearPart, quarterPart] = dateKey.split("-Q");
        return `Q${quarterPart}`;
      }
      return dateKey;
    case "custom":
      // 根據格式判斷
      if (dateKey.includes("W")) {
        // 週格式
        const [year, week] = dateKey.split("-W");
        return `${year}年第${week}週`;
      } else if (dateKey.includes("-Q")) {
        // 季度格式
        const [yearPart, quarterPart] = dateKey.split("-Q");
        return `${yearPart}年Q${quarterPart}`;
      } else if (dateKey.match(/^\d{4}-\d{2}$/)) {
        // 月份格式 "yyyy-MM"
        const [year, month] = dateKey.split("-");
        return `${year}年${month}月`;
      } else if (dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // 日期格式 "yyyy-MM-dd"
        const [year, month, day] = dateKey.split("-");
        return `${year}/${month}/${day}`;
      }
      return dateKey;
    default:
      return dateKey;
  }
};

// 變更時間單位
const changeTimeUnit = (unit) => {
  currentTimeUnit.value = unit;
  processDataByTimeUnit(props.bodyData, unit);

  if (unit !== "custom") {
    emit("change-time-unit", unit);
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
    emit("apply-custom-date-range", customStartDate.value, customEndDate.value);
    customDateRangeDialogVisible.value = false;

    // 在應用自訂日期範圍後，也要處理數據
    processDataByTimeUnit(props.bodyData, "custom");
  } else {
    alert("請選擇開始和結束日期");
  }
};

const processDataByTimeUnit = (data, timeUnit) => {
  if (!data || data.length === 0) {
    processedChartData.value = [];
    renderBodyDataChart();
    return;
  }

  let groupedData = {};
  const now = new Date();
  let filteredData = [...data];

  // 根據時間單位篩選數據並分組
  switch (timeUnit) {
    case "week": {
      // 獲取本週的範圍
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 從週一開始
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // 篩選本週數據
      filteredData = data.filter((item) => {
        const itemDate = parseISO(item.dateRecorded);
        return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
      });

      // 按日期分組（每天）
      groupedData = _.groupBy(filteredData, (item) => {
        return format(parseISO(item.dateRecorded), "yyyy-MM-dd");
      });
      break;
    }
    case "month": {
      // 獲取本月的範圍
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // 篩選本月數據
      filteredData = data.filter((item) => {
        const itemDate = parseISO(item.dateRecorded);
        return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
      });

      // 按週分組
      groupedData = _.groupBy(filteredData, (item) => {
        const date = parseISO(item.dateRecorded);
        const year = getYear(date);
        const week = getWeek(date, { weekStartsOn: 1 });
        return `${year}-W${week}`;
      });
      break;
    }
    case "quarter": {
      // 獲取本季度的範圍
      const quarterStart = startOfQuarter(now);
      const quarterEnd = endOfQuarter(now);

      // 篩選本季度數據
      filteredData = data.filter((item) => {
        const itemDate = parseISO(item.dateRecorded);
        return isWithinInterval(itemDate, {
          start: quarterStart,
          end: quarterEnd,
        });
      });

      // 按月分組
      groupedData = _.groupBy(filteredData, (item) => {
        const date = parseISO(item.dateRecorded);
        return format(date, "yyyy-MM");
      });
      break;
    }
    case "year": {
      // 獲取本年的範圍
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);

      // 篩選本年數據
      filteredData = data.filter((item) => {
        const itemDate = parseISO(item.dateRecorded);
        return isWithinInterval(itemDate, { start: yearStart, end: yearEnd });
      });

      // 按季度分組
      groupedData = _.groupBy(filteredData, (item) => {
        const date = parseISO(item.dateRecorded);
        const year = getYear(date);
        const month = getMonth(date);
        const quarter = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;
      });
      break;
    }
    case "custom": {
      if (customStartDate.value && customEndDate.value) {
        // 將自訂日期範圍轉換為 Date 對象
        const start = new Date(customStartDate.value);
        const end = new Date(customEndDate.value);

        // 篩選指定範圍內的數據
        filteredData = data.filter((item) => {
          const itemDate = parseISO(item.dateRecorded);
          return isWithinInterval(itemDate, { start, end });
        });

        // 根據日期跨度選擇分組方式
        const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
        if (daysDiff > 180) {
          // 大於180天，按季度分組
          groupedData = _.groupBy(filteredData, (item) => {
            const date = parseISO(item.dateRecorded);
            const year = getYear(date);
            const month = getMonth(date);
            const quarter = Math.floor(month / 3) + 1;
            return `${year}-Q${quarter}`;
          });
        } else if (daysDiff > 60) {
          // 大於60天，按月分組
          groupedData = _.groupBy(filteredData, (item) => {
            return format(parseISO(item.dateRecorded), "yyyy-MM");
          });
        } else if (daysDiff > 14) {
          // 大於14天，按週分組
          groupedData = _.groupBy(filteredData, (item) => {
            const date = parseISO(item.dateRecorded);
            const year = getYear(date);
            const week = getWeek(date, { weekStartsOn: 1 });
            return `${year}-W${week}`;
          });
        } else {
          // 否則按天分組
          groupedData = _.groupBy(filteredData, (item) => {
            return format(parseISO(item.dateRecorded), "yyyy-MM-dd");
          });
        }
      } else {
        // 如果沒有選擇自訂日期範圍，使用原始數據
        processedChartData.value = data;
        renderBodyDataChart();
        return;
      }
      break;
    }
    default:
      // 默認情況下也按月顯示
      processedChartData.value = data;
      renderBodyDataChart();
      return;
  }

  // 計算每組的平均值並轉換成圖表數據格式
  const result = [];

  for (const [dateKey, group] of Object.entries(groupedData)) {
    if (group.length > 0) {
      // 計算平均值
      const avgWeight = _.meanBy(group, "weight");
      const avgBodyFat = _.meanBy(group, "bodyFat");
      const avgMuscleMass = _.meanBy(group, "muscleMass");

      // 如果有腰圍和臀圍數據，也計算它們的平均值
      let avgWaistCircumference = null;
      let avgHipCircumference = null;

      // 檢查是否有有效的腰圍和臀圍數據
      const validWaistData = group.filter(
        (item) =>
          item.waistCircumference != null &&
          item.waistCircumference !== undefined
      );
      const validHipData = group.filter(
        (item) =>
          item.hipCircumference != null && item.hipCircumference !== undefined
      );

      if (validWaistData.length > 0) {
        avgWaistCircumference = _.meanBy(validWaistData, "waistCircumference");
      }

      if (validHipData.length > 0) {
        avgHipCircumference = _.meanBy(validHipData, "hipCircumference");
      }

      // 添加到結果中
      result.push({
        dateRecorded: formatDisplayDate(dateKey, timeUnit),
        weight: _.round(avgWeight, 2),
        bodyFat: _.round(avgBodyFat, 2),
        muscleMass: _.round(avgMuscleMass, 2),
        waistCircumference: avgWaistCircumference
          ? _.round(avgWaistCircumference, 2)
          : null,
        hipCircumference: avgHipCircumference
          ? _.round(avgHipCircumference, 2)
          : null,
        originalDateKey: dateKey,
        dataCount: group.length,
      });
    }
  }

  // 按日期排序
  result.sort((a, b) => {
    return a.originalDateKey.localeCompare(b.originalDateKey);
  });

  // 更新處理後的數據
  processedChartData.value = result;

  // 渲染圖表
  renderBodyDataChart();
};

let bodyDataChartInstance = null;

// 渲染圖表
const renderBodyDataChart = () => {
  const chartDom = document.querySelector(".body-data-chart");
  if (!chartDom) return;

  // 確保容器有足夠的大小
  chartDom.style.width = "100%";
  chartDom.style.height = "400px";

  // 如果已有實例，先銷毀
  if (bodyDataChartInstance) {
    bodyDataChartInstance.dispose();
  }

  bodyDataChartInstance = echarts.init(chartDom);

  if (processedChartData.value && processedChartData.value.length > 0) {
    const dates = processedChartData.value.map((item) => item.dateRecorded);
    const weights = processedChartData.value.map((item) => item.weight);
    const bodyFats = processedChartData.value.map((item) => item.bodyFat);
    const muscleMasses = processedChartData.value.map(
      (item) => item.muscleMass
    );

    // 獲取當前時間戳，用於設置導出文件名
    const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
    const exportFilename = `身體數據圖表_${timestamp}`;

    const option = {
      title: {
        text: `身體數據變化 (${getTimeUnitText(currentTimeUnit.value)})`,
        textStyle: { color: "white" },
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          let result = `<div style="font-weight:bold;margin-bottom:5px">${params[0].axisValue}</div>`;
          params.forEach((param) => {
            if (param.value !== null && param.value !== undefined) {
              let unit = param.seriesName === "體脂率" ? "%" : "kg";
              result += `<div>${param.marker} ${param.seriesName}: ${param.value} ${unit}</div>`;
            }
          });

          // 添加數據點數量信息
          const dataItem = processedChartData.value.find(
            (item) => item.dateRecorded === params[0].axisValue
          );
          if (dataItem && dataItem.dataCount) {
            result += `<div style="margin-top:5px;font-size:0.9em;color:#999">數據點數量: ${dataItem.dataCount}</div>`;
          }

          return result;
        },
      },
      legend: {
        data: ["體重", "體脂率", "肌肉量"],
        textStyle: { color: "white" },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
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
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "white",
          rotate: currentTimeUnit.value === "year" ? 0 : 30, // 對於較長的日期標籤，旋轉30度
          interval: 0, // 顯示所有標籤
        },
        axisLine: { lineStyle: { color: "#eee" } },
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
            color: "white",
          },
        },
        {
          type: "value",
          name: "體脂率 (%)",
          position: "right",
          alignTicks: true,
          offset: 80,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#91cc75",
            },
          },
          axisLabel: {
            formatter: "{value} %",
            color: "white",
          },
        },
        {
          type: "value",
          name: "肌肉量 (kg)",
          position: "right",
          alignTicks: true,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#74add1",
            },
          },
          axisLabel: {
            formatter: "{value} kg",
            color: "white",
          },
        },
      ],
      series: [
        {
          name: "體重",
          type: "line",
          data: weights,
          yAxisIndex: 0,
          lineStyle: {
            width: 2,
          },
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              borderWidth: 3,
              borderColor: "#5470c6",
              shadowBlur: 10,
              shadowColor: "rgba(84,112,198,0.5)",
            },
          },
          markPoint: {
            data: [
              { type: "max", name: "最大值" },
              { type: "min", name: "最小值" },
            ],
          },
          markLine: {
            data: [{ type: "average", name: "平均值" }],
          },
        },
        {
          name: "體脂率",
          type: "line",
          data: bodyFats,
          yAxisIndex: 1,
          lineStyle: {
            width: 2,
          },
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              borderWidth: 3,
              borderColor: "#91cc75",
              shadowBlur: 10,
              shadowColor: "rgba(145,204,117,0.5)",
            },
          },
          markPoint: {
            data: [
              { type: "max", name: "最大值" },
              { type: "min", name: "最小值" },
            ],
          },
          markLine: {
            data: [{ type: "average", name: "平均值" }],
          },
        },
        {
          name: "肌肉量",
          type: "line",
          data: muscleMasses,
          yAxisIndex: 2,
          lineStyle: {
            width: 2,
          },
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              borderWidth: 3,
              borderColor: "#74add1",
              shadowBlur: 10,
              shadowColor: "rgba(116,173,209,0.5)",
            },
          },
          markPoint: {
            data: [
              { type: "max", name: "最大值" },
              { type: "min", name: "最小值" },
            ],
          },
          markLine: {
            data: [{ type: "average", name: "平均值" }],
          },
        },
      ],
    };

    bodyDataChartInstance.setOption(option);
  } else {
    const noDataOption = {
      title: {
        text: `身體數據變化 (${getTimeUnitText(currentTimeUnit.value)})`,
        textStyle: { color: "white" },
      },
      graphic: [
        {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "暫無身體數據",
            fontSize: 20,
            fontWeight: "bold",
            fill: "rgba(255, 255, 255, 0.7)",
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

    bodyDataChartInstance.setOption(noDataOption);
  }
};

// 添加視窗調整大小的事件處理
const handleResize = () => {
  if (bodyDataChartInstance) {
    bodyDataChartInstance.resize();
  }
};

// 監聽數據變化，重新處理並渲染圖表
watch(
  () => props.bodyData,
  (newData) => {
    if (newData && newData.length > 0) {
      processDataByTimeUnit(newData, currentTimeUnit.value);
    } else {
      processedChartData.value = [];
      renderBodyDataChart();
    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  if (props.bodyData && props.bodyData.length > 0) {
    processDataByTimeUnit(props.bodyData, currentTimeUnit.value);
  }
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (bodyDataChartInstance) {
    bodyDataChartInstance.dispose();
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.body-data-manager {
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.body-data-manager h1 {
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

.body-data-chart {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
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

.body-data-list {
  margin-top: 20px;
  color: white;
}

.body-data-list h3 {
  margin-bottom: 15px;
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  color: var(--text-secondary);
  padding: 20px;
}

.loading {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  color: #999;
}

/* 針對 el-table 的樣式 */
:deep(.el-table) {
  background-color: transparent;
  color: var(--text-primary);
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #333 !important;
  font-weight: bold !important;
  font-size: 1rem !important;
}
</style>
