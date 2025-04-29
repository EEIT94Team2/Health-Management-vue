<template>
    <div class="trial-booking-page frontend-layout">
        <div class="page-content section-container">
            <h2 class="section-title">預約<span class="text-highlight">體驗課程</span></h2>

            <div v-if="isLoading" class="loading-skeleton">
                <el-skeleton :rows="8" animated />
            </div>

            <div v-else class="trial-list">
                 <el-table :data="trialCourses" style="width: 100%" class="trial-table" empty-text="沒有找到可預約的體驗課程">
                    <el-table-column prop="name" label="課程名稱" width="200"></el-table-column>
                    <el-table-column label="時間" width="150">
                        <template #default="{ row }">
                            {{ formatDayOfWeek(row.dayOfWeek) }} {{ row.startTime }}
                        </template>
                    </el-table-column>
                     <el-table-column prop="coachName" label="教練" width="120"></el-table-column> <el-table-column prop="duration" label="時長" width="100"></el-table-column>
                    <el-table-column label="體驗名額" width="120">
                         <template #default="{ row }">
                            {{ row.bookedTrialCount || 0 }} / {{ row.maxTrialCapacity || row.maxCapacity }}
                         </template>
                    </el-table-column>
                     <el-table-column label="操作">
                        <template #default="{ row }">
                             <el-button
                                 type="primary"
                                 size="small"
                                 @click="openBookingModal(row)"
                                 :disabled="row.hasBookedTrial || (row.bookedTrialCount >= row.maxTrialCapacity)"
                             >
                                 {{ row.hasBookedTrial ? '已預約體驗' : '預約體驗' }}
                             </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <el-dialog
                 v-model="showBookingModal"
                 title="預約體驗課程"
                 width="400px"
                 class="booking-modal"
            >
                <el-form :model="bookingForm" :rules="bookingRules" ref="bookingFormRef" label-position="top">
                    <el-form-item label="課程名稱">
                        <el-input v-model="bookingForm.courseName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="預約姓名" prop="name">
                         <el-input v-model="bookingForm.name" placeholder="請輸入您的姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="聯絡電話" prop="phone">
                         <el-input v-model="bookingForm.phone" placeholder="請輸入您的聯絡電話"></el-input>
                    </el-form-item>
                    <el-form-item label="預約日期與時間" prop="time">
                         <el-date-picker
                             v-model="bookingForm.time"
                             type="datetime"
                             placeholder="請選擇日期與時間"
                             :disabled-date="disabledBookingDate"
                             :disabled-time="disabledBookingTime"
                             format="YYYY-MM-DD HH:mm"
                             value-format="YYYY-MM-DD HH:mm:ss"
                             style="width: 100%;"
                         ></el-date-picker>
                         </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="showBookingModal = false">取消</el-button>
                        <el-button type="primary" @click="submitBooking">確定預約</el-button>
                    </span>
                </template>
            </el-dialog>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// Sidebar import path may vary
// import Sidebar from '@/components/Layouts/frontend/Sidebar.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

const apiBaseUrl = import.meta.env.VUE_APP_API_URL || 'http://localhost:8080/api';

const router = useRouter();
const trialCourses = ref([]);
const isLoading = ref(false);

const authStore = useAuthStore();
const currentUserId = authStore.user?.id;

// Require login
if (!currentUserId) {
     ElMessage.warning("請先登入以預約體驗課程。");
     router.push('/login');
}

const showBookingModal = ref(false);
const bookingFormRef = ref(null);
const bookingForm = reactive({
     courseId: null,
     courseName: '',
     name: '',
     phone: '',
     time: null,
});

const bookingRules = reactive({
     name: [{ required: true, message: '請輸入您的姓名', trigger: 'blur' }],
     phone: [{ required: true, message: '請輸入您的聯絡電話', trigger: 'blur' }],
     time: [{ required: true, message: '請選擇預約日期與時間', trigger: 'change' }],
});

const disabledBookingDate = (date) => {
     return dayjs(date).isBefore(dayjs(), 'day');
     // TODO: Implement logic based on available future course occurrences
};

const disabledBookingTime = (time) => {
      return false;
     // TODO: Implement logic based on course start time and duration
};


const fetchTrialCourses = async () => {
    if (!currentUserId) {
         trialCourses.value = [];
         isLoading.value = false;
         return;
    }

    isLoading.value = true;
    try {
        // Backend endpoint to get all trial courses (isTrial=1)
        // Needs to include hasBookedTrial, bookedTrialCount, maxTrialCapacity
        const response = await axios.get(`${apiBaseUrl}/courses/trial`, { // !!! Adjust backend endpoint !!!
             headers: {
                 Authorization: `Bearer ${authStore.token}`
             }
        });
        trialCourses.value = response.data;
        console.log('Fetched trial courses:', trialCourses.value);

    } catch (error) {
        console.error('Error fetching trial courses:', error);
        const errorMessage = error.response?.data?.message || '無法載入體驗課程列表。';
        ElMessage.error(errorMessage);
    } finally {
        isLoading.value = false;
    }
};

const openBookingModal = (course) => {
     if (!currentUserId) {
         ElMessage.warning("請先登入以預約體驗課程。");
         router.push('/login');
         return;
     }
     if (bookingFormRef.value) {
         bookingFormRef.value.resetFields();
     }
     Object.assign(bookingForm, {
         courseId: course.id,
         courseName: course.name,
         name: authStore.user?.name || '',
         phone: authStore.user?.phone || '',
         time: null,
     });
     showBookingModal.value = true;

     // TODO: Fetch available trial times for the selected course if needed
};

const submitBooking = async () => {
     if (!bookingFormRef.value) return;

     bookingFormRef.value.validate(async (valid) => {
         if (valid) {
             isLoading.value = true;
             try {
                 // Backend endpoint for trial booking
                 const response = await axios.post(`${apiBaseUrl}/trial-bookings`, { // !!! Adjust backend endpoint !!!
                     userId: currentUserId,
                     courseId: bookingForm.courseId,
                     bookingName: bookingForm.name,
                     bookingPhone: bookingForm.phone,
                     bookingDate: dayjs(bookingForm.time).format('YYYY-MM-DD'),
                     bookingTime: dayjs(bookingForm.time).format('HH:mm:ss'),
                     bookingStatus: '已預約'
                 }, {
                     headers: {
                         Authorization: `Bearer ${authStore.token}`
                     }
                 });
                 console.log('Trial booking response:', response.data);
                 ElMessage.success('體驗課程預約成功！');
                 showBookingModal.value = false;
                 fetchTrialCourses(); // Refresh list
             } catch (error) {
                 console.error('Trial booking failed:', error);
                 const errorMessage = error.response?.data?.message || '預約體驗課程失敗，請稍後再試。';
                 ElMessage.error(errorMessage);
                 isLoading.value = false;
             } finally {
                 // isLoading.value = false; // fetchTrialCourses handles loading
             }
         } else {
             ElMessage.warning('請完成所有必填的預約資訊。');
         }
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

onMounted(() => {
    fetchTrialCourses();
});

</script>

<style lang="scss" scoped>
/* Import variables and mixins if you have separate files */
/* @import '@/assets/styles/variables'; */
/* @import '@/assets/styles/mixins'; */

.trial-booking-page {
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

    .trial-list {
        margin-top: 20px;

        .trial-table {
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
                     background-color: var(--card-bg); // 單元格背景色
                     color: var(--text-secondary); // 單元格文字顏色
                     border-color: var(--border-color); // 單元格邊框顏色
                 }
                 // 可選：為偶數行添加背景色，使用新的變數
                 tr:nth-child(even) {
                      td {
                         // **使用定義好的更亮的顏色變數**
                         background-color: var(--card-bg-lighter);
                      }
                 }

             :deep(.el-table__empty-block) {
                  background-color: var(--card-bg);
                  color: var(--text-secondary);
             }

             .el-button {
                 &.el-button--primary {
                      background-color: #409EFF;
                      color: #fff;
                      border-color: #409EFF;
                       &:hover {
                            background-color: darken(#409EFF, 10%); // 這個 darken 可以保留，因為它是對靜態顏色計算
                            border-color: darken(#409EFF, 10%);
                       }
                 }
                  &.is-disabled {
                      opacity: 0.5;
                      cursor: not-allowed;
                 }
             }
        }
    }

    .booking-modal {
         // Styles for the booking modal
         // Inherits global .el-dialog styles defined in homepage.vue or index.scss
         // Example override if needed:
        // :deep(.el-dialog__body) {
        //     padding-top: 10px;
        // }
    }
}
}
</style>