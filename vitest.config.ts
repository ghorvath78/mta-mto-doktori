import { defineConfig } from "vitest/config";

// Az appok tesztjei az app saját vite.config.ts-ét használják, így a modulfeloldás ugyanaz, mint az appban.
export default defineConfig({
    test: {
        projects: ["packages/form-schemas", "packages/mtmt-tools", "apps/kerelmezoi", "apps/eloterjesztoi", "apps/bizottsagi"]
    }
});
