import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { Table, UpdateTableRequest } from "../../common/types";

export async function updateSpreadsheetTable(
  spreadsheetId: string,
  pageId: string,
  tableId: string,
  payload: UpdateTableRequest,
): Promise<Table> {
  const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}/pages/${pageId}/tables/${tableId}`, {
    method: "PATCH",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update table: ${res.status}`);
  return (await res.json()) as Table;
}
