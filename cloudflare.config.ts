import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig(({ isPreview }) => ({
  worker: defineWorker({
    name: "delvin-socks",
    domains: isPreview ? [] : ["delvin-socks.ir"],
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-11",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      // Cloudflare Images: optimizes next/image (/_next/image) on the fly.
      IMAGES: bindings.images(),
      DB: bindings.d1({
        name: isPreview ? "delvin-socks-preview" : "delvin-socks-db",
        id: isPreview
          ? "79e2f26b-4d87-4a67-87c3-83b7af11f3a8"
          : "8d537aba-79e4-4ff2-960d-752843b118af",
      }),
      DB_SEED: isPreview ? bindings.text("true") : undefined,
      DEPLOYMENT_ENV: isPreview ? bindings.text("preview") : undefined,
      TELEGRAM_NOTIFICATIONS_ENABLED: isPreview
        ? bindings.text("true")
        : bindings.secret(),
      // Secrets: set in production with `cf workers secrets update`,
      // read from .env / .dev.vars in local dev.
      ADMIN_PASSWORD: bindings.secret(),
      TELEGRAM_BOT_TOKEN: bindings.secret(),
      TELEGRAM_CHAT_ID: isPreview ? undefined : bindings.secret(),
      PREVIEW_TELEGRAM_CHAT_ID: isPreview ? bindings.secret() : undefined,
      SUPABASE_URL: isPreview
        ? bindings.text("https://nrwmvdjbbvtvuzrbrveu.supabase.co")
        : bindings.secret(),
      SUPABASE_SERVICE_KEY: bindings.secret(),
    },
  }),
}));
