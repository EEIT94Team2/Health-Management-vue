// src/views/frontend/CoursesPage.vue
<template>
  <div class="health-platform dark-theme">
    <main class="content">
      <section class="courses-section">
        <div class="container">
          <h1 class="section-title">課程查詢</h1>
          <div class="course-filter">
            <el-form :inline="true" :model="courseQuery" class="course-search-form">
              <el-form-item label="課程名稱">
                <el-input v-model="courseQuery.name" placeholder="請輸入課程名稱" />
              </el-form-item>
              <el-form-item label="教師">
                <el-input v-model="courseQuery.teacher" placeholder="請輸入教師名稱" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchCourses">查詢</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="course-list">
            <el-card v-for="course in courses" :key="course.id" class="course-card">
              <template #header>
                <div class="course-header">
                  <span>{{ course.name }}</span>
                  <span class="course-teacher">教師：{{ course.teacher }}</span>
                </div>
              </template>
              <p>時間：{{ course.time }}</p>
              <p>地點：{{ course.location }}</p>
              <p>描述：{{ course.description }}</p>
            </el-card>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
//import { ElForm, ElFormItem, ElInput, ElButton, ElCard } from 'element-plus'; // 確import Element Plus

export default {
  name: 'CoursesPage',
  components: {
   // ElForm,
    //ElFormItem,
    //ElInput,
    //ElButton,
    //ElCard,
  },
  setup() {
    const courseQuery = reactive({
      name: '',
      teacher: '',
    });

    const courses = ref([
      {
        id: 1,
        name: '瑜珈入門',
        teacher: '李老師',
        time: '週一 18:00-19:00',
        location: 'A教室',
        description: '適合初學者，學習基礎瑜珈動作。',
      },
      {
        id: 2,
        name: '重量訓練',
        teacher: '陳教練',
        time: '週三 20:00-21:00',
        location: 'B教室',
        description: '增肌減脂，提升肌力。',
      },
      {
        id: 3,
        name: '有氧舞蹈',
        teacher: '林老師',
        time: '週五 19:00-20:00',
        location: 'C教室',
        description: '燃燒卡路里，提升心肺功能。',
      },
    ]);

    const searchCourses = () => {
      // 根據查詢條件篩選課程
      console.log('查詢課程', courseQuery);
    };

    return {
      courseQuery,
      courses,
      searchCourses,
    };
  },
};
</script>

<style scoped>
.courses-section {
  padding: 5rem 0;
}

.course-search-form {
  margin-bottom: 2rem;
}

.course-card {
  margin-bottom: 1.5rem;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-teacher {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
