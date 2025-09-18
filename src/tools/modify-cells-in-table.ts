import type { OverwriteRangeRequest } from "../common/types";
import { overwriteTableCells as apiOverwriteTableCells } from "../api/cells/overwrite-table-cells";
import { Tool } from "@raycast/api";

type Input = {
  /** Spreadsheet ID containing the table */
  spreadsheetId: string;
  /** Table ID to overwrite */
  tableId: string;
  /**
   * Target range in A1-style notation (e.g., "A1:C1").
   * Always provide both bounds in ranges:
   * - Unbounded range formats like "A:A", "A:B", "A:C" are CORRECT
   * - Bounded range formats like "A1:A", "A1:A10", "A1:B10" are CORRECT
   * - Single bounded/unbounded formats like "A", "A1", "B1" are INCORRECT
   *
   * To update a single cell, use a bounded range with the same row and column ("A1:A1").
   */
  range: string;
  /** Rows of values to write (outer array = rows) */
  values: string[][];
  /** Optional: Rows of formulas to write (outer array = rows) */
  formulas?: string[][];
};

/**
 * Overwrite cells (values and formulas) in a table range in a spreadsheet.
 *
 * Pass formulas only when needed: if specifying formulas, the array must have the same number of rows as the values array.
 * Use empty strings for empty cells.
 * If a cell contains a value and a formula, the formula will take precedence over the value.
 * If a cell contains values and formulas, they will be overwritten.
 *
 * @param input Identifiers, target range, and rows of cells to write.
 * @returns 'true' if the request was accepted, 'false' otherwise.
 */
export default async function tool(input: Input): Promise<boolean> {
  if (!input || !input.spreadsheetId) throw new Error("spreadsheetId is required");
  if (!input.tableId) throw new Error("tableId is required");
  if (!input.range || !input.range.trim()) throw new Error("range is required");
  if (!Array.isArray(input.values) || input.values.length === 0)
    throw new Error("values must include at least one row");

  if (input.formulas && input.values.length !== input.formulas.length) {
    throw new Error("values and formulas arrays must have the same number of rows");
  }

  // Check that all rows have same length within values array
  const valueRowLength = input.values[0].length;
  if (!input.values.every((row) => row.length === valueRowLength)) {
    throw new Error("all rows in values array must have the same length");
  }

  // If formulas exist, check all rows have same length and match values dimensions
  if (input.formulas) {
    const formulaRowLength = input.formulas[0].length;
    if (!input.formulas.every((row) => row.length === formulaRowLength)) {
      throw new Error("all rows in formulas array must have the same length");
    }
    if (formulaRowLength !== valueRowLength) {
      throw new Error("values and formulas arrays must have the same number of columns");
    }
  }

  // Convert to cells array with values and formulas
  const cells = input.values.map((row, rowIndex) =>
    row.map((value, colIndex) => ({
      value: value || "",
      formula: input.formulas ? input.formulas[rowIndex][colIndex] || "" : "",
    })),
  );

  const payload: OverwriteRangeRequest = { cells };
  return await apiOverwriteTableCells(input.spreadsheetId, input.tableId, input.range.trim(), payload);
}

export const confirmation: Tool.Confirmation<Input> = async (input: Input) => ({
  message: `Overwrite ${input.values.length ?? 0} row(s) in range "${input?.range ?? ""}"? This will replace existing data.`,
});
