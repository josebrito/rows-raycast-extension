import { withCache } from "@raycast/utils";
import { API_URL, buildAuthHeaders } from "../common/utils";
import type { Folder } from "../common/types";

export const fetchFolders = withCache(
  async (apiToken: string): Promise<Folder[]> => {
    const res = await fetch(`${API_URL}/folders?offset=0&limit=100`, {
      headers: buildAuthHeaders(apiToken),
    });
    if (!res.ok) throw new Error(`Failed to fetch folders: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return (data.flatMap((page) => page.items) as Folder[]) || [];
    }
    return (data.items || []) as Folder[];
  },
  { maxAge: 5 * 60 * 1000 },
);
