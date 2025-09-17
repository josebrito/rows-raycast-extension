import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { CreateTableRequest, Table } from "../../common/types";

export async function createSpreadsheetTable(
  spreadsheetId: string,
  pageId: string,
  payload: CreateTableRequest,
): Promise<Table> {
  const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}/pages/${pageId}/tables`, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create table: ${res.status}`);
  return (await res.json()) as Table;
}
