import type {
  GetValuesResponse,
  ValueRenderOption,
  DateTimeRenderOption,
  MajorDimension,
  CellGetterQueryParameters,
} from "../common/types";
import { getValuesFromRange as apiGetValuesFromRange } from "../api/cells/get-values-from-range";

type Input = {
  /** Spreadsheet ID containing the table */
  spreadsheetId: string;
  /** Table ID to read from */
  tableId: string;
  /** Range in A1-style notation (e.g., "A1:C10") */
  range: string;
  /** How to render cell values (default: FORMATTED) */
  valueRenderOption?: ValueRenderOption;
  /** How to render datetimes (default: FORMATTED) */
  datetimeRenderOption?: DateTimeRenderOption;
  /** Major dimension for returned data (default: ROW) */
  majorDimension?: MajorDimension;
  /** Max number of items to return (server default 10000) */
  limit?: number;
  /** Pagination token from previous response */
  pageToken?: string;
};

/**
 * Get table contents (cell values) for a given spreadsheet table and range.
 *
 * Returns `GetValuesResponse` with `items` and `next_page_token`.
 *
 * @param input Object with identifiers and optional render/pagination options.
 * @returns The values response for the specified range.
 */
export default async function tool(input: Input): Promise<GetValuesResponse> {
  if (!input || !input.spreadsheetId) throw new Error("spreadsheetId is required");
  if (!input.tableId) throw new Error("tableId is required");
  if (!input.range || !input.range.trim()) throw new Error("range is required");

  const options: CellGetterQueryParameters = {
    value_render_option: input.valueRenderOption || "FORMATTED",
    datetime_render_option: input.datetimeRenderOption || "FORMATTED",
    major_dimension: input.majorDimension,
    ...(typeof input.limit === "number" ? { limit: input.limit } : {}),
    ...(input.pageToken ? { page_token: input.pageToken } : {}),
  };

  return await apiGetValuesFromRange(input.spreadsheetId, input.tableId, input.range.trim(), options);
}
