import type { Folder } from "../common/types";
import { listFolders as apiListFolders } from "../api/workspace/list-folders";

/**
 * List workspace folders available to the authenticated user.
 *
 * Returns `Folder` objects with identifiers and names.
 *
 * @param _input No input required.
 * @returns Array of `Folder` items.
 */
export default async function tool(): Promise<Folder[]> {
  return await apiListFolders();
}
