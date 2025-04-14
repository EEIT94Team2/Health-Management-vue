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
    },
    publicDir: 'public',
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.svg', '**/*.gif'],
});
