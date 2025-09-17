import type { Spreadsheet } from "../common/types";
import { createSpreadsheet as apiCreateSpreadsheet } from "../api/spreadsheet/create-spreadsheet";
import { Tool } from "@raycast/api";

type Input = {
  /** Name for the new spreadsheet */
  name: string;
};

/**
 * Create a new spreadsheet in the current workspace.
 *
 * Note: This operation is Enterprise-only in the Rows API.
 *
 * @param input Object containing the required `name` for the spreadsheet.
 * @returns The created `Spreadsheet` metadata.
 */
export default async function tool(input: Input): Promise<Spreadsheet> {
  if (!input || !input.name || !input.name.trim()) {
    throw new Error("name is required");
  }
  return await apiCreateSpreadsheet({ name: input.name.trim() });
}

export const confirmation: Tool.Confirmation<Input> = async (input: Input) => ({
  message: `Create spreadsheet "${input?.name ?? "(no name)"}"? This will create a new spreadsheet in your Rows workspace.`,
});
