<template>
    <div class="homepage-content">
        <Sidebar />
        <div class="health-platform dark-theme">
            <!-- Hero 區塊 -->
            <section class="hero-section">
                <div class="hero-overlay"></div>
                <div class="section-container hero-content">
                    <h1>
                        健康管理專家，
                        <span class="text-highlight">掌握你的健康</span>
                    </h1>
                    <p>
                        專業數據分析、個人化健康計劃、全方位追蹤功能，<br />
                        讓健康管理更簡單有效
                    </p>
                    <div class="hero-buttons">
                        <el-button
                            type="success"
                            size="large"
                            class="btn-primary"
                            @click="redirectToLogin"
                        >
                            立即開始
                        </el-button>
                        <el-button
                            plain
                            size="large"
                            class="btn-secondary"
                            @click="scrollToFeatures"
                        >
                            瞭解功能
                        </el-button>
                    </div>
                </div>
            </section>

            <!-- 課程區塊 -->
            <section class="courses-section" id="courses">
                <div class="section-container">
                    <h2 class="section-title">熱門 <span class="text-highlight">課程</span></h2>
                    <el-row :gutter="20" class="course-list">
                        <el-col
                            :xs="24"
                            :sm="12"
                            :md="8"
                            v-for="course in popularCourses"
                            :key="course.id"
                        >
                            <div class="course-card">
                                <div class="course-image">
                                    <img
                                        :src="
                                            course.image ||
                                            'https://placehold.co/300x200/FFC107/000000?text=HIIT'
                                        "
                                        :alt="course.name"
                                        onerror="this.src='https://placehold.co/300x200/cccccc/ffffff?text=Image+Not+Found'"
                                    />
                                </div>
                                <div class="course-content">
                                    <h3>{{ course.name }}</h3>
                                    <p class="course-description">{{ course.description }}</p>
                                    <div class="course-info">
                                        <span>
                                            <el-icon><User /></el-icon>
                                            {{ course.coach }}
                                        </span>
                                        <span>
                                            <el-icon><Clock /></el-icon>
                                            {{ course.duration }}
                                        </span>
                                    </div>
                                    <el-button type="primary" @click="viewCourseDetails(course.id)">
                                        查看詳情
                                    </el-button>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                    <div class="view-all-courses">
                        <el-button type="text" @click="viewAllCourses">
                            查看所有課程 <el-icon><ArrowRight /></el-icon>
                        </el-button>
                    </div>
                </div>
            </section>

            <!-- 教練團隊區塊 -->
            <section class="trainers-section" id="trainers">
                <div class="section-container">
                    <h2 class="section-title">專業 <span class="text-highlight">教練團隊</span></h2>
                    <div class="trainers-grid">
                        <div class="trainer-card" v-for="trainer in trainers" :key="trainer.id">
                            <div class="trainer-image">
                                <img
                                    :src="
                                        trainer.photo ||
                                        'https://placehold.co/300x400/777777/ffffff?text=Trainer'
                                    "
                                    :alt="trainer.name"
                                    onerror="this.src='https://placehold.co/300x400/cccccc/ffffff?text=Image+Not+Found'"
                                />
                            </div>
                            <div class="trainer-content">
                                <h3>{{ trainer.name }}</h3>
                                <div class="trainer-title">{{ trainer.specialization }}</div>
                                <p class="trainer-bio">{{ trainer.bio }}</p>
                                <div class="trainer-certifications">
                                    <div
                                        class="certification"
                                        v-for="(cert, index) in trainer.certifications"
                                        :key="index"
                                    >
                                        <el-icon><Check /></el-icon>
                                        {{ cert }}
                                    </div>
                                </div>
                                <el-button @click="bookTrainer(trainer)">預約諮詢</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 商品區塊 -->
            <section class="products-section" id="products">
                <div class="section-container">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="title-text"
                                >健康 <span class="text-highlight"> 精選商品</span></span
                            >
                        </h2>
                        <router-link to="/shop/products" class="view-all-link">
                            查看全部 <el-icon><ArrowRight /></el-icon>
                        </router-link>
                    </div>
                    <div v-if="isLoading" class="loading-skeleton">
                        <el-skeleton :rows="3" animated />
                    </div>
                    <el-row v-else :gutter="20" class="product-list">
                        <el-col
                            :xs="24"
                            :sm="12"
                            :md="6"
                            v-for="(product, index) in displayProducts"
                            :key="product.id"
                        >
                            <div class="product-card" @click="viewProductDetail(product.id)">
                                <div class="product-image">
                                    <img
                                        :src="getProductImageUrl(product)"
                                        :alt="product.name"
                                        onerror="this.src='https://placehold.co/300x300/4CAF50/ffffff?text=Product'"
                                    />
                                </div>
                                <div class="product-content">
                                    <h3>{{ product.name }}</h3>
                                    <p class="product-description">{{ product.description }}</p>
                                    <div class="product-price">NT$ {{ product.price }}</div>
                                    <div class="product-actions">
                                        <el-button
                                            type="success"
                                            @click.stop="addProductToCart(product)"
                                        >
                                            加入購物車
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </section>

            <!-- 核心功能區塊 -->
            <section class="features-section" id="features">
                <div class="section-container">
                    <h2 class="section-title">
                        健康管理 <span class="text-highlight">核心功能</span>
                    </h2>
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

            <!-- 儀表板預覽區塊 -->
            <section class="dashboard-preview" id="fitness">
                <div class="section-container">
                    <h2 class="section-title">
                        數據驅動的 <span class="text-highlight">健康管理</span>
                    </h2>
                    <div class="dashboard-container">
                        <div class="dashboard-info">
                            <h3>全方位健康數據分析</h3>
                            <p>
                                我們的智能系統會分析您的健康數據，提供專業的健康洞見，幫助您做出更明智的健康決策。
                            </p>
                            <ul class="feature-list">
                                <li>
                                    <el-icon><Check /></el-icon> 個人化飲食建議
                                </li>
                                <li>
                                    <el-icon><Check /></el-icon> 運動表現分析
                                </li>
                                <li>
                                    <el-icon><Check /></el-icon> 體重與體脂趨勢
                                </li>
                                <li>
                                    <el-icon><Check /></el-icon> 營養素攝入平衡
                                </li>
                            </ul>
                            <el-button type="success" @click="viewDemoData">查看示範數據</el-button>
                        </div>
                        <div class="dashboard-image">
                            <img
                                src="https://placehold.co/600x400/1f2937/ffffff?text=Dashboard+Preview"
                                alt="健康數據儀表板"
                                class="dashboard-screenshot"
                                onerror="this.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <!-- 社區區塊 -->
            <section class="community-section" id="social">
                <div class="section-container">
                    <h2 class="section-title">加入健康 <span class="text-highlight">社區</span></h2>
                    <div class="community-content">
                        <div class="community-info">
                            <p>與志同道合的健康夥伴分享心得、交流經驗，一起邁向更健康的生活。</p>
                            <ul class="community-features">
                                <li>
                                    <el-icon><ChatDotRound /></el-icon> 健康討論區
                                </li>
                                <li>
                                    <el-icon><Connection /></el-icon> 尋找運動夥伴
                                </li>
                                <li>
                                    <el-icon><Share /></el-icon> 分享成功故事
                                </li>
                                <li>
                                    <el-icon><QuestionFilled /></el-icon> 專家解答
                                </li>
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

            <!-- 評價區塊 -->
            <section class="testimonial-section">
                <div class="section-container">
                    <h2 class="section-title">會員 <span class="text-highlight">評價</span></h2>
                    <el-carousel :interval="5000" type="card" height="300px">
                        <el-carousel-item v-for="testimonial in testimonials" :key="testimonial.id">
                            <div class="testimonial-card">
                                <div class="testimonial-content">
                                    <div class="quote-icon">❝</div>
                                    <p class="testimonial-text">{{ testimonial.text }}</p>
                                    <div class="testimonial-author">
                                        <img
                                            :src="
                                                testimonial.avatar ||
                                                'https://placehold.co/100x100/cccccc/ffffff?text=Avatar'
                                            "
                                            :alt="testimonial.name"
                                            class="author-avatar"
                                            onerror="this.src='https://placehold.co/100x100/cccccc/ffffff?text=Image+Not+Found'"
                                        />
                                        <div class="author-info">
                                            <div class="author-name">{{ testimonial.name }}</div>
                                            <div class="author-title">{{ testimonial.title }}</div>
                                            <div class="rating">
                                                <el-icon v-for="i in 5" :key="i">
                                                    <StarFilled :fill="i <= testimonial.rating" />
                                                </el-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </div>
            </section>

            <!-- FAQ 區塊 -->
            <section class="faq-section" id="faq">
                <div class="section-container">
                    <h2 class="section-title">常見 <span class="text-highlight">問題</span></h2>
                    <el-collapse v-model="activeFaq">
                        <el-collapse-item
                            v-for="item in faqData"
                            :key="item.id"
                            :title="item.question"
                            :name="item.id"
                        >
                            <p>{{ item.answer }}</p>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </section>

            <!-- 聯絡我們 區塊 -->
            <section class="contact-section" id="contact">
                <div class="section-container">
                    <div class="contact-content">
                        <div class="contact-info">
                            <h2 class="section-title-contact">
                                聯絡 <span class="text-highlight">我們</span>
                            </h2>
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
                                <a href="#" class="social-link"><i class="bi bi-facebook"></i></a>
                                <a href="#" class="social-link"><i class="bi bi-instagram"></i></a>
                                <a href="#" class="social-link"><i class="bi bi-twitter"></i></a>
                                <a href="#" class="social-link"><i class="bi bi-youtube"></i></a>
                            </div>
                        </div>
                        <div class="contact-form">
                            <h3>發送訊息 / 預約</h3>
                            <el-form :model="contactForm" ref="contactFormRef">
                                <el-form-item prop="name">
                                    <el-input
                                        v-model="contactForm.name"
                                        placeholder="您的姓名"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item prop="email">
                                    <el-input
                                        v-model="contactForm.email"
                                        placeholder="您的電子郵件"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item prop="phone">
                                    <el-input
                                        v-model="contactForm.phone"
                                        placeholder="聯絡電話"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item prop="message">
                                    <el-input
                                        v-model="contactForm.message"
                                        type="textarea"
                                        rows="4"
                                        placeholder="您的訊息"
                                    ></el-input>
                                </el-form-item>
                                <div class="header-buttons">
                                    <el-form-item>
                                        <el-button
                                            class="send-btn"
                                            type="primary"
                                            @click="submitContactForm"
                                        >
                                            <el-icon><Message /></el-icon>發送訊息
                                        </el-button>
                                        <el-button
                                            class="booking-btn"
                                            @click="showBookingModal = true"
                                        >
                                            <el-icon><Calendar /></el-icon>預約體驗
                                        </el-button>
                                    </el-form-item>
                                </div>
                            </el-form>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 訂閱區塊 -->
            <section class="subscribe-section">
                <div class="subscribe-overlay"></div>
                <div class="section-container">
                    <div class="subscribe-content">
                        <h2 class="section-title">
                            訂閱 <span class="text-highlight">健康資訊</span>
                        </h2>
                        <p>獲取最新的健康知識、營養建議和專屬優惠</p>
                        <div class="subscribe-form">
                            <el-input
                                placeholder="您的電子郵件"
                                v-model="subscribeEmail"
                            ></el-input>
                            <el-button type="success" @click="submitSubscription"
                                ><i class="bi bi-bell"></i>&nbsp;&nbsp;立即訂閱</el-button
                            >
                        </div>
                    </div>
                </div>
            </section>

            <!-- 預約體驗 Modal -->
            <el-dialog v-model="showBookingModal" title="預約免費體驗" width="500px">
                <el-form :model="bookingForm" label-width="100px">
                    <el-form-item label="您的姓名">
                        <el-input v-model="bookingForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="您的電話">
                        <el-input v-model="bookingForm.phone"></el-input>
                    </el-form-item>
                    <el-form-item label="預計體驗時間">
                        <el-date-picker
                            v-model="bookingForm.time"
                            type="datetime"
                            placeholder="選擇日期時間"
                            style="width: 100%"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitBooking">提交預約</el-button>
                        <el-button @click="showBookingModal = false">取消</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getProducts, addItemToCart } from "@/api/shop";
import Sidebar from "@/components/Layouts/frontend/Sidebar.vue";
import {
    Menu,
    Trophy,
    Calendar,
    Check,
    User,
    Location,
    Phone,
    Message,
    Clock,
    DArrowRight,
    DataAnalysis,
    ChatDotRound,
    Connection,
    Share,
    QuestionFilled,
    StarFilled,
} from "@element-plus/icons-vue";

export default {
    name: "HomePage",
    components: {
        Sidebar,
        Menu,
        Trophy,
        Calendar,
        Check,
        User,
        Location,
        Phone,
        Message,
        Clock,
        DArrowRight,
        DataAnalysis,
        ChatDotRound,
        Connection,
        Share,
        QuestionFilled,
        StarFilled,
    },
    setup() {
        const router = useRouter();

        // 控制 Sidebar 狀態（父層控制）
        const isSidebarOpen = ref(false);
        const toggleSidebar = () => {
            isSidebarOpen.value = !isSidebarOpen.value;
        };

        // 其他狀態資料
        const subscribeEmail = ref("");
        const popularProducts = ref([]);
        const isLoading = ref(false);
        const recentPosts = ref([
            {
                id: 1,
                title: "如何保持運動習慣？分享我的三個月減脂成功經驗",
                excerpt: "堅持運動三個月，我不僅瘦了10公斤，更重要的是養成了健康的生活習慣...",
                author: "小明",
                date: "3天前",
                comments: 15,
            },
            {
                id: 2,
                title: "營養師推薦：增肌期的飲食安排",
                excerpt: "想要有效增肌，飲食安排至關重要。本文分享專業營養師的建議...",
                author: "專業營養師",
                date: "1週前",
                comments: 23,
            },
        ]);
        const popularCourses = ref([
            {
                id: 101,
                name: "燃脂高效HIIT",
                description: "快速燃燒卡路里，提升心肺功能",
                image: "https://via.placeholder.com/300x200/FFC107/000000?Text=HIIT",
                coach: "張教練",
                duration: "60 分鐘",
            },
            {
                id: 102,
                name: "瑜珈伸展入門",
                description: "舒緩身心，提升柔軟度與平衡感",
                image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?Text=Yoga",
                coach: "李老師",
                duration: "75 分鐘",
            },
            {
                id: 103,
                name: "肌力訓練基礎",
                description: "建立全身肌力，改善體態",
                image: "https://via.placeholder.com/300x200/2196F3/FFFFFF?Text=Strength",
                coach: "王教練",
                duration: "90 分鐘",
            },
        ]);
        const trainers = ref([
            {
                id: 1,
                name: "張大明",
                specialization: "重量訓練專家",
                photo: "https://via.placeholder.com/300x400",
                bio: "擁有10年健身教練經驗，專精於肌力訓練與體態調整，幫助無數客戶達成增肌減脂目標。",
                certifications: ["NASM認證私人教練", "TRX懸吊訓練認證", "運動營養師認證"],
            },
            {
                id: 2,
                name: "林彥廷",
                specialization: "拳擊與格鬥訓練教練",
                photo: "https://via.placeholder.com/300x400",
                bio: "前業餘拳擊選手，專注於拳擊、踢拳與心肺耐力訓練，課程節奏明快、實戰感強，是喜歡挑戰的學員首選。",
                certifications: ["WBC認證拳擊教練", "心肺耐力訓練認證", "格鬥技術指導證書"],
            },
            {
                id: 3,
                name: "王信義",
                specialization: "功能性訓練導師",
                photo: "https://via.placeholder.com/300x400",
                bio: "擁有多年體能訓練背景，善於設計針對運動表現與受傷預防的訓練計畫，深受運動員與一般學員喜愛。",
                certifications: ["FMS功能動作評估認證", "CrossFit L1教練", "NSCA-CPT認證教練"],
            },
            {
                id: 4,
                name: "陳玉蓮",
                specialization: "瑜珈與伸展教練",
                photo: "https://via.placeholder.com/300x400",
                bio: "專精於瑜珈與身心放鬆訓練，擁有溫和且細膩的教學風格，幫助學員提升柔軟度與身心平衡。",
                certifications: ["RYT200瑜珈師資認證", "孕婦瑜珈認證", "筋膜放鬆技巧培訓"],
            },
        ]);
        const testimonials = ref([
            {
                id: 1,
                name: "陳小明",
                title: "會員一年",
                avatar: "https://via.placeholder.com/100x100",
                text: "在這裡訓練半年，體脂從25%降到18%！教練專業又細心，設備也很完善，非常推薦！",
                rating: 5,
            },
            {
                id: 2,
                name: "林小華",
                title: "會員八個月",
                avatar: "https://via.placeholder.com/100x100",
                text: "加入後不僅身材變好，整個人的精神狀態也提升了。尤其喜歡這裡的瑜伽課程，很舒壓！",
                rating: 5,
            },
            {
                id: 3,
                name: "王大同",
                title: "會員三個月",
                avatar: "https://via.placeholder.com/100x100",
                text: "環境乾淨，器材新穎，教練們都很專業友善，開始變喜歡運動了！",
                rating: 4,
            },
        ]);
        const faqData = ref([
            {
                id: 401,
                question: "如何開始使用健康管理平台？",
                answer: "您只需要註冊一個帳號，即可開始使用我們的各項功能，包括飲食追蹤、運動記錄、身體指標監測和目標設定。",
            },
            {
                id: 402,
                question: "平台上的健康建議是個人化的嗎？",
                answer: "是的，我們的系統會根據您輸入的個人資料和健康數據，提供個人化的飲食和運動建議。",
            },
            {
                id: 403,
                question: "如何聯繫專業教練？",
                answer: "您可以在教練團隊頁面查看教練的個人資料和聯繫方式，或者透過平台內的訊息系統與教練溝通。",
            },
            {
                id: 404,
                question: "平台是否提供免費試用？",
                answer: "我們提供新用戶一定的免費體驗期，讓您體驗平台的核心功能。詳細資訊請查看我們的訂閱方案。",
            },
        ]);
        const activeFaq = ref([]);
        const contactForm = ref({ name: "", email: "", message: "" });
        const bookingForm = ref({ name: "", phone: "", time: null });
        const showBookingModal = ref(false);

        // 商品獲取方法改進
        const fetchPopularProducts = async () => {
            try {
                isLoading.value = true;
                // 移除limit參數，獲取所有商品
                const response = await getProducts({ sort: "popular" });
                console.log("商品數據:", response);

                // 確保即使沒有數據也不會出錯
                if (response && response.data) {
                    // 檢查不同格式的數據結構
                    if (Array.isArray(response.data)) {
                        popularProducts.value = response.data;
                    } else if (response.data.content && Array.isArray(response.data.content)) {
                        popularProducts.value = response.data.content;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        popularProducts.value = response.data.data;
                    } else {
                        console.warn("未識別的API響應格式:", response.data);
                        useExampleProducts();
                    }
                } else {
                    console.warn("API未返回有效數據");
                    useExampleProducts();
                }
            } catch (error) {
                console.error("獲取熱門商品失敗:", error);
                ElMessage.error("無法載入熱門商品，使用示例數據");
                useExampleProducts();
            } finally {
                isLoading.value = false;
            }
        };

        // 使用示例數據的輔助函數
        const useExampleProducts = () => {
            popularProducts.value = [
                {
                    id: 1,
                    name: "蛋白粉",
                    description: "乳清蛋白粉，巧克力口味",
                    price: 1200,
                    image: null,
                },
                {
                    id: 2,
                    name: "健身手套",
                    description: "防滑透氣健身手套",
                    price: 450,
                    image: null,
                },
                {
                    id: 3,
                    name: "瑜伽墊",
                    description: "加厚防滑瑜伽墊",
                    price: 800,
                    image: null,
                },
                {
                    id: 4,
                    name: "啞鈴組",
                    description: "可調節重量啞鈴組",
                    price: 2500,
                    image: null,
                },
            ];
        };

        // 獲取商品圖片URL的方法，處理各種可能的URL格式
        const getProductImageUrl = (product) => {
            if (!product) return "https://placehold.co/400x300/4CAF50/ffffff?text=Product";

            // 檢查各種可能的圖片URL屬性
            if (product.imageUrl) {
                // 檢查是否為完整URL還是相對路徑
                if (product.imageUrl.startsWith("http") || product.imageUrl.startsWith("https")) {
                    return product.imageUrl;
                } else {
                    // 假設是相對路徑，添加後端基礎URL
                    return `http://localhost:8080${product.imageUrl}`;
                }
            }

            if (product.image) {
                if (product.image.startsWith("http") || product.image.startsWith("https")) {
                    return product.image;
                } else {
                    return `http://localhost:8080${product.image}`;
                }
            }

            // 如果沒有找到有效的圖片URL，根據產品類別或名稱生成佔位圖
            // 根據產品名稱生成不同顏色的佔位圖
            const colors = {
                蛋白粉: "4CAF50",
                健身手套: "2196F3",
                瑜伽墊: "FF9800",
                啞鈴組: "FF5722",
                彈力帶: "9C27B0",
                跳繩: "3F51B5",
                手套: "2196F3",
                水壺: "FFC107",
            };

            // 嘗試根據類別生成顏色
            if (product.category) {
                const categoryColors = {
                    protein: "4CAF50",
                    equipment: "FF5722",
                    nutrition: "FFC107",
                    yoga: "3F51B5",
                    creatine: "2196F3",
                    accessories: "9C27B0",
                    preworkout: "FF9800",
                };

                const color = categoryColors[product.category.toLowerCase()] || "4CAF50";
                return `https://placehold.co/400x300/${color}/ffffff?text=${encodeURIComponent(
                    product.name
                )}`;
            }

            // 從產品名稱提取關鍵詞，查看它是否匹配顏色字典中的任何鍵
            const keyword = Object.keys(colors).find(
                (key) => product.name && product.name.includes(key)
            );
            const color = keyword ? colors[keyword] : "4CAF50"; // 默認綠色

            return `https://placehold.co/400x300/${color}/ffffff?text=${encodeURIComponent(
                product.name || "Product"
            )}`;
        };

        // 獲取默認商品圖片
        const getDefaultProductImage = (productName = "Product") => {
            return `https://placehold.co/400x300/4CAF50/ffffff?text=${encodeURIComponent(
                productName
            )}`;
        };

        // 添加商品到購物車
        const addProductToCart = async (product) => {
            try {
                const cartItem = {
                    productId: product.id,
                    quantity: 1,
                };

                await addItemToCart(cartItem);
                ElMessage.success("已加入購物車");
            } catch (error) {
                console.error("加入購物車失敗:", error);
                ElMessage.error("加入購物車失敗，請稍後再試");
            }
        };

        // 滾動方法
        const scrollToFeatures = () => {
            const elem = document.getElementById("features");
            if (elem) {
                elem.scrollIntoView({ behavior: "smooth" });
            }
        };
        const scrollToContact = () => {
            const elem = document.getElementById("contact");
            if (elem) {
                elem.scrollIntoView({ behavior: "smooth" });
            }
        };
        const scrollToTop = () => {
            router.push("/").then(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        };

        // 導頁方法
        const redirectToLogin = () => {
            router.push("/backpage/member/login");
        };
        const viewAllProducts = () => {
            router.push("/shop/products");
        };
        const viewAllCourses = () => {
            router.push("/backpage/courses");
        };
        const viewCourseDetails = (courseId) => {
            router.push(`/backpage/courses/${courseId}`);
        };
        const viewCoachProfile = (coachId) => {
            router.push(`/backpage/coaches/${coachId}`);
        };
        const goToForum = () => {
            router.push("/backpage/social/home");
        };
        const viewDemoData = () => {
            router.push("/backpage/fitness/admin/reports");
        };

        // 表單提交方法
        const submitSubscription = () => {
            if (!subscribeEmail.value) {
                ElMessage.warning("請輸入有效的電子郵件");
                return;
            }
            ElMessage.success("感謝您的訂閱！");
            subscribeEmail.value = "";
            // 可加入發送訂閱請求至後端
        };
        const submitContactForm = () => {
            if (!contactForm.value.name || !contactForm.value.email || !contactForm.value.message) {
                ElMessage.warning("請填寫所有必填欄位");
                return;
            }
            ElMessage.success("您的訊息已成功發送！");
            contactForm.value = { name: "", email: "", message: "" };
            // 可加入發送聯絡表單數據至後端
        };
        const submitBooking = () => {
            if (!bookingForm.value.name || !bookingForm.value.phone || !bookingForm.value.time) {
                ElMessage.warning("請填寫所有預約資訊");
                return;
            }
            ElMessage.success("您的體驗預約已成功送出！");
            showBookingModal.value = false;
            bookingForm.value = { name: "", phone: "", time: null };
            // 可加入發送預約數據至後端
        };

        // 若有額外 API 請求，可於 onMounted 呼叫
        onMounted(() => {
            fetchPopularProducts();
        });

        // 此處 bookTrainer 如有使用，可自行定義邏輯
        const bookTrainer = (trainer) => {
            // 例如：導向到教練預約頁面
            router.push(`/backpage/coaches/${trainer.id}/booking`);
        };

        const viewProductDetail = (productId) => {
            router.push(`/shop/products/${productId}`);
        };

        // 在setup函數中更新
        // 將displayProducts改為初始顯示12個商品
        const displayProducts = computed(() => {
            return popularProducts.value.slice(0, 12);
        });

        return {
            isSidebarOpen,
            toggleSidebar,
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
            viewCoachProfile,
            scrollToTop,
            trainers,
            scrollToContact,
            bookTrainer,
            viewProductDetail,
            getDefaultProductImage,
            getProductImageUrl,
            displayProducts,
        };
    },
};
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
    padding-top: 80px; /* 為導航欄預留空間 */
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
    font-size: 2.5rem;
    margin-bottom: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    position: relative;

    .title-text {
        display: inline-block;
        white-space: nowrap;
        position: relative;
        text-align: center;
    }

    .text-highlight {
        color: var(--highlight-color);
        margin-left: 0.2rem;
    }
}

// 英雄區塊
.hero-section {
    position: relative;
    height: 600px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center; /* 添加水平居中 */
    padding: 0;
    width: 100%;
    animation: backgroundImageSlideshow 15s infinite;
}

@keyframes backgroundImageSlideshow {
    0%,
    100% {
        background-image: url("@/assets/images/Yoga2.jpg"); /* 第一張圖片路徑 */
    }
    20% {
        background-image: url("@/assets/images/Weightlifting.jpg"); /* 第二張圖片路徑 */
    }
    40% {
        background-image: url("@/assets/images/Weightlifting.jpg"); /* 第二張圖片路徑 */
    }
    60% {
        background-image: url("@/assets/images/Relax.jpg"); /* 第三張圖片路徑 */
    }
    80% {
        background-image: url("@/assets/images/Think.jpg"); /* 第三張圖片路徑 */
    }
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(17, 24, 39, 0.8), rgba(16, 185, 129, 0.4));
}

.hero-content {
    position: relative; /* 改回relative以配合flex居中 */
    max-width: 1000px;
    width: 100%;
    z-index: 10;
    margin: 0 auto; /* 使用auto邊距居中 */
    text-align: center;

    h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
        text-align: center; /* 確保標題居中 */
    }

    p {
        font-size: 1.25rem;
        color: var(--text-secondary);
        margin-bottom: 2rem;
        text-align: center; /* 確保段落居中 */
    }

    .hero-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;

        @media (max-width: 576px) {
            flex-direction: column;
        }
    }

    .btn-primary {
        /* 針對 "立即開始" 按鈕 */
        background-color: #42b883 !important; /* 設定背景色為指定顏色 */
        color: #fff !important; /* 設定文字顏色為白色 */
        border: none !important; /* 移除邊框 */

        &:hover {
            background-color: #369169 !important; /* hover 時稍微變深的顏色 */
        }
    }

    .btn-secondary {
        /* 針對 "瞭解功能" 按鈕 */
        color: #42b883 !important; /* 設定文字顏色為指定顏色 */
        border: 1px solid #42b883 !important; /* 添加邊框 */

        &:hover {
            background-color: rgba(66, 184, 131, 0.1) !important; /* hover 時的微弱背景 */
            color: #ffffff !important; /* hover 時稍微變深的文字顏色 */
        }
    }
}

// 課程區塊
.courses-section {
    padding: 5rem 0;
    background-color: var(--bg-primary);
    text-align: left;

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

/* 教練團隊區塊 */
.trainers-section {
    padding: 80px 0; /* 可以稍微減少上下 padding */
    background-color: var(--bg-secondary);
    text-align: left; /* 將區塊內的文字預設靠左 */

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

.trainers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 減小 minmax 值，讓卡片更小 */
    gap: 20px; /* 可以稍微減小 gap */
}

.trainer-card {
    background-color: var(--card-bg);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
    text-align: left; /* 確保卡片內的文字靠左 */
}

.trainer-card:hover {
    transform: translateY(-5px); /* 相應減小 hover 的位移 */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* 相應減小 hover 的陰影 */
}

.trainer-image {
    height: 200px; /* 減小圖片高度 */
}

.trainer-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.trainer-content {
    padding: 15px; /* 相應減小內容 padding */
    text-align: left; /* 確保內容文字靠左 */
}

.trainer-content h3 {
    font-size: 1.2rem; /* 減小標題字體大小 */
    margin-bottom: 3px;
    text-align: left; /* 確保標題文字靠左 */
}

.trainer-title {
    color: #42b883;
    margin-bottom: 10px; /* 相應減小間距 */
    font-size: 0.9rem; /* 減小職稱字體大小 */
    text-align: left; /* 確保職稱文字靠左 */
}

.trainer-bio {
    margin-bottom: 10px; /* 相應減小間距 */
    color: #ccc;
    font-size: 0.8rem; /* 減小簡介字體大小 */
    line-height: 1.4; /* 調整行高 */
    text-align: left; /* 確保簡介文字靠左 */
}

.trainer-certifications {
    margin-bottom: 15px; /* 相應減小間距 */
    text-align: left; /* 確保認證區塊文字靠左 */
}

.certification {
    display: flex;
    align-items: center;
    margin-bottom: 3px; /* 相應減小間距 */
    color: #aaa;
    font-size: 0.75rem; /* 減小認證字體大小 */
    text-align: left; /* 確保單個認證文字靠左 */
}

.certification i {
    margin-right: 8px; /* 相應減小圖示間距 */
    color: #42b883;
    font-size: 0.9rem; /* 相應減小圖示大小 */
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
            display: flex; /* 啟用 Flexbox 佈局 */
            flex-direction: column; /* 使子元素垂直排列 */
            align-items: center; /* 將子元素在水平方向上置中對齊 */
            text-align: center; /* 確保卡片內的文字內容（包括 h3 和 p）也居中 */

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
                text-align: center; /* 確保標題文字居中 */
            }

            p {
                color: var(--text-secondary);
                line-height: 1.6;
                text-align: center; /* 確保段落文字居中 */
            }
        }
    }
}

// 儀表板預覽區
.dashboard-preview {
    padding: 5rem 0;
    background-color: var(--bg-secondary);

    .dashboard-container {
        display: flex;
        gap: 2rem;
        align-items: flex-start; /* 將容器內的項目在交叉軸起始位置對齊（頂部） */

        @media (max-width: 768px) {
            flex-direction: column;
            align-items: stretch; /* 在小螢幕上讓項目佔滿寬度 */
        }

        .dashboard-info {
            flex: 1;
            text-align: left; /* 將 info 區塊內的文字靠左對齊 */
            display: flex; /* 使 info 區塊成為 flex 容器，以便控制按鈕的對齊 */
            flex-direction: column; /* 確保內容垂直排列 */

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
                align-self: flex-start;
                width: auto;
                display: inline-block;

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
    padding: 4rem 0;
    background-color: var(--bg-secondary);

    .section-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.5rem;
        text-align: center;

        .section-title {
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            margin: 0 0 1rem 0;
        }

        .view-all-link {
            white-space: nowrap;
            color: var(--highlight-color, #4cd137);
            text-decoration: none;
            display: flex;
            margin-left: 90%;
            align-items: center;
            font-size: 0.9rem;
            transition: color 0.3s ease;

            &:hover {
                color: var(--highlight-hover, #3cb528);
            }

            .el-icon {
                margin-left: 0.5rem;
            }
        }
    }
}

.loading-skeleton {
    padding: 20px;
    background-color: var(--card-bg);
    border-radius: 8px;
    max-width: 1000px;
    margin: 0 auto;
}

.product-list {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;

    /* 確保在小螢幕上也能保持良好的間距和大小 */
    @media (max-width: 1200px) {
        flex-wrap: wrap;
    }
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
    cursor: pointer;
    margin-bottom: 1.5rem;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
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
                transform: scale(1.03);
            }
        }
    }

    .product-content {
        padding: 1.2rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;

        h3 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .product-description {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-bottom: 0.8rem;
            flex-grow: 1;
            line-height: 1.4;
        }

        .product-price {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--highlight-color, #4cd137);
            margin-bottom: 0.8rem;
        }

        .product-actions {
            display: flex;
            justify-content: center;

            .el-button {
                margin-left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding-left: 20px;
                padding-right: 20px;
                width: 90%;
                font-size: 0.9rem;
                background-color: var(--highlight-color, #4cd137);
                color: var(--text-primary);
                border: none;

                &:hover {
                    background-color: var(--highlight-hover, #3cb528);
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
        text-align: left; /* 將內容預設靠左 */

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }

        .community-info {
            p {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 1.5rem;
                text-align: left; /* 確保 p 元素靠左 */
            }

            .community-features {
                list-style: none;
                padding: 0;
                margin-bottom: 2rem;
                text-align: left; /* 確保列表靠左 */

                li {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    color: var(--text-secondary);
                    text-align: left; /* 確保列表項靠左 */

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
                align-self: flex-start; /* 確保按鈕靠左 */
                text-align: center; /* 如果按鈕內部有文字，可以使其居中 */

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

/* 評價區塊 */
.testimonial-section {
    padding: 100px 0;
    background-color: var(--bg-primary);
}

.testimonial-card {
    background-color: var(--card-bg);
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

// 常見問題區塊
.faq-section {
    padding: 5rem 0;
    background-color: var(--bg-secondary);
}

.el-collapse {
    width: 100%; /* 修改處：讓每個問題分開一點 */
    margin: 0 auto;
    border: 1px solid var(--border-color); /* 修改處：增加邊框 */
    border-radius: 8px; /* 修改處：增加圓弧 */
    margin-bottom: 2rem; /* 修改處：每個問題下方增加間距 */

    @media (max-width: 768px) {
        width: 100%;
        border-radius: 0;
    }
}

.el-collapse-item {
    border-bottom: 1px solid var(--border-color); /* 修改處：問題之間增加分隔線 */
    margin-bottom: 0; /* 移除預設底部間距 */

    &:last-child {
        border-bottom: none; /* 修改處：移除最後一個問題的分隔線 */
    }
}

.el-collapse-item__header {
    font-size: 1.1rem; /* 修改處：字放大一點 */
    color: var(--text-primary);
    font-weight: bold;
    border-bottom: 1px solid var(--border-color);
    padding: 1.2rem 1.5rem; /* 修改處：增加 header 的 padding */
}

.el-collapse-item__content {
    color: var(--text-secondary);
    line-height: 1.6;
    padding: 1.5rem; /* 修改處：增加 content 的 padding */
    font-size: 1rem; /* 修改處：字放大一點 */
}

// 聯絡我們區塊
.contact-section {
    padding: 100px 0;
    background-color: var(--bg-primary);
}

.contact-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 50px;
}

.contact-info {
    text-align: left; /* 修改處：將 contact-info 內的文字預設靠左對齊 */
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

.section-title-contact {
    text-align: left; /* 靠左對齊 */
    margin-bottom: 25px;
}

.social-links {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.social-link {
    width: 40px;
    height: 40px;
    background-color: #42b883;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: #fff;
}

.social-link:hover {
    background-color: #065f46;
}

.contact-form h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-align: left; /* 確保表單標題靠左 */
}

// 訂閱區塊
.subscribe-section {
    position: relative;
    padding: 4rem 0;
    background-image: url("https://via.placeholder.com/1920x600");
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

.el-button .el-icon {
    margin-right: 8px;
    display: flex;
    align-items: center;
}
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
@media (max-width: 576px) {
    .contact-form .el-form-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .el-button {
            width: 100%;
            margin-right: 0;
        }
    }
}

// 發送訊息：主按鈕
.send-btn {
    background-color: var(--highlight-color);
    color: var(--text-primary);
    border: none;
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--highlight-hover);
    }
}

.booking-btn {
    background-color: #fff; // 白底
    color: var(--highlight-color); // 綠字
    border: 1px solid var(--highlight-color);
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--highlight-color); // hover 時變綠底
        color: #fff; // 字變白
    }
}

.gym-platform {
    font-family: "Roboto", sans-serif;
    width: 100%;
}

.section-container {
    max-width: 1600px;
    width: 100%;
    margin: 0 auto; /* 自動左右邊距使其居中 */
    padding: 0 40px;
    box-sizing: border-box;
    position: relative; /* 確保定位正確 */
}

.section {
    margin: 0 10%;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .section-container {
        padding: 0 20px; /* 在小螢幕上減少左右padding */
    }

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
</style>
