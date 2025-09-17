import type { SpreadsheetInfo } from "../common/types";
import { getSpreadsheetInfo as apiGetSpreadsheetInfo } from "../api/spreadsheet/get-spreadsheet-info";

type Input = {
  /** The spreadsheet ID to retrieve information for */
  spreadsheetId: string;
};

/**
 * Get a spreadsheet's structure for a given spreadsheet ID.
 *
 * Returns `SpreadsheetInfo` including contained pages and tables information (ID, name, slug).
 *
 * Does not return the contents of the tables, for that use tool `get-table-contents`.
 *
 * @param input Object containing the required `spreadsheetId`.
 * @returns The `SpreadsheetInfo` for the given spreadsheet.
 */
export default async function tool(input: Input): Promise<SpreadsheetInfo> {
  if (!input || !input.spreadsheetId) {
    throw new Error("spreadsheetId is required");
  }
  return await apiGetSpreadsheetInfo(input.spreadsheetId);
}
