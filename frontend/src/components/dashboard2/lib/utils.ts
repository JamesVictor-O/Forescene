export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassDictionary
  | ClassArray;

export interface ClassDictionary {
  [id: string]: any;
}

export interface ClassArray extends Array<ClassValue> {}

function toVal(mixed: ClassValue): string {
  let str = "";
  if (!mixed) return str;
  if (typeof mixed === "string" || typeof mixed === "number") {
    str += mixed;
  } else if (Array.isArray(mixed)) {
    for (let i = 0; i < mixed.length; i++) {
      const inner = toVal(mixed[i]);
      if (inner) {
        if (str) str += " ";
        str += inner;
      }
    }
  } else {
    for (const key in mixed as ClassDictionary) {
      if ((mixed as ClassDictionary)[key]) {
        if (str) str += " ";
        str += key;
      }
    }
  }
  return str;
}

export function cn(...inputs: ClassValue[]): string {
  let i = 0, tmp, x = "", str = "";
  while (i < inputs.length) {
    tmp = toVal(inputs[i++]);
    if (tmp) {
      x && (str += " ");
      str += tmp;
      x = tmp;
    }
  }
  return str;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}


