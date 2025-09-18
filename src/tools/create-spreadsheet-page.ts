import type { Page } from "../common/types";
import { createSpreadsheetPage as apiCreateSpreadsheetPage } from "../api/spreadsheet/create-spreadsheet-page";
import { Tool } from "@raycast/api";

type Input = {
  /** The spreadsheet ID where the page will be created */
  spreadsheetId: string;
  /** The spreadsheet name where the page will be created */
  spreadsheetName: string;
  /** Name for the new page */
  name: string;
};

/**
 * Create a new page in a spreadsheet.
 *
 * @param input Object containing spreadsheet info (id and name) and the new page `name`.
 * @returns The created `Page` metadata.
 */
export default async function tool(input: Input): Promise<Page> {
  if (!input || !input.spreadsheetId) {
    throw new Error("spreadsheetId is required");
  }
  if (!input.name || !input.name.trim()) {
    throw new Error("name is required");
  }

  return await apiCreateSpreadsheetPage(input.spreadsheetId, { name: input.name.trim() });
}

export const confirmation: Tool.Confirmation<Input> = async (input: Input) => ({
  message: `Create page "${input?.name ?? "(no name)"}" in spreadsheet "${input?.spreadsheetName ?? input?.spreadsheetId ?? "(no spreadsheet)"}"? This will create a new page in the specified spreadsheet.`,
});
