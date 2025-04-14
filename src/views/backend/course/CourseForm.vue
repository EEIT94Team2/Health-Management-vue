<template>
  <div>
    <h3>{{ isEdit ? '編輯課程' : '新增課程' }}</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="課程名稱：">
        <el-input v-model="form.name" placeholder="請輸入課程名稱" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="課程內容：">
        <el-input v-model="form.description" type="textarea" placeholder="請輸入課程內容" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="日期：">
        <el-date-picker v-model="form.date" type="date" placeholder="選擇日期" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="時長（分鐘）：">
        <el-input-number v-model="form.duration" :min="1" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="最大人數：">
        <el-input-number v-model="form.maxCapacity" :min="1" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="教練編號：">
        <el-input v-model="form.coachId" :min="1" placeholder="請輸入教練編號" style="width: 150px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '編輯' : '新增' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElDatePicker, ElInputNumber, ElButton, ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const courseId = route.params.id;
const isEdit = !!courseId;
const form = ref({
  name: '',
  description: '',
  date: null,
  duration: 60,
  maxCapacity: 10,
  coachId: null,
});

const fetchCourse = async (id) => {
  try {
    const response = await axios.get(`/api/courses/${id}`);
    form.value = {
      name: response.data.name,
      description: response.data.description,
      date: new Date(response.data.date),
      duration: response.data.duration,
      maxCapacity: response.data.maxCapacity,
      coachId: response.data.coachId,
    };
  } catch (error) {
    console.error('獲取課程資訊失敗', error);
    ElMessage.error('獲取課程資訊失敗');
    router.push('/courses');
  }
};

const handleSubmit = async () => {
  try {
    if (isEdit) {
      await axios.put(`/api/courses/${courseId}`, form.value);
      ElMessage.success('課程編輯成功');
    } else {
      await axios.post('/courses', form.value);
      ElMessage.success('課程新增成功');
    }
    router.push('/courses');
  } catch (error) {
    console.error(isEdit ? '編輯課程失敗' : '新增課程失敗', error);
    ElMessage.error(isEdit ? '編輯課程失敗' : '新增課程失敗');
  }
};

const handleCancel = () => {
  router.push('/courses');
};

onMounted(() => {
  if (isEdit) {
    fetchCourse(courseId);
  }
});
</script>