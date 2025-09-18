import type { AppendValuesRequest } from "../common/types";
import { appendValuesToTable as apiAppendValuesToTable } from "../api/cells/append-values-to-table";
import { Tool } from "@raycast/api";

type Input = {
  /** Spreadsheet ID containing the table */
  spreadsheetId: string;
  /** Table ID to append into */
  tableId: string;
  /**
   * Target range in A1-style notation (e.g., "A1:C1")
   * Always provide both bounds in ranges:
   * - Unbounded range formats like "A:A", "A:B", "A:C" are CORRECT
   * - Bounded range formats like "A1:A", "A1:A10", "A1:B10" are CORRECT
   * - Single bounded/unbounded formats like "A", "A1", "B1" are INCORRECT
   */
  range: string;
  /**
   * Rows of values to append (outer array = rows).
   * To set a cell to an empty value, set the string value to an empty string.
   * The values are written to the specified range from the left to the right cell, moving row by row.
   * Example: if you request range=A:B and the cells are filled until range A10:B10, then the API will append to the next empty row: A11, B11.
   */
  values: string[][];
};

/**
 * Append rows of values to a table range in a spreadsheet.
 *
 * @param input Identifiers, target range, and rows of values to append.
 * @returns 'true' if the values were appended, 'false' otherwise.
 */
export default async function tool(input: Input): Promise<boolean> {
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
