import type { Workspace } from "../common/types";
import { getWorkspaceInfo as fetchWorkspaceInfo } from "../api/workspace/get-workspace-info";

/**
 * Retrieve the active Rows workspace information for the authenticated user.
 *
 * No input is required.
 *
 * @returns The current user's `Workspace` object with identifiers and metadata.
 */
export default async function tool(): Promise<Workspace> {
  return await fetchWorkspaceInfo();
}
