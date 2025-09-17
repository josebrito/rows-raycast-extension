import { API_URL, buildAuthHeaders } from "../common/utils";
import type { Folder } from "../common/types";

export async function listFolders(): Promise<Folder[]> {
  const res = await fetch(`${API_URL}/folders?offset=0&limit=100`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch folders: ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data)) {
    return (data.flatMap((page) => page.items) as Folder[]) || [];
  }
  return (data.items || []) as Folder[];
}
