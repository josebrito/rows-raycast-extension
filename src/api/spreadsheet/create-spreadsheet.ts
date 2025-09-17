import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { CreateSpreadsheetRequest, Spreadsheet } from "../../common/types";

export async function createSpreadsheet(payload: CreateSpreadsheetRequest): Promise<Spreadsheet> {
  const res = await fetch(`${API_URL}/spreadsheets`, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create spreadsheet: ${res.status}`);
  return (await res.json()) as Spreadsheet;
}
