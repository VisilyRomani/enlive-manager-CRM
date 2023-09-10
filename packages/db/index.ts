require("dotenv").config();
import { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { Resend } from "resend";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  var s3: S3Client | undefined;
  var mail: Resend | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

export const s3 =
  global.s3 ||
  new S3Client({
    region: "auto",
    endpoint:
      "https://5d72dc28d38a0b43dc9ca4be12150f9e.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_ACCESS as string,
      secretAccessKey: process.env.CLOUDFLARE_SECRET as string,
    },
  });

export const mail = global.mail || new Resend(process.env.RESEND_API as string);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  global.s3 = s3;
}
