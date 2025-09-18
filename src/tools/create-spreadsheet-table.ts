import type { Table } from "../common/types";
import { createSpreadsheetTable as apiCreateSpreadsheetTable } from "../api/spreadsheet/create-spreadsheet-table";
import { Tool } from "@raycast/api";

type Input = {
  /** The spreadsheet ID where the table will be created */
  spreadsheetId: string;
  /** The spreadsheet name where the table will be created */
  spreadsheetName: string;
  /** The page ID within the spreadsheet where the table will be created */
  pageId: string;
  /** The page name within the spreadsheet where the table will be created */
  pageName: string;
  /** Name for the new table */
  name: string;
};

/**
 * Create a new table in a spreadsheet page.
 *
 * @param input Object containing spreadsheet info (id and name), page info (id and name) and the new table name.
 * @returns The created `Table` metadata.
 */
export default async function tool(input: Input): Promise<Table> {
  if (!input || !input.spreadsheetId) {
    throw new Error("spreadsheetId is required");
  }
  if (!input.pageId) {
    throw new Error("pageId is required");
  }
  if (!input.name || !input.name.trim()) {
    throw new Error("name is required");
  }

  return await apiCreateSpreadsheetTable(input.spreadsheetId, input.pageId, { name: input.name.trim() });
}

export const confirmation: Tool.Confirmation<Input> = async (input: Input) => ({
  message: `Create table "${input?.name ?? "(no name)"}" in page "${input?.pageName ?? input?.pageId ?? "(no page)"}" of spreadsheet "${input?.spreadsheetName ?? input?.spreadsheetId ?? "(no spreadsheet)"}"? This will create a new table in the specified page.`,
});
