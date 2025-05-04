<template>
  <div class="admin-course-management">
    <h2 class="page-title">課程管理</h2>

    <div class="action-buttons">
      <el-button
        @click="
          activeSearch = null;
          showCreateForm = false;
          editingCourseId = null;
          currentPage = 1; // 重置到第一頁
          resetSearchStates(); // 重置所有搜尋狀態
          clearTableFilter(); // 清除表格篩選
          fetchCourses(); // 獲取全部課程 (Action 將使用 Store 的分頁和篩選狀態)
        "
        :type="
          activeSearch === null && !showCreateForm && !editingCourseId // isFiltering 變數未找到定義，暫時移除
            ? 'primary'
            : ''
        "
        >全部課程
      </el-button>

      <el-button
        @click="
          activeSearch = 'byId';
          showCreateForm = false;
          editingCourseId = null;
          // 切換查詢模式時，不應自動觸發依 ID 查詢，只需重置狀態
          resetSearchStates(); // 切換查詢模式時清空其他搜尋狀態
          clearTableFilter(); // 清除表格篩選
        "
        :type="activeSearch === 'byId' ? 'primary' : ''"
        >依課程編號查詢</el-button
      >
      <el-button
        @click="
          activeSearch = 'byName';
          showCreateForm = false;
          editingCourseId = null;
          resetSearchStates(); // 切換查詢模式時清空其他搜尋狀態
          clearTableFilter(); // 清除表格篩選
        "
        :type="activeSearch === 'byName' ? 'primary' : ''"
        >依課程名稱查詢</el-button
      >
      <el-button
        @click="
          activeSearch = 'byCoachId';
          showCreateForm = false;
          editingCourseId = null;
          resetSearchStates(); // 切換查詢模式時清空其他搜尋狀態
          clearTableFilter(); // 清除表格篩選
        "
        :type="activeSearch === 'byCoachId' ? 'primary' : ''"
        >依教練編號查詢</el-button
      >
      <el-button
        @click="
          activeSearch = 'byCoachName';
          showCreateForm = false;
          editingCourseId = null;
          resetSearchStates(); // 切換查詢模式時清空其他搜尋狀態
          clearTableFilter(); // 清除表格篩選
        "
        :type="activeSearch === 'byCoachName' ? 'primary' : ''"
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
      class="search-section"
    >
      <div class="search-input-group">
        <el-input
          v-model="searchById.id"
          placeholder="請輸入課程編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="handleSearchById"
        />
        <el-button type="primary" @click="handleSearchById">查詢</el-button>
      </div>
      <el-table
        :data="searchById.course ? [searchById.course] : []"
        style="width: 100%"
        v-if="searchById.course"
        border
      >
        <el-table-column prop="id" label="編號" width="53" />
        <el-table-column prop="name" label="名稱" width="150" />
        <el-table-column prop="description" label="內容" />
        <el-table-column
          label="時間  "
          width="110"
          prop="dayOfWeek"
          :filters="dayOfWeekFilters"
          :filter-method="filterDayOfWeek"
          filter-placement="bottom-end"
          :filter-multiple="false"
          column-key="dayOfWeek"
        >
          <template #default="scope">
            {{ formatDayOfWeek(scope.row.dayOfWeek) }}
            {{ scope.row.startTime ? scope.row.startTime.substring(0, 5) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="時長(分)" width="77" />
        <el-table-column
          prop="coachId"
          label="教練編號"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="coachName"
          label="教練名字"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="statusCombined"
          label="課程狀態 / 人數  "
          width="170"
          :filters="fullnessFilters"
          :filter-method="filterFullnessSimple"
          filter-placement="bottom-start"
          :filter-multiple="false"
          column-key="statusCombined"
        >
          <template #default="scope">
            <div class="combined-fullness-cell">
              <div class="status-line">
                <el-tag
                  :type="
                    scope.row.full
                      ? 'danger' /* 如果額滿，顯示紅色 danger */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.full
                      ? "課程已額滿" /* 如果額滿，顯示已額滿 */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? "課程快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "課程未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.full /* 常規額滿紅色 */,
                    /* 常規超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.full &&
                      scope.row.maxCapacity > 0 &&
                      scope.row.registeredCount / scope.row.maxCapacity >= 0.5,
                  }"
                  >{{ scope.row.registeredCount }} /
                  {{ scope.row.maxCapacity }}</span
                >
              </div>

              <div class="status-line" v-if="scope.row.offersTrialOption">
                <el-tag
                  :type="
                    scope.row.trialFull
                      ? 'danger' /* 如果體驗額滿，顯示紅色 danger */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.trialFull
                      ? "預約已額滿" /* 如果體驗額滿，顯示已額滿 */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? "預約快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "預約未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.trialFull /* 體驗額滿紅色 */,
                    /* 體驗超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.trialFull &&
                      scope.row.maxTrialCapacity > 0 &&
                      scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                        0.5,
                  }"
                  >{{ scope.row.bookedTrialCount }} /
                  {{ scope.row.maxTrialCapacity }}</span
                >
              </div>

              <div class="status-line" v-else>
                <el-tag type="info" class="fullness-tag-small">
                  未提供體驗課程
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="default" @click="openEditForm(scope.row.id)"
              >編輯</el-button
            >
            <el-button
              size="default"
              type="danger"
              @click="handleDelete(scope.row.id)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="searchById.performed && !searchById.course"
        class="search-no-results"
      >
        沒有找到該編號的課程。
      </p>
      <p v-else-if="!searchById.performed" class="search-initial-hint">
        請輸入課程編號進行查詢。
      </p>
    </section>

    <section
      v-if="activeSearch === 'byName' && !showCreateForm && !editingCourseId"
      class="search-section"
    >
      <div class="search-input-group">
        <el-input
          v-model="searchByName.name"
          placeholder="請輸入課程名稱"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearchByName"
        />
        <el-button type="primary" @click="handleSearchByName">查詢</el-button>
      </div>
      <el-table
        :data="displayedCourses"
        style="width: 100%"
        v-loading="isLoading"
        v-if="
          displayedCourses.length > 0 ||
          (searchByName.performed && displayedCourses.length === 0)
        "
        border
      >
        <el-table-column prop="id" label="編號" width="53" />
        <el-table-column prop="name" label="名稱" width="150" />
        <el-table-column prop="description" label="內容" />
        <el-table-column
          label="時間  "
          width="110"
          prop="dayOfWeek"
          :filters="dayOfWeekFilters"
          :filter-method="filterDayOfWeek"
          filter-placement="bottom-end"
          :filter-multiple="false"
          column-key="dayOfWeek"
        >
          <template #default="scope">
            {{ formatDayOfWeek(scope.row.dayOfWeek) }}
            {{ scope.row.startTime ? scope.row.startTime.substring(0, 5) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="時長(分)" width="77" />
        <el-table-column
          prop="coachId"
          label="教練編號"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="coachName"
          label="教練名字"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="statusCombined"
          label="課程狀態 / 人數  "
          width="170"
          :filters="fullnessFilters"
          :filter-method="filterFullnessSimple"
          filter-placement="bottom-start"
          :filter-multiple="false"
          column-key="statusCombined"
        >
          <template #default="scope">
            <div class="combined-fullness-cell">
              <div class="status-line">
                <el-tag
                  :type="
                    scope.row.full
                      ? 'danger' /* 如果額滿，顯示紅色 danger */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.full
                      ? "課程已額滿" /* 如果額滿，顯示已額滿 */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? "課程快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "課程未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.full /* 常規額滿紅色 */,
                    /* 常規超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.full &&
                      scope.row.maxCapacity > 0 &&
                      scope.row.registeredCount / scope.row.maxCapacity >= 0.5,
                  }"
                  >{{ scope.row.registeredCount }} /
                  {{ scope.row.maxCapacity }}</span
                >
              </div>

              <div class="status-line" v-if="scope.row.offersTrialOption">
                <el-tag
                  :type="
                    scope.row.trialFull
                      ? 'danger' /* 如果體驗額滿，顯示紅色 danger */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.trialFull
                      ? "預約已額滿" /* 如果體驗額滿，顯示已額滿 */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? "預約快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "預約未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.trialFull /* 體驗額滿紅色 */,
                    /* 體驗超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.trialFull &&
                      scope.row.maxTrialCapacity > 0 &&
                      scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                        0.5,
                  }"
                  >{{ scope.row.bookedTrialCount }} /
                  {{ scope.row.maxTrialCapacity }}</span
                >
              </div>

              <div class="status-line" v-else>
                <el-tag type="info" class="fullness-tag-small">
                  未提供體驗課程
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="default" @click="openEditForm(scope.row.id)"
              >編輯</el-button
            >
            <el-button
              size="default"
              type="danger"
              @click="handleDelete(scope.row.id)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="searchByName.performed && displayedCourses.length === 0"
        class="search-no-results"
      >
        沒有找到符合該名稱的課程。
      </p>
      <p v-else-if="!searchByName.performed" class="search-initial-hint">
        請輸入課程名稱進行查詢。
      </p>
    </section>

    <section
      v-if="activeSearch === 'byCoachId' && !showCreateForm && !editingCourseId"
      class="search-section"
    >
      <div class="search-input-group">
        <el-input
          v-model="searchByCoachId.coachId"
          placeholder="請輸入教練編號"
          clearable
          type="number"
          :min="0"
          style="width: 200px"
          @keyup.enter="handleSearchByCoachId"
        />
        <el-button type="primary" @click="handleSearchByCoachId"
          >查詢</el-button
        >
      </div>
      <el-table
        :data="displayedCourses"
        style="width: 100%"
        v-loading="isLoading"
        v-if="
          displayedCourses.length > 0 ||
          (searchByCoachId.performed && displayedCourses.length === 0)
        "
        border
      >
        <el-table-column prop="id" label="編號" width="53" />
        <el-table-column prop="name" label="名稱" width="150" />
        <el-table-column prop="description" label="內容" />
        <el-table-column
          label="時間  "
          width="110"
          prop="dayOfWeek"
          :filters="dayOfWeekFilters"
          :filter-method="filterDayOfWeek"
          filter-placement="bottom-end"
          :filter-multiple="false"
          column-key="dayOfWeek"
        >
          <template #default="scope">
            {{ formatDayOfWeek(scope.row.dayOfWeek) }}
            {{ scope.row.startTime ? scope.row.startTime.substring(0, 5) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="時長(分)" width="77" />
        <el-table-column
          prop="coachId"
          label="教練編號"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="coachName"
          label="教練名字"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="statusCombined"
          label="課程狀態 / 人數  "
          width="170"
          :filters="fullnessFilters"
          :filter-method="filterFullnessSimple"
          filter-placement="bottom-start"
          :filter-multiple="false"
          column-key="statusCombined"
        >
          <template #default="scope">
            <div class="combined-fullness-cell">
              <div class="status-line">
                <el-tag
                  :type="
                    scope.row.full
                      ? 'danger' /* 如果額滿，顯示紅色 danger */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.full
                      ? "課程已額滿" /* 如果額滿，顯示已額滿 */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? "課程快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "課程未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.full /* 常規額滿紅色 */,
                    /* 常規超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.full &&
                      scope.row.maxCapacity > 0 &&
                      scope.row.registeredCount / scope.row.maxCapacity >= 0.5,
                  }"
                  >{{ scope.row.registeredCount }} /
                  {{ scope.row.maxCapacity }}</span
                >
              </div>

              <div class="status-line" v-if="scope.row.offersTrialOption">
                <el-tag
                  :type="
                    scope.row.trialFull
                      ? 'danger' /* 如果體驗額滿，顯示紅色 danger */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.trialFull
                      ? "預約已額滿" /* 如果體驗額滿，顯示已額滿 */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? "預約快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "預約未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.trialFull /* 體驗額滿紅色 */,
                    /* 體驗超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.trialFull &&
                      scope.row.maxTrialCapacity > 0 &&
                      scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                        0.5,
                  }"
                  >{{ scope.row.bookedTrialCount }} /
                  {{ scope.row.maxTrialCapacity }}</span
                >
              </div>

              <div class="status-line" v-else>
                <el-tag type="info" class="fullness-tag-small">
                  未提供體驗課程
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="default" @click="openEditForm(scope.row.id)"
              >編輯</el-button
            >
            <el-button
              size="default"
              type="danger"
              @click="handleDelete(scope.row.id)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="searchByCoachId.performed && displayedCourses.length === 0"
        class="search-no-results"
      >
        沒有找到該教練編號的課程。
      </p>
      <p v-else-if="!searchByCoachId.performed" class="search-initial-hint">
        請輸入教練編號進行查詢。
      </p>
    </section>

    <section
      v-if="
        activeSearch === 'byCoachName' && !showCreateForm && !editingCourseId
      "
      class="search-section"
    >
      <div class="search-input-group">
        <el-input
          v-model="searchByCoachName.name"
          placeholder="請輸入教練名稱"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearchByCoachName"
        />
        <el-button type="primary" @click="handleSearchByCoachName"
          >查詢</el-button
        >
      </div>
      <el-table
        :data="displayedCourses"
        style="width: 100%"
        v-loading="isLoading"
        v-if="
          displayedCourses.length > 0 ||
          (searchByCoachName.performed && displayedCourses.length === 0)
        "
        border
      >
        <el-table-column prop="id" label="編號" width="53" />
        <el-table-column prop="name" label="名稱" width="150" />
        <el-table-column prop="description" label="內容" />
        <el-table-column
          label="時間  "
          width="110"
          prop="dayOfWeek"
          :filters="dayOfWeekFilters"
          :filter-method="filterDayOfWeek"
          filter-placement="bottom-end"
          :filter-multiple="false"
          column-key="dayOfWeek"
        >
          <template #default="scope">
            {{ formatDayOfWeek(scope.row.dayOfWeek) }}
            {{ scope.row.startTime ? scope.row.startTime.substring(0, 5) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="時長(分)" width="77" />
        <el-table-column
          prop="coachId"
          label="教練編號"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="coachName"
          label="教練名字"
          width="81"
        ></el-table-column>
        <el-table-column
          prop="statusCombined"
          label="課程狀態 / 人數  "
          width="170"
          :filters="fullnessFilters"
          :filter-method="filterFullnessSimple"
          filter-placement="bottom-start"
          :filter-multiple="false"
          column-key="statusCombined"
        >
          <template #default="scope">
            <div class="combined-fullness-cell">
              <div class="status-line">
                <el-tag
                  :type="
                    scope.row.full
                      ? 'danger' /* 如果額滿，顯示紅色 danger */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.full
                      ? "課程已額滿" /* 如果額滿，顯示已額滿 */
                      : scope.row.maxCapacity > 0 &&
                        scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                      ? "課程快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "課程未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.full /* 常規額滿紅色 */,
                    /* 常規超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.full &&
                      scope.row.maxCapacity > 0 &&
                      scope.row.registeredCount / scope.row.maxCapacity >= 0.5,
                  }"
                  >{{ scope.row.registeredCount }} /
                  {{ scope.row.maxCapacity }}</span
                >
              </div>

              <div class="status-line" v-if="scope.row.offersTrialOption">
                <el-tag
                  :type="
                    scope.row.trialFull
                      ? 'danger' /* 如果體驗額滿，顯示紅色 danger */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                      : 'success' /* 否則顯示綠色 success */
                  "
                  class="fullness-tag-small"
                >
                  {{
                    scope.row.trialFull
                      ? "預約已額滿" /* 如果體驗額滿，顯示已額滿 */
                      : scope.row.maxTrialCapacity > 0 &&
                        scope.row.bookedTrialCount /
                          scope.row.maxTrialCapacity >=
                          0.5
                      ? "預約快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                      : "預約未額滿" /* 否則顯示未額滿 */
                  }}
                </el-tag>
                <span
                  :class="{
                    'count-full': scope.row.trialFull /* 體驗額滿紅色 */,
                    /* 體驗超過一半黃色 */
                    'count-more-than-half':
                      !scope.row.trialFull &&
                      scope.row.maxTrialCapacity > 0 &&
                      scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                        0.5,
                  }"
                  >{{ scope.row.bookedTrialCount }} /
                  {{ scope.row.maxTrialCapacity }}</span
                >
              </div>

              <div class="status-line" v-else>
                <el-tag type="info" class="fullness-tag-small">
                  未提供體驗課程
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="default" @click="openEditForm(scope.row.id)"
              >編輯</el-button
            >
            <el-button
              size="default"
              type="danger"
              @click="handleDelete(scope.row.id)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <p
        v-else-if="searchByCoachName.performed && displayedCourses.length === 0"
        class="search-no-results"
      >
        沒有找到該教練名稱的課程。
      </p>
      <p v-else-if="!searchByCoachName.performed" class="search-initial-hint">
        請輸入教練名稱進行查詢。
      </p>
    </section>

    <el-dialog
      v-model="showCreateForm"
      :title="editingCourseId ? '編輯課程' : '新增課程'"
      width="600px"
      :before-close="handleCloseFormDialog"
    >
      <CourseForm
        v-if="showCreateForm"
        :course-id="editingCourseId"
        @submit-success="handleFormSubmitSuccess"
        @cancel="handleFormCancel"
        ref="courseFormRef"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseFormDialog">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <el-table
      ref="courseTableRef"
      :data="displayedCourses"
      style="width: 100%"
      v-if="activeSearch === null && !showCreateForm && !editingCourseId"
      v-loading="isLoading"
      border
      @filter-change="handleTableFilterChange"
    >
      <el-table-column prop="id" label="編號" width="53" />
      <el-table-column prop="name" label="名稱" width="150" />
      <el-table-column prop="description" label="內容" />
      <el-table-column
        label="時間  "
        width="110"
        prop="dayOfWeek"
        :filters="dayOfWeekFilters"
        :filter-method="filterDayOfWeek"
        filter-placement="bottom-start"
        :filter-multiple="false"
        column-key="dayOfWeek"
      >
        <template #default="scope">
          {{ formatDayOfWeek(scope.row.dayOfWeek) }}
          {{ scope.row.startTime ? scope.row.startTime.substring(0, 5) : "" }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="時長(分)" width="77" />
      <el-table-column
        prop="coachId"
        label="教練編號"
        width="81"
      ></el-table-column>
      <el-table-column
        prop="coachName"
        label="教練名字"
        width="81"
      ></el-table-column>
      <el-table-column
        prop="statusCombined"
        label="課程狀態 / 人數  "
        width="170"
        :filters="fullnessFilters"
        :filter-method="filterFullnessSimple"
        filter-placement="bottom-start"
        :filter-multiple="false"
        column-key="statusCombined"
      >
        <template #default="scope">
          <div class="combined-fullness-cell">
            <div class="status-line">
              <el-tag
                :type="
                  scope.row.full
                    ? 'danger' /* 如果額滿，顯示紅色 danger */
                    : scope.row.maxCapacity > 0 &&
                      scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                    ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                    : 'success' /* 否則顯示綠色 success */
                "
                class="fullness-tag-small"
              >
                {{
                  scope.row.full
                    ? "課程已額滿" /* 如果額滿，顯示已額滿 */
                    : scope.row.maxCapacity > 0 &&
                      scope.row.registeredCount / scope.row.maxCapacity >= 0.5
                    ? "課程快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                    : "課程未額滿" /* 否則顯示未額滿 */
                }}
              </el-tag>
              <span
                :class="{
                  'count-full': scope.row.full /* 常規額滿紅色 */,
                  /* 常規超過一半黃色 */
                  'count-more-than-half':
                    !scope.row.full &&
                    scope.row.maxCapacity > 0 &&
                    scope.row.registeredCount / scope.row.maxCapacity >= 0.5,
                }"
                >{{ scope.row.registeredCount }} /
                {{ scope.row.maxCapacity }}</span
              >
            </div>

            <div class="status-line" v-if="scope.row.offersTrialOption">
              <el-tag
                :type="
                  scope.row.trialFull
                    ? 'danger' /* 如果體驗額滿，顯示紅色 danger */
                    : scope.row.maxTrialCapacity > 0 &&
                      scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                        0.5
                    ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                    : 'success' /* 否則顯示綠色 success */
                "
                class="fullness-tag-small"
              >
                {{
                  scope.row.trialFull
                    ? "預約已額滿" /* 如果體驗額滿，顯示已額滿 */
                    : scope.row.maxTrialCapacity > 0 &&
                      scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                        0.5
                    ? "預約快額滿" /* 如果未額滿但超過一半，顯示快額滿 */
                    : "預約未額滿" /* 否則顯示未額滿 */
                }}
              </el-tag>
              <span
                :class="{
                  'count-full': scope.row.trialFull /* 體驗額滿紅色 */,
                  /* 體驗超過一半黃色 */
                  'count-more-than-half':
                    !scope.row.trialFull &&
                    scope.row.maxTrialCapacity > 0 &&
                    scope.row.bookedTrialCount / scope.row.maxTrialCapacity >=
                      0.5,
                }"
                >{{ scope.row.bookedTrialCount }} /
                {{ scope.row.maxTrialCapacity }}</span
              >
            </div>

            <div class="status-line" v-else>
              <el-tag type="info" class="fullness-tag-small">
                未提供體驗課程
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="default" @click="openEditForm(scope.row.id)"
            >編輯</el-button
          >
          <el-button
            size="default"
            type="danger"
            @click="handleDelete(scope.row.id)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="
        activeSearch === null || // 在主要列表模式下顯示
        activeSearch === 'byName' || // 在依名稱搜尋模式下顯示
        activeSearch === 'byCoachId' || // 在依教練編號搜尋模式下顯示
        activeSearch === 'byCoachName' // 在依教練名稱搜尋模式下顯示
        // !showCreateForm && // 關閉表單時顯示
        // !editingCourseId && // 非編輯狀態時顯示
        // totalCourses > 0 // 總數大於 0 才顯示
      "
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :total="totalCourses"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="pagination-container"
      :page-sizes="[10, 20, 50, 100]"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCourseStore } from "@/stores/courseStore";
import { ElMessage, ElMessageBox, ElDialog, ElImageViewer } from "element-plus";
// import axios from "axios"; // axios 從 Store 中引入並使用
import CourseForm from "./CourseForm.vue";

// 拿 Pinia Store
const courseStore = useCourseStore();
const {
  courses, // <-- 主要列表數據 (將用於顯示所有分頁結果，包括搜尋)
  totalCourses, // <-- 主列表總數 (將用於顯示所有分頁結果的總數，包括搜尋)
  isLoading,
  activeSearch, // <-- 當前啟用的搜尋模式
  searchById, // <-- 依 ID 搜尋狀態 (不分頁)
  searchByName, // <-- 依名稱搜尋狀態 (將不再直接用於表格數據源)
  searchByCoachId, // <-- 依教練 ID 搜尋狀態 (將不再直接用於表格數據源)
  searchByCoachName, // <-- 依教練名稱搜尋狀態 (將不再直接用於表格數據源)
  currentPage, // <-- Store 中的當前頁碼 (已是 ref)
  pageSize, // <-- Store 中的每頁大小 (已是 ref)
  currentTableFilter, // <-- 從 Store 獲取表格篩選狀態
} = storeToRefs(courseStore); // 使用 storeToRefs 讓 Store 狀態在元件中保持響應性

// Store 裡的方法 (直接從 Store 實例獲取 Action)
const {
  fetchCourses, // <-- 獲取主列表數據 (應支援分頁和篩選)
  searchCourseById, // <-- 依 ID 搜尋 (不分頁)
  searchCourseByName, // <-- 依名稱搜尋 (需要修改以支援分頁)
  searchCourseByCoachId, // <-- 依教練 ID 搜尋 (需要修改以支援分頁)
  searchCourseByCoachName, // <-- 依教練名稱搜尋 (需要修改以支援分頁)
  clearTableFilterState, // 清除 Store 中的表格篩選狀態
  // 其他需要的 Action...
} = courseStore;

// 控制新增編輯表單顯示的狀態
const showCreateForm = ref(false);
const editingCourseId = ref(null);

// 綁定到 CourseForm 元件的 ref
const courseFormRef = ref(null);
// 綁定到主列表 el-table 的 ref (用於客戶端篩選清除等)
const courseTableRef = ref(null); // 綁定到 v-if="activeSearch === null..." 的那個 el-table

// 表格篩選選項 - 星期幾
const dayOfWeekFilters = [
  { text: "星期日", value: 0 },
  { text: "星期一", value: 1 },
  { text: "星期二", value: 2 },
  { text: "星期三", value: 3 },
  { text: "星期四", value: 4 },
  { text: "星期五", value: 5 },
  { text: "星期六", value: 6 },
];
// 表格客戶端篩選星期幾的方法 (僅用於依 ID 查詢的單個結果表格)
const filterDayOfWeek = (value, row) => {
  if (value === null || value === undefined) return true;
  return row.dayOfWeek === value;
};

// 額滿狀態過濾器
const fullnessFilters = [
  { text: "未額滿/快額滿", value: "notFull" },
  { text: "已額滿", value: "full" },
];
// 表格篩選方法 (僅用於依 ID 查詢的單個結果表格)
const filterFullnessSimple = (value, row) => {
  if (value === "full") {
    return row.full === true || row.trialFull === true;
  } else if (value === "notFull") {
    return (
      (row.full === false || row.full === null || row.full === undefined) &&
      (row.trialFull === false ||
        row.trialFull === null ||
        row.trialFull === undefined)
    );
  }
  return true;
};

// 重置所有搜尋相關的狀態
const resetSearchStates = () => {
  // 重置依編號搜尋的狀態物件
  if (searchById.value) {
    searchById.value.id = null;
    searchById.value.course = null;
    searchById.value.performed = false;
  }
  // 重置依名稱搜尋的狀態物件
  if (searchByName.value) {
    searchByName.value.name = "";
    searchByName.value.performed = false; // 不清空 courses，由 Store Actions 統一管理 this.courses
  }
  // 重置依教練編號搜尋的狀態物件
  if (searchByCoachId.value) {
    searchByCoachId.value.coachId = null;
    searchByCoachId.value.performed = false; // 不清空 courses
  }
  // 重置依教練名稱搜尋的狀態物件
  if (searchByCoachName.value) {
    searchByCoachName.value.name = "";
    searchByCoachName.value.performed = false; // 不清空 courses
  }

  // TODO: 如果有其他搜尋狀態（如依星期、依日期時間），也要在這裡重置

  // 清空 Store 中的主要課程列表和總數，以便顯示新的查詢結果
  courses.value = [];
  totalCourses.value = 0;
};

// 清除表格篩選的方法 (僅適用於 activeSearch === null 的主表格)
const clearTableFilter = () => {
  // 如果在主表格模式下，清除 Element Plus 表格內置篩選的視覺狀態
  if (activeSearch.value === null && courseTableRef.value) {
    // 這裡需要根據您實際使用的篩選器 prop 名稱來清除
    // 例如：courseTableRef.value.clearFilter(['dayOfWeek', 'statusCombined']);
    // 如果您的篩選是基於後端參數的，這裡可能不需要呼叫 clearFilter
    // Element Plus 的 clearFilter 主要是用於客戶端篩選
  }
  // 清除 Store 中的篩選狀態
  clearTableFilterState();
};

// **顯示用資料的 Computed 屬性**
// 這個 computed 屬性根據 activeSearch 的值，返回要顯示在表格中的數據源
// 所有支援分頁的表格都應該使用這個 computed 屬性作為數據源
const displayedCourses = computed(() => {
  if (activeSearch.value === "byId") {
    // 在「依 ID 搜尋」模式下，顯示 searchById.course (如果存在的話)
    return searchById.value && searchById.value.course
      ? [searchById.value.course]
      : [];
  } else {
    // 在「全部課程」和所有分頁的搜尋模式下 (byName, byCoachId, byCoachName)，
    // 都使用 Store 中的主要 courses 數據
    // Store 中的 courses 已經由對應的 Action 處理了分頁和切片
    return courses.value;
  }
});

// **新增各查詢模式的處理函式，用於呼叫 Store Action 並顯示成功訊息**

// 處理依課程編號查詢
const handleSearchById = async () => {
  // Store Action 本身會處理輸入驗證和錯誤訊息顯示
  await courseStore.searchCourseById();
  // 只有當查詢成功且有結果時才顯示成功訊息
  if (searchById.value.performed && searchById.value.course) {
    ElMessage.success("查詢成功");
  }
  // 如果沒有找到結果，Store Action 已經會顯示提示訊息，或模板會顯示"沒有找到..."，所以這裡不再重複顯示成功訊息。
};

// 處理依課程名稱查詢 (支援分頁)
const handleSearchByName = async () => {
  // 切換查詢模式或按下查詢按鈕時，重置到第一頁
  currentPage.value = 1;
  // Store Action 本身會處理輸入驗證和錯誤訊息顯示
  await courseStore.searchCourseByName();
  // 只有當查詢成功且有結果時才顯示成功訊息
  if (searchByName.value.performed && displayedCourses.value.length > 0) {
    ElMessage.success("查詢成功");
  }
  // 如果沒有找到結果，模板會顯示"沒有找到..."，所以這裡不再重複顯示成功訊息。
};

// 處理依教練編號查詢 (支援分頁)
const handleSearchByCoachId = async () => {
  // 切換查詢模式或按下查詢按鈕時，重置到第一頁
  currentPage.value = 1;
  // Store Action 本身會處理輸入驗證和錯誤訊息顯示
  await courseStore.searchCourseByCoachId();
  // 只有當查詢成功且有結果時才顯示成功訊息
  if (searchByCoachId.value.performed && displayedCourses.value.length > 0) {
    ElMessage.success("查詢成功");
  }
  // 如果沒有找到結果，模板會顯示"沒有找到..."，所以這裡不再重複顯示成功訊息。
};

// 處理依教練名稱查詢 (支援分頁)
const handleSearchByCoachName = async () => {
  // 切換查詢模式或按下查詢按鈕時，重置到第一頁
  currentPage.value = 1;
  // Store Action 本身會處理輸入驗證和錯誤訊息顯示
  await courseStore.searchCourseByCoachName();
  // 只有當查詢成功且有結果時才顯示成功訊息
  if (searchByCoachName.value.performed && displayedCourses.value.length > 0) {
    ElMessage.success("查詢成功");
  }
  // 如果沒有找到結果，模板會顯示"沒有找到..."，所以這裡不再重複顯示成功訊息。
};

// 分頁事件處理函數 (處理所有支援分頁的模式)
const handleSizeChange = (size) => {
  // 直接更新 Store 的 pageSize 狀態
  pageSize.value = size;
  // 改變每頁大小時重置到第一頁
  currentPage.value = 1;

  // 根據當前的搜尋模式，呼叫對應的 Action 重新獲取數據
  // Action 會自動使用 Store 中更新後的 currentPage 和 pageSize
  if (activeSearch.value === null) {
    // 主列表模式
    fetchCourses();
  } else if (activeSearch.value === "byName") {
    // 依名稱搜尋模式
    searchCourseByName(); // Action 會使用 Store 的 name, currentPage 和 pageSize
  } else if (activeSearch.value === "byCoachId") {
    // 依教練編號搜尋模式
    searchCourseByCoachId(); // Action 會使用 Store 的 coachId, currentPage 和 pageSize
  } else if (activeSearch.value === "byCoachName") {
    // 依教練名稱搜尋模式
    searchCourseByCoachName(); // Action 會使用 Store 的 name, currentPage 和 pageSize
  }
  // TODO: 如果有其他支援分頁的搜尋模式，也要在這裡添加處理邏輯
};
const handleCurrentChange = (page) => {
  // 直接更新 Store 的 currentPage 狀態
  currentPage.value = page;
  // 根據當前的搜尋模式，呼叫對應的 Action 獲取該頁數據
  // Action 會自動使用 Store 中更新後的 currentPage 和 pageSize
  if (activeSearch.value === null) {
    // 主列表模式
    fetchCourses();
  } else if (activeSearch.value === "byName") {
    // 依名稱搜尋模式
    searchCourseByName(); // Action 會使用 Store 的 name, currentPage 和 pageSize
  } else if (activeSearch.value === "byCoachId") {
    // 依教練編號搜尋模式
    searchCourseByCoachId(); // Action 會使用 Store 的 coachId, currentPage 和 pageSize
  } else if (activeSearch.value === "byCoachName") {
    // 依教練名稱搜尋模式
    searchCourseByCoachName(); // Action 會使用 Store 的 name, currentPage 和 pageSize
  }
  // TODO: 如果有其他支援分頁的搜尋模式，也要在這裡添加處理邏輯
};
// 處理表格篩選變化 (僅適用於 activeSearch === null 的主表格)
const handleTableFilterChange = async (filters) => {
  // 如果不在主表格模式下，清除篩選並返回
  if (activeSearch.value !== null) {
    // 清除 Store 中的篩選狀態
    clearTableFilterState();
    // 清除 Element Plus 表格內置篩選的視覺狀態 (如果適用)
    if (courseTableRef.value) {
      courseTableRef.value.clearFilter(); // 或指定篩選器的 prop 名稱
    }
    return;
  }

  const dayOfWeekValues = filters.dayOfWeek;
  const statusCombinedValues = filters.statusCombined;

  let dayOfWeekFilter = null;
  if (dayOfWeekValues && dayOfWeekValues.length > 0) {
    dayOfWeekFilter = dayOfWeekValues[0];
  }

  let statusCombinedFilter = null;
  if (statusCombinedValues && statusCombinedValues.length > 0) {
    statusCombinedFilter = statusCombinedValues[0];
  }

  // 更新 Store 中的表格篩選狀態
  courseStore.setCurrentTableFilter({
    dayOfWeek: dayOfWeekFilter,
    // 如果您在 fullnessFilters 中使用了 'full'/'notFull'，並且後端 API 接受 'fullness' 參數
    // 您需要將 statusCombinedFilter 的值轉換為後端期望的格式
    fullness:
      statusCombinedFilter === "full"
        ? "full"
        : statusCombinedFilter === "notFull"
        ? "notFull"
        : null,
    // TODO: 確保後端 API (fetchCourses) 能夠正確處理 fullness 參數
  });
  // 應用篩選時重置到第一頁
  currentPage.value = 1;

  // 重新獲取數據，應用新的篩選和分頁狀態
  fetchCourses(); // Action 會使用 Store 中更新後的 currentPage, pageSize 和 currentTableFilter
};
// 輔助：星期格式化 (數字轉中文)
const formatDayOfWeek = (dayOfWeek) => {
  if (dayOfWeek === null || dayOfWeek === undefined) return "未知";
  const simpleDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return dayOfWeek >= 0 && dayOfWeek <= 6 ? simpleDays[dayOfWeek] : "無";
};

// 處理刪除課程
const handleDelete = async (id) => {
  ElMessageBox.confirm("確定要刪除此課程嗎？刪除後將無法恢復！", "刪除確認", {
    confirmButtonText: "確定刪除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      isLoading.value = true;
      try {
        await courseStore.deleteCourse(id); // Use the imported deleteCourse action
        ElMessage.success("課程刪除成功");

        if (activeSearch.value === null) {
          fetchCourses();
        } else if (activeSearch.value === "byName") {
          searchCourseByName();
        } else if (activeSearch.value === "byCoachId") {
          searchCourseByCoachId();
        } else if (activeSearch.value === "byCoachName") {
          searchCourseByCoachName();
        } else if (activeSearch.value === "byId") {
          resetSearchStates();
          activeSearch.value = null;
          fetchCourses();
        }
      } catch (error) {
        console.error("Error during delete:", error);

        // Modified error handling for 409 status code
        if (error.response && error.response.status === 409) {
          // Always show the specific warning message for 409 errors
          ElMessage.warning("無法刪除課程：有已報名或已預約的紀錄存在");
        } else if (error.request) {
          console.error(
            "Error during delete: No response received",
            error.request
          );
          ElMessage.error("刪除課程失敗：無法連接到伺服器或網絡問題。");
        } else {
          console.error(
            "Error during delete: Request setup error",
            error.message
          );
          ElMessage.error(`刪除課程失敗：發生意外錯誤 - ${error.message}`);
        }
      } finally {
        isLoading.value = false;
      }
    })
    .catch(() => {
      ElMessage.info("已取消刪除操作");
    });
};

// 處理表單相關事件（打開、關閉、提交成功、取消）
// 在這些事件處理函數中，確保在關閉表單後根據當前模式重新獲取數據，並保持分頁狀態
const openCreateForm = () => {
  editingCourseId.value = null;
  showCreateForm.value = true;
  // 打開新增表單時，通常會回到主列表視圖，並清空其他查詢狀態和表格篩選
  activeSearch.value = null;
  resetSearchStates(); // 清空搜尋狀態
  clearTableFilter(); // 清除表格篩選
  // fetchCourses(); // 打開表單時不立即獲取，在關閉表單或提交成功後才獲取
};
const openEditForm = (id) => {
  editingCourseId.value = id;
  showCreateForm.value = true;
  // 打開編輯表單時，通常會回到主列表視圖，並清空其他查詢狀態和表格篩選
  activeSearch.value = null;
  resetSearchStates(); // 清空搜尋狀態
  clearTableFilter(); // 清除表格篩選
  // TODO: 在打開編輯表單時，調用 Store action 獲取單個課程數據並填充表單
  // 例如：courseStore.fetchCourseById(id);
};
const handleCloseFormDialog = () => {
  ElMessageBox.confirm("確定要關閉表單嗎？未保存的更改將會丟失。", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      showCreateForm.value = false;
      editingCourseId.value = null;
      // 關閉表單後，根據當前模式重新獲取列表，並應用可能的表格篩選和分頁
      // 直接呼叫 Action，Action 會使用 Store 中的狀態
      // 在關閉表單時，先回到全部課程模式
      activeSearch.value = null;
      // 重置分頁到第一頁
      currentPage.value = 1;
      // 清除表格篩選
      clearTableFilter();
      // 重新獲取全部課程列表
      fetchCourses();

      // TODO: 如果有其他支援分頁的搜尋模式，在關閉表單後需要回到對應模式並刷新數據
      // 例如，如果您希望關閉編輯表單後回到之前的搜尋結果頁面：
      // if (先前是依名稱搜尋模式) { searchCourseByName(); }
      // 這需要您額外記錄關閉表單前的 activeSearch 狀態和分頁狀態，會更複雜。
      // 目前的邏輯是統一回到全部課程第一頁，這是比較簡單的實現。
    })
    .catch(() => {
      // 用戶點擊取消
    });
};

const handleFormSubmit = async () => {
  console.log("CourseList: handleFormSubmit executed"); // <<<< 添加這一行 >>>>
  // 呼叫 CourseForm 內部的提交方法
  if (courseFormRef.value && courseFormRef.value.submitForm) {
    // 您可能需要在提交前再次驗證
    const isValid = await courseFormRef.value.validateForm();
    if (isValid) {
      console.log(
        "CourseList: Validation successful, calling child submitForm..."
      ); // <<<< 可選，添加這行以確認驗證通過 >>>>
      courseFormRef.value.submitForm(); // CourseForm 提交成功後應該會觸發 @submit-success 事件
    } else {
      console.log("CourseList: Validation failed."); // <<<< 可選，添加這行以確認驗證失敗 >>>>
    }
  } else {
    console.warn(
      "CourseList: courseFormRef is not available to call submitForm."
    ); // <<<< 可選，添加這行以偵測 ref 問題 >>>>
  }
};
const handleFormSubmitSuccess = () => {
  console.log("CourseList: handleFormSubmitSuccess executed"); // <<<< 添加這一行 >>>>
  showCreateForm.value = false;
  editingCourseId.value = null;
  // 提交成功後，回到主列表模式，並重置到第一頁並重新獲取列表
  activeSearch.value = null; // 回到全部課程模式
  currentPage.value = 1; // 重置到第一頁
  resetSearchStates(); // 清空搜尋狀態 (如果需要)
  clearTableFilter(); // 清除表格篩選
  fetchCourses(); // 重新獲取全部課程列表 (Action 會使用 Store 的狀態)
};

const handleFormCancel = () => {
  showCreateForm.value = false;
  editingCourseId.value = null;
  // 取消表單後，回到主列表模式，並重置到第一頁並重新獲取列表
  activeSearch.value = null; // 回到全部課程模式
  currentPage.value = 1; // 重置到第一頁
  resetSearchStates(); // 清空搜尋狀態 (如果需要)
  clearTableFilter(); // 清除表格篩選
  fetchCourses(); // 重新獲取全部課程列表 (Action 會使用 Store 的狀態)
};

// 在元件掛載後獲取初始課程列表 (全部課程)
onMounted(() => {
  // 在頁面載入時獲取第一頁的全部課程列表
  // Action 會使用 Store 中預設或已有的 currentPage 和 pageSize
  fetchCourses();
});
</script>

<style scoped>
/* 樣式部分保持不變 */
.admin-course-management {
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

.edit-create-form-card {
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
  background-color: #fff;
}

.edit-create-form-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.edit-create-form-card .close-button {
  font-size: 20px;
  color: #999;
}

.el-table {
  margin-top: 20px;
}

.admin-course-management :deep(.el-table .el-button) {
  padding: 8px 13px;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  text-align: right;
}

.status-line {
  display: flex;
  align-items: center; /* 垂直居中行內的元素 */
  font-size: 14px; /* 行內文字的基礎字體大小 */
  color: #606266; /* 行內文字的基礎顏色 */
  flex-wrap: nowrap; /* 確保行內元素不換行 */
  padding: 0;
  margin-top: 0;
  margin-left: 0;
  margin-right: 0;
}

/* 移除最後一行的下邊距 */
.status-line:last-child {
  margin-bottom: 0;
}

/* 設定額滿狀態標籤的樣式 (在 .combined-fullness-cell 內部) */
.combined-fullness-cell .el-tag {
  font-size: 14px; /* 標籤字體大小 */
  padding: 1px 8px; /* 標籤內邊距 */
  display: inline-flex;
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  height: 30px;
  width: auto;
  margin: 5px; /* 外邊距由 .status-line 控制 */
}

/* 用於額滿數字的 CSS class (紅色) */
.combined-fullness-cell .status-line span.count-full {
  color: #f56c6c; /* 紅色 */
  font-weight: bold; /* 可選加粗 */
}

/* 用於超過一半數字的 CSS class (黃色/橙色) */
.combined-fullness-cell .status-line span.count-more-than-half {
  color: #e6a23c; /* 黃色/橙色 */
}
</style>
