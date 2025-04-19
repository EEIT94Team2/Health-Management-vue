import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";

// 後端
import Layout from "@/components/Layouts/backend/index.vue";
import BackPage from "@/views/backend/BackPage.vue";

// 前端
import FrontendLayout from "@/components/Layouts/frontend/index.vue";
import HomePage from "@/views/frontend/HomePage.vue";
import GymHomePage from "@/views/frontend/GymHomePage.vue";
import GymPage from "@/views/frontend/GymPage.vue";

// 課程管理
import CourseList from "@/views/backend/course/CourseList.vue";
import CourseForm from "@/views/backend/course/CourseForm.vue";

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

// 追蹤成效
import AdminDietRecords from "@/views/backend/fitness/back/DietRecords.vue";
import AdminExerciseRecords from "@/views/backend/fitness/back/ExerciseRecords.vue";
import AdminBodyData from "@/views/backend/fitness/back/BodyData.vue";
import AdminGoalsProgress from "@/views/backend/fitness/back/GoalsProgress.vue";
import ReportsAnalysis from "@/views/backend/fitness/back/ReportsAnalysis.vue";

// 錯誤頁面
import Forbidden403 from "@/views/403.vue";

import Courses from "@/views/frontend/course/CourseList.vue";
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
                path: "courses",
                name: "Courses",
                component: Courses,
                meta: { title: "課程" },
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
                path: "user/profile",
                name: "FrontProfile",
                component: () => import("@/views/frontend/member/ProfileView.vue"),
                meta: { title: "會員中心", requiresAuth: true },
            },
            {
                path: "user/orders",
                redirect: "shop/orders",
            },
            {
                path: "user/orders/:id",
                redirect: (to) => {
                    // 重定向到對應的訂單詳情頁
                    const { id } = to.params;
                    return `/shop/orders/${id}`;
                },
            },
            {
                path: "user/courses",
                redirect: "courses",
            },
            {
                path: "user/fitness",
                redirect: "/",
            },
        ],
    },
    {
        path: "/gym",
        name: "GymHomePage",
        component: GymHomePage,
        meta: { title: "健身房" },
    },
    {
        path: "/home",
        name: "GymPage",
        component: GymPage,
        meta: { title: "健身房" },
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
    history: createWebHistory(),
    routes,
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
