const KEY = "RatinGrow@JobId#2026";
const PREFIX = "rg";

const toBase64Url = (str) =>
  btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (str) => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
};

const xor = (str) =>
  Array.from(str)
    .map((ch, i) =>
      String.fromCharCode(ch.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length))
    )
    .join("");

export const encodeJobId = (id) => {
  if (id === null || id === undefined || id === "") return "";
  return PREFIX + toBase64Url(xor(String(id)));
};

// Returns the original id; plain (unencrypted) ids are passed through.
export const decodeJobId = (token) => {
  if (token === null || token === undefined) return token;
  const value = decodeURIComponent(String(token));
  if (!value.startsWith(PREFIX)) return value;
  try {
    return xor(fromBase64Url(value.slice(PREFIX.length)));
  } catch {
    return value;
  }
};
