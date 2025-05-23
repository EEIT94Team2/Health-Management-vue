import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";

// 後端
import Layout from "@/components/Layouts/backend/index.vue";
import BackPage from "@/views/backend/BackPage.vue";

// 前端
import FrontendLayout from "@/components/Layouts/frontend/index.vue";
import HomePage from "@/views/frontend/HomePage.vue";

// 課程管理
import CourseList from "@/views/backend/course/CourseList.vue";
import CourseForm from "@/views/backend/course/CourseForm.vue";
import EnrollmentList from "@/views/backend/course/EnrollmentList.vue";
import TrailBooking from "@/views/backend/course/TrailBooking.vue";
import Courses from "@/views/frontend/course/CoursePage.vue";
import EnrollmentStatusPage from "@/views/frontend/course/EnrollmentStatusPage.vue"; // 修改後的查看狀態頁
import RegularEnrollmentPage from "@/views/frontend/course/RegularEnrollmentPage.vue"; // 報名常規課程頁
import TrialBookingPage from "@/views/frontend/course/TrialBookingPage.vue"; // 預約體驗課程頁
import MyCoursesPage from "@/views/frontend/course/MyCourse.vue";
import CourseDetailsPage from '@/views/frontend/course/CourseDetailsPage.vue';

// 會員中心
import MemberLoginView from "@/views/backend/member/MemberLoginView.vue";
import MemberRegisterView from "@/views/backend/member/MemberRegisterView.vue";
import MemberProfileView from "@/views/backend/member/MemberProfileView.vue";
import MemberManagement from "@/views/backend/member/MemberManagement.vue";

// 商城管理
import OrderList from "@/views/backend/shop/OrderList.vue";
import OrderDetail from "@/views/backend/shop/OrderDetail.vue";
import CartManagement from "@/views/backend/shop/CartManagement.vue";
import ProductList from "@/views/backend/shop/ProductList.vue";
import ProductDetail from "@/views/backend/shop/ProductDetail.vue";
import ProductManagement from "@/views/backend/shop/ProductManagement.vue";
import ProductAdmin from "@/views/backend/shop/ProductAdmin.vue";

// 論壇
import ForumHomeView from "@/views/backend/social/ForumHomeView.vue";
import ForumPostsView from "@/views/backend/social/ForumPostsView.vue";
import ForumCreateView from "@/views/backend/social/ForumCreateView.vue";
import SocialAnalyticsView from "@/views/backend/social/SocialAnalyticsView.vue";

// 追蹤成效
import AdminDietRecords from "@/views/backend/fitness/DietRecords.vue";
import AdminExerciseRecords from "@/views/backend/fitness/ExerciseRecords.vue";
import AdminBodyData from "@/views/backend/fitness/BodyData.vue";
import AdminGoalsProgress from "@/views/backend/fitness/GoalsProgress.vue";
import ReportsAnalysis from "@/views/backend/fitness/ReportsAnalysis.vue";
import AdminAchievement from "@/views/backend/fitness/Achievement.vue";

// 錯誤頁面
import Forbidden403 from "@/views/403.vue";

const routes = [
    {
        path: "/",
        component: FrontendLayout,
        children: [
            {
                path: "",
                name: "HomePage",
                component: HomePage,
                meta: { title: "首頁" },
            },
            {
                path: '/courses',
                name: 'Courses',
                component: Courses,
                meta: { title: '課程' }
              },
              {
                path: '/courses/:courseId', // 注意這裡的 :courseId 會作為路由參數
                name: 'course-details', // 給這個路由一個名稱，方便在代碼中使用 router.push({ name: 'course-details', params: { courseId: id } })
                component: CourseDetailsPage, // 指向您新創建的詳情頁面元件
                props: true, // 如果您想將路由參數 courseId 作為 props 傳遞給組件，可以添加這一行
              },
              {
                path: '/my-enrollment-status', // 查看所有課程與我的狀態頁面路徑
                name: 'my-enrollment-status',
                component: EnrollmentStatusPage,
                meta: { title: '我的課程狀態' } // 通常需要登入才能看自己的狀態
              },
              {
                path: '/courses/regular-enrollment', // 報名常規課程頁面路徑
                name: 'regular-enrollment',
                component: RegularEnrollmentPage,
                meta: { title: '報名常規課程' } // 需要登入才能報名
              },
               {
                path: '/courses/trial-booking', // 預約體驗課程頁面路徑
                name: 'trial-booking',
                component: TrialBookingPage,
                meta: { title: '預約體驗課' } // 需要登入才能預約
              },
              {
                path: '/user/courses',
                name: 'MyCourses',
                component: MyCoursesPage,
                meta: { title: '我的課程', requiresAuth: true },
              },
            // 前台商城路由
            {
                path: "shop/products",
                name: "FrontProductList",
                component: () => import("@/views/frontend/shop/ProductList.vue"),
                meta: { title: "商品列表" },
            },
            {
                path: "shop/products/:id",
                name: "FrontProductDetail",
                component: () => import("@/views/frontend/shop/ProductDetail.vue"),
                meta: { title: "商品詳情" },
            },
            {
                path: "shop/cart",
                name: "FrontCart",
                component: () => import("@/views/frontend/shop/Cart.vue"),
                meta: { title: "購物車", requiresAuth: true },
            },
            {
                path: "shop/checkout",
                name: "FrontCheckout",
                component: () => import("@/views/frontend/shop/Checkout.vue"),
                meta: { title: "結帳", requiresAuth: true },
            },
            {
                path: "shop/orders",
                name: "FrontOrderList",
                component: () => import("@/views/frontend/shop/OrderList.vue"),
                meta: { title: "我的訂單", requiresAuth: true },
            },
            {
                path: "shop/orders/:id",
                name: "FrontOrderDetail",
                component: () => import("@/views/frontend/shop/OrderDetail.vue"),
                meta: { title: "訂單詳情", requiresAuth: true },
            },
            {
                path: "user/login",
                name: "FrontLogin",
                component: () => import("@/views/frontend/member/LoginPage.vue"),
                meta: { title: "會員登入" },
            },
            {
                path: "user/register",
                name: "FrontRegister",
                component: () => import("@/views/frontend/member/RegisterPage.vue"),
                meta: { title: "會員註冊" },
            },
            {
                path: "user/forgot-password",
                name: "ForgotPassword",
                component: () => import("@/views/frontend/member/ForgotPasswordView.vue"),
                meta: { title: "忘記密碼" },
            },
            {
                path: "user/reset-password",
                name: "ResetPassword",
                component: () => import("@/views/frontend/member/ResetPasswordView.vue"),
                meta: { title: "重設密碼" },
            },
            {
                path: "user/profile",
                name: "FrontProfile",
                component: () => import("@/views/frontend/member/ProfileView.vue"),
                meta: { title: "會員中心", requiresAuth: true },
            },
            {
                path: "social/forumhome",
                name: "FrontendForumHome",
                component: () => import("@/views/frontend/social/ForumHomeView.vue"),
                meta: { title: "論壇首頁" },
            },
            {
                path: "social/forum",
                name: "FrontendForum",
                component: () => import("@/views/frontend/social/Forum.vue"),
                meta: { title: "健康討論區" },
            },
            {
                path: "social/UserSocialProfile",
                name: "UserSocialProfile",
                component: () => import("@/views/frontend/social/UserSocialProfile.vue"),
                meta: { title: "個人檔案" },
            },
            {
                path: "social/forumcreate",
                name: "FrontendForumCreateView",
                component: () => import("@/views/frontend/social/ForumCreateView.vue"),
                meta: { title: "發表文章" },
            },
            {
                path: "social/partner",
                name: "Partner",
                component: () => import("@/views/frontend/social/FindWorkoutPartner.vue"),
                meta: { title: "尋找夥伴" },
            },
            {
                path: "user/fitness",
                name: "Fitness",
                component: () => import("@/views/frontend/fitness/Fitness.vue"),
                meta: { title: "健身成效" },
            },
            {
                path: "user/achievements",
                name: "UserAchievements",
                component: () => import("@/views/frontend/fitness/Achievements.vue"),
                meta: { title: "我的獎章" },
            },
            {
                path: "user/body-data",
                name: "UserBodyData",
                component: () => import("@/views/frontend/fitness/BodyData.vue"),
                meta: { title: "我的身體數據" },
            },
            {
                path: "user/diet-records",
                name: "UserDietRecords",
                component: () => import("@/views/frontend/fitness/DietRecords.vue"),
                meta: { title: "我的飲食記錄" },
            },
            {
                path: "user/workouts",
                name: "UserWorkoutRecords",
                component: () => import("@/views/frontend/fitness/WorkoutRecords.vue"),
                meta: { title: "我的運動記錄" },
            },
            {
                path: "user/goals",
                name: "UserGoalsProgress",
                component: () => import("@/views/frontend/fitness/GoalsProgress.vue"),
                meta: { title: "我的健身目標" },
            },
        ],
    },
    // 添加重設密碼直接路徑
    {
        path: "/reset-password",
        name: "DirectResetPassword",
        component: () => import("@/views/frontend/member/ResetPasswordView.vue"),
        meta: { title: "重設密碼" },
    },
    // 添加OAuth回調路由
    {
        path: "/oauth/callback",
        name: "OAuthCallback",
        component: () => import("@/views/oauth/OAuthCallback.vue"),
        meta: { title: "OAuth登入處理" },
    },
    {
        path: "/backpage",
        component: Layout,
        redirect: "/backpage/dashboard",
        children: [
            {
                path: "dashboard",
                name: "Dashboard",
                component: BackPage,
                meta: { title: "後台首頁", icon: "HomeFilled", requiresAuth: true },
            },
            {
                path: "courses",
                name: "CourseList",
                component: CourseList,
                meta: { title: "課程管理", icon: "Calendar", requiresAuth: true },
            },
            {
                path: "courses/create",
                name: "CourseCreate",
                component: CourseForm,
                meta: { title: "創建課程", hidden: true, requiresAuth: true },
            },
            {
                path: "courses/edit/:id",
                name: "CourseEdit",
                component: CourseForm,
                meta: { title: "編輯課程", hidden: true, requiresAuth: true },
            },
            {
                path: "enrollments",
                name: "EnrollmentList",
                component: EnrollmentList,
                meta: { title: "報名紀錄", icon: "Document", requiresAuth: true }
            },
            {
                path: "trailBooking",
                name: "TrailBooking",
                component: TrailBooking,
                meta: { title: "預約紀錄", icon: "Document", requiresAuth: true }
            },

            // 會員中心
            {
                path: "member/login",
                name: "MemberLogin",
                component: MemberLoginView,
                meta: { title: "會員登入" },
            },
            {
                path: "member/register",
                name: "MemberRegister",
                component: MemberRegisterView,
                meta: { title: "會員註冊" },
            },
            {
                path: "member/profile",
                name: "MemberProfile",
                component: MemberProfileView,
                meta: { title: "會員資料", requiresAuth: true },
            },
            {
                path: "member/management",
                name: "MemberManagement",
                component: MemberManagement,
                meta: { title: "會員總管", requiresAuth: true, isAdmin: true },
            },
            // 商城管理
            {
                path: "shop/orders",
                name: "OrderList",
                component: OrderList,
                meta: { title: "訂單管理", requiresAuth: true },
            },
            {
                path: "shop/orders/:id",
                name: "OrderDetail",
                component: OrderDetail,
                meta: { title: "訂單詳情", requiresAuth: true },
            },
            {
                path: "shop/products",
                name: "ProductList",
                component: ProductList,
                meta: { title: "商品列表", requiresAuth: true },
            },
            {
                path: "shop/product-list",
                redirect: "shop/products",
            },
            {
                path: "shop/products/:id",
                name: "ProductDetail",
                component: ProductDetail,
                meta: { title: "商品詳情", requiresAuth: true },
            },
            {
                path: "shop/product-management",
                name: "ProductManagement",
                component: ProductManagement,
                meta: { title: "商品管理", requiresAuth: true, isAdmin: true },
            },
            {
                path: "shop/product-admin",
                name: "ProductAdmin",
                component: ProductAdmin,
                meta: { title: "商品管理後台", requiresAuth: true, isAdmin: true },
            },
            {
                path: "shop/cart",
                name: "CartManagement",
                component: CartManagement,
                meta: { title: "購物車管理", requiresAuth: true },
            },
            {
                path: "shop/checkout",
                name: "PaymentSimulation",
                redirect: "shop/orders",
                meta: { title: "支付功能暫不可用", requiresAuth: true, isAdmin: true },
            },

            // 論壇
            {
                path: "social/home",
                name: "ForumHome",
                component: ForumHomeView,
                meta: { title: "論壇首頁", requiresAuth: true },
            },
            {
                path: "social/posts",
                name: "ForumPosts",
                component: ForumPostsView,
                meta: { title: "文章列表", requiresAuth: true },
            },
            {
                path: "social/create",
                name: "ForumCreate",
                component: ForumCreateView,
                meta: { title: "發表文章", requiresAuth: true },
            },
            {
                path: "social/analytics",
                name: "SocialAnalytics",
                component: SocialAnalyticsView,
                meta: { title: "社群分析", requiresAuth: true },
            },
            // 追蹤成效
            {
                path: "fitness/admin/workouts",
                name: "AdminWorkouts",
                component: AdminExerciseRecords,
                meta: {
                    title: "運動紀錄管理",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/diet",
                name: "AdminDiet",
                component: AdminDietRecords,
                meta: {
                    title: "飲食紀錄管理",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/body",
                name: "AdminBodyData",
                component: AdminBodyData,
                meta: {
                    title: "身體數據管理",
                    icon: "Scale",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/goals",
                name: "AdminGoalsProgress",
                component: AdminGoalsProgress,
                meta: {
                    title: "目標與進度",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            // 後台獎章管理
            {
                path: "fitness/admin/achievements",
                name: "AdminAchievement",
                component: AdminAchievement,
                meta: {
                    title: "獎章管理",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },
            {
                path: "fitness/admin/reports",
                name: "ReportsAnalysis",
                component: ReportsAnalysis,
                meta: {
                    title: "報告與數據分析",
                    requiresAuth: true,
                    isAdmin: true,
                },
            },

            // 錯誤頁面
            {
                path: "error/403",
                name: "Forbidden",
                component: Forbidden403,
                meta: { title: "訪問被拒絕" },
            },
        ],
    },
    // 全局錯誤頁面，不使用布局
    {
        path: "/error/403",
        name: "GlobalForbidden",
        component: Forbidden403,
        meta: { title: "訪問被拒絕" },
    },
    // 添加或修改支付模擬頁面的路由
    {
        path: "/backpage/shop/payment",
        name: "PaymentSimulation",
        component: () => import("@/views/backend/shop/PaymentSimulation.vue"),
        meta: {
            requiresAuth: true,
        },
    },
    // 添加一個支付頁面的別名路由，方便用戶直接訪問
    {
        path: "/payment",
        redirect: "/backpage/shop/payment",
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    // 添加這個 scrollBehavior 函式來控制滾動行為
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
          return savedPosition // 如果有儲存的位置，就返回到那個位置
        } else {
          return { top: 0 } // 否則滾動到頁面頂部
        }
      }
  });

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const authToken = localStorage.getItem("authToken");
        const userRole = localStorage.getItem("userRole");

        if (!authToken) {
            return next({
                path: "/backpage/member/login",
                query: { redirect: to.fullPath },
            });
        }

        if (to.meta.isAdmin && userRole !== "admin") {
            ElMessage.error("您沒有訪問此頁面的權限");
            return next({
                path: "/backpage/error/403",
                query: {
                    message: "您沒有管理員權限，無法訪問此頁面",
                    code: "ERR_BAD_REQUEST",
                },
            });
        }

        return next();
    }

    return next();
});

export default router;
