import { apiError } from "@/lib/api-response";

export function GET() {
  return apiError("诊断接口已停用", 404, "DIAGNOSTIC_DISABLED");
}
