<template>
  <div class="body-data-container">
    <div class="body-data-header">
      <h2>身體數據</h2>
      <el-button type="info" size="small" @click="$emit('open-add-body-data')"
        >新增數據</el-button
      >
    </div>

    <div id="body-data-chart" style="width: 100%; height: 400px"></div>

    <el-button style="margin-top: 20px" @click="showDataTable = !showDataTable">
      {{ showDataTable ? "隱藏數據列表" : "查看數據列表" }}
    </el-button>

    <el-table
      v-if="showDataTable"
      :data="bodyData"
      border
      style="width: 100%; margin-top: 15px"
      sort-by="dateRecorded"
      sort-order="descending"
    >
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
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button
            size="small"
            @click="$emit('open-edit-body-data', scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="$emit('delete-body-data', scope.row.id)"
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
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
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

const showDataTable = ref(false);
let bodyDataChartInstance = null;

const renderBodyDataChart = () => {
  const chartDom = document.getElementById("body-data-chart");
  if (chartDom) {
    bodyDataChartInstance = echarts.init(chartDom);
    if (props.bodyData && props.bodyData.length > 0) {
      const dates = props.bodyData.map((item) => item.dateRecorded);
      const weights = props.bodyData.map((item) => item.weight);
      const bodyFats = props.bodyData.map((item) => item.bodyFat);

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
            yAxisIndex: 0,
          },
          {
            name: "體脂率",
            type: "line",
            data: bodyFats,
            yAxisIndex: 1,
          },
        ],
      };
      bodyDataChartInstance.setOption(option);
    } else {
      // 清空圖表或顯示無數據的訊息
      bodyDataChartInstance.clear();
    }
  }
};

watch(() => props.bodyData, renderBodyDataChart, {
  deep: true,
  immediate: true,
});
</script>

<style scoped>
.body-data-container {
  padding: 20px;
}

.body-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h2 {
  margin: 0;
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.loading {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  color: #999;
}
</style>
