import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { OverwriteRangeRequest, CellWriterResponse } from "../../common/types";

export async function overwriteTableCells(
  spreadsheetId: string,
  tableId: string,
  range: string,
  payload: OverwriteRangeRequest,
): Promise<CellWriterResponse> {
  const url = `${API_URL}/spreadsheets/${spreadsheetId}/tables/${tableId}/cells/${range}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to overwrite cells: ${res.status}`);
  return (await res.json()) as CellWriterResponse;
}
