import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { Page, UpdatePageRequest } from "../../common/types";

export async function updateSpreadsheetPage(
  spreadsheetId: string,
  pageId: string,
  payload: UpdatePageRequest,
): Promise<Page> {
  const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update page: ${res.status}`);
  return (await res.json()) as Page;
}
