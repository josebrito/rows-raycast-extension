import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { Spreadsheet } from "../../common/types";

export async function listSpreadsheets(folderId?: string): Promise<Spreadsheet[]> {
  const url = `${API_URL}/spreadsheets?${folderId ? `folder_id=${folderId}&` : ""}offset=0&limit=100`;
  const res = await fetch(url, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch spreadsheets: ${res.status}`);
  const data = await res.json();
  return (data.items || []) as Spreadsheet[];
}
