import createNumberMask from "text-mask-addons/dist/createNumberMask";

export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeWord = (string: string): string => {
  return string
    .split(" ")
    .map((i) => capitalizeFirstLetter(i))
    .join(" ");
};

const defaultMaskOptions = {
  prefix: "",
  suffix: "",
  includeThousandsSeparator: false,
  allowDecimal: true,
  decimalSymbol: ".",
  decimalLimit: 2, // how many digits allowed after the decimal
  integerLimit: 7, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: false,
};

const intMaskOptions = {
  prefix: "",
  suffix: "",
  includeThousandsSeparator: false,
  allowDecimal: false,
  decimalSymbol: ".",
  integerLimit: 7, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: false,
};

export const TIME_LIST = [
  { label: "8:00 AM", value: "8:00" },
  { label: "8:30 AM", value: "8:30" },
  { label: "9:00 AM", value: "9:00" },
  { label: "9:30 AM", value: "9:30" },
  { label: "10:00 AM", value: "10:00" },
  { label: "10:30 AM", value: "10:30" },
  { label: "11:00 AM", value: "11:00" },
  { label: "11:30 AM", value: "11:30" },
  { label: "12:00 PM", value: "12:00" },
  { label: "12:30 PM", value: "12:30" },
  { label: "1:00 PM", value: "13:00" },
  { label: "1:30 PM", value: "13:30" },
  { label: "2:00 PM", value: "14:00" },
  { label: "2:30 PM", value: "14:30" },
  { label: "3:00 PM", value: "15:00" },
  { label: "3:30 PM", value: "15:30" },
  { label: "4:00 PM", value: "16:00" },
  { label: "4:30 PM", value: "16:30" },
  { label: "5:00 PM", value: "17:00" },
  { label: "5:30 PM", value: "17:30" },
  { label: "6:00 PM", value: "18:00" },
  { label: "6:30 PM", value: "18:30" },
  { label: "7:00 PM", value: "19:00" },
  { label: "7:30 PM", value: "19:30" },
  { label: "8:00 PM", value: "20:00" },
];

const admin = ["OWNER", "ADMIN", "OPERATIONS"];

export const isNotAdmin = (perm: string) => {
  return !admin.includes(perm);
};

export const StringToPriceint = (price: string) => {
  return ~~(Number(price) * 100);
};

export const numberMask = createNumberMask(defaultMaskOptions);
export const intMask = createNumberMask(intMaskOptions);
