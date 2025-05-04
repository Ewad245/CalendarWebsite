import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import child_process from "child_process";
import { env } from "process";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const isDevelopment = process.env.NODE_ENV === "development";

const baseFolder =
  env.APPDATA !== undefined && env.APPDATA !== ""
    ? `${env.APPDATA}/ASP.NET/https`
    : `${env.HOME}/.aspnet/https`;

const certificateName = "calendarwebsite.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

// Only create certificates in development mode
if (isDevelopment) {
  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
  }

  if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (
      0 !==
      child_process.spawnSync(
        "dotnet",
        [
          "dev-certs",
          "https",
          "--export-path",
          certFilePath,
          "--format",
          "Pem",
          "--no-password",
        ],
        { stdio: "inherit" }
      ).status
    ) {
      throw new Error("Could not create certificate.");
    }
  }
}

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(";")[0]
  : "https://localhost:5194";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: isDevelopment
    ? {
        proxy: {
          "^/api": {
            target,
            secure: false,
          },
        },
        port: 50857,
        https: {
          key: fs.readFileSync(keyFilePath),
          cert: fs.readFileSync(certFilePath),
        },
      }
    : undefined,
});
