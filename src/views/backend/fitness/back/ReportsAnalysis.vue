<template>
    <div>
        <h1>綜合數據報告</h1>
        <div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px">
                <el-card style="width: 250px">
                    <template #header>
                        <div class="card-header">
                            <span>總訓練次數</span>
                        </div>
                    </template>
                    <div style="text-align: center; font-size: 24px; font-weight: bold">
                        {{ dashboardStats.totalWorkouts }}
                    </div>
                </el-card>

                <el-card style="width: 250px">
                    <template #header>
                        <div class="card-header">
                            <span>總訓練時長 (分鐘)</span>
                        </div>
                    </template>
                    <div style="text-align: center; font-size: 24px; font-weight: bold">
                        {{ dashboardStats.totalWorkoutMinutes }}
                    </div>
                </el-card>

                <el-card style="width: 250px">
                    <template #header>
                        <div class="card-header">
                            <span>總燃燒卡路里</span>
                        </div>
                    </template>
                    <div style="text-align: center; font-size: 24px; font-weight: bold">
                        {{
                            dashboardStats.totalCaloriesBurned
                                ? dashboardStats.totalCaloriesBurned.toFixed(2)
                                : 0
                        }}
                    </div>
                </el-card>

                <el-card style="width: 250px">
                    <template #header>
                        <div class="card-header">
                            <span>本週活躍用戶數</span>
                        </div>
                    </template>
                    <div style="text-align: center; font-size: 24px; font-weight: bold">
                        {{ dashboardStats.activeUsersThisWeek }}
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const dashboardStats = ref({
    totalWorkouts: 0,
    totalWorkoutMinutes: 0,
    totalCaloriesBurned: 0,
    activeUsersThisWeek: 0,
});

onMounted(() => {
    fetchDashboardStats();
});

const fetchDashboardStats = async () => {
    try {
        const token = localStorage.getItem("authToken");
        console.log("從 localStorage 獲取的 token:", token); // 檢查 token 值

        const response = await axios.get("/api/fitness/dashboard/stats", {
            headers: {
                Authorization: `Bearer ${token}`, // 直接在請求中設置 Authorization header
            },
        });
        dashboardStats.value = response.data;
        console.log("儀表板統計數據:", response.data);
    } catch (error) {
        console.error("獲取儀表板統計數據失敗", error);
        ElMessage.error("獲取儀表板統計數據失敗");
    }
};
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
