import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { AppendValuesRequest, CellWriterResponse } from "../../common/types";

export async function appendValuesToTable(
  spreadsheetId: string,
  tableId: string,
  range: string,
  payload: AppendValuesRequest,
): Promise<CellWriterResponse> {
  const url = `${API_URL}/spreadsheets/${spreadsheetId}/tables/${tableId}/values/${range}:append`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to append values: ${res.status}`);
  return (await res.json()) as CellWriterResponse;
}
