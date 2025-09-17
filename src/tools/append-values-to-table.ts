import type { AppendValuesRequest, CellWriterResponse } from "../common/types";
import { appendValuesToTable as apiAppendValuesToTable } from "../api/cells/append-values-to-table";
import { Tool } from "@raycast/api";

type Input = {
  /** Spreadsheet ID containing the table */
  spreadsheetId: string;
  /** Table ID to append into */
  tableId: string;
  /** Target range in A1-style notation (e.g., "A1:C1") */
  range: string;
  /** Rows of values to append (outer array = rows) */
  values: string[][];
};

/**
 * Append rows of values to a table range in a spreadsheet.
 *
 * @param input Identifiers, target range, and rows of values to append.
 * @returns A `CellWriterResponse` with status information.
 */
export default async function tool(input: Input): Promise<CellWriterResponse> {
  if (!input || !input.spreadsheetId) throw new Error("spreadsheetId is required");
  if (!input.tableId) throw new Error("tableId is required");
  if (!input.range || !input.range.trim()) throw new Error("range is required");
  if (!Array.isArray(input.values) || input.values.length === 0)
    throw new Error("values must include at least one row");

  const payload: AppendValuesRequest = { values: input.values };
  return await apiAppendValuesToTable(input.spreadsheetId, input.tableId, input.range.trim(), payload);
}

export const confirmation: Tool.Confirmation<Input> = async (input: Input) => ({
  message: `Append ${input?.values?.length ?? 0} row(s) to range "${input?.range ?? ""}"? This will modify the table.`,
});
