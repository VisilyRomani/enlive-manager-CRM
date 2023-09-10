// src/server/router/index.ts
import { t } from "../trpc";
import { addressRouter } from "./address";

import { clientRouter } from "./client";
import { jobRouter } from "./job";
import { taskRouter } from "./task";
import { userRouter } from "./user";
import { companyRouter } from "./company";
import { codeRouter } from "./company_code";
import { scheudleRouter } from "./schedule";
import { stockRouter } from "./stock";
import { taxRouter } from "./tax";
import { productServiceRouter } from "./product_service";
import { invoiceTemplateRouter } from "./invoice_template";
import { invoiceRouter } from "./invoice";
import { transactionRouter } from "./transaction";
import { invoiceLocationRouter } from "./invoice_location";

export const appRouter = t.router({
  client: clientRouter,
  job: jobRouter,
  user: userRouter,
  address: addressRouter,
  task: taskRouter,
  company: companyRouter,
  company_code: codeRouter,
  schdule: scheudleRouter,
  stock: stockRouter,
  tax: taxRouter,
  product_service: productServiceRouter,
  invoiceTemplate: invoiceTemplateRouter,
  invoice: invoiceRouter,
  transaction: transactionRouter,
  invoiceLocation: invoiceLocationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
