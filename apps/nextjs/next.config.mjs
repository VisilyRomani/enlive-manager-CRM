// @ts-check
import withTM from "next-transpile-modules";
import withPWA from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";
/**
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}
export default withSentryConfig(
  withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
  })(
    withTM(["@acme/api", "@acme/db"])(
      defineNextConfig({
        images: {
          domains: [
            "lh3.googleusercontent.com",
            "5d72dc28d38a0b43dc9ca4be12150f9e.r2.cloudflarestorage.com",
          ],
        },
        reactStrictMode: true,
        swcMinify: true,
      })
    )
  ),
  {
    silent: true,
    org: "michael-wong-306d0172f",
    project: "enlive-manager",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
