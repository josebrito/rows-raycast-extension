import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { OverwriteRangeRequest, BadResponse } from "../../common/types";

export async function overwriteTableCells(
  spreadsheetId: string,
  tableId: string,
  range: string,
  payload: OverwriteRangeRequest,
): Promise<boolean> {
  const url = `${API_URL}/spreadsheets/${spreadsheetId}/tables/${tableId}/cells/${range}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to modify cells: ${res.status} - ${((await res.json()) as BadResponse)?.message || "Unknown error"}`,
    );
  }
  return res.status === 202;
}
