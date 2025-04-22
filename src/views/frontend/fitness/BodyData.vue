<template>
  <div class="body-data-manager">
    <div class="card-header">
      <h2>身體數據</h2>
      <el-button
        type="primary"
        size="small"
        @click="$emit('open-add-body-data')"
      >
        新增數據
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import * as echarts from "echarts";

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
]);

let bodyDataChartInstance = null;

const renderBodyDataChart = () => {
  const chartDom = document.querySelector(".body-data-chart");
  if (chartDom) {
    bodyDataChartInstance = echarts.init(chartDom);
    if (props.bodyData && props.bodyData.length > 0) {
      const dates = props.bodyData.map((item) => item.dateRecorded);
      const weights = props.bodyData.map((item) => item.weight);
      const bodyFats = props.bodyData.map((item) => item.bodyFat);
      const muscleMasses = props.bodyData.map((item) => item.muscleMass); // 假設後端有提供肌肉量

      const option = {
        title: {
          text: "身體數據變化",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["體重", "體脂率", "肌肉量"], // 包含肌肉量
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
            offset: 80, // 調整偏移量，避免與其他 Y 軸重疊
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
            },
          },
        ],
        series: [
          {
            name: "體重",
            type: "line",
            data: weights,
            yAxisIndex: 0,
          },
          {
            name: "體脂率",
            type: "line",
            data: bodyFats,
            yAxisIndex: 1,
          },
          {
            name: "肌肉量",
            type: "line",
            data: muscleMasses,
            yAxisIndex: 2,
          },
        ],
      };
      bodyDataChartInstance.setOption(option);
    } else {
      bodyDataChartInstance.clear();
    }
  }
};

watch(() => props.bodyData, renderBodyDataChart, {
  deep: true,
  immediate: true,
});

onMounted(() => {
  renderBodyDataChart();
});
</script>

<style lang="scss" scoped>
.body-data-manager {
  /* 移除容器的內邊距，讓父組件的 el-card 控制 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.body-data-chart {
  width: 100%;
  height: 400px;
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  color: var(--text-secondary);
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

.el-button {
}
</style>
