import { createHmac } from "node:crypto";
import { LIMITS } from "../../shared/constants/limits.js";

export interface TelegramInitDataResult {
  isValid: boolean;
  telegramId?: bigint;
}

export function validateTelegramInitData(initData: string, botToken: string): TelegramInitDataResult {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { isValid: false };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return { isValid: false };

  const authDate = Number(params.get("auth_date"));
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (!Number.isFinite(authDate) || ageSeconds > LIMITS.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS) {
    return { isValid: false };
  }

  const userJson = params.get("user");
  if (!userJson) return { isValid: false };

  const user = JSON.parse(userJson) as { id: number };
  return { isValid: true, telegramId: BigInt(user.id) };
}
