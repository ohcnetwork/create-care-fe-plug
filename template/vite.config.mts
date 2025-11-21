import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: "REACT_",
  plugins: [
    federation({
      name: "{{PROJECT_NAME_SNAKE}}",
      filename: "remoteEntry.js",
      exposes: {
        "./manifest": "./src/manifest.ts",
      },
      shared: [
        "react",
        "react-dom",
        "react-i18next",
        "@tanstack/react-query",
        "raviger",
      ],
    }),
    tailwindcss(),
    react(),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        format: "esm",
      },
      input: {
        main: "./src/index.tsx",
      },
    },
  },
  preview: {
    port: {{PORT}},
    allowedHosts: true,
    host: "0.0.0.0",
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
