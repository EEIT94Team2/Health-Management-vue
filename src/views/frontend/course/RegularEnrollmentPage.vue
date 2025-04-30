<template>
    <div class="regular-enrollment-page frontend-layout">
        <div class="page-content section-container">
            <h2 class="section-title">報名<span class="text-highlight">常規課程</span></h2>

            <div v-if="isLoading" class="loading-skeleton">
                <el-skeleton :rows="8" animated />
            </div>

            <div v-else class="enrollment-list">
                 <el-table :data="regularCourses" style="width: 100%" class="enrollment-table" empty-text="沒有找到可報名的常規課程">
                    <el-table-column prop="name" label="課程名稱" width="200"></el-table-column>
                    <el-table-column label="時間" width="150">
                        <template #default="{ row }">
                            {{ formatDayOfWeek(row.dayOfWeek) }} {{ row.startTime }}
                        </template>
                    </el-table-column>
                     <el-table-column prop="coachName" label="教練" width="120"></el-table-column> <el-table-column prop="duration" label="時長" width="100"></el-table-column>
                    <el-table-column label="已報名 / 容量" width="120">
                         <template #default="{ row }">
                            {{ row.registeredCount }} / {{ row.maxCapacity }}
                         </template>
                    </el-table-column>
                    <el-table-column prop="waitlistCount" label="候補人數" width="100"></el-table-column>

                    <el-table-column label="操作">
                        <template #default="{ row }">
                             <template v-if="!row.userStatus || row.userStatus === '未報名'">
                                <el-button
                                    :type="row.registeredCount >= row.maxCapacity ? 'warning' : 'success'"
                                    :plain="row.registeredCount >= row.maxCapacity"
                                    size="small"
                                    @click="handleEnroll(row.id)"
                                    :disabled="isCourseWithinCutoff(row)"
                                >
                                    {{ row.registeredCount >= row.maxCapacity ? '候補' : '報名' }}
                                </el-button>
                             </template>
                            <template v-else>
                                <el-tag :type="getStatusTagType(row.userStatus)">
                                    {{ row.userStatus }}
                                </el-tag>
                            </template>

                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// Sidebar import path may vary
// import Sidebar from '@/components/Layouts/frontend/Sidebar.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const apiBaseUrl = import.meta.env.VUE_APP_API_URL || 'http://localhost:8080/api';

const router = useRouter();
const regularCourses = ref([]);
const isLoading = ref(false);

const authStore = useAuthStore();
const currentUserId = authStore.user?.id;

// Require login
if (!currentUserId) {
     ElMessage.warning("請先登入以報名課程。");
     router.push('/login');
}

const fetchRegularCourses = async () => {
    if (!currentUserId) {
         regularCourses.value = [];
         isLoading.value = false;
         return;
    }

    isLoading.value = true;
    try {
        // Backend endpoint to get all regular courses (isTrial=0)
        // Ideally includes userStatus for filtering/display
        const response = await axios.get(`${apiBaseUrl}/courses/regular`, { // !!! Adjust backend endpoint !!!
             headers: {
                 Authorization: `Bearer ${authStore.token}`
             }
        });
         regularCourses.value = response.data;
        console.log('Fetched regular courses:', regularCourses.value);

    } catch (error) {
        console.error('Error fetching regular courses:', error);
        const errorMessage = error.response?.data?.message || '無法載入常規課程列表。';
        ElMessage.error(errorMessage);
    } finally {
        isLoading.value = false;
    }
};

const handleEnroll = async (courseId) => {
     if (!currentUserId) {
         ElMessage.warning("請先登入以進行報名。");
         router.push('/login');
         return;
     }
     const course = regularCourses.value.find(c => c.id === courseId);
     const courseName = course ? course.name : '該課程';

     ElMessageBox.confirm(
         `確定要報名或加入【${courseName}】的候補名單嗎？`,
         '報名確認',
         {
             confirmButtonText: '確定',
             cancelButtonText: '取消',
             type: 'info',
         }
     )
     .then(async () => {
          isLoading.value = true;
          try {
              const response = await axios.post(`${apiBaseUrl}/enrollments/courses/${courseId}`, {}, {
                  headers: {
                      Authorization: `Bearer ${authStore.token}`
                  }
              });
              console.log('Enrollment response:', response.data);
              const statusMessage = response.data.status || '報名成功';
              ElMessage.success(`${statusMessage}！`);
              fetchRegularCourses(); // Refresh list
          } catch (error) {
              console.error('Enrollment failed:', error);
              const errorMessage = error.response?.data?.message || '報名失敗，請稍後再試。';
              ElMessage.error(errorMessage);
              isLoading.value = false;
          } finally {
               if (isLoading.value) {
                   isLoading.value = false;
              }
          }
     })
     .catch(() => {
         ElMessage.info('已取消報名操作。');
     });
};

const formatDayOfWeek = (dayOfWeek) => {
    if (dayOfWeek === null || dayOfWeek === undefined) return '未知';
    const simpleDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
     if (dayOfWeek >= 1 && dayOfWeek <= 6) {
         return simpleDays[dayOfWeek - 1];
    } else if (dayOfWeek === 7 || dayOfWeek === 0) {
         return simpleDays[6];
    }
    return '無';
};

const getStatusTagType = (status) => {
    switch (status) {
        case '已報名': return 'success';
        case '候補中': return 'warning';
        case '已取消': return 'info';
        case '已完成': return 'success';
        case '未到場': return 'danger';
        default: return 'info';
    }
};

const isCourseWithinCutoff = (course) => {
     // This logic depends on backend providing next occurrence time if needed
     return false;
};

onMounted(() => {
    fetchRegularCourses();
});

</script>

<style lang="scss" scoped>
/* Import variables and mixins if you have separate files */
/* @import '@/assets/styles/variables'; */
/* @import '@/assets/styles/mixins'; */

.regular-enrollment-page {
    // Inherit dark theme variables

    .page-content {
        padding-top: 30px;
        padding-bottom: 50px;
    }

    .section-title {
        text-align: center;
        margin-bottom: 2.5rem;
        color: var(--text-primary);
    }

    .text-highlight {
        color: var(--highlight-color);
    }

    .loading-skeleton {
        padding: 20px;
        background-color: var(--card-bg);
        border-radius: 8px;
        max-width: 100%;
        margin: 20px auto;
    }

    .enrollment-list {
        margin-top: 20px;

        .enrollment-table {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;

            :deep(.el-table__header-wrapper) {
                 th {
                     // 使用定義好的更深的顏色變數
                     background-color: var(--card-bg-darker);
                     color: var(--text-primary);
                     border-color: var(--border-color);
                     font-weight: bold;
                 }
            }

            :deep(.el-table__body-wrapper) {
                td {
                    background-color: var(--card-bg);
                    color: var(--text-secondary);
                    border-color: var(--border-color);
                }
                tr:nth-child(even) {
                     td {
                        background-color: var(--card-bg-lighter);
                     }
                }
            }

             :deep(.el-table__empty-block) {
                  background-color: var(--card-bg);
                  color: var(--text-secondary);
             }

            .el-tag {
                 &.el-tag--success {
                    background-color: var(--highlight-color);
                    color: var(--text-primary);
                    border-color: var(--highlight-color);
                    opacity: 0.9;
                     font-weight: normal;
                }
                 &.el-tag--warning {
                     background-color: lighten(#ff9800, 10%);
                     color: #333;
                     border-color: lighten(#ff9800, 10%);
                     opacity: 0.9;
                      font-weight: normal;
                 }
                 &.el-tag--danger {
                      background-color: lighten(#f44336, 10%);
                      color: var(--text-primary);
                      border-color: lighten(#f44336, 10%);
                      opacity: 0.9;
                       font-weight: normal;
                 }
                 &.el-tag--info {
                     background-color: var(--border-color);
                     color: var(--text-secondary);
                     border-color: var(--border-color);
                     opacity: 0.9;
                      font-weight: normal;
                 }
            }

             .el-button {
                  &.el-button--success {
                      background-color: var(--highlight-color);
                      color: var(--text-primary);
                      border-color: var(--highlight-color);
                       &:hover {
                            background-color: var(--highlight-hover);
                            border-color: var(--highlight-hover);
                       }
                 }
                  &.el-button--warning {
                     background-color: lighten(#ff9800, 10%);
                     color: #333;
                     border-color: lighten(#ff9800, 10%);
                       &:hover {
                            background-color: #ff9800;
                            border-color: #ff9800;
                       }
                  }
                  &.is-plain {
                       background-color: transparent;
                       &.el-button--warning {
                            color: lighten(#ff9800, 10%);
                            border-color: lighten(#ff9800, 10%);
                             &:hover {
                                background-color: lighten(#ff9800, 10%);
                                color: #333;
                            }
                       }
                  }

                 &.is-disabled {
                      opacity: 0.5;
                      cursor: not-allowed;
                 }
             }
        }
    }
}
</style>