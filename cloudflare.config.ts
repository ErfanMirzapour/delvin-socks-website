import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "delvin-socks",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-11",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({
        name: "delvin-socks-db",
        id: "8d537aba-79e4-4ff2-960d-752843b118af",
      }),
      // Secrets: set in production with `cf workers secrets update`,
      // read from .env / .dev.vars in local dev.
      ADMIN_PASSWORD: bindings.secret(),
      TELEGRAM_BOT_TOKEN: bindings.secret(),
      TELEGRAM_CHAT_ID: bindings.secret(),
      SUPABASE_URL: bindings.secret(),
      SUPABASE_SERVICE_KEY: bindings.secret(),
    },
  }),
});
