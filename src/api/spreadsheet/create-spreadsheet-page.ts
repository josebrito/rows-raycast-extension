import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { CreatePageRequest, Page } from "../../common/types";

export async function createSpreadsheetPage(spreadsheetId: string, payload: CreatePageRequest): Promise<Page> {
  const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}/pages`, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create page: ${res.status}`);
  return (await res.json()) as Page;
}
