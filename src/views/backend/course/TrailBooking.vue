<template>
  <div class="admin-trial-booking-management-page">
    <h2 class="page-title">預約紀錄管理</h2>
    <p class="automation-note">
      <el-icon><InfoFilled /></el-icon>
      每天凌晨 2 點 05
      分更新，將狀態為「已預約」，且發生時間已過的記錄標記為「未到場」。
    </p>

    <div class="action-buttons">
      <el-button
        @click="
          activeSearch = null;
          resetSearchStates();
          currentPage = 1;
          fetchAllCourseBookings();
        "
        :type="activeSearch === null ? 'primary' : ''"
        >全部預約紀錄</el-button
      >
      <el-button
        @click="
          activeSearch = 'byId';
          resetSearchStates();
          if (bookingTableRef) bookingTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byId' ? 'primary' : ''"
        >依預約編號查詢</el-button
      >
      <el-button
        @click="
          activeSearch = 'byCourseId';
          resetSearchStates();
          if (bookingTableRef) bookingTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byCourseId' ? 'primary' : ''"
        >依課程編號查詢</el-button
      >
      <el-button
        @click="
          activeSearch = 'byUserId';
          resetSearchStates();
          if (bookingTableRef) bookingTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byUserId' ? 'primary' : ''"
        >依會員編號查詢</el-button
      >
      <el-button
        @click="
          activeSearch = 'byUserName';
          resetSearchStates();
          if (bookingTableRef) bookingTableRef.clearFilter();
          filterStatus = null;
        "
        :type="activeSearch === 'byUserName' ? 'primary' : ''"
        >依會員名稱查詢</el-button
      >
    </div>

    <section v-if="activeSearch !== null" class="search-input-area">
      <div v-if="activeSearch === 'byId'" class="search-input-group">
        <el-input
          v-model="searchById.id"
          placeholder="請輸入預約編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="searchBookingById"
        />
        <el-button type="primary" @click="searchBookingById">查詢</el-button>
      </div>

      <div v-if="activeSearch === 'byCourseId'" class="search-input-group">
        <el-input
          v-model="searchByCourseId.courseId"
          placeholder="請輸入課程編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="searchBookingByCourseId"
        />
        <el-button type="primary" @click="searchBookingByCourseId"
          >查詢</el-button
        >
      </div>

      <div v-if="activeSearch === 'byUserId'" class="search-input-group">
        <el-input
          v-model="searchByUserId.userId"
          placeholder="請輸入會員編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="searchBookingByUserId"
        />
        <el-button type="primary" @click="searchBookingByUserId"
          >查詢</el-button
        >
      </div>

      <div v-if="activeSearch === 'byUserName'" class="search-input-group">
        <el-input
          v-model="searchByUserName.userName"
          placeholder="請輸入會員名稱"
          clearable
          style="width: 200px"
          @keyup.enter="searchBookingByUserName"
        />
        <el-button type="primary" @click="searchBookingByUserName"
          >查詢</el-button
        >
      </div>
    </section>

    <section v-if="activeSearch === 'byId'" class="search-section">
      <el-table
        :data="searchById.booking ? [searchById.booking] : []"
        style="width: 100%"
        v-if="searchById.performed && searchById.booking"
        border
      >
        <el-table-column prop="id" label="預約編號" width="81" />
        <el-table-column label="預約者類型" width="120">
          <template #default="scope">
            <span
              @click="handleViewBookerDetails(scope.row)"
              style="cursor: pointer"
            >
              <el-tag
                :type="isTrueMember(scope.row.userId) ? 'success' : 'info'"
                size="large"
              >
                {{ isTrueMember(scope.row.userId) ? "會員" : "非會員" }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingName" label="報名姓名" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="bookingTime" label="預約排定時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookedAt" label="預約建立時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingStatus" label="預約狀態  " width="120">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.bookingStatus)"
              size="large"
            >
              {{ scope.row.bookingStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.bookingStatus"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byId')
              "
              style="width: 100%"
            >
              <el-option label="已預約" value="已預約" />
              <el-option label="已取消" value="已取消" />
              <el-option label="已完成" value="已完成" />
              <el-option label="未到場" value="未到場" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="searchById.performed && !searchById.booking"
        class="search-no-results"
      >
        沒有找到該預約編號的紀錄。
      </p>
      <p v-else-if="!searchById.performed" class="search-initial-hint">
        請輸入預約編號進行查詢。
      </p>
    </section>

    <section v-if="activeSearch === 'byCourseId'" class="search-section">
      <el-table
        :data="searchByCourseId.bookings"
        style="width: 100%"
        v-if="
          searchByCourseId.performed && searchByCourseId.bookings.length > 0
        "
        border
      >
        <el-table-column prop="id" label="預約編號" width="81" />
        <el-table-column label="預約者類型" width="120">
          <template #default="scope">
            <span
              @click="handleViewBookerDetails(scope.row)"
              style="cursor: pointer"
            >
              <el-tag
                :type="isTrueMember(scope.row.userId) ? 'success' : 'info'"
                size="large"
              >
                {{ isTrueMember(scope.row.userId) ? "會員" : "非會員" }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingName" label="報名姓名" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="bookingTime" label="預約排定時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookedAt" label="預約建立時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingStatus" label="預約狀態  " width="120">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.bookingStatus)"
              size="large"
            >
              {{ scope.row.bookingStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.bookingStatus"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byCourseId')
              "
              style="width: 100%"
            >
              <el-option label="已預約" value="已預約" />
              <el-option label="已取消" value="已取消" />
              <el-option label="已完成" value="已完成" />
              <el-option label="未到場" value="未到場" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="
          searchByCourseId.performed && searchByCourseId.bookings.length === 0
        "
        class="search-no-results"
      >
        沒有找到該課程編號的預約紀錄。
      </p>
      <p v-else-if="!searchByCourseId.performed" class="search-initial-hint">
        請輸入課程編號進行查詢。
      </p>
    </section>

    <section v-if="activeSearch === 'byUserId'" class="search-section">
      <el-table
        :data="searchByUserId.bookings"
        style="width: 100%"
        v-if="searchByUserId.performed && searchByUserId.bookings.length > 0"
        border
      >
        <el-table-column prop="id" label="預約編號" width="81" />
        <el-table-column label="預約者類型" width="120">
          <template #default="scope">
            <span
              @click="handleViewBookerDetails(scope.row)"
              style="cursor: pointer"
            >
              <el-tag
                :type="isTrueMember(scope.row.userId) ? 'success' : 'info'"
                size="large"
              >
                {{ isTrueMember(scope.row.userId) ? "會員" : "非會員" }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingName" label="報名姓名" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="bookingTime" label="預約排定時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookedAt" label="預約建立時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingStatus" label="預約狀態  " width="120">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.bookingStatus)"
              size="large"
            >
              {{ scope.row.bookingStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.bookingStatus"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byUserId')
              "
              style="width: 100%"
            >
              <el-option label="已預約" value="已預約" />
              <el-option label="已取消" value="已取消" />
              <el-option label="已完成" value="已完成" />
              <el-option label="未到場" value="未到場" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="
          searchByUserId.performed && searchByUserId.bookings.length === 0
        "
        class="search-no-results"
      >
        沒有找到該會員編號的預約紀錄。
      </p>
      <p v-else-if="!searchByUserId.performed" class="search-initial-hint">
        請輸入會員編號進行查詢。
      </p>
    </section>

    <section v-if="activeSearch === 'byUserName'" class="search-section">
      <el-table
        :data="searchByUserName.bookings"
        style="width: 100%"
        v-if="
          searchByUserName.performed && searchByUserName.bookings.length > 0
        "
        border
      >
        <el-table-column prop="id" label="預約編號" width="81" />
        <el-table-column label="預約者類型" width="120">
          <template #default="scope">
            <span
              @click="handleViewBookerDetails(scope.row)"
              style="cursor: pointer"
            >
              <el-tag
                :type="isTrueMember(scope.row.userId) ? 'success' : 'info'"
                size="large"
              >
                {{ isTrueMember(scope.row.userId) ? "會員" : "非會員" }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingName" label="報名姓名" />
        <el-table-column prop="courseId" label="課程編號" width="81" />
        <el-table-column prop="courseName" label="課程名稱" />
        <el-table-column prop="bookingTime" label="預約排定時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookedAt" label="預約建立時間" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.bookedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="bookingStatus" label="預約狀態  " width="120">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.bookingStatus)"
              size="large"
            >
              {{ scope.row.bookingStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-select
              :model-value="scope.row.bookingStatus"
              placeholder="更新狀態"
              @change="
                (newStatus) =>
                  handleStatusChangeInSearch(scope.row, newStatus, 'byUserName')
              "
              style="width: 100%"
            >
              <el-option label="已預約" value="已預約" />
              <el-option label="已取消" value="已取消" />
              <el-option label="已完成" value="已完成" />
              <el-option label="未到場" value="未到場" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="
          searchByUserName.performed && searchByUserName.bookings.length === 0
        "
        class="search-no-results"
      >
        沒有找到該會員名稱的預約紀錄。
      </p>
      <p v-else-if="!searchByUserName.performed" class="search-initial-hint">
        請輸入會員名稱進行查詢。
      </p>
    </section>

    <el-table
      ref="bookingTableRef"
      :data="bookings"
      style="width: 100%"
      v-if="activeSearch === null"
      v-loading="loading"
      border
      @filter-change="handleFilterChange"
    >
      <el-table-column prop="id" label="預約編號" width="81" />
      <el-table-column label="預約者類型" width="120">
        <template #default="scope">
          <span
            @click="handleViewBookerDetails(scope.row)"
            style="cursor: pointer"
          >
            <el-tag
              :type="isTrueMember(scope.row.userId) ? 'success' : 'info'"
              size="large"
            >
              {{ isTrueMember(scope.row.userId) ? "會員" : "非會員" }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="bookingName" label="報名姓名" />
      <el-table-column prop="courseId" label="課程編號" width="81" />
      <el-table-column prop="courseName" label="課程名稱" />
      <el-table-column prop="bookingTime" label="預約排定時間" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.bookingTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="bookedAt" label="預約建立時間" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.bookedAt) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="bookingStatus"
        label="預約狀態  "
        width="120"
        :filters="statusFilters"
        :filter-multiple="false"
        column-key="bookingStatus"
      >
        <template #default="scope">
          <el-tag
            :type="getStatusTagType(scope.row.bookingStatus)"
            size="large"
          >
            {{ scope.row.bookingStatus }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-select
            :model-value="scope.row.bookingStatus"
            placeholder="更新狀態"
            @change="(newStatus) => handleStatusChange(scope.row, newStatus)"
            style="width: 100%"
          >
            <el-option label="已預約" value="已預約" />
            <el-option label="已取消" value="已取消" />
            <el-option label="已完成" value="已完成" />
            <el-option label="未到場" value="未到場" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="activeSearch === null && totalBookings > 0"
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :total="totalBookings"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="pagination-container"
      :page-sizes="[10, 20, 50, 100]"
    />
    <el-dialog
      v-model="showDetailsDialog"
      title="預約詳細資料"
      width="40%"
      @close="closeDetailsDialog"
    >
      <div v-if="currentBookingDetails">
        <h5>預約資訊</h5>
        <p>
          <strong>預約姓名：</strong> {{ currentBookingDetails.bookingName }}
        </p>
        <p>
          <strong>預約電話：</strong> {{ currentBookingDetails.bookingPhone }}
        </p>
        <p>
          <strong>預約信箱：</strong> {{ currentBookingDetails.bookingEmail }}
        </p>
      </div>
      <p v-else>無法載入預約資訊。</p>
      <el-divider />
      <div v-if="currentMemberDetails">
        <h5>會員資訊</h5>
        <p><strong>會員編號：</strong> {{ currentMemberDetails.id }}</p>
        <p><strong>會員名稱：</strong> {{ currentMemberDetails.name }}</p>
        <p><strong>會員信箱：</strong> {{ currentMemberDetails.email }}</p>
      </div>
      <div
        v-else-if="
          currentBookingDetails &&
          (currentBookingDetails.userId === null ||
            currentBookingDetails.userId === 2)
        "
      >
        <h5>會員資訊</h5>
        <p>非會員預約，無會員詳細資料。</p>
      </div>
      <div
        v-if="
          currentBookingDetails && isTrueMember(currentBookingDetails.userId)
        "
      >
        <el-divider />
        <h5>會員報名課程紀錄</h5>
        <div v-loading="loadingEnrollments">
          <el-table
            v-if="memberEnrollments.length > 0"
            :data="memberEnrollments"
            style="width: 100%"
            border
          >
            <el-table-column prop="id" label="報名編號" width="90" />
            <el-table-column prop="courseName" label="課程名稱" />
            <el-table-column prop="enrollmentTime" label="報名時間" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.enrollmentTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="報名狀態" width="100">
              <template #default="scope">
                <el-tag
                  :type="getStatusTagType(scope.row.status)"
                  size="default"
                  >{{ scope.row.status }}</el-tag
                >
              </template>
            </el-table-column>
          </el-table>
          <p
            v-else-if="!loadingEnrollments && memberEnrollments.length === 0"
            style="text-align: left; color: #666; margin-top: 10px"
          >
            該會員無課程報名記錄。
          </p>
        </div>
      </div>
      <div
        v-else-if="
          currentBookingDetails && !isTrueMember(currentBookingDetails.userId)
        "
      >
        <el-divider />
        <h5>會員報名課程紀錄</h5>
        <p style="text-align: left; color: #666; margin-top: 10px">
          非會員預約，無相關報名課程紀錄可顯示。
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDetailsDialog">關閉</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { ElMessage, ElIcon, ElDivider } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";

// 主要數據狀態
const bookings = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalBookings = ref(0);
const filterStatus = ref(null);
const bookingTableRef = ref(null);

// 搜尋相關狀態
const activeSearch = ref(null);
const searchById = reactive({ id: null, booking: null, performed: false });
const searchByCourseId = reactive({
  courseId: null,
  bookings: [],
  performed: false,
});
const searchByUserId = reactive({
  userId: null,
  bookings: [],
  performed: false,
});
const searchByUserName = reactive({
  userName: "",
  bookings: [],
  performed: false,
});

// 狀態篩選選項
const statusFilters = [
  { text: "已預約", value: "已預約" },
  { text: "已取消", value: "已取消" },
  { text: "已完成", value: "已完成" },
  { text: "未到場", value: "未到場" },
];

// 重置所有搜尋相關狀態
const resetSearchStates = () => {
  searchById.id = null;
  searchById.booking = null;
  searchById.performed = false;
  searchByCourseId.courseId = null;
  searchByCourseId.bookings = [];
  searchByCourseId.performed = false;
  searchByUserId.userId = null;
  searchByUserId.bookings = [];
  searchByUserId.performed = false;
  searchByUserName.userName = "";
  searchByUserName.bookings = [];
  searchByUserName.performed = false;
};

// --- 主要表格 (全部紀錄) 的數據獲取和處理 ---
const fetchAllCourseBookings = async () => {
  loading.value = true;
  try {
    const params = { page: currentPage.value - 1, pageSize: pageSize.value };
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    const res = await axios.get("/api/trial-bookings", { params: params });
    bookings.value = res.data.content || [];
    totalBookings.value = res.data.totalElements || 0;
  } catch (err) {
    ElMessage.error("無法取得體驗預約紀錄列表");
    console.error(err);
    bookings.value = [];
    totalBookings.value = 0;
  } finally {
    loading.value = false;
  }
};

// 主表格的分頁和篩選事件處理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchAllCourseBookings();
};
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchAllCourseBookings();
};
const handleFilterChange = (filters) => {
  const selectedStatuses = filters.bookingStatus;
  if (selectedStatuses && selectedStatuses.length > 0) {
    filterStatus.value = selectedStatuses[0];
  } else {
    filterStatus.value = null;
  }
  currentPage.value = 1;
  fetchAllCourseBookings();
};

// 主表格的操作：更新狀態
const handleStatusChange = async (row, newStatus) => {
  try {
    await axios.put(`/api/trial-bookings/${row.id}/status`, {
      status: newStatus,
    });
    ElMessage.success("狀態已更新");
    row.bookingStatus = newStatus;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "更新失敗，請稍後再試";
    ElMessage.error("更新失敗：" + errorMessage);
    console.error("更新狀態失敗", err);
  }
};

// --- 搜尋表格的數據獲取和處理 ---
// 依預約編號查詢
const searchBookingById = async () => {
  if (searchById.id === null || searchById.id === "") {
    ElMessage.warning("請輸入預約編號");
    searchById.booking = null;
    searchById.performed = true;
    return;
  }
  loading.value = true;
  searchById.booking = null;
  searchById.performed = true;
  try {
    const res = await axios.get(`/api/trial-bookings/${searchById.id}`);
    searchById.booking = res.data;
    ElMessage.success("查詢成功");
  } catch (err) {
    searchById.booking = null;
    if (
      axios.isAxiosError(err) &&
      err.response &&
      err.response.status === 404
    ) {
      ElMessage.info(`沒有找到預約編號 ${searchById.id} 的紀錄`);
    } else {
      const errorMessage =
        err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
      ElMessage.error("查詢失敗：" + errorMessage);
      console.error("查詢預約紀錄失敗", err);
    }
  } finally {
    loading.value = false;
  }
};
// 依課程編號查詢
const searchBookingByCourseId = async () => {
  // 請注意：這裡的 searchLoading, searchError, searchNoResults, searchInitialHint, activeSearch, searchCourseId, searchedBookings, totalSearchCount 未在此提供的程式碼片段中聲明。
  // 您需要確保它們已經在 <script setup> 頂層聲明。
  // 同時，您還需要確保searchLoading等變數與您其他搜尋方法使用的 loading 狀態邏輯一致。
  // 為了簡潔，這裡只包含邏輯部分，請將這些變數聲明加回您的完整程式碼中。
  // activeSearch = "byCourseId"; // 這行也需要處理，因為 activeSearch 是 ref，不能直接賦值
  // activeSearch.value = "byCourseId"; // 應該是這樣

  // 這裡引用了一些未在提供的代碼塊中定義的變數和邏輯，請確保它們存在並正確使用。
  // 例如 searchLoading, searchError, searchNoResults, searchInitialHint, activeSearch, searchCourseId, searchedBookings, totalSearchCount

  // 以下是根據您提供的代碼片段進行修改的searchBookingByCourseId方法
  // 請確保您在其他地方正確聲明並初始化了上述未聲明的變量

  // 為了兼容性，暫時使用 loading.value 作為 loading 狀態，並假設 searchCourseId 是 ref
  // 假設 searchCourseId 已經定義為 ref(null)
  // const searchCourseId = ref(null); // 示例聲明

  if (searchByCourseId.courseId === null || searchByCourseId.courseId === "") {
    ElMessage.warning("請輸入課程編號");
    searchByCourseId.bookings = [];
    searchByCourseId.performed = true;
    return;
  }
  loading.value = true; // 使用 loading.value
  searchByCourseId.bookings = [];
  searchByCourseId.performed = true;
  try {
    const res = await axios.get(
      `/api/trial-bookings/course/${searchByCourseId.courseId}`
    );
    searchByCourseId.bookings = res.data;
    ElMessage.success(`查詢到 ${res.data.length} 筆紀錄`);
  } catch (err) {
    searchByCourseId.bookings = [];
    // 檢查是否為 404 錯誤
    if (
      axios.isAxiosError(err) &&
      err.response &&
      err.response.status === 404
    ) {
      // *** 顯示「查無此課程編號」的明確訊息 ***
      ElMessage.error("查詢失敗：查無此課程編號"); // 直接使用 ElMessage 顯示
    } else {
      const errorMessage =
        err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
      ElMessage.error("查詢失敗：" + errorMessage);
      console.error("依課程編號查詢預約紀錄失敗", err);
    }
  } finally {
    loading.value = false; // 使用 loading.value
  }
};

// 依會員編號查詢
const searchBookingByUserId = async () => {
  if (searchByUserId.userId === null || searchByUserId.userId === "") {
    ElMessage.warning("請輸入會員編號");
    searchByUserId.bookings = [];
    searchByUserId.performed = true;
    return;
  }
  loading.value = true;
  searchByUserId.bookings = [];
  searchByUserId.performed = true;
  try {
    const res = await axios.get(
      `/api/trial-bookings/user/${searchByUserId.userId}`
    );
    searchByUserId.bookings = res.data;
    ElMessage.success(`查詢到 ${res.data.length} 筆紀錄`);
  } catch (err) {
    searchByUserId.bookings = [];
    const errorMessage =
      err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
    ElMessage.error("查詢失敗：" + errorMessage);
    console.error("依會員編號查詢預約紀錄失敗", err);
  } finally {
    loading.value = false;
  }
};
// 依會員名稱查詢
const searchBookingByUserName = async () => {
  if (
    searchByUserName.userName === null ||
    searchByUserName.userName.trim() === ""
  ) {
    ElMessage.warning("請輸入會員名稱");
    searchByUserName.bookings = [];
    searchByUserName.performed = true;
    return;
  }
  loading.value = true;
  searchByUserName.bookings = [];
  searchByUserName.performed = true;
  try {
    const res = await axios.get(`/api/trial-bookings/search/by-user-name`, {
      params: { name: searchByUserName.userName },
    });
    searchByUserName.bookings = res.data;
    ElMessage.success(`查詢到 ${res.data.length} 筆紀錄`);
  } catch (err) {
    searchByUserName.bookings = [];
    const errorMessage =
      err.response?.data?.message || err.message || "查詢失敗，請稍後再試";
    ElMessage.error("查詢失敗：" + errorMessage);
    console.error("依會員名稱查詢預約紀錄失敗", err);
  } finally {
    loading.value = false;
  }
};
// 搜尋結果表格中的操作：更新狀態
const handleStatusChangeInSearch = async (row, newStatus, searchType) => {
  try {
    await axios.put(`/api/trial-bookings/${row.id}/status`, {
      status: newStatus,
    });
    ElMessage.success("狀態已更新");
    if (searchType === "byId") await searchBookingById();
    else if (searchType === "byCourseId") await searchBookingByCourseId();
    else if (searchType === "byUserId") await searchBookingByUserId();
    else if (searchType === "byUserName") await searchBookingByUserName();
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
    case "已預約":
      return "success";
    case "已取消":
      return "info";
    case "已完成":
      return "primary";
    case "未到場":
      return "danger";
    default:
      return "info";
  }
};
// 輔助函數：格式化日期時間
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  if (isNaN(date)) {
    console.error("無法解析日期時間字串:", dateTimeString);
    return dateTimeString;
  }
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// *** 詳細資料彈窗相關狀態和方法 ***
const showDetailsDialog = ref(false);
const currentBookingDetails = ref(null); // 儲存點擊行的完整數據
const currentMemberDetails = ref(null); // 儲存獲取的會員詳細資料
const memberEnrollments = ref([]); // *** 新增: 儲存獲取的會員報名紀錄列表 ***
const loadingEnrollments = ref(false); // *** 新增: 載入報名紀錄的 loading 狀態 ***

// 判斷是否為「真」會員 (userId 非 null 且非 2)
const isTrueMember = (userId) => {
  // 假設 guest user ID 為 2
  return userId !== null && userId !== 2;
};

// 獲取會員詳細資料的方法
const fetchMemberDetails = async (userId) => {
  if (!isTrueMember(userId)) {
    currentMemberDetails.value = null;
    console.warn("嘗試獲取會員詳細資料但 userId 無效或為 Guest ID。");
    return;
  }
  try {
    const res = await axios.get(`/api/users/${userId}`); // <-- 請確認這裡的 API 端點是否正確
    currentMemberDetails.value = res.data.data; // 假設後端返回會員資料物件
  } catch (err) {
    currentMemberDetails.value = null;
    const errorMessage =
      err.response?.data?.message || err.message || "無法載入會員資料";
    ElMessage.error("載入會員資料失敗：" + errorMessage);
    console.error("載入會員資料失敗", err);
  }
};

// *** 獲取會員常規課程報名記錄的方法 ***
const fetchMemberEnrollments = async (userId) => {
  if (!userId) {
    memberEnrollments.value = [];
    console.warn("嘗試獲取會員報名紀錄但 userId 為空。");
    return;
  }
  loadingEnrollments.value = true; // 開始載入
  try {
    // *** 呼叫後端獲取特定使用者常規課程報名記錄的 API ***
    // 根據您「報名紀錄管理」頁面的後端 API 設計，可能是 GET /api/enrollments/users/{userId}
    const res = await axios.get(`/api/enrollments/users/${userId}`); // <-- 請確認您的報名 API 路徑 // 假設後端回傳的是報名紀錄列表
    memberEnrollments.value = res.data; // <--- 請根據您的後端 API 調整這裡
    console.log(
      `成功獲取使用者 ID ${userId} 的報名紀錄`,
      memberEnrollments.value
    );
  } catch (err) {
    memberEnrollments.value = [];
    const errorMessage =
      err.response?.data?.message || err.message || "無法載入會員報名紀錄";
    ElMessage.error("載入會員報名紀錄失敗：" + errorMessage);
    console.error("載入會員報名紀錄失敗", err);
  } finally {
    loadingEnrollments.value = false; // 結束載入
  }
};
// *** 新增結束 ***

// 處理點擊「預約者類型」的操作，顯示彈窗並載入資料
const handleViewBookerDetails = async (row) => {
  // 1. 儲存點擊的預約記錄詳細資訊
  currentBookingDetails.value = row; // 2. 清空舊的會員資料和報名紀錄列表

  currentMemberDetails.value = null;
  memberEnrollments.value = []; // 3. 判斷是否為「真」會員

  if (isTrueMember(row.userId)) {
    console.log(
      `預約 ID ${row.id} 由會員 ${row.userId} 創建。獲取會員詳細資料及報名紀錄...`
    );
    await fetchMemberDetails(row.userId); // 獲取會員詳細資料
    await fetchMemberEnrollments(row.userId); // 獲取會員報名紀錄
  } else {
    console.log(
      `預約 ID ${row.id} 由非會員創建。顯示聯絡資訊，無會員及報名紀錄。`
    ); // 非會員，不需要呼叫會員相關 API，確保清空狀態 (已在前面完成) // 彈窗模板會根據 currentBookingDetails 和 currentMemberDetails 的狀態顯示對應區塊
    // 可選：給使用者提示非會員無會員及報名紀錄
    // ElMessage.info("此預約為非會員預約，無會員及報名紀錄可顯示。");
    // return; // 如果是非會員，也可以選擇不打開彈窗，根據需求決定
  } // 4. 顯示詳細資料彈窗

  showDetailsDialog.value = true;
};

// 關閉詳細資料彈窗並清空資料
const closeDetailsDialog = () => {
  showDetailsDialog.value = false;
  currentBookingDetails.value = null; // 清空預約詳細資料狀態
  currentMemberDetails.value = null; // 清空會員詳細資料狀態
  memberEnrollments.value = []; // 清空會員報名紀錄列表
};

// 元件掛載時獲取初始數據
onMounted(() => {
  fetchAllCourseBookings();
});
</script>

<style scoped>
/* 修改 CSS class name */
.admin-trial-booking-management-page {
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

/* 共用搜尋輸入框區塊的樣式 */
.search-input-area {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.search-section {
  /* 原來的搜尋區塊，現在主要包含表格和提示 */
  margin-bottom: 20px;
  padding: 15px; /* 移除或減少 padding，因為輸入框已經移走了 */
  border: 1px solid #ddd; /* 移除或減少 border */
  border-radius: 5px;
  background-color: #f9f9f9; /* 移除或修改背景色 */
}

.search-input-group {
  display: flex;
  align-items: center;
  margin-bottom: 0; /* 輸入框組在共用區塊內，底部邊距可能不需要 */
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

/* 放大 el-tag 的文字 */
.admin-trial-booking-management-page :deep(.el-table__cell .el-tag) {
  font-size: 14px;
}

/* 可以為會員按鈕添加樣式 */
.admin-trial-booking-management-page :deep(.el-table__cell .el-button--text) {
  padding: 0;
  height: auto;
  font-size: 14px;
  vertical-align: middle;
}

/* 為會員類型的文字按鈕添加樣式，讓它看起來更像可點擊 */
.admin-trial-booking-management-page
  :deep(.el-table__cell .el-button.is-member) {
  color: #409eff; /* Element Plus primary color */
  cursor: pointer;
}
/* 非會員類型雖然點擊也能彈窗，但可能不需要特別的顏色，只改變鼠標樣式 */
.admin-trial-booking-management-page
  :deep(.el-table__cell .el-button:not(.is-member)) {
  cursor: pointer;
}
</style>
