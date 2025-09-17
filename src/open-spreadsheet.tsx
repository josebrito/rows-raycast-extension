import React, { useEffect, useState } from "react";
import { ActionPanel, Action, Icon, List, showToast, Toast, useNavigation, Keyboard } from "@raycast/api";
import { getSpreadsheetUrl, getTableUrl } from "./common/utils";
import type { Spreadsheet, SpreadsheetInfo } from "./common/types";
import { fetchWorkspaces } from "./services/fetch-workspaces";
import { fetchFolders } from "./services/fetch-folders";
import { fetchSpreadsheets } from "./services/fetch-spreadsheets";
import { fetchSpreadsheetInfo } from "./services/fetch-spreadsheet-info";

export default function Command() {
  const { push } = useNavigation();
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [folderMap, setFolderMap] = useState<Record<string, { slug: string; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * FIXME: remove withCache from the fetch functions
   * and replace this hook with a useCachedPromise hook
   */
  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // Fetch workspace slug
        const workspace = await fetchWorkspaces();
        // Fetch folders and build id->slug map
        const folders = await fetchFolders();
        const folderMap: Record<string, { slug: string; name: string }> = {};
        for (const folder of folders) {
          folderMap[folder.id] = { slug: folder.slug, name: folder.name };
        }
        // Fetch spreadsheets
        const sheets = await fetchSpreadsheets();

        setWorkspaceSlug(workspace.slug);
        setFolderMap(folderMap);
        setSpreadsheets(sheets);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        showToast(Toast.Style.Failure, "Failed to fetch data", err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
              <Action.OpenInBrowser url={getSpreadsheetUrl(workspaceSlug, folderMap, sheet)} />
              <Action.CopyToClipboard content={getSpreadsheetUrl(workspaceSlug, folderMap, sheet)} />
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
  const [info, setInfo] = useState<SpreadsheetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSpreadsheetInfo(props.spreadsheetId)
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
  }, [props.spreadsheetId]);

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
                  <Action.OpenInBrowser
                    url={getTableUrl(
                      props.workspaceSlug,
                      props.folderMap[props.spreadsheetFolderId]?.slug,
                      info,
                      page.id,
                      table.slug,
                    )}
                  />
                  <Action.CopyToClipboard
                    content={getTableUrl(
                      props.workspaceSlug,
                      props.folderMap[props.spreadsheetFolderId]?.slug,
                      info,
                      page.id,
                      table.slug,
                    )}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
