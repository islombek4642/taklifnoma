import { createHmac } from "node:crypto";

export function signInitData(botToken: string, fields: Record<string, string>): string {
  const dataCheckString = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const params = new URLSearchParams({ ...fields, hash });
  return params.toString();
}
