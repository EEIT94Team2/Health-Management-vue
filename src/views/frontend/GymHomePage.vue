<!-- src/views/frontend/GymHomePage.vue -->
<template>
  <div class="gym-platform dark-theme">
    <!-- 導航欄 -->
    <header class="main-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/gym">FitGym</router-link>
          </div>
          <nav class="main-nav">
            <ul>
              <li><a href="#features">優勢</a></li>
              <li><a href="#classes">課程</a></li>
              <li><a href="#membership">方案</a></li>
              <li><a href="#contact">聯絡我們</a></li>
              <li><router-link to="/" class="nav-link">回健康平台</router-link></li>
            </ul>
          </nav>
          <div class="header-buttons">
            <el-button size="small">登入</el-button>
            <el-button type="primary" size="small">免費體驗</el-button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要內容區塊 -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>專業健身房，<span class="text-highlight">塑造理想身材</span></h1>
        <p>先進設備、專業教練、個人化訓練計劃，讓您的健身之旅更高效</p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" class="btn-primary" @click="redirectToMembership">立即加入會員</el-button>
          <el-button plain size="large" class="btn-secondary" @click="scrollToClasses">探索課程</el-button>
        </div>
      </div>
    </section>

    <!-- 主要特色 -->
    <section class="features-section" id="features">
      <div class="container">
        <h2 class="section-title">健身房 <span class="text-highlight">核心優勢</span></h2>
        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <h3>專業設備</h3>
            <p>配備最新健身器材，滿足各種訓練需求，從重訓到有氧一應俱全</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <h3>專業教練</h3>
            <p>擁有專業證照與豐富經驗的教練團隊，提供專業指導與建議</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <h3>多元課程</h3>
            <p>提供各種團體課程，包括瑜伽、有氧、飛輪等，滿足不同需求</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Medal /></el-icon>
            </div>
            <h3>個人化計劃</h3>
            <p>根據個人目標和身體狀況，制定專屬訓練計劃，提高訓練效果</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 課程預覽 -->
    <section class="classes-section" id="classes">
      <div class="container">
        <h2 class="section-title">精選 <span class="text-highlight">健身課程</span></h2>
        <div class="class-cards">
          <div class="class-card" v-for="course in featuredCourses" :key="course.id">
            <div class="class-image">
              <img :src="course.image" :alt="course.name">
              <div class="class-tag">{{ course.category }}</div>
            </div>
            <div class="class-content">
              <h3>{{ course.name }}</h3>
              <div class="class-info">
                <div><el-icon><Timer /></el-icon> {{ course.duration }}</div>
                <div><el-icon><User /></el-icon> {{ course.instructor }}</div>
                <div><el-icon><Star /></el-icon> {{ course.rating }}</div>
              </div>
              <p class="class-description">{{ course.description }}</p>
              <el-button type="primary" @click="bookClass(course)">預約課程</el-button>
            </div>
          </div>
        </div>
        <div class="view-more">
          <el-button plain @click="viewAllClasses">查看全部課程</el-button>
        </div>
      </div>
    </section>

    <!-- 教練團隊 -->
    <section class="trainers-section">
      <div class="container">
        <h2 class="section-title">專業 <span class="text-highlight">教練團隊</span></h2>
        <div class="trainers-grid">
          <div class="trainer-card" v-for="trainer in trainers" :key="trainer.id">
            <div class="trainer-image">
              <img :src="trainer.photo" :alt="trainer.name">
            </div>
            <div class="trainer-content">
              <h3>{{ trainer.name }}</h3>
              <div class="trainer-title">{{ trainer.specialization }}</div>
              <p class="trainer-bio">{{ trainer.bio }}</p>
              <div class="trainer-certifications">
                <div class="certification" v-for="(cert, index) in trainer.certifications" :key="index">
                  <el-icon><Check /></el-icon> {{ cert }}
                </div>
              </div>
              <el-button @click="bookTrainer(trainer)">預約諮詢</el-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 會員方案 -->
    <section class="membership-section" id="membership">
      <div class="container">
        <h2 class="section-title">會員 <span class="text-highlight">方案</span></h2>
        <div class="membership-cards">
          <div class="membership-card" v-for="plan in membershipPlans" :key="plan.id">
            <div class="membership-header">
              <h3>{{ plan.name }}</h3>
              <div class="membership-price">
                <span class="price">NT$ {{ plan.price }}</span>
                <span class="period">/ {{ plan.period }}</span>
              </div>
            </div>
            <ul class="membership-features">
              <li v-for="(feature, index) in plan.features" :key="index">
                <el-icon><Check /></el-icon> {{ feature }}
              </li>
            </ul>
            <el-button type="primary" @click="selectPlan(plan)">選擇方案</el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 健身房環境 -->
    <section class="gallery-section">
      <div class="container">
        <h2 class="section-title">健身房 <span class="text-highlight">環境</span></h2>
        <div class="gallery-grid">
          <div class="gallery-item" v-for="(image, index) in gymImages" :key="index" @click="showGallery(index)">
            <img :src="image" :alt="`健身房環境 ${index + 1}`">
          </div>
        </div>
      </div>
    </section>

    <!-- 客戶評價 -->
    <section class="testimonial-section">
      <div class="container">
        <h2 class="section-title">會員 <span class="text-highlight">評價</span></h2>
        <el-carousel :interval="5000" type="card" height="300px">
          <el-carousel-item v-for="testimonial in testimonials" :key="testimonial.id">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <div class="quote-icon">❝</div>
                <p class="testimonial-text">{{ testimonial.text }}</p>
                <div class="testimonial-author">
                  <img :src="testimonial.avatar" :alt="testimonial.name" class="author-avatar">
                  <div class="author-info">
                    <div class="author-name">{{ testimonial.name }}</div>
                    <div class="author-title">{{ testimonial.title }}</div>
                    <div class="rating">
                      <el-icon v-for="i in 5" :key="i"><Star :fill="i <= testimonial.rating" /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </section>

    <!-- 聯絡我們 -->
    <section class="contact-section" id="contact">
      <div class="container">
        <div class="contact-content">
          <div class="contact-info">
            <h2 class="section-title">聯絡 <span class="text-highlight">我們</span></h2>
            <p>有任何問題或需要協助？請隨時與我們聯繫！</p>
            <div class="contact-details">
              <div class="contact-item">
                <el-icon><Location /></el-icon>
                <span>台北市信義區信義路五段7號</span>
              </div>
              <div class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>02-1234-5678</span>
              </div>
              <div class="contact-item">
                <el-icon><Message /></el-icon>
                <span>info@fitnessgym.com</span>
              </div>
              <div class="contact-item">
                <el-icon><Clock /></el-icon>
                <span>週一至週日 06:00 - 23:00</span>
              </div>
            </div>
            <div class="social-links">
              <a href="#" class="social-link"><el-icon><ElementPlus /></el-icon></a>
              <a href="#" class="social-link"><el-icon><ElementPlus /></el-icon></a>
              <a href="#" class="social-link"><el-icon><ElementPlus /></el-icon></a>
              <a href="#" class="social-link"><el-icon><ElementPlus /></el-icon></a>
            </div>
          </div>
          <div class="contact-form">
            <h3>發送訊息</h3>
            <el-form :model="contactForm" ref="contactFormRef">
              <el-form-item prop="name">
                <el-input v-model="contactForm.name" placeholder="您的姓名"></el-input>
              </el-form-item>
              <el-form-item prop="email">
                <el-input v-model="contactForm.email" placeholder="您的電子郵件"></el-input>
              </el-form-item>
              <el-form-item prop="phone">
                <el-input v-model="contactForm.phone" placeholder="聯絡電話"></el-input>
              </el-form-item>
              <el-form-item prop="message">
                <el-input v-model="contactForm.message" type="textarea" rows="4" placeholder="您的訊息"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitContact">發送訊息</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Trophy,
  Calendar, 
  Check,
  UserFilled,
  Timer,
  User,
  Star,
  Medal,
  Location,
  Phone,
  Message,
  Clock,
  ElementPlus 
} from '@element-plus/icons-vue'

export default {
  name: 'GymHomePage',
  components: {
    Trophy,
    Calendar,
    Check,
    UserFilled,
    Timer,
    User,
    Star,
    Medal,
    Location, 
    Phone,
    Message,
    Clock,
    ElementPlus
  },
  setup() {
    const router = useRouter()
    const contactForm = ref({
      name: '',
      email: '',
      phone: '',
      message: ''
    })
    
    // 課程數據
    const featuredCourses = ref([
      {
        id: 1,
        name: '核心肌群訓練',
        category: '重訓',
        duration: '50分鐘',
        instructor: '王教練',
        rating: '4.9',
        image: 'https://via.placeholder.com/400x300',
        description: '專注於強化腹肌、背肌等核心肌群的課程，提升身體穩定性與姿勢'
      },
      {
        id: 2,
        name: '高強度間歇訓練',
        category: '有氧',
        duration: '45分鐘',
        instructor: '陳教練',
        rating: '4.8',
        image: 'https://via.placeholder.com/400x300',
        description: '結合高強度與短休息的訓練方式，快速燃燒脂肪，提高心肺功能'
      },
      {
        id: 3,
        name: '流動瑜伽',
        category: '瑜伽',
        duration: '60分鐘',
        instructor: '林教練',
        rating: '4.7',
        image: 'https://via.placeholder.com/400x300',
        description: '透過連貫的體位法流動，增強柔軟度與身體覺察，舒緩壓力'
      }
    ])
    
    // 教練數據
    const trainers = ref([
      {
        id: 1,
        name: '張大明',
        specialization: '重量訓練專家',
        photo: 'https://via.placeholder.com/300x400',
        bio: '擁有10年健身教練經驗，專精於肌力訓練與體態調整，幫助無數客戶達成增肌減脂目標。',
        certifications: ['NASM認證私人教練', 'TRX懸吊訓練認證', '運動營養師認證']
      },
      {
        id: 2,
        name: '李美華',
        specialization: '有氧運動教練',
        photo: 'https://via.placeholder.com/300x400',
        bio: '前職業舞者，專注於有氧、舞蹈與間歇訓練課程，課堂充滿活力與熱情。',
        certifications: ['ACE認證團體課教練', 'AFAA有氧訓練認證', 'Zumba舞蹈教練']
      }
    ])
    
    // 會員方案
    const membershipPlans = ref([
      {
        id: 1,
        name: '基本方案',
        price: '1,200',
        period: '月',
        features: [
          '無限制進入健身區',
          '基本設備使用',
          '淋浴設施',
          '每月1次體態評估'
        ]
      },
      {
        id: 2,
        name: '進階方案',
        price: '2,000',
        period: '月',
        features: [
          '無限制進入健身區',
          '所有設備使用',
          '每週3次團體課程',
          '淋浴與蒸氣室使用',
          '每月1次私人教練課程'
        ]
      },
      {
        id: 3,
        name: '尊爵方案',
        price: '3,500',
        period: '月',
        features: [
          '無限制進入健身區',
          '所有設備優先使用權',
          '無限制團體課程',
          '每週2次私人教練課程',
          '專屬營養諮詢',
          '免費停車',
          '訪客免費體驗'
        ]
      }
    ])
    
    // 健身房圖片集
    const gymImages = ref([
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400'
    ])
    
    // 會員評價
    const testimonials = ref([
      {
        id: 1,
        name: '陳小明',
        title: '會員一年',
        avatar: 'https://via.placeholder.com/100x100',
        text: '在這裡訓練半年，體脂從25%降到18%！教練專業又細心，設備也很完善，非常推薦！',
        rating: 5
      },
      {
        id: 2,
        name: '林小華',
        title: '會員八個月',
        avatar: 'https://via.placeholder.com/100x100',
        text: '加入後不僅身材變好，整個人的精神狀態也提升了。尤其喜歡這裡的瑜伽課程，很舒壓！',
        rating: 5
      },
      {
        id: 3,
        name: '王大同',
        title: '會員三個月',
        avatar: 'https://via.placeholder.com/100x100',
        text: '環境乾淨，器材新穎，教練們都很專業友善，開始變喜歡運動了！',
        rating: 4
      }
    ])

    // 方法區
    const redirectToMembership = () => {
      document.getElementById('membership').scrollIntoView({ behavior: 'smooth' })
    }
    
    const scrollToClasses = () => {
      document.getElementById('classes').scrollIntoView({ behavior: 'smooth' })
    }
    
    const bookClass = (course) => {
      ElMessage.success(`您已成功預約「${course.name}」課程`)
      // 實際應用中可導向預約頁面或顯示表單
    }
    
    const viewAllClasses = () => {
      router.push('/classes')
    }
    
    const bookTrainer = (trainer) => {
      ElMessage.success(`您已預約「${trainer.name}」教練的諮詢`)
      // 實際應用中可導向預約頁面或顯示表單
    }
    
    const selectPlan = (plan) => {
      ElMessage.success(`您已選擇「${plan.name}」會員方案`)
      // 實際應用中可導向付款頁面
    }
    
    const showGallery = (index) => {
      // 實作圖片預覽功能
      console.log('Show gallery image:', index)
    }
    
    const submitContact = () => {
      // 實際應用中需進行表單驗證
      ElMessage.success('您的訊息已成功發送，我們將盡快回覆您')
      contactForm.value = { name: '', email: '', phone: '', message: '' }
    }

    return {
      featuredCourses,
      trainers,
      membershipPlans,
      gymImages,
      testimonials,
      contactForm,
      redirectToMembership,
      scrollToClasses,
      bookClass,
      viewAllClasses,
      bookTrainer,
      selectPlan,
      showGallery,
      submitContact
    }
  }
}
</script>

<style scoped>
.gym-platform {
  font-family: 'Roboto', sans-serif;
  color: #333;
  width: 100%
}

.dark-theme {
  background-color: #121212;
  color: #f5f5f5;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 主要區塊 */
.hero-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  background-image: url('https://via.placeholder.com/1920x1080');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  font-weight: 300;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.text-highlight {
  color: #42b883;
}

/* 核心特色區塊 */
.features-section {
  padding: 100px 0;
  background-color: #1a1a1a;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 60px;
  font-weight: 600;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: #242424;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(66, 184, 131, 0.1);
  border-radius: 50%;
  margin: 0 auto 20px;
}

.feature-icon i {
  font-size: 30px;
  color: #42b883;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.feature-card p {
  color: #aaa;
}

/* 課程區塊 */
.classes-section {
  padding: 100px 0;
  background-color: #121212;
}

.class-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.class-card {
  background-color: #242424;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.class-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.class-image {
  position: relative;
  height: 200px;
}

.class-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.class-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: #42b883;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.class-content {
  padding: 20px;
}

.class-content h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.class-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #aaa;
  font-size: 0.9rem;
}

.class-description {
  margin-bottom: 20px;
  color: #ccc;
}

.view-more {
  text-align: center;
  margin-top: 20px;
}

/* 教練團隊區塊 */
.trainers-section {
  padding: 100px 0;
  background-color: #1a1a1a;
}

.trainers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.trainer-card {
  background-color: #242424;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.trainer-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.trainer-image {
  height: 300px;
}

.trainer-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trainer-content {
  padding: 20px;
}

.trainer-content h3 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.trainer-title {
  color: #42b883;
  margin-bottom: 15px;
}

.trainer-bio {
  margin-bottom: 15px;
  color: #ccc;
}

.trainer-certifications {
  margin-bottom: 20px;
}

.certification {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  color: #aaa;
}

.certification i {
  margin-right: 10px;
  color: #42b883;
}

/* 會員方案區塊 */
.membership-section {
  padding: 100px 0;
  background-color: #121212;
}

.membership-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.membership-card {
  background-color: #242424;
  border-radius: 10px;
  padding: 30px;
  transition: all 0.3s ease;
}

.membership-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.membership-header {
  text-align: center;
  margin-bottom: 30px;
}

.membership-header h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.membership-price {
  font-size: 1.2rem;
}

.membership-price .price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #42b883;
}

.membership-features {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.membership-features li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.membership-features li i {
  margin-right: 10px;
  color: #42b883;
}

/* 健身房環境區塊 */
.gallery-section {
  padding: 100px 0;
  background-color: #1a1a1a;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.gallery-item {
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* 評價區塊 */
.testimonial-section {
  padding: 100px 0;
  background-color: #121212;
}

.testimonial-card {
  background-color: #242424;
  padding: 30px;
  height: 100%;
  border-radius: 10px;
}

.quote-icon {
  font-size: 3rem;
  color: #42b883;
  opacity: 0.3;
  margin-bottom: 20px;
}

.testimonial-text {
  font-size: 1.1rem;
  font-style: italic;
  margin-bottom: 20px;
  color: #ccc;
}

.testimonial-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.author-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.author-title {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.rating {
  color: #f9ca24;
}

/* 聯絡區塊 */
.contact-section {
  padding: 100px 0;
  background-color: #1a1a1a;
}

.contact-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 50px;
}

.contact-details {
  margin: 30px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #ccc;
}

.contact-item i {
  margin-right: 15px;
  color: #42b883;
  font-size: 1.2rem;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.social-link {
  width: 40px;
  height: 40px;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: #42b883;
}

.contact-form h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
  }
}

/* 導航欄樣式 */
.main-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.logo a:hover {
  color: #42b883;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
}

.main-nav a {
  color: #f5f5f5;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: #42b883;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  
  .header-content {
    justify-content: space-between;
  }
}
</style> 