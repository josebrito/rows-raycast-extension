import { withCache } from "@raycast/utils";
import { API_URL, buildAuthHeaders } from "../common/utils";
import type { Workspace } from "../common/types";

export const fetchWorkspaces = withCache(
  async (apiToken: string): Promise<Workspace> => {
    const res = await fetch(`${API_URL}/workspaces`, {
      headers: buildAuthHeaders(apiToken),
    });
    if (!res.ok) throw new Error(`Failed to fetch workspaces: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data[0] as Workspace;
    return data as Workspace;
  },
  { maxAge: 5 * 60 * 1000 },
);
