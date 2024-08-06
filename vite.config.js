import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import path from "path";

// https://vitejs.dev/config/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: {
      scopeBehaviour: "local",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
      hashPrefix: "prefix",
      globalModulePaths: [/global\.module\.css$/],
    },
  },
});
