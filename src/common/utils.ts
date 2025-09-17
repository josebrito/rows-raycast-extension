import { getPreferenceValues } from "@raycast/api";
import type { Spreadsheet, SpreadsheetInfo } from "./types";

export const API_URL = "https://api.rows.com/v1";
export const PREFERENCES = getPreferenceValues<{ apiToken?: string }>();

export function buildAuthHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${PREFERENCES.apiToken || ""}`,
  };
}

export function getSpreadsheetUrl(
  workspaceSlug: string | null,
  folderMap: Record<string, { slug: string; name: string }>,
  sheet: Spreadsheet,
): string {
  if (!workspaceSlug || !sheet.folder_id || !folderMap[sheet.folder_id]) return "";
  return `https://rows.com/${workspaceSlug}/${folderMap[sheet.folder_id].slug}/${sheet.slug}-${sheet.id}`;
}

export function getTableUrl(
  workspaceSlug: string | null,
  folderSlug: string | undefined,
  spreadsheet: SpreadsheetInfo,
  pageId: string,
  tableSlug: string,
): string {
  if (!workspaceSlug || !folderSlug) return "";
  return `https://rows.com/${workspaceSlug}/${folderSlug}/${spreadsheet.slug}-${spreadsheet.id}/${pageId}/edit#${tableSlug}`;
}
