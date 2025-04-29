<template>
  <div class="admin-enrollment-management">
    <h2 class="page-title">報名紀錄管理</h2>
    <p class="automation-note">
      <el-icon><InfoFilled /></el-icon>
      每天凌晨 2 點更新，將狀態為 '已報名' ，且發生時間已過的記錄標記為
      '未到場'。
    </p>

    <div class="action-buttons">
      <el-button
        @click="
          activeSearch = null; // 切換到「全部紀錄」模式
          resetSearchStates(); // 重置所有查詢相關狀態
          // 保留表格篩選狀態，重新獲取全部紀錄時應用
          currentPage = 1; // 重置頁碼
          fetchAllEnrollments(); // 獲取全部報名紀錄
        "
        :type="activeSearch === null ? 'primary' : ''"
        >全部報名紀錄</el-button
      >

      <el-button
        @click="
          activeSearch = 'byId'; // 切換到「依報名編號」查詢模式
          resetSearchStates(); // 重置其他查詢相關狀態
          // 清除表格篩選狀態，因為切換到查詢模式不應保留表格篩選
          if (enrollmentTableRef) enrollmentTableRef.clearFilter();
          filterStatus = null; // 重置篩選狀態
        "
        :type="activeSearch === 'byId' ? 'primary' : ''"
        >依報名編號查詢</el-button
      >

      <el-button
        @click="
          activeSearch = 'byCourseId'; // 切換到「依課程編號」查詢模式
          resetSearchStates();
          if (enrollmentTableRef) enrollmentTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byCourseId' ? 'primary' : ''"
        >依課程編號查詢</el-button
      >

      <el-button
        @click="
          activeSearch = 'byUserId'; // 切換到「依會員編號」查詢模式
          resetSearchStates();
          if (enrollmentTableRef) enrollmentTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byUserId' ? 'primary' : ''"
        >依會員編號查詢</el-button
      >

      <el-button
        @click="
          activeSearch = 'byUserName'; // 切換到「依會員名稱」查詢模式
          resetSearchStates();
          if (enrollmentTableRef) enrollmentTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byUserName' ? 'primary' : ''"
        >依會員名稱查詢</el-button
      >
    </div>

    <section v-if="activeSearch === 'byId'" class="search-section">
      <div class="search-input-group">
        <el-input
          v-model="searchById.id"
          placeholder="請輸入報名編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="searchEnrollmentById"
        />
        <el-button type="primary" @click="searchEnrollmentById">查詢</el-button>
      </div>
      <el-table
        :data="searchById.enrollment ? [searchById.enrollment] : []"
        style="width: 100%"
        v-if="searchById.performed && searchById.enrollment"
        border
      >
        <el-table-column prop="id" label="報名編號" width="81" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="userId" label="會員編號" width="81" />
        <el-table-column prop="userName" label="會員名字">
          <template #default="scope">
            <span>{{ scope.row.userName }}</span>
            <el-button
              v-if="scope.row.userId"
              type="text"
              size="large"
              @click="handleViewMemberTrialBookings(scope.row)"
              class="member-info-button"
            >
              <el-icon class="member-info-icon"> <User /> </el-icon>        
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentTime" label="報名時間" width="180">
          <template #default="scope">
            {{ formatEnrollmentTime(scope.row.enrollmentTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="報名狀態  " width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="large">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.status"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byId')
              "
              style="width: 100%"
            >
              <el-option label="已報名" value="已報名" />
              <el-option label="已取消" value="已取消" />
              <el-option label="候補中" value="候補中" />
              <el-option label="未到場" value="未到場" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="searchById.performed && !searchById.enrollment"
        class="search-no-results"
      >
        沒有找到該報名編號的紀錄。
      </p>
      <p v-else-if="!searchById.performed" class="search-initial-hint">
        請輸入報名編號進行查詢。
      </p>
    </section>

    <section v-if="activeSearch === 'byCourseId'" class="search-section">
      <div class="search-input-group">
        <el-input
          v-model="searchByCourseId.courseId"
          placeholder="請輸入課程編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="searchEnrollmentByCourseId"
        />
        <el-button type="primary" @click="searchEnrollmentByCourseId"
          >查詢</el-button
        >
      </div>
      <el-table
        :data="searchByCourseId.enrollments"
        style="width: 100%"
        v-if="
          searchByCourseId.performed && searchByCourseId.enrollments.length > 0
        "
        border
      >
        <el-table-column prop="id" label="報名編號" width="81" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="userId" label="會員編號" width="81" />
        <el-table-column prop="userName" label="會員名字">
          <template #default="scope">
            <span>{{ scope.row.userName }}</span>
            <el-button
              v-if="scope.row.userId"
              type="text"
              size="large"
              @click="handleViewMemberTrialBookings(scope.row)"
              class="member-info-button"
            >
              <el-icon class="member-info-icon"> <User /> </el-icon>        
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentTime" label="報名時間" width="180">
          <template #default="scope">
            {{ formatEnrollmentTime(scope.row.enrollmentTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="報名狀態  " width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="large">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.status"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byCourseId')
              "
              style="width: 100%"
            >
              <el-option label="已報名" value="已報名" />
              <el-option label="已取消" value="已取消" />
              <el-option label="候補中" value="候補中" />
              <el-option label="未到場" value="未到場" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="
          searchByCourseId.performed &&
          searchByCourseId.enrollments.length === 0
        "
        class="search-no-results"
      >
        沒有找到該課程編號的報名紀錄。
      </p>
      <p v-else-if="!searchByCourseId.performed" class="search-initial-hint">
        請輸入課程編號進行查詢。
      </p>
    </section>

    <section v-if="activeSearch === 'byUserId'" class="search-section">
      <div class="search-input-group">
        <el-input
          v-model="searchByUserId.userId"
          placeholder="請輸入會員編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="searchEnrollmentByUserId"
        />
        <el-button type="primary" @click="searchEnrollmentByUserId"
          >查詢</el-button
        >
      </div>
      <el-table
        :data="searchByUserId.enrollments"
        style="width: 100%"
        v-if="searchByUserId.performed && searchByUserId.enrollments.length > 0"
        border
      >
        <el-table-column prop="id" label="報名編號" width="81" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="userId" label="會員編號" width="81" />
        <el-table-column prop="userName" label="會員名字">
          <template #default="scope">
            <span>{{ scope.row.userName }}</span>
            <el-button
              v-if="scope.row.userId"
              type="text"
              size="large"
              @click="handleViewMemberTrialBookings(scope.row)"
              class="member-info-button"
            >
              <el-icon class="member-info-icon"> <User /> </el-icon>        
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentTime" label="報名時間" width="180">
          <template #default="scope">
            {{ formatEnrollmentTime(scope.row.enrollmentTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="報名狀態  " width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="large">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.status"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byUserId')
              "
              style="width: 100%"
            >
              <el-option label="已報名" value="已報名" />
              <el-option label="已取消" value="已取消" />
              <el-option label="候補中" value="候補中" />
              <el-option label="未到場" value="未到場" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="
          searchByUserId.performed && searchByUserId.enrollments.length === 0
        "
        class="search-no-results"
      >
        沒有找到該會員編號的報名紀錄。
      </p>
      <p v-else-if="!searchByUserId.performed" class="search-initial-hint">
        請輸入會員編號進行查詢。
      </p>
    </section>

    <section v-if="activeSearch === 'byUserName'" class="search-section">
      <div class="search-input-group">
        <el-input
          v-model="searchByUserName.userName"
          placeholder="請輸入會員名稱"
          clearable
          style="width: 200px"
          @keyup.enter="searchEnrollmentByUserName"
        />
        <el-button type="primary" @click="searchEnrollmentByUserName"
          >查詢</el-button
        >
      </div>
      <el-table
        :data="searchByUserName.enrollments"
        style="width: 100%"
        v-if="
          searchByUserName.performed && searchByUserName.enrollments.length > 0
        "
        border
      >
        <el-table-column prop="id" label="報名編號" width="81" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="userId" label="會員編號" width="81" />
        <el-table-column prop="userName" label="會員名字">
          <template #default="scope">
            <span>{{ scope.row.userName }}</span>
            <el-button
              v-if="scope.row.userId"
              type="text"
              size="large"
              @click="handleViewMemberTrialBookings(scope.row)"
              class="member-info-button"
            >
              <el-icon class="member-info-icon"> <User /> </el-icon>        
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentTime" label="報名時間" width="180">
          <template #default="scope">
            {{ formatEnrollmentTime(scope.row.enrollmentTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="報名狀態  " width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="large">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.status"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byUserName')
              "
              style="width: 100%"
            >
              <el-option label="已報名" value="已報名" />
              <el-option label="已取消" value="已取消" />
              <el-option label="候補中" value="候補中" />
              <el-option label="未到場" value="未到場" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="
          searchByUserName.performed &&
          searchByUserName.enrollments.length === 0
        "
        class="search-no-results"
      >
        沒有找到該會員名稱的報名紀錄。
      </p>
      <p v-else-if="!searchByUserName.performed" class="search-initial-hint">
        請輸入會員名稱進行查詢。
      </p>
    </section>

    <el-table
      ref="enrollmentTableRef"
      :data="enrollments"
      style="width: 100%"
      v-if="activeSearch === null"
      v-loading="loading"
      border
      @filter-change="handleFilterChange"
    >
      <el-table-column prop="id" label="報名編號" width="81" />
      <el-table-column prop="courseId" label="課程編號" width="81" />
      <el-table-column prop="courseName" label="課程名稱" />
      <el-table-column prop="userId" label="會員編號" width="81" />
      <el-table-column prop="userName" label="會員名字">
        <template #default="scope">
          <span>{{ scope.row.userName }}</span>
          <el-button
            v-if="scope.row.userId"
            type="text"
            size="large"
            @click="handleViewMemberTrialBookings(scope.row)"
            class="member-info-button"
          >
            <el-icon class="member-info-icon"> <User /> </el-icon>        
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="enrollmentTime" label="報名時間" width="180">
        <template #default="scope">
          {{ formatEnrollmentTime(scope.row.enrollmentTime) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        label="報名狀態  "
        width="120"
        :filters="statusFilters"
        :filter-multiple="false"
        column-key="status"
      >
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)" size="large">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-select
            :model-value="scope.row.status"
            placeholder="更新狀態"
            @change="(newStatus) => handleStatusChange(scope.row, newStatus)"
            style="width: 100%"
          >
            <el-option label="已報名" value="已報名" />
            <el-option label="已取消" value="已取消" />
            <el-option label="候補中" value="候補中" />
            <el-option label="未到場" value="未到場" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="activeSearch === null && totalEnrollments > 0"
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :total="totalEnrollments"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="pagination-container"
      :page-sizes="[10, 20, 50, 100]"
    />
  </div>
  <el-dialog
    v-model="showTrialBookingsDialog"
    title="預約課程紀錄"
    width="40%"
    @close="closeTrialBookingsDialog"
  >
    <div v-loading="loadingTrialBookings">
      <el-table
        :data="memberTrialBookings"
        style="width: 100%"
        v-if="memberTrialBookings.length > 0"
        border
      >
        <el-table-column prop="id" label="預約編號" width="90" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="bookingTime" label="預約時間" width="180">
          <template #default="scope">
            {{ formatEnrollmentTime(scope.row.bookingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingStatus" label="狀態" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.bookingStatus)"
              size="default"
              >{{ scope.row.bookingStatus }}</el-tag
            >
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="!loadingTrialBookings"
        style="text-align: center; color: #666"
      >
        該會員無體驗預約記錄。
      </p>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeTrialBookingsDialog">關閉</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue"; // 匯入 reactive
import axios from "axios";
import { ElMessage, ElIcon } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";

// 主要數據狀態 (用於全部紀錄模式)
const enrollments = ref([]);
const loading = ref(true); // 用於主表格的 loading
const currentPage = ref(1);
const pageSize = ref(10);
const totalEnrollments = ref(0);
const filterStatus = ref(null); // 用於主表格的篩選狀態
const enrollmentTableRef = ref(null); // 主表格的 ref

// 搜尋相關狀態
const activeSearch = ref(null); // null: 全部, 'byId', 'byCourseId', 'byUserId', 'byUserName'
const searchById = reactive({
  // reactive 用於包含多個屬性的物件
  id: null,
  enrollment: null, // 依 ID 查詢通常只有一條結果
  performed: false, // 是否已執行過查詢
});
const searchByCourseId = reactive({
  courseId: null,
  enrollments: [], // 依課程 ID 查詢可能有多條結果
  performed: false,
});
const searchByUserId = reactive({
  userId: null,
  enrollments: [], // 依會員 ID 查詢可能有多條結果
  performed: false,
});
const searchByUserName = reactive({
  userName: "",
  enrollments: [], // 依會員名稱查詢可能有多條結果
  performed: false,
});

// 狀態篩選選項
const statusFilters = [
  { text: "已報名", value: "已報名" },
  { text: "已取消", value: "已取消" },
  { text: "候補中", value: "候補中" },
  { text: "未到場", value: "未到場" },
  { text: "已完成", value: "已完成" },
];

// 重置所有搜尋相關狀態
const resetSearchStates = () => {
  searchById.id = null;
  searchById.enrollment = null;
  searchById.performed = false;

  searchByCourseId.courseId = null;
  searchByCourseId.enrollments = [];
  searchByCourseId.performed = false;

  searchByUserId.userId = null;
  searchByUserId.enrollments = [];
  searchByUserId.performed = false;

  searchByUserName.userName = "";
  searchByUserName.enrollments = [];
  searchByUserName.performed = false;
};

// --- 主要表格 (全部紀錄) 的數據獲取和處理 ---

const fetchAllEnrollments = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value - 1, // 假設後端頁碼從 0 開始
      pageSize: pageSize.value,
    };

    // 加入篩選條件參數
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }

    const res = await axios.get("/api/enrollments", {
      params: params,
    });

    enrollments.value = res.data.data || []; // 更新表格資料
    totalEnrollments.value = res.data.total || 0; // 更新總筆數
  } catch (err) {
    ElMessage.error("無法取得報名紀錄列表");
    console.error(err);
    enrollments.value = [];
    totalEnrollments.value = 0;
  } finally {
    loading.value = false;
  }
};

// 主表格的分頁和篩選事件處理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchAllEnrollments();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchAllEnrollments();
};

const handleFilterChange = (filters) => {
  const selectedStatuses = filters.status;

  if (selectedStatuses && selectedStatuses.length > 0) {
    filterStatus.value = selectedStatuses[0];
  } else {
    filterStatus.value = null;
  }

  currentPage.value = 1; // 篩選改變時回到第一頁
  fetchAllEnrollments();
};

// 主表格的操作：更新狀態
const handleStatusChange = async (row, newStatus) => {
  try {
    await axios.put(`/api/enrollments/${row.id}`, {
      status: newStatus,
    });
    ElMessage.success("狀態已更新");
    // 直接更新前端數據，觸發畫面刷新
    row.status = newStatus;
    // 如果狀態更新後可能導致該行不再符合當前篩選條件，可以考慮刷新當前頁數據
    // fetchAllEnrollments(); // 根據需要決定是否需要刷新
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "更新失敗，請稍後再試";
    ElMessage.error("更新失敗：" + errorMessage);
    console.error("更新狀態失敗", err);
  }
};

// --- 搜尋表格的數據獲取和處理 ---

// 依報名編號查詢
const searchEnrollmentById = async () => {
  if (searchById.id === null || searchById.id === "") {
    ElMessage.warning("請輸入報名編號");
    searchById.enrollment = null;
    searchById.performed = true; // 即使未輸入也標記為已執行，顯示提示
    return;
  }
  loading.value = true;
  searchById.enrollment = null; // 清空上次結果
  searchById.performed = true; // 標記已執行
  try {
    // 假設後端 API 為 GET /api/enrollments/search/by-id/{id}
    const res = await axios.get(
      `/api/enrollments/search/by-id/${searchById.id}`
    );
    searchById.enrollment = res.data; // 假設成功返回的是單一報名紀錄物件
    ElMessage.success("查詢成功");
  } catch (err) {
    searchById.enrollment = null; // 查詢失敗或未找到，清空結果
    // 處理 404 Not Found 錯誤
    if (
      axios.isAxiosError(err) &&
      err.response &&
      err.response.status === 404
    ) {
      ElMessage.info(`沒有找到報名編號 ${searchById.id} 的紀錄`);
    } else {
      const errorMessage =
        err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
      ElMessage.error("查詢失敗：" + errorMessage);
      console.error("查詢報名紀錄失敗", err);
    }
  } finally {
    loading.value = false;
  }
};

// 依課程編號查詢
const searchEnrollmentByCourseId = async () => {
  if (searchByCourseId.courseId === null || searchByCourseId.courseId === "") {
    ElMessage.warning("請輸入課程編號");
    searchByCourseId.enrollments = [];
    searchByCourseId.performed = true;
    return;
  }
  loading.value = true;
  searchByCourseId.enrollments = []; // 清空上次結果
  searchByCourseId.performed = true;
  try {
    // 後端 API 為 GET /api/enrollments/courses/{courseId}
    const res = await axios.get(
      `/api/enrollments/courses/${searchByCourseId.courseId}`
    );
    searchByCourseId.enrollments = res.data; // 假設成功返回的是報名紀錄陣列
    ElMessage.success(`查詢到 ${res.data.length} 筆紀錄`);
  } catch (err) {
    searchByCourseId.enrollments = [];
    const errorMessage =
      err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
    ElMessage.error("查詢失敗：" + errorMessage);
    console.error("依課程編號查詢報名紀錄失敗", err);
  } finally {
    loading.value = false;
  }
};

// 依會員編號查詢
const searchEnrollmentByUserId = async () => {
  if (searchByUserId.userId === null || searchByUserId.userId === "") {
    ElMessage.warning("請輸入會員編號");
    searchByUserId.enrollments = [];
    searchByUserId.performed = true;
    return;
  }
  loading.value = true;
  searchByUserId.enrollments = []; // 清空上次結果
  searchByUserId.performed = true;
  try {
    // 後端 API 為 GET /api/enrollments/users/{userId}
    const res = await axios.get(
      `/api/enrollments/users/${searchByUserId.userId}`
    );
    searchByUserId.enrollments = res.data; // 假設成功返回的是報名紀錄陣列
    ElMessage.success(`查詢到 ${res.data.length} 筆紀錄`);
  } catch (err) {
    searchByUserId.enrollments = [];
    const errorMessage =
      err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
    ElMessage.error("查詢失敗：" + errorMessage);
    console.error("依會員編號查詢報名紀錄失敗", err);
  } finally {
    loading.value = false;
  }
};

// 依會員名稱查詢
const searchEnrollmentByUserName = async () => {
  if (
    searchByUserName.userName === null ||
    searchByUserName.userName.trim() === ""
  ) {
    ElMessage.warning("請輸入會員名稱");
    searchByUserName.enrollments = [];
    searchByUserName.performed = true;
    return;
  }
  loading.value = true;
  searchByUserName.enrollments = []; // 清空上次結果
  searchByUserName.performed = true;
  try {
    // 後端 API 為 GET /api/enrollments/search/by-user-name?name={userName}
    const res = await axios.get(`/api/enrollments/search/by-user-name`, {
      params: { name: searchByUserName.userName },
    });
    searchByUserName.enrollments = res.data; // 假設成功返回的是報名紀錄陣列
    ElMessage.success(`查詢到 ${res.data.length} 筆紀錄`);
  } catch (err) {
    searchByUserName.enrollments = [];
    const errorMessage =
      err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
    ElMessage.error("查詢失敗：" + errorMessage);
    console.error("依會員名稱查詢報名紀錄失敗", err);
  } finally {
    loading.value = false;
  }
};

// 搜尋結果表格中的操作：更新狀態
// 這裡需要根據當前是哪種查詢模式，在更新成功後重新執行對應的查詢，以確保搜尋結果的數據一致性
const handleStatusChangeInSearch = async (row, newStatus, searchType) => {
  try {
    await axios.put(`/api/enrollments/${row.id}`, {
      status: newStatus,
    });
    ElMessage.success("狀態已更新");
    // 更新成功後，重新獲取當前搜尋模式下的數據
    if (searchType === "byId") await searchEnrollmentById();
    else if (searchType === "byCourseId") await searchEnrollmentByCourseId();
    else if (searchType === "byUserId") await searchEnrollmentByUserId();
    else if (searchType === "byUserName") await searchEnrollmentByUserName();
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "更新失敗，請稍後再試";
    ElMessage.error("更新失敗：" + errorMessage);
    console.error("搜尋結果中更新狀態失敗", err);
  }
};

// 根據狀態返回 el-tag 的 type 屬性
const getStatusTagType = (status) => {
  switch (status) {
    case "已報名":
      return "success";
    case "已取消":
      return "info";
    case "候補中":
      return "warning";
    case "未到場":
      return "danger";
    case "已完成":
      return "primary";
    default:
      return "info";
  }
};

// 輔助函數：格式化報名時間
const formatEnrollmentTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  // 嘗試解析 ISO 8601 格式的日期時間字串
  const date = new Date(dateTimeString);
  if (isNaN(date)) {
    // 如果解析失敗，可能是其他格式，或者無效日期
    console.error("無法解析日期時間字串:", dateTimeString);
    return dateTimeString; // 返回原始字串或顯示錯誤
  }
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // 月份從 0 開始
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// *** 新增: 會員體驗預約紀錄彈窗相關狀態 ***
const showTrialBookingsDialog = ref(false); // 控制彈窗顯示 (使用新的狀態名稱)
const memberTrialBookings = ref([]); // 儲存獲取的會員體驗預約紀錄列表
const loadingTrialBookings = ref(false); // *** 新增: 載入體驗預約紀錄的 loading 狀態 ***
// *** 新增狀態結束 ***

// *** 新增: 獲取會員體驗預約紀錄的方法 ***
const fetchMemberTrialBookings = async (userId) => {
  if (!userId) {
    memberTrialBookings.value = [];
    console.warn("嘗試獲取會員體驗預約紀錄但 userId 為空。");
    return;
  }
  loadingTrialBookings.value = true; // 開始載入
  try {
    // *** 呼叫後端獲取特定使用者體驗預約紀錄的 API ***
    // 根據您「預約紀錄管理」頁面的後端 API 設計，可能是 GET /api/trial-bookings/user/{userId}
    const res = await axios.get(`/api/trial-bookings/user/${userId}`);
    // 假設後端回傳的是體驗預約紀錄列表
    memberTrialBookings.value = res.data; // <--- 請根據您的後端 API 調整這裡
    console.log(
      `成功獲取使用者 ID ${userId} 的體驗預約紀錄`,
      memberTrialBookings.value
    );
  } catch (err) {
    memberTrialBookings.value = [];
    const errorMessage =
      err.response?.data?.message || err.message || "無法載入會員預約紀錄";
    ElMessage.error("載入會員預約紀錄失敗：" + errorMessage);
    console.error("載入會員預約紀錄失敗", err);
  } finally {
    loadingTrialBookings.value = false; // 結束載入
  }
};
// *** 新增結束 ***

// *** 新增: 處理點擊「預約紀錄」按鈕的操作 ***
const handleViewMemberTrialBookings = async (row) => {
  // 清空舊的體驗預約紀錄列表
  memberTrialBookings.value = [];

  // 根據當前報名記錄的 userId 獲取會員體驗預約紀錄
  if (row.userId) {
    await fetchMemberTrialBookings(row.userId);
  } else {
    console.warn("點擊查看會員預約紀錄，但該行報名紀錄無 userId。", row);
  }

  // 顯示彈窗
  showTrialBookingsDialog.value = true; // 使用控制彈窗顯示的狀態
};
// *** 新增結束 ***

// *** 新增: 關閉會員體驗預約紀錄彈窗並清空資料 ***
const closeTrialBookingsDialog = () => {
  // 使用新的關閉方法名稱
  showTrialBookingsDialog.value = false;
  memberTrialBookings.value = []; // 清空會員體驗預約紀錄列表
};
// *** 新增結束 ***

// 元件掛載時獲取初始數據
onMounted(() => {
  fetchAllEnrollments();
});
</script>

<style scoped>
h2 {
  margin-bottom: 20px;
}
.admin-enrollment-management {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.page-title {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: left;
  color: #333;
}

.automation-note {
  display: flex;
  align-items: center;
  margin-top: -10px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #666;
}

.automation-note .el-icon {
  margin-right: 5px;
  font-size: 16px;
  color: #409eff;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.search-input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input-group .el-input {
  flex-grow: 1;
  max-width: 300px;
}

.search-no-results,
.search-initial-hint {
  text-align: center;
  color: #666;
  margin-top: 10px;
}

.check-full-result {
  margin-top: 10px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 添加這段 CSS 來放大 el-tag 的文字 */
.admin-enrollment-management :deep(.el-table__cell .el-tag) {
  font-size: 14px;
}

.member-info-icon {
  font-size: 15px;
  color: #789dfd;
  vertical-align: middle;
  margin-left: 5px; /* 如果需要，將 margin 也移到 CSS */
  margin-bottom: 3px; /* 如果需要，將 margin 也移到 CSS */
}
/* 如果需要，還可以為按鈕本身添加樣式 */
.member-info-button {
  padding: 0;
  height: auto;
}
</style>
