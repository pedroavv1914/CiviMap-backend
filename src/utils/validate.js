function isString(v) { return typeof v === "string"; }
function str(v, min = 1, max = 200) { if (!isString(v)) return false; const t = v.trim(); return t.length >= min && t.length <= max; }
function optionalStr(v, max = 200) { if (v === undefined || v === null || v === "") return true; return str(v, 0, max); }
function email(v) { if (!isString(v)) return false; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function num(v, min = -Infinity, max = Infinity) { const n = Number(v); if (!Number.isFinite(n)) return false; return n >= min && n <= max; }
function integer(v, min = -Infinity, max = Infinity) { const n = Number(v); if (!Number.isInteger(n)) return false; return n >= min && n <= max; }
function enumeration(v, allowed = []) { return allowed.includes(v); }
export const validate = { str, optionalStr, email, num, integer, enumeration };
