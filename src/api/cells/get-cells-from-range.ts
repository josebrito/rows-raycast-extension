import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { CellGetterQueryParameters, GetCellsResponse } from "../../common/types";

export async function getCellsFromRange(
  spreadsheetId: string,
  tableId: string,
  range: string,
  options?: CellGetterQueryParameters,
): Promise<GetCellsResponse> {
  const base = `${API_URL}/spreadsheets/${spreadsheetId}/tables/${tableId}/cells/${range}`;
  const params = new URLSearchParams();

  if (options?.value_render_option) {
    params.set("value_render_option", options.value_render_option);
  }
  if (options?.datetime_render_option) {
    params.set("datetime_render_option", options.datetime_render_option);
  }
  if (options?.major_dimension) {
    params.set("major_dimension", options.major_dimension);
  }
  if (typeof options?.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (options?.page_token) {
    params.set("page_token", options.page_token);
  }

  const url = `${base}?${params.toString()}`;

  const res = await fetch(url, { headers: buildAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to get cells: ${res.status}`);
  return (await res.json()) as GetCellsResponse;
}
