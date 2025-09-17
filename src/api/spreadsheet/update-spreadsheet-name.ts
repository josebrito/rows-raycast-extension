import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { Spreadsheet, UpdateSpreadsheetRequest } from "../../common/types";

export async function updateSpreadsheetName(
  spreadsheetId: string,
  payload: UpdateSpreadsheetRequest,
): Promise<Spreadsheet> {
  const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}`, {
    method: "PATCH",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update spreadsheet: ${res.status}`);
  return (await res.json()) as Spreadsheet;
}
