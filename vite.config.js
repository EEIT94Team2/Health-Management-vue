import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            bootstrap: fileURLToPath(new URL("./node_modules/bootstrap", import.meta.url)),
        },
    },
    optimizeDeps: {
        include: ["@popperjs/core"],
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    server: {
        port: 5173,
        host: "localhost",
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        }
        // ====== 加入 proxy 配置在這裡 END ======
    },
    publicDir: 'public',
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.svg', '**/*.gif'],
});
