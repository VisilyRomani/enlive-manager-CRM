export const SelectPlatform = [
  { label: "FACEBOOK", value: "FACEBOOK" },
  { label: "EMAIL", value: "EMAIL" },
  { label: "TEXT", value: "TEXT" },
  { label: "PHONE", value: "PHONE" },
];

export const selectStatus = [
  { label: "PENDING", value: "PENDING" },
  { label: "CONFIRMED", value: "CONFIRMED" },
  { label: "IN_PROGRESS", value: "IN_PROGRESS" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "CANCELED", value: "CANCELED" },
];

export const selectRole = [
  { label: "OWNER", value: "OWNER" },
  { label: "ADMIN", value: "ADMIN" },
  { label: "OPERATIONS", value: "OPERATIONS" },
  { label: "TEAMLEAD", value: "TEAMLEAD" },
  { label: "WORKER", value: "WORKER" },
];

export enum Platform {
  "FACEBOOK" = "FACEBOOK",
  "EMAIL" = "EMAIL",
  "TEXT" = "TEXT",
  "PHONE" = "PHONE",
}

export type status =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export type userRole = "OWNER" | "ADMIN" | "OPERATIONS" | "TEAMLEAD" | "WORKER";

export const phoneMask = [
  "(",
  /[1-9]/,
  /\d/,
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

export type paymentType = "ETRANSFER" | "CASH" | "CHEQUE" | "OTHER";

export const paymentSelect = [
  { label: "ETRANSFER", value: "ETRANSFER" },
  { label: "CASH", value: "CASH" },
  { label: "CHEQUE", value: "CHEQUE" },
  { label: "OTHER", value: "OTHER" },
];
