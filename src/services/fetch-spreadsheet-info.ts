import { withCache } from "@raycast/utils";
import { API_URL, buildAuthHeaders } from "../common/utils";
import type { SpreadsheetInfo } from "../common/types";

export const fetchSpreadsheetInfo = withCache(
  async (spreadsheetId: string): Promise<SpreadsheetInfo> => {
    const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}`, {
      headers: buildAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch spreadsheet info: ${res.status}`);
    return (await res.json()) as SpreadsheetInfo;
  },
  { maxAge: 2 * 60 * 1000 },
);
