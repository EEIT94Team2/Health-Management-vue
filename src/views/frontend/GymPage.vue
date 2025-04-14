<!-- src/views/frontend/HomePage.vue -->
<template>
  <div class="health-platform dark-theme">
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <h1>健康管理專家，<span class="text-highlight">掌握你的健康</span></h1>
        <p>專業數據分析、個人化健康計劃、全方位追蹤功能，讓健康管理更簡單有效</p>
        <div class="hero-buttons">
          <el-button type="success" size="large" class="btn-primary" @click="redirectToLogin">立即開始</el-button>
          <el-button plain size="large" class="btn-secondary" @click="scrollToFeatures">瞭解功能</el-button>
        </div>
      </div>
      </section>

    <section class="courses-section" id="courses">
      <div class="container">
        <h2 class="section-title">熱門<span class="text-highlight">課程</span></h2>
        <el-row :gutter="20" class="course-list">
          <el-col :xs="24" :sm="12" :md="8" v-for="course in popularCourses" :key="course.id">
            <div class="course-card">
              <div class="course-image">
                <img :src="course.image || 'https://via.placeholder.com/300x200'" :alt="course.name">
              </div>
              <div class="course-content">
                <h3>{{ course.name }}</h3>
                <p class="course-description">{{ course.description }}</p>
                <div class="course-info">
                  <span><el-icon><User /></el-icon> {{ course.coach }}</span>
                  <span><el-icon><Clock /></el-icon> {{ course.duration }}</span>
                </div>
                <el-button type="primary" @click="viewCourseDetails(course.id)">查看詳情</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="view-all-courses">
          <el-button type="text" @click="viewAllCourses">查看所有課程 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
      </div>
    </section>

    <section class="coaches-section" id="coaches">
      <div class="container">
        <h2 class="section-title">專業<span class="text-highlight">教練團隊</span></h2>
        <el-row :gutter="20" class="coach-list">
          <el-col :xs="24" :sm="12" :md="6" v-for="coach in coaches" :key="coach.id">
            <div class="coach-card">
              <div class="coach-image">
                <img :src="coach.image || 'https://via.placeholder.com/200x200'" :alt="coach.name" class="rounded-full">
              </div>
              <h3>{{ coach.name }}</h3>
              <p class="coach-specialty">{{ coach.specialty }}</p>
              <el-button type="info" size="small" @click="viewCoachProfile(coach.id)">了解更多</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="features-section" id="features">
      <div class="container">
        <h2 class="section-title">健康管理 <span class="text-highlight">核心功能</span></h2>
        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><DArrowRight /></el-icon>
            </div>
            <h3>飲食追蹤</h3>
            <p>記錄每日飲食攝入，分析營養成分，提供個人化飲食建議</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <h3>運動記錄</h3>
            <p>追蹤各類運動數據，科學安排訓練計劃，提升運動效果</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <h3>身體指標</h3>
            <p>監測體重、體脂等關鍵指標，視覺化呈現健康趨勢</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <h3>目標設定</h3>
            <p>設定個人健康目標，系統智能追蹤進度，提供階段性反饋</p>
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-preview">
      <div class="container">
        <h2 class="section-title">數據驅動的 <span class="text-highlight">健康管理</span></h2>
        <div class="dashboard-container">
          <div class="dashboard-info">
            <h3>全方位健康數據分析</h3>
            <p>我們的智能系統會分析您的健康數據，提供專業的健康洞見，幫助您做出更明智的健康決策。</p>
            <ul class="feature-list">
              <li><el-icon><Check /></el-icon> 個人化飲食建議</li>
              <li><el-icon><Check /></el-icon> 運動表現分析</li>
              <li><el-icon><Check /></el-icon> 體重與體脂趨勢</li>
              <li><el-icon><Check /></el-icon> 營養素攝入平衡</li>
            </ul>
            <el-button type="success" @click="viewDemoData">查看示範數據</el-button>
          </div>
          <div class="dashboard-image">
            <img src="https://via.placeholder.com/600x400" alt="健康數據儀表板" class="dashboard-screenshot" />
          </div>
        </div>
      </div>
    </section>

    <section class="products-section" v-if="popularProducts.length > 0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">健康 <span class="text-highlight">精選商品</span></h2>
          <el-button text type="success" class="view-all-btn" @click="viewAllProducts">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-row :gutter="20" class="product-list">
          <el-col :xs="24" :sm="12" :md="8" v-for="product in popularProducts" :key="product.id">
            <div class="product-card">
              <div class="product-image">
                <img :src="product.image || 'https://via.placeholder.com/300x300'" :alt="product.name">
              </div>
              <div class="product-content">
                <h3>{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">NT$ {{ product.price }}</div>
                <div class="product-actions">
                  <el-button type="success" @click="addProductToCart(product)">加入購物車</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="community-section">
      <div class="container">
        <h2 class="section-title">加入健康 <span class="text-highlight">社區</span></h2>
        <div class="community-content">
          <div class="community-info">
            <p>與志同道合的健康夥伴分享心得、交流經驗，一起邁向更健康的生活。</p>
            <ul class="community-features">
              <li><el-icon><ChatDotRound /></el-icon> 健康討論區</li>
              <li><el-icon><Connection /></el-icon> 尋找運動夥伴</li>
              <li><el-icon><Share /></el-icon> 分享成功故事</li>
              <li><el-icon><QuestionFilled /></el-icon> 專家解答</li>
            </ul>
            <el-button type="success" @click="goToForum">進入社區</el-button>
          </div>
          <div class="community-posts">
            <div class="forum-preview" v-for="post in recentPosts" :key="post.id">
              <h4>{{ post.title }}</h4>
              <p>{{ post.excerpt }}</p>
              <div class="post-meta">
                <span>{{ post.author }}</span>
                <span>{{ post.date }}</span>
                <span>{{ post.comments }} 則留言</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title"><span class="text-highlight">學員</span>成功案例</h2>
        <el-carousel height="300px">
          <el-carousel-item v-for="testimonial in testimonials" :key="testimonial.id">
            <div class="testimonial-card">
              <p class="quote">{{ testimonial.quote }}</p>
              <div class="author">
                <span class="name">{{ testimonial.name }}</span>
                <span class="info">{{ testimonial.age }}, {{ testimonial.occupation }}</span>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </section>

    <section class="faq-section">
      <div class="container">
        <h2 class="section-title">常見<span class="text-highlight">問題</span></h2>
        <el-collapse v-model="activeFaq">
          <el-collapse-item v-for="item in faqData" :key="item.id" :title="item.question">
            <p>{{ item.answer }}</p>
          </el-collapse-item>
        </el-collapse>
      </div>
    </section>

    <section class="contact-section">
      <div class="container">
        <h2 class="section-title">聯絡我們 / 預約<span class="text-highlight">體驗</span></h2>
        <el-row :gutter="20" justify="center">
          <el-col :xs="24" :sm="16" :md="12">
            <el-card class="contact-card">
              <el-form :model="contactForm" label-position="top">
                <el-form-item label="您的姓名">
                  <el-input v-model="contactForm.name"></el-input>
                </el-form-item>
                <el-form-item label="您的電子郵件">
                  <el-input v-model="contactForm.email"></el-input>
                </el-form-item>
                <el-form-item label="訊息">
                  <el-input type="textarea" v-model="contactForm.message"></el-input>
                </el-form-item>
                <el-button type="primary" @click="submitContactForm">發送訊息</el-button>
                <el-button @click="showBookingModal = true">預約體驗</el-button>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="subscribe-section">
      <div class="subscribe-overlay"></div>
      <div class="container">
        <div class="subscribe-content">
          <h2 class="section-title">訂閱 <span class="text-highlight">健康資訊</span></h2>
          <p>獲取最新的健康知識、營養建議和專屬優惠</p>
          <div class="subscribe-form">
            <el-input placeholder="您的電子郵件" v-model="subscribeEmail"></el-input>
            <el-button type="success" @click="submitSubscription">立即訂閱</el-button>
          </div>
        </div>
      </div>
    </section>

    <el-dialog v-model="showBookingModal" title="預約免費體驗">
      <el-form :model="bookingForm" label-width="120px">
        <el-form-item label="您的姓名">
          <el-input v-model="bookingForm.name"></el-input>
        </el-form-item>
        <el-form-item label="您的電話">
          <el-input v-model="bookingForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="預計體驗時間">
          <el-date-picker v-model="bookingForm.time" type="datetime" placeholder="選擇日期時間"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitBooking">提交預約</el-button>
          <el-button @click="showBookingModal = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProducts } from '@/api/shop'
// 假設你也有獲取課程和教練的 API
// import { getPopularCourses, getCoaches } from '@/api/fitness'

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter()
    const subscribeEmail = ref('')
    const popularProducts = ref([])
    const isLoading = ref(false)

    // 模擬論壇貼文
    const recentPosts = ref([
      { id: 1, title: '如何保持運動習慣？分享我的三個月減脂成功經驗', excerpt: '堅持運動三個月，我不僅瘦了10公斤，更重要的是養成了健康的生活習慣...', author: '小明', date: '3天前', comments: 15 },
      { id: 2, title: '營養師推薦：增肌期的飲食安排', excerpt: '想要有效增肌，飲食安排至關重要。本文分享專業營養師的建議...', author: '專業營養師', date: '1週前', comments: 23 }
    ])

    // 模擬熱門課程資料
    const popularCourses = ref([
      { id: 101, name: '燃脂高效HIIT', description: '快速燃燒卡路里，提升心肺功能', image: 'https://via.placeholder.com/300x200/FFC107/000000?Text=HIIT', coach: '張教練', duration: '60 分鐘' },
      { id: 102, name: '瑜珈伸展入門', description: '舒緩身心，提升柔軟度與平衡感', image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?Text=Yoga', coach: '李老師', duration: '75 分鐘' },
      { id: 103, name: '肌力訓練基礎', description: '建立全身肌力，改善體態', image: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?Text=Strength', coach: '王教練', duration: '90 分鐘' }
    ])

    // 模擬教練團隊資料
    const coaches = ref([
      { id: 201, name: '張志明', specialty: '體能訓練專家', image: 'https://via.placeholder.com/200x200/00BCD4/FFFFFF?Text=Coach+A' },
      { id: 202, name: '李美玲', specialty: '瑜珈與皮拉提斯', image: 'https://via.placeholder.com/200x200/E91E63/FFFFFF?Text=Coach+B' },
      { id: 203, name: '王強', specialty: '重量訓練與營養', image: 'https://via.placeholder.com/200x200/673AB7/FFFFFF?Text=Coach+C' },
      { id: 204, name: '陳小華', specialty: '水中運動與復健', image: 'https://via.placeholder.com/200x200/FF9800/FFFFFF?Text=Coach+D' }
    ])

    // 模擬學員成功案例
    const testimonials = ref([
      { id: 301, name: '林小姐', age: 32, occupation: '上班族', quote: '加入平台後，我成功減掉了 8 公斤，而且更有活力了！感謝教練的專業指導和系統化的追蹤工具。' },
      { id: 302, name: '陳先生', age: 45, occupation: '工程師', quote: '這個平台幫助我養成了規律運動的習慣，身體狀況明顯改善，睡眠品質也提升了。' },
      { id: 303, name: '黃同學', age: 20, occupation: '學生', quote: '透過飲食追蹤和運動記錄功能，我更了解自己的身體，也達成了設定的健身目標！' }
    ])

    // 模擬常見問題資料
    const faqData = ref([
      { id: 401, question: '如何開始使用健康管理平台？', answer: '您只需要註冊一個帳號，即可開始使用我們的各項功能，包括飲食追蹤、運動記錄、身體指標監測和目標設定。' },
      { id: 402, question: '平台上的健康建議是個人化的嗎？', answer: '是的，我們的系統會根據您輸入的個人資料和健康數據，提供個人化的飲食和運動建議。' },
      { id: 403, question: '如何聯繫專業教練？', answer: '您可以在教練團隊頁面查看教練的個人資料和聯繫方式，或者透過平台內的訊息系統與教練溝通。' },
      { id: 404, question: '平台是否提供免費試用？', answer: '我們提供新用戶一定的免費體驗期，讓您體驗平台的核心功能。詳細資訊請查看我們的訂閱方案。' }
    ])

    const activeFaq = ref([])
    const contactForm = ref({ name: '', email: '', message: '' })
    const bookingForm = ref({ name: '', phone: '', time: null })
    const showBookingModal = ref(false)

    // 從後端獲取熱門商品
    const fetchPopularProducts = async () => {
      try {
        isLoading.value = true
        const response = await getProducts({ sort: 'popular', limit: 3 })
        popularProducts.value = response.data || []
      } catch (error) {
        console.error('獲取熱門商品失敗:', error)
        ElMessage.error('無法載入熱門商品，請稍後再試')
      } finally {
        isLoading.value = false
      }
    }

    // 添加商品到購物車
    const addProductToCart = async (product) => {
      try {
        await import('@/api/shop').then(({ addToCart }) => {
          addToCart({
            productId: product.id,
            quantity: 1
          }).then(() => {
            ElMessage.success('已成功加入購物車')
          })
        })
      } catch (error) {
        console.error('加入購物車失敗:', error)
        ElMessage.error('加入購物車失敗，請先登入')
        router.push('/backpage/member/login')
      }
    }

    // 滾動到功能區塊
    const scrollToFeatures = () => {
      document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
      })
    }

    // 重定向到登入頁面
    const redirectToLogin = () => {
      router.push('/backpage/member/login')
    }

    // 查看所有商品
    const viewAllProducts = () => {
      router.push('/backpage/shop/products')
    }

    // 前往課程列表
    const viewAllCourses = () => {
      router.push('/backpage/courses') // 假設你的課程列表路由是這個
    }

    // 查看課程詳情
    const viewCourseDetails = (courseId) => {
      router.push(`/backpage/courses/${courseId}`) // 假設你的課程詳情路由是這個
    }

    // 查看教練個人資料
    const viewCoachProfile = (coachId) => {
      router.push(`/backpage/coaches/${coachId}`) // 假設你的教練個人資料路由是這個
    }

    // 前往論壇
    const goToForum = () => {
      router.push('/backpage/social/home')
    }

    // 查看示範數據
    const viewDemoData = () => {
      router.push('/backpage/fitness/admin/reports')
    }

    // 提交訂閱
    const submitSubscription = () => {
      if (!subscribeEmail.value) {
        ElMessage.warning('請輸入有效的電子郵件')
        return
      }

      ElMessage.success('感謝您的訂閱！')
      subscribeEmail.value = ''
      // 在這裡可以發送訂閱請求到後端
    }

    // 提交聯絡表單
    const submitContactForm = () => {
      if (!contactForm.value.name || !contactForm.value.email || !contactForm.value.message) {
        ElMessage.warning('請填寫所有必填欄位')
        return
      }
      ElMessage.success('您的訊息已成功發送！')
      contactForm.value = { name: '', email: '', message: '' }
      // 在這裡可以發送聯絡表單數據到後端
    }

    // 提交預約體驗
    const submitBooking = () => {
      if (!bookingForm.value.name || !bookingForm.value.phone || !bookingForm.value.time) {
        ElMessage.warning('請填寫所有預約資訊')
        return
      }
      ElMessage.success('您的體驗預約已成功送出！')
      showBookingModal.value = false
      bookingForm.value = { name: '', phone: '', time: null }
      // 在這裡可以發送預約數據到後端
    }

    onMounted(() => {
      // 載入商品數據
      fetchPopularProducts()
      // 假設你也有獲取課程和教練的 API，可以在這裡調用
      // fetchPopularCourses();
      // fetchCoaches();
    })

    return {
      subscribeEmail,
      popularProducts,
      recentPosts,
      addProductToCart,
      scrollToFeatures,
      redirectToLogin,
      viewAllProducts,
      goToForum,
      viewDemoData,
      submitSubscription,
      popularCourses,
      coaches,
      testimonials,
      faqData,
      activeFaq,
      contactForm,
      submitContactForm,
      bookingForm,
      showBookingModal,
      submitBooking,
      viewAllCourses,
      viewCourseDetails,
      viewCoachProfile
    }
  }
}
</script>

<style lang="scss" scoped>
.health-platform {
  // 深色主題變數
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --highlight-color: #10b981;
  --highlight-hover: #059669;
  --border-color: #374151;
  --card-bg: #1e293b;
  --success-light: #ecfdf5;
  --success-dark: #065f46;

  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  width: 100%;
}

.text-highlight {
  color: var(--highlight-color);
  font-weight: 600;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-align: center;
  color: var(--text-primary);
}

// 英雄區塊
.hero-section {
  position: relative;
  height: 600px;
  background-image: url('https://via.placeholder.com/1920x1080');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  width: 100%;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(17, 24, 39, 0.8), rgba(16, 185, 129, 0.4));
  }

  .hero-content {
    position: relative;
    max-width: 700px;
    width: 100%;
    z-index: 10;

    h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    p {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;

      @media (max-width: 576px) {
        flex-direction: column;
      }
    }
  }
}

// 課程區塊
.courses-section {
  padding: 5rem 0;
  background-color: var(--bg-primary);

  .course-list {
    margin-top: 2rem;
  }

  .course-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .course-image {
      height: 150px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .course-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: var(--highlight-color);
      }

      .course-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        flex-grow: 1;
      }

      .course-info {
        display: flex;
        gap: 1rem;
        color: var(--text-secondary);
        font-size: 0.8rem;
        margin-bottom: 1rem;

        .el-icon {
          margin-right: 0.3rem;
          color: var(--highlight-color);
        }
      }

      .el-button {
        align-self: flex-start;
        background-color: var(--highlight-color);
        color: var(--text-primary);
        border: none;

        &:hover {
          background-color: var(--highlight-hover);
        }
      }
    }
  }

  .view-all-courses {
    margin-top: 2rem;
    text-align: center;

    .el-button {
      color: var(--highlight-color);

      &:hover {
        color: var(--highlight-hover);
      }
    }
  }
}

// 教練團隊區塊
.coaches-section {
  padding: 5rem 0;
  background-color: var(--bg-secondary);

  .coach-list {
    margin-top: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    text-align: center;
  }

  .coach-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .coach-image {
      width: 100px;
      height: 100px;
      margin: 0 auto 1rem;
      overflow: hidden;
      border-radius: 50%;
      border: 2px solid var(--highlight-color);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
      color: var(--highlight-color);
    }

    .coach-specialty {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .el-button {
      background-color: transparent;
      color: var(--highlight-color);
      border: 1px solid var(--highlight-color);

      &:hover {
        background-color: var(--highlight-color);
        color: var(--text-primary);
      }
    }
  }
}

// 功能區塊
.features-section {
  padding: 5rem 0;
  background-color: var(--bg-secondary);
  width: 100%;

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    width: 100%;

    .feature-card {
      background-color: var(--card-bg);
      border-radius: 8px;
      padding: 2rem;
      transition: all 0.3s ease;
      border: 1px solid var(--border-color);

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .feature-icon {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--highlight-color);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }

      h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        color: var(--highlight-color);
      }

      p {
        color: var(--text-secondary);
        line-height: 1.6;
      }
    }
  }
}

// 儀表板預覽區
.dashboard-preview {
  padding: 5rem 0;

  .dashboard-container {
    display: flex;
    gap: 2rem;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .dashboard-info {
      flex: 1;

      h3 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin-bottom: 1.5rem;

        li {
          display: flex;
          align-items: center;
          margin-bottom: 0.8rem;
          color: var(--text-secondary);

          .el-icon {
            color: var(--highlight-color);
            margin-right: 0.5rem;
          }
        }
      }

      .el-button {
        background-color: var(--highlight-color);
        color: var(--text-primary);
        border: none;

        &:hover {
          background-color: var(--highlight-hover);
        }
      }
    }

    .dashboard-image {
      flex: 1;

      .dashboard-screenshot {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border: 1px solid var(--border-color);
      }
    }
  }
}

// 商品區塊
.products-section {
  padding: 5rem 0;
  background-color: var(--bg-secondary);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    .view-all-btn {
      color: var(--highlight-color);

      &:hover {
        color: var(--highlight-hover);
      }

      .el-icon {
        margin-left: 0.5rem;
      }
    }
  }

  .product-list {
    margin-top: 2rem;
  }

  .product-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .product-image {
      height: 200px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .product-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: var(--highlight-color);
      }

      .product-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        flex-grow: 1;
      }

      .product-price {
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--highlight-color);
        margin-bottom: 1rem;
      }

      .product-actions {
        .el-button {
          background-color: var(--highlight-color);
          color: var(--text-primary);
          border: none;

          &:hover {
            background-color: var(--highlight-hover);
          }
        }
      }
    }
  }
}

// 社區區塊
.community-section {
  padding: 5rem 0;

  .community-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .community-info {
      p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .community-features {
        list-style: none;
        padding: 0;
        margin-bottom: 2rem;

        li {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: var(--text-secondary);

          .el-icon {
            color: var(--highlight-color);
            margin-right: 0.8rem;
          }
        }
      }

      .el-button {
        background-color: var(--highlight-color);
        color: var(--text-primary);
        border: none;

        &:hover {
          background-color: var(--highlight-hover);
        }
      }
    }

    .community-posts {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .forum-preview {
        padding: 1.5rem;
        background-color: var(--card-bg);
        border-radius: 8px;
        border-left: 4px solid var(--highlight-color);

        h4 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .post-meta {
          display: flex;
          gap: 1rem;
          color: var(--text-secondary);
          font-size: 0.8rem;
        }
      }
    }
  }
}

// 學員成功案例區塊
.testimonials-section {
  padding: 5rem 0;
  background-color: var(--bg-primary);

  .el-carousel {
    width: 80%;
    margin: 0 auto;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .el-carousel__container {
    height: 300px !important; /* 確保輪播高度 */
  }

  .el-carousel__item {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent !important; /* 移除預設背景 */
  }

  .testimonial-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    height: 80%; /* 調整卡片高度 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--border-color);

    .quote {
      font-size: 1.1rem;
      font-style: italic;
      color: var(--text-secondary);
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .author {
      .name {
        font-weight: bold;
        color: var(--highlight-color);
        display: block;
        margin-bottom: 0.3rem;
      }

      .info {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
    }
  }
}

// 常見問題區塊
.faq-section {
  padding: 5rem 0;
  background-color: var(--bg-secondary);

  .el-collapse {
    width: 100%;
    margin: 0 auto;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .el-collapse-item__header {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: bold;
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 0;
  }

  .el-collapse-item__content {
    color: var(--text-secondary);
    line-height: 1.6;
    padding: 1.5rem 0;
  }
}

// 聯絡我們區塊
.contact-section {
  padding: 5rem 0;
  background-color: var(--bg-primary);

  .contact-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    padding: 2rem;
    border: 1px solid var(--border-color);
  }

  .el-form-item__label {
    color: var(--text-primary);
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .el-input__wrapper {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-textarea__inner {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-button {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: var(--highlight-color);
    color: var(--text-primary);
    border: none;

    &:hover {
      background-color: var(--highlight-hover);
    }

    &:last-child {
      margin-right: 0;
      background-color: transparent;
      color: var(--highlight-color);
      border: 1px solid var(--highlight-color);

      &:hover {
        background-color: var(--highlight-color);
        color: var(--text-primary);
      }
    }
  }
}

// 訂閱區塊
.subscribe-section {
  position: relative;
  padding: 4rem 0;
  background-image: url('https://via.placeholder.com/1920x600');
  background-size: cover;
  background-position: center;

  .subscribe-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(17, 24, 39, 0.8), rgba(16, 185, 129, 0.4));
  }

  .subscribe-content {
    position: relative;
    z-index: 10;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;

    h2 {
      color: var(--text-primary);
    }

    p {
      color: var(--success-light);
      margin-bottom: 2rem;
    }

    .subscribe-form {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;

      .el-input__wrapper {
        background-color: var(--bg-secondary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
      }

      .el-button {
        background-color: var(--highlight-color);
        color: var(--text-primary);
        border: none;

        &:hover {
          background-color: var(--highlight-hover);
        }
      }

      @media (max-width: 576px) {
        flex-direction: column;
      }
    }
  }
}

// 預約體驗 Modal 樣式
.el-dialog {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);

  .el-dialog__title {
    color: var(--text-primary);
  }

  .el-form-item__label {
    color: var(--text-primary);
    font-weight: bold;
  }

  .el-input__wrapper {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-textarea__inner {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-date-editor.el-input__wrapper {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-button {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: var(--highlight-color);
    color: var(--text-primary);
    border: none;

    &:hover {
      background-color: var(--highlight-hover);
    }

    &:last-child {
      margin-right: 0;
      background-color: transparent;
      color: var(--highlight-color);
      border: 1px solid var(--highlight-color);

      &:hover {
        background-color: var(--highlight-color);
        color: var(--text-primary);
      }
    }
  }
}
</style>  