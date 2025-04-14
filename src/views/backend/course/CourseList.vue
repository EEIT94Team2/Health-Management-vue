<template>
    <div>
        <div style="margin-bottom: 20px">
            <el-button
                @click="
                    activeSearch = null;
                    showCreateForm = false;
                    editingCourseId = null;
                    currentPage = 1;
                    fetchCourses();
                "
                :type="
                    activeSearch === null && !showCreateForm && !editingCourseId ? 'primary' : ''
                "
                >全部課程
            </el-button>
            <el-button
                @click="
                    activeSearch = 'byId';
                    showCreateForm = false;
                "
                :type="activeSearch === 'byId' ? 'primary' : ''"
                style="margin-left: 10px"
                >依課程編號查詢</el-button
            >
            <el-button
                @click="
                    activeSearch = 'byName';
                    showCreateForm = false;
                "
                :type="activeSearch === 'byName' ? 'primary' : ''"
                style="margin-left: 10px"
                >依課程名稱查詢</el-button
            >
            <el-button
                @click="
                    activeSearch = 'byCoachId';
                    showCreateForm = false;
                "
                :type="activeSearch === 'byCoachId' ? 'primary' : ''"
                style="margin-left: 10px"
                >依教練編號查詢</el-button
            >
            <el-button
                @click="
                    activeSearch = 'byCoachName';
                    showCreateForm = false;
                "
                :type="activeSearch === 'byCoachName' ? 'primary' : ''"
                style="margin-left: 10px"
                >依教練名稱查詢</el-button
            >
            <el-button
                @click="openCreateForm"
                :type="showCreateForm && !editingCourseId ? 'primary' : ''"
                >新增課程</el-button
            >
        </div>

        <section
            v-if="activeSearch === 'byId' && !showCreateForm && !editingCourseId"
            style="margin-bottom: 20px"
        >
            <div style="display: flex; align-items: center; margin-bottom: 10px">
                <el-input
                    v-model="searchById.id"
                    placeholder="請輸入課程編號"
                    style="width: 300px"
                />
                <el-button type="primary" @click="searchCourseById" style="margin-left: 10px"
                    >查詢</el-button
                >
            </div>
            <el-table
                :data="searchById.course ? [searchById.course] : []"
                style="width: 100%"
                v-if="searchById.course"
            >
                <el-table-column prop="id" label="課程編號" width="85" />
                <el-table-column prop="name" label="課程名稱" />
                <el-table-column prop="description" label="課程內容" />
                <el-table-column prop="date" label="日期" width="150">
                    <template #default="scope">
                        {{ formatDate(scope.row.date) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="時長（分鐘）" width="110" />
                <el-table-column prop="maxCapacity" label="最大人數" width="100" />
                <el-table-column prop="coachId" label="教練編號" width="85"></el-table-column>
                <el-table-column prop="coachName" label="教練名字"></el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button @click="openEditForm(scope.row.id)">編輯</el-button>
                        <el-button type="danger" @click="handleDelete(scope.row.id)"
                            >刪除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <p v-else-if="searchById.performed && !searchById.course">沒有找到該編號的課程。</p>
        </section>

        <section
            v-if="activeSearch === 'byName' && !showCreateForm && !editingCourseId"
            style="margin-bottom: 20px"
        >
            <div style="display: flex; align-items: center; margin-bottom: 10px">
                <el-input
                    v-model="searchByName.name"
                    placeholder="請輸入課程名稱"
                    style="width: 300px"
                />
                <el-button type="primary" @click="searchCourseByName" style="margin-left: 10px"
                    >查詢</el-button
                >
            </div>
            <el-table
                :data="searchByName.courses"
                style="width: 100%"
                v-if="searchByName.courses.length > 0"
            >
                <el-table-column prop="id" label="課程編號" width="85" />
                <el-table-column prop="name" label="課程名稱" />
                <el-table-column prop="description" label="課程內容" />
                <el-table-column prop="date" label="日期" width="150">
                    <template #default="scope">
                        {{ formatDate(scope.row.date) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="時長（分鐘）" width="110" />
                <el-table-column prop="maxCapacity" label="最大人數" width="100" />
                <el-table-column prop="coachId" label="教練編號" width="85"></el-table-column>
                <el-table-column prop="coachName" label="教練名字"></el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button @click="openEditForm(scope.row.id)">編輯</el-button>
                        <el-button type="danger" @click="handleDelete(scope.row.id)"
                            >刪除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <p v-else-if="searchByName.performed && searchByName.courses.length === 0">
                沒有找到符合該名稱的課程。
            </p>
        </section>

        <section
            v-if="activeSearch === 'byCoachId' && !showCreateForm && !editingCourseId"
            style="margin-bottom: 20px"
        >
            <div style="display: flex; align-items: center; margin-bottom: 10px">
                <el-input
                    v-model="searchByCoachId.coachId"
                    placeholder="請輸入教練編號"
                    style="width: 300px"
                />
                <el-button type="primary" @click="searchCourseByCoachId" style="margin-left: 10px"
                    >查詢</el-button
                >
            </div>
            <el-table
                :data="searchByCoachId.courses"
                style="width: 100%"
                v-if="searchByCoachId.courses.length > 0"
            >
                <el-table-column prop="id" label="課程編號" width="85" />
                <el-table-column prop="name" label="課程名稱" />
                <el-table-column prop="description" label="課程內容" />
                <el-table-column prop="date" label="日期" width="150">
                    <template #default="scope">
                        {{ formatDate(scope.row.date) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="時長（分鐘）" width="110" />
                <el-table-column prop="maxCapacity" label="最大人數" width="100" />
                <el-table-column prop="coachId" label="教練編號" width="85"></el-table-column>
                <el-table-column prop="coachName" label="教練名字"></el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button @click="openEditForm(scope.row.id)">編輯</el-button>
                        <el-button type="danger" @click="handleDelete(scope.row.id)"
                            >刪除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <p v-else-if="searchByCoachId.performed && searchByCoachId.courses.length === 0">
                沒有找到該教練編號的課程。
            </p>
        </section>

        <section v-if="activeSearch === 'byCoachName' && !showCreateForm && !editingCourseId">
            <div style="display: flex; align-items: center; margin-bottom: 10px">
                <el-input
                    v-model="searchByCoachName.name"
                    placeholder="請輸入教練名稱"
                    style="width: 300px"
                />
                <el-button type="primary" @click="searchCourseByCoachName" style="margin-left: 10px"
                    >查詢</el-button
                >
            </div>
            <el-table
                :data="searchByCoachName.courses"
                style="width: 100%"
                v-if="searchByCoachName.courses.length > 0"
            >
                <el-table-column prop="id" label="課程編號" width="85" />
                <el-table-column prop="name" label="課程名稱" />
                <el-table-column prop="description" label="課程內容" />
                <el-table-column prop="date" label="日期" width="150">
                    <template #default="scope">
                        {{ formatDate(scope.row.date) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="時長（分鐘）" width="110" />
                <el-table-column prop="maxCapacity" label="最大人數" width="100" />
                <el-table-column prop="coachId" label="教練編號" width="85"></el-table-column>
                <el-table-column prop="coachName" label="教練名字"></el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button @click="openEditForm(scope.row.id)">編輯</el-button>
                        <el-button type="danger" @click="handleDelete(scope.row.id)"
                            >刪除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <p v-else-if="searchByCoachName.performed && searchByCoachName.courses.length === 0">
                沒有找到該教練名稱的課程。
            </p>
        </section>

        <el-card
            v-if="showCreateForm || editingCourseId"
            class="create-form"
            style="margin-bottom: 20px"
        >
            <template #header>
                <div class="card-header">
                    <span>{{ editingCourseId ? "編輯課程" : "新增課程" }}</span>
                    <el-button
                        class="button"
                        style="float: right; padding: 3px 0"
                        type="text"
                        @click="closeForm"
                    >
                        關閉
                    </el-button>
                </div>
            </template>
            <el-form :model="form" label-width="120px">
                <el-form-item label="課程名稱：">
                    <el-input
                        v-model="form.name"
                        placeholder="請輸入課程名稱"
                        style="width: 300px"
                    />
                </el-form-item>
                <el-form-item label="課程內容：">
                    <el-input
                        v-model="form.description"
                        type="textarea"
                        placeholder="請輸入課程內容"
                        style="width: 300px"
                    />
                </el-form-item>
                <el-form-item label="日期：">
                    <el-date-picker
                        v-model="form.date"
                        type="date"
                        placeholder="選擇日期"
                        style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="時長（分鐘）：">
                    <el-input-number v-model="form.duration" :min="1" style="width: 150px" />
                </el-form-item>
                <el-form-item label="最大人數：">
                    <el-input-number v-model="form.maxCapacity" :min="1" style="width: 150px" />
                </el-form-item>
                <el-form-item label="教練編號：">
                    <el-input
                        v-model="form.coachId"
                        placeholder="請輸入教練編號"
                        style="width: 150px"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">{{
                        editingCourseId ? "編輯" : "新增"
                    }}</el-button>
                    <el-button @click="closeForm">取消</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <br /><br />
        <el-table
            ref="courseTable"
            :data="displayedCourses"
            style="width: 100%"
            v-if="activeSearch === null && !showCreateForm && !editingCourseId"
        >
            <el-table-column prop="id" label="課程編號" width="85" />
            <el-table-column prop="name" label="課程名稱" />
            <el-table-column prop="description" label="課程內容" />
            <el-table-column prop="date" label="日期" width="150">
                <template #default="scope">
                    {{ formatDate(scope.row.date) }}
                </template>
            </el-table-column>
            <el-table-column prop="duration" label="時長（分鐘）" width="110" />
            <el-table-column prop="maxCapacity" label="最大人數" width="100" />
            <el-table-column prop="coach.id" label="教練編號" width="85"></el-table-column>
            <el-table-column prop="coach.name" label="教練名字"></el-table-column>
            <el-table-column label="操作" width="200">
                <template #default="scope">
                    <el-button @click="openEditForm(scope.row.id)">編輯</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row.id)">刪除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            v-if="activeSearch === null && !showCreateForm && !editingCourseId"
            v-model:currentPage="currentPage"
            v-model:pageSize="pageSize"
            :total="totalCourses"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            style="margin-top: 20px; display: flex; justify-content: center"
            :page-sizes="[10, 20]"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import {
    ElTable,
    ElTableColumn,
    ElButton,
    ElMessage,
    ElPagination,
    ElInput,
    ElCard,
    ElForm,
    ElFormItem,
    ElDatePicker,
    ElInputNumber,
} from "element-plus";
import axios from "axios";

const router = useRouter();
const courses = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCourses = ref(0);
const activeSearch = ref(null);
const showCreateForm = ref(false); // 控制新增/編輯表單的顯示
const editingCourseId = ref(null); // 儲存正在編輯的課程 ID
const form = ref({
    // 新增和編輯共用的表單資料
    name: "",
    description: "",
    date: null,
    duration: null,
    maxCapacity: null,
    coachId: null,
    coachName: "",
});

const courseTable = ref(null);

const searchById = reactive({ id: "", course: null, performed: false });
const searchByName = reactive({ name: "", courses: [], performed: false });
const searchByCoachId = reactive({ coachId: null, courses: [], performed: false });
const searchByCoachName = reactive({ name: "", courses: [], performed: false });

const fetchCourses = async () => {
    try {
        console.log("開始獲取課程列表...");
        const response = await axios.get("/api/courses");
        console.log("課程API響應:", response);

        courses.value = response.data.data || response.data;
        totalCourses.value = courses.value.length;
        closeForm();
        resetSearchStates();

        console.log(`成功獲取${courses.value.length}個課程`);
    } catch (error) {
        console.error("獲取課程列表失敗", error);
        if (error.response) {
            console.error("錯誤狀態:", error.response.status);
            console.error("錯誤信息:", error.response.data);
        }
        ElMessage.error("獲取課程列表失敗，請檢查網絡連接或登入狀態");
        courses.value = [];
        totalCourses.value = 0;
    }
};

const resetSearchStates = () => {
    searchById.course = null;
    searchById.performed = false;
    searchByName.courses = [];
    searchByName.performed = false;
    searchByCoachId.courses = [];
    searchByCoachId.performed = false;
    searchByCoachName.courses = [];
    searchByCoachName.performed = false;
};

const displayedCourses = computed(() => {
    if (activeSearch.value === "byId" && searchById.course) {
        return [searchById.course];
    } else if (activeSearch.value === "byName" && searchByName.courses.length > 0) {
        return searchByName.courses.slice(
            (currentPage.value - 1) * pageSize.value,
            currentPage.value * pageSize.value
        );
    } else if (activeSearch.value === "byCoachId" && searchByCoachId.courses.length > 0) {
        return searchByCoachId.courses.slice(
            (currentPage.value - 1) * pageSize.value,
            currentPage.value * pageSize.value
        );
    } else if (activeSearch.value === "byCoachName" && searchByCoachName.courses.length > 0) {
        return searchByCoachName.courses.slice(
            (currentPage.value - 1) * pageSize.value,
            currentPage.value * pageSize.value
        );
    } else {
        return courses.value.slice(
            (currentPage.value - 1) * pageSize.value,
            currentPage.value * pageSize.value
        );
    }
});

const openCreateForm = () => {
    editingCourseId.value = null;
    resetForm();
    showCreateForm.value = true;
    activeSearch.value = null; // 加這一行
};

const openEditForm = (id) => {
    editingCourseId.value = id;
    showCreateForm.value = true;
    fetchCourseToEdit(id);
};

const closeForm = () => {
    showCreateForm.value = false;
    editingCourseId.value = null;
    resetForm();
};

const resetForm = () => {
    form.value = {
        name: "",
        description: "",
        date: null,
        duration: 60,
        maxCapacity: 10,
        coachId: null,
        coachName: "",
    };
};

const handleDelete = async (id) => {
    if (window.confirm("確定要刪除此課程嗎？")) {
        try {
            await axios.delete(`/api/courses/${id}`);
            ElMessage.success("課程刪除成功");
            fetchCourses();
        } catch (error) {
            console.error("刪除課程失敗", error);
            ElMessage.error("刪除課程失敗");
        }
    }
};

const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
};

const handleCurrentChange = (page) => {
    currentPage.value = page;
};

const searchCourseById = async () => {
    showCreateForm.value = false; // 確保關閉新增表單
    if (!searchById.id) {
        ElMessage.warning("請輸入課程編號");
        return;
    }
    try {
        const response = await axios.get(`/api/courses/${searchById.id}`);
        searchById.course = response.data.data || response.data;
        searchById.performed = true;
        activeSearch.value = "byId";
    } catch (error) {
        console.error("依編號查詢課程失敗", error);
        searchById.course = null;
        searchById.performed = true;
        ElMessage.error("查詢失敗");
    }
};

const searchCourseByName = async () => {
    showCreateForm.value = false; // 確保關閉新增表單
    if (!searchByName.name) {
        ElMessage.warning("請輸入課程名稱");
        return;
    }
    try {
        const response = await axios.get(`/api/courses/course_search?name=${searchByName.name}`);
        searchByName.courses = response.data.data || response.data;
        searchByName.performed = true;
        activeSearch.value = "byName";
        if (searchByName.courses.length === 0) {
            ElMessage.warning("沒有找到符合該名稱的課程。");
        }
    } catch (error) {
        console.error("依課程名稱查詢失敗", error);
        searchByName.courses = [];
        searchByName.performed = true;
        ElMessage.error("查詢失敗");
    }
};

const searchCourseByCoachId = async () => {
    showCreateForm.value = false; // 確保關閉新增表單
    if (!searchByCoachId.coachId) {
        ElMessage.warning("請輸入教練編號");
        return;
    }
    try {
        const response = await axios.get(`/api/courses/coach?coachId=${searchByCoachId.coachId}`);
        searchByCoachId.courses = response.data.data || response.data;
        searchByCoachId.performed = true;
        activeSearch.value = "byCoachId";
    } catch (error) {
        console.error("依教練編號查詢失敗", error);
        searchByCoachId.courses = [];
        searchByCoachId.performed = true;
        ElMessage.error("查詢失敗");
    }
};

const searchCourseByCoachName = async () => {
    showCreateForm.value = false; // 確保關閉新增表單
    if (!searchByCoachName.name) {
        ElMessage.warning("請輸入教練名稱");
        return;
    }
    try {
        const response = await axios.get(
            `/api/courses/coach_search?coachName=${searchByCoachName.name}`
        );
        searchByCoachName.courses = response.data.data || response.data;
        searchByCoachName.performed = true;
        activeSearch.value = "byCoachName";
        if (searchByCoachName.courses.length === 0) {
            ElMessage.warning("沒有找到符合該教練名稱的課程。");
        }
    } catch (error) {
        console.error("依教練名稱查詢失敗", error);
        searchByCoachName.courses = [];
        searchByCoachName.performed = true;
        ElMessage.error("查詢失敗");
    }
};

const fetchCourseToEdit = async (id) => {
    try {
        const response = await axios.get(`/api/courses/${id}`);
        const courseData = response.data.data || response.data;
        form.value = {
            id: courseData.id,
            name: courseData.name,
            description: courseData.description,
            date: courseData.date,
            duration: courseData.duration,
            maxCapacity: courseData.maxCapacity,
            coachId: courseData.coachId || courseData.coach?.id,
            coachName: courseData.coachName || courseData.coach?.name,
        };
    } catch (error) {
        console.error("獲取課程詳情失敗", error);
        ElMessage.error("獲取課程詳情失敗");
        closeForm();
    }
};

const scrollToEditedCourse = (id) => {
    if (courseTable.value && courses.value) {
        const index = courses.value.findIndex((course) => course.id === id);
        if (index !== -1) {
            courseTable.value.scrollToRow(courses.value[index]);
        }
    }
};

const formatDate = (date) => {
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    return date;
};

const formatDateForBackend = (date) => {
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    return date; // 如果已經是字串，則直接返回
};

const handleSubmit = async () => {
    try {
        const payload = { ...form.value };
        payload.date = formatDateForBackend(payload.date);

        if (editingCourseId.value) {
            await axios.put(`/api/courses/${editingCourseId.value}`, payload);
            ElMessage.success("課程編輯成功");

            if (
                activeSearch.value === "byId" &&
                searchById.performed &&
                searchById.course?.id === editingCourseId.value
            ) {
                searchCourseById();
            } else if (
                activeSearch.value === "byName" &&
                searchByName.performed &&
                searchByName.courses.some((course) => course.id === editingCourseId.value)
            ) {
                searchCourseByName();
            } else if (
                activeSearch.value === "byCoachId" &&
                searchByCoachId.performed &&
                searchByCoachId.courses.some((course) => course.id === editingCourseId.value)
            ) {
                searchCourseByCoachId();
            } else if (
                activeSearch.value === "byCoachName" &&
                searchByCoachName.performed &&
                searchByCoachName.courses.some((course) => course.id === editingCourseId.value)
            ) {
                searchCourseByCoachName();
            } else {
                // 如果不是任何特定的查詢模式，則更新 courses 列表
                const index = courses.value.findIndex(
                    (course) => course.id === editingCourseId.value
                );
                if (index !== -1) {
                    Object.assign(courses.value[index], {
                        ...form.value,
                        id: editingCourseId.value,
                    });
                }
            }
        } else {
            await axios.post("/api/courses", payload);
            ElMessage.success("課程新增成功");
            activeSearch.value = null; // 設定 activeSearch 為 null，顯示全部課程
            currentPage.value = 1; // 重置頁碼到第一頁
            fetchCourses(); // 重新載入全部課程
        }
    } catch (error) {
        console.error(editingCourseId.value ? "編輯課程失敗" : "新增課程失敗", error);
        ElMessage.error(editingCourseId.value ? "編輯課程失敗" : "新增課程失敗");
    } finally {
        closeForm();
    }
};

onMounted(() => {
    fetchCourses();
});
</script>
