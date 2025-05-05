<template>
    <div class="admin-container">
        <h1>前台首頁設定</h1>

        <el-form label-width="120px">
            <!-- Hero 文案輸入 -->

            <el-form-item label="首頁主標文案">
                <el-input v-model="bannerText" placeholder="請輸入 Hero 區塊的主標文案" />
            </el-form-item>

            <!-- 三張廣告文案輸入與圖片上傳展示 -->
            <el-form-item label="廣告文案一">
                <el-input v-model="promoTexts[0]" placeholder="請輸入第一張廣告文字" />
                <el-upload action="#" :auto-upload="false">
                    <el-button>上傳廣告圖一</el-button>
                </el-upload>
            </el-form-item>
            <el-form-item label="廣告文案二">
                <el-input v-model="promoTexts[1]" placeholder="請輸入第二張廣告文字" />
                <el-upload action="#" :auto-upload="false">
                    <el-button>上傳廣告圖二</el-button>
                </el-upload>
            </el-form-item>
            <el-form-item label="廣告文案三">
                <el-input v-model="promoTexts[2]" placeholder="請輸入第三張廣告文字" />
                <el-upload action="#" :auto-upload="false">
                    <el-button>上傳廣告圖三</el-button>
                </el-upload>
            </el-form-item>

            <!-- 推薦影片連結輸入 -->
            <el-form-item label="YouTube 影片網址">
                <el-input
                    v-model="youtubeInput"
                    placeholder="請貼上 YouTube 分享網址，如 https://www.youtube.com/watch?v=XXXXX"
                />
            </el-form-item>

            <!-- 儲存按鈕 -->
            <el-form-item>
                <el-button type="primary" @click="saveConfig">儲存設定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";

const bannerText = ref(
    localStorage.getItem("home_bannerText") ||
        "專業數據分析、個人化健康計劃，全方位追蹤功能，讓健康管理更簡單有效"
);
const promoTexts = ref(
    JSON.parse(
        localStorage.getItem("home_promoTexts") || '["廣告一文案", "廣告二文案", "廣告三文案"]'
    )
);
const videoUrl = ref(
    localStorage.getItem("home_videoUrl") || "https://www.youtube.com/embed/WUZZ0N7pmlc"
);
const youtubeInput = ref(
    videoUrl.value.replace("https://www.youtube.com/embed/", "https://www.youtube.com/watch?v=")
);

function convertYoutubeUrl(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function saveConfig() {
    localStorage.setItem("home_bannerText", bannerText.value);
    localStorage.setItem("home_promoTexts", JSON.stringify(promoTexts.value));
    const embeddedUrl = convertYoutubeUrl(youtubeInput.value);
    localStorage.setItem("home_videoUrl", embeddedUrl);
    videoUrl.value = embeddedUrl;
    ElMessage.success("儲存成功，請至前台查看效果！");
}
</script>

<style scoped>
.admin-container {
    max-width: 720px;
    margin: 40px auto;
    padding: 40px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
h1 {
    font-size: 24px;
    margin-bottom: 20px;
}
</style>
