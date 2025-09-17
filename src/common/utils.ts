import { getPreferenceValues } from "@raycast/api";
import type { Spreadsheet } from "./types";

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
  folderSlug: string | undefined,
  sheet: Spreadsheet,
): string {
  if (!workspaceSlug || !folderSlug) return "";
  return `https://rows.com/${workspaceSlug}/${folderSlug}/${sheet.slug}-${sheet.id}`;
}

export function getSpreadsheetTableUrl(
  workspaceSlug: string | null,
  folderSlug: string | undefined,
  spreadsheet: Spreadsheet,
  spreadsheetPageId: string,
  spreadsheetTableSlug: string,
): string {
  if (!workspaceSlug || !folderSlug) return "";
  return `${getSpreadsheetUrl(workspaceSlug, folderSlug, spreadsheet)}/${spreadsheetPageId}/edit#${spreadsheetTableSlug}`;
}
