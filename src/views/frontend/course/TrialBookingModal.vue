<template>
    <el-dialog
      :model-value="visible"
      :title="course?.name + ' 體驗預約'"
      @close="$emit('update:visible', false); $emit('close')"
      width="30%"
    >
      <div v-if="course">
        <p><strong>教練：</strong>{{ course.coachName }}</p>
        <p><strong>時間：</strong>{{ formatDayOfWeek(course.dayOfWeek) }} {{ course.startTime }}</p>
        <p><strong>剩餘名額：</strong>{{ course.maxTrialCapacity - course.bookedTrialCount }}</p>
  
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
          <el-form-item label="預約人姓名" prop="bookingName">
            <el-input v-model="form.bookingName" placeholder="請輸入姓名" />
          </el-form-item>
  
          <el-form-item label="聯絡電話" prop="bookingPhone">
            <el-input v-model="form.bookingPhone" placeholder="請輸入電話" />
          </el-form-item>
  
          <el-form-item label="預約日期" prop="bookingDate">
            <el-date-picker
              v-model="form.bookingDate"
              type="date"
              placeholder="選擇預約日期"
              :disabled-date="disableInvalidDates"
            />
          </el-form-item>
        </el-form>
  
        <div style="text-align: right; margin-top: 20px">
          <el-button @click="$emit('update:visible', false); $emit('close')">取消</el-button>
          <el-button type="primary" @click="submitBooking">確認預約</el-button>
        </div>
      </div>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  
  const props = defineProps({
    visible: Boolean,
    course: Object
  })
  const emit = defineEmits(['update:visible', 'close'])
  
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  
  const formRef = ref(null)
  const form = ref({
    bookingName: '',
    bookingPhone: '',
    bookingDate: null
  })
  
  const rules = {
    bookingName: [{ required: true, message: '請輸入姓名', trigger: 'blur' }],
    bookingPhone: [{ required: true, message: '請輸入聯絡電話', trigger: 'blur' }],
    bookingDate: [{ required: true, message: '請選擇預約日期', trigger: 'change' }]
  }
  
  const disableInvalidDates = (date) => {
    if (!props.course) return false;
    const targetDay = props.course.dayOfWeek;
    return date.getDay() !== targetDay;
  }
  
  const formatDayOfWeek = (dayOfWeek) => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[dayOfWeek] || '未知';
  }
  
  const submitBooking = () => {
    formRef.value.validate(async (valid) => {
      if (!valid) return;
      try {
        await axios.post(`${apiBaseUrl}/trial-bookings/book`, {
          courseId: props.course.id,
          bookingName: form.value.bookingName,
          bookingPhone: form.value.bookingPhone,
          bookingDate: form.value.bookingDate
        })
        ElMessage.success('預約成功！')
        emit('update:visible', false)
        emit('close')
      } catch (e) {
        console.error(e)
        ElMessage.error('預約失敗，請確認資料是否正確或名額已滿')
      }
    })
  }
  </script>
  
  <style scoped>
  .el-form-item {
    margin-bottom: 16px;
  }
  </style>