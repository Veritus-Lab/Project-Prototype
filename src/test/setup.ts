import "@testing-library/jest-dom/vitest";

process.env.APP_ENV ??= "test";
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
process.env.EXTERNAL_INTEGRATIONS_MODE ??= "disabled";
