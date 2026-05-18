import type { User } from "@supabase/supabase-js";

const DEFAULT_AUTH_REDIRECT = "/dashboard";
const MAX_REDIRECT_LENGTH = 2048;
const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

function metadataString(metadata: User["user_metadata"] | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT
) {
  const candidate = value?.trim();

  if (!candidate || candidate.length > MAX_REDIRECT_LENGTH) {
    return fallback;
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//") || ABSOLUTE_URL_PATTERN.test(candidate)) {
    return fallback;
  }

  try {
    const url = new URL(candidate, "https://auth.local");
    if (url.origin !== "https://auth.local") {
      return fallback;
    }

    const path = `${url.pathname}${url.search}${url.hash}`;

    if (path.startsWith("/auth/callback") || path.startsWith("/auth/success")) {
      return fallback;
    }

    return path;
  } catch {
    return fallback;
  }
}

export function getAuthDisplayName(user: Pick<User, "email" | "user_metadata"> | null | undefined) {
  if (!user) return "用户";

  return (
    metadataString(user.user_metadata, "full_name") ||
    metadataString(user.user_metadata, "name") ||
    metadataString(user.user_metadata, "user_name") ||
    metadataString(user.user_metadata, "preferred_username") ||
    metadataString(user.user_metadata, "nickname") ||
    user.email?.split("@")[0] ||
    "用户"
  );
}

export function getAuthAvatarUrl(user: Pick<User, "user_metadata"> | null | undefined) {
  if (!user) return null;
  return metadataString(user.user_metadata, "avatar_url") || metadataString(user.user_metadata, "picture");
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "上午好";
  if (hour >= 12 && hour < 18) return "下午好";
  return "晚上好";
}

export function buildAuthCallbackUrl(origin: string, redirectTo: string | null | undefined) {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", getSafeRedirectPath(redirectTo));
  return callbackUrl.toString();
}
