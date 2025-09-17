import type { Spreadsheet } from "../common/types";
import { listSpreadsheets as apiListSpreadsheets } from "../api/workspace/list-spreadsheets";

type Input = {
  /** Optional folder id to filter spreadsheets by folder */
  folderId?: string;
};

/**
 * List spreadsheets the user has access to, optionally filtered by folder ID.
 *
 * Returns `Spreadsheet` objects containing general information about the spreadsheets: identifiers and names.
 *
 * Does not return the contents of the spreadsheets, instead:
 * - use tool `get-spreadsheet` to get the elements of the spreadsheets.
 * - followed by tool `get-table-contents` to get the contents of the tables.
 *
 * @param input Structured arguments for the tool. Provide `folderId` to filter.
 * @returns Array of `Spreadsheet` items.
 */
export default async function tool(input: Input = {}): Promise<Spreadsheet[]> {
  const { folderId } = input;
  return await apiListSpreadsheets(folderId);
}
