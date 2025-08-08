import React, { useEffect, useState } from "react";
import {
  ActionPanel,
  Action,
  Icon,
  List,
  getPreferenceValues,
  showToast,
  Toast,
  useNavigation,
  Keyboard,
} from "@raycast/api";
import { withCache } from "@raycast/utils";

interface Spreadsheet {
  id: string;
  name: string;
  slug: string;
  folder_id: string;
}

interface Folder {
  id: string;
  slug: string;
  name: string;
}

// Add type for spreadsheet info response
interface SpreadsheetInfo {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  pages: Array<{
    id: string;
    name: string;
    slug: string;
    created_at: string;
    tables: Array<{
      id: string;
      name: string;
      slug: string;
      created_at: string;
    }>;
  }>;
}

const PREFERENCES = getPreferenceValues<{ apiToken?: string; folderId?: string }>();
const API_URL = "https://api.rows.com/v1";

const fetchWorkspaces = withCache(
  async (apiToken: string) => {
    const res = await fetch(`${API_URL}/workspaces`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch workspaces: ${res.status}`);
    const data = await res.json();
    // If the response is an array, pick the first workspace
    if (Array.isArray(data)) return data[0];
    return data;
  },
  { maxAge: 5 * 60 * 1000 },
);

const fetchFolders = withCache(
  async (apiToken: string) => {
    const res = await fetch(`${API_URL}/folders?offset=0&limit=100`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch folders: ${res.status}`);
    const data = await res.json();
    // Some APIs wrap items in an array, some in an object
    if (Array.isArray(data)) {
      // If the response is an array, merge all items arrays
      return data.flatMap((page) => page.items as Folder[]);
    }
    return data.items as Folder[];
  },
  { maxAge: 5 * 60 * 1000 },
);

const fetchSpreadsheets = withCache(
  async (apiToken: string, folderId?: string) => {
    const url = `${API_URL}/spreadsheets?${folderId ? `folder_id=${folderId}&` : ""}offset=0&limit=100`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch spreadsheets: ${res.status}`);
    const data = await res.json();
    return (data.items || []) as Spreadsheet[];
  },
  { maxAge: 2 * 60 * 1000 },
);

// Fetch spreadsheet info by ID, with cache
const fetchSpreadsheetInfo = withCache(
  async (apiToken: string, spreadsheetId: string): Promise<SpreadsheetInfo> => {
    const res = await fetch(`${API_URL}/spreadsheets/${spreadsheetId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch spreadsheet info: ${res.status}`);
    return await res.json();
  },
  { maxAge: 2 * 60 * 1000 },
);

export default function Command() {
  const { push } = useNavigation();
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [folderMap, setFolderMap] = useState<Record<string, { slug: string; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiToken = PREFERENCES.apiToken || "";
    const folderId = PREFERENCES.folderId;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // Fetch workspace slug
        const workspace = await fetchWorkspaces(apiToken);
        setWorkspaceSlug(workspace.slug);
        // Fetch folders and build id->slug map
        const folders = await fetchFolders(apiToken);
        const folderMap: Record<string, { slug: string; name: string }> = {};
        for (const folder of folders) {
          folderMap[folder.id] = { slug: folder.slug, name: folder.name };
        }
        setFolderMap(folderMap);
        // Fetch spreadsheets
        const sheets = await fetchSpreadsheets(apiToken, folderId);
        setSpreadsheets(sheets);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        showToast(Toast.Style.Failure, "Failed to fetch data", err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getSpreadsheetUrl(sheet: Spreadsheet): string {
    if (!workspaceSlug || !sheet.folder_id || !folderMap[sheet.folder_id]) return "";
    return `https://rows.com/${workspaceSlug}/${folderMap[sheet.folder_id].slug}/${sheet.slug}-${sheet.id}`;
  }

  if (loading) {
    return <List isLoading />;
  }

  if (error) {
    return (
      <List isLoading={false}>
        <List.EmptyView title="Error" description={error} />
      </List>
    );
  }

  if (spreadsheets.length === 0) {
    return (
      <List isLoading={false}>
        <List.EmptyView title="No spreadsheets found" />
      </List>
    );
  }

  return (
    <List isLoading={false} searchBarPlaceholder="Search spreadsheets..." isShowingDetail={false}>
      {spreadsheets.map((sheet) => (
        <List.Item
          key={sheet.id}
          title={sheet.name}
          subtitle={folderMap[sheet.folder_id]?.name || ""}
          icon={Icon.List}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={getSpreadsheetUrl(sheet)} />
              <Action.CopyToClipboard content={getSpreadsheetUrl(sheet)} />
              <Action
                title="Show Spreadsheet Tables"
                onAction={() =>
                  push(
                    <SpreadsheetInfoScreen
                      spreadsheetId={sheet.id}
                      spreadsheetName={sheet.name}
                      spreadsheetSlug={sheet.slug}
                      spreadsheetFolderId={sheet.folder_id}
                      workspaceSlug={workspaceSlug}
                      folderMap={folderMap}
                    />,
                  )
                }
                shortcut={Keyboard.Shortcut.Common.Open}
                icon={Icon.Eye}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export function SpreadsheetInfoScreen(props: {
  spreadsheetId: string;
  spreadsheetName: string;
  spreadsheetSlug: string;
  spreadsheetFolderId: string;
  workspaceSlug: string | null;
  folderMap: Record<string, { slug: string; name: string }>;
}) {
  const apiToken = PREFERENCES.apiToken || "";
  const [info, setInfo] = useState<SpreadsheetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSpreadsheetInfo(apiToken, props.spreadsheetId)
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiToken, props.spreadsheetId]);

  if (loading) {
    return <List isLoading navigationTitle={props.spreadsheetName} />;
  }
  if (error) {
    return (
      <List navigationTitle={props.spreadsheetName}>
        <List.EmptyView title="Error" description={error} />
      </List>
    );
  }
  if (!info) {
    return (
      <List navigationTitle={props.spreadsheetName}>
        <List.EmptyView title="No data" />
      </List>
    );
  }

  // Helper to build table URL
  function getTableUrl(table: { slug: string }, page: { id: string }, spreadsheet: SpreadsheetInfo) {
    const workspaceSlug = props.workspaceSlug;
    const folderId = props.spreadsheetFolderId;
    const folderSlug = props.folderMap[folderId]?.slug;
    if (!workspaceSlug || !folderSlug) return "";
    return `https://rows.com/${workspaceSlug}/${folderSlug}/${spreadsheet.slug}-${spreadsheet.id}/${page.id}/edit#${table.slug}`;
  }

  return (
    <List navigationTitle={info.name} searchBarPlaceholder="Search tables...">
      {info.pages.map((page) => (
        <List.Section key={page.id} title={page.name}>
          {page.tables.map((table) => (
            <List.Item
              key={table.id}
              title={table.name}
              icon={Icon.AppWindowGrid3x3}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={getTableUrl(table, page, info)} />
                  <Action.CopyToClipboard content={getTableUrl(table, page, info)} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
