/**
 * 認證相關 API 服務
 * 包含登入、註冊、忘記密碼、重設密碼等功能
 */

import axios from './config/axios';

/**
 * 忘記密碼 - 發送重設密碼連結
 * @param {Object} data - 請求數據
 * @param {string} data.email - 用戶電子郵件
 * @returns {Promise<Object>} 請求結果
 */
export const forgotPassword = async (data) => {
  try {
    const response = await axios.post('/api/auth/forgot-password', data);
    return response;
  } catch (error) {
    console.error('忘記密碼請求失敗', error);
    throw error;
  }
};

/**
 * 驗證重設密碼令牌是否有效
 * @param {Object} data - 請求數據
 * @param {string} data.token - 重設密碼令牌
 * @returns {Promise<Object>} 請求結果
 */
export const validateResetToken = async (data) => {
  try {
    const response = await axios.post('/api/auth/validate-reset-token', data);
    return response;
  } catch (error) {
    console.error('令牌驗證失敗', error);
    throw error;
  }
};

/**
 * 重設密碼
 * @param {Object} data - 請求數據
 * @param {string} data.token - 重設密碼令牌
 * @param {string} data.newPassword - 新密碼
 * @returns {Promise<Object>} 請求結果
 */
export const resetPassword = async (data) => {
  try {
    const response = await axios.post('/api/auth/reset-password', {
      token: data.token,
      password: data.newPassword  // 將 newPassword 轉換為 password
    });
    return response;
  } catch (error) {
    console.error('重設密碼失敗', error);
    throw error;
  }
};

// 注意：登入、註冊和登出功能已經由 Pinia store 處理
// 這裡只添加忘記密碼和重設密碼的 API 