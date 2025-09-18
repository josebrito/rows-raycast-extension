import type { SpreadsheetInfo } from "../common/types";
import { getSpreadsheetInfo as apiGetSpreadsheetInfo } from "../api/spreadsheet/get-spreadsheet-info";

type Input = {
  /** The spreadsheet ID to retrieve information for */
  spreadsheetId: string;
};

/**
 * Get a spreadsheet's structure for a given spreadsheet ID, the contained pages and tables.
 *
 * @param input Object containing the required `spreadsheetId`.
 * @returns The spreadsheet structure for the given spreadsheet, includes pages and tables information (ID, name, slug).
 */
export default async function tool(input: Input): Promise<SpreadsheetInfo> {
  if (!input || !input.spreadsheetId) {
    throw new Error("spreadsheetId is required");
  }
  return await apiGetSpreadsheetInfo(input.spreadsheetId);
}
