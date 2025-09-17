import { API_URL, buildAuthHeaders } from "../../common/utils";
import type { Workspace } from "../../common/types";

export async function getWorkspaceInfo(): Promise<Workspace> {
  const res = await fetch(`${API_URL}/workspaces`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch workspaces: ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data)) return data[0] as Workspace;
  return data as Workspace;
}
