import type { Spreadsheet } from "../common/types";
import { listSpreadsheets as apiListSpreadsheets } from "../api/workspace/list-spreadsheets";

type Input = {
  /** Optional folder id to filter spreadsheets by folder */
  folderId?: string;
};

/**
 * List spreadsheets the user has access to, optionally filtered by folder ID.
 *
 * @param input Structured arguments for the tool. Provide `folderId` to filter.
 * @returns Returns array of spreadsheets with metadata (not contents) such as IDs and names.
 */
export default async function tool(input: Input = {}): Promise<Spreadsheet[]> {
  const { folderId } = input;
  return await apiListSpreadsheets(folderId);
}
