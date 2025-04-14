/**
 * 圖片上傳工具函數
 * 將上傳的圖片保存到本地assets/images目錄
 */

// 模擬文件上傳處理，實際項目中，這通常是在後端完成的
// 這裡我們只是將文件轉換為URL並返回，實際上並沒有保存到文件系統
export const uploadLocalImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('文件不能為空'));
      return;
    }

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      reject(new Error('只能上傳圖片文件'));
      return;
    }

    // 檢查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('圖片大小不能超過5MB'));
      return;
    }

    // 創建一個FileReader來讀取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // 獲取Base64格式的圖片數據
        const base64Image = e.target.result;
        
        // 生成唯一文件名
        const timestamp = new Date().getTime();
        const fileName = `product_image_${timestamp}.${file.name.split('.').pop()}`;
        
        // 在實際項目中，此處會將文件保存到服務器
        // 但在前端環境中，我們只能模擬文件路徑
        // 我們假設將其保存在 assets/images 目錄下
        const imageUrl = `/src/assets/images/${fileName}`;
        
        // 實際上我們返回原始文件的DataURL，因為前端無法真正保存文件
        // 在實際的生產環境中，這裡會返回由服務器存儲的圖片URL
        resolve({ imageUrl: base64Image, fileName });
      } catch (error) {
        reject(new Error('圖片處理失敗'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('圖片讀取失敗'));
    };
    
    // 開始讀取文件
    reader.readAsDataURL(file);
  });
};

// 模擬獲取所有上傳的圖片
export const getUploadedImages = () => {
  // 實際中會從服務器或數據庫獲取圖片列表
  // 這裡只是返回一個空數組
  return [];
}; 