// src/utils/eventBus.js
import mitt from "mitt";

// 創建 mitt 實例
const emitter = mitt();

// 導出該實例，以便在其他組件中引入和使用
export default emitter;
