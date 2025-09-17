import React, { useEffect } from "react";
import { ActionPanel, Action, Icon, List, showToast, Toast, useNavigation, Keyboard } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getSpreadsheetUrl, getSpreadsheetTableUrl } from "./common/utils";
import type { Folder, Spreadsheet } from "./common/types";
import { getWorkspaceInfo } from "./api/workspace/get-workspace-info";
import { listFolders } from "./api/workspace/list-folders";
import { listSpreadsheets } from "./api/workspace/list-spreadsheets";
import { getSpreadsheetInfo } from "./api/spreadsheet/get-spreadsheet-info";

export default function Command() {
  const { push } = useNavigation();

  const { data, isLoading, error } = useCachedPromise(
    async () => {
      const [workspace, folders, sheets] = await Promise.all([getWorkspaceInfo(), listFolders(), listSpreadsheets()]);
      const folderMap: Map<string, Folder> = new Map(folders.map((folder) => [folder.id, folder]));
      return {
        workspaceSlug: workspace.slug as string | null,
        folderMap,
        spreadsheets: sheets as Spreadsheet[],
      };
    },
    [],
    { keepPreviousData: true },
  );

  const spreadsheets = data?.spreadsheets ?? [];
  const workspaceSlug = data?.workspaceSlug ?? null;
  const folderMap = data?.folderMap ?? new Map<string, Folder>();

  useEffect(() => {
    if (error) {
      showToast(Toast.Style.Failure, "Failed to fetch data", String(error));
    }
  }, [error]);

  if (isLoading) {
    return <List isLoading />;
  }

  if (error) {
    return (
      <List isLoading={false}>
        <List.EmptyView title="Error" description={String(error)} />
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
          subtitle={folderMap.get(sheet.folder_id)?.name || ""}
          icon={Icon.List}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                url={getSpreadsheetUrl(workspaceSlug, folderMap.get(sheet.folder_id)?.slug, sheet)}
              />
              <Action.CopyToClipboard
                content={getSpreadsheetUrl(workspaceSlug, folderMap.get(sheet.folder_id)?.slug, sheet)}
              />
              <Action
                title="Show Spreadsheet Tables"
                onAction={() =>
                  push(
                    <SpreadsheetInfoScreen
                      workspaceSlug={workspaceSlug}
                      folderSlug={folderMap.get(sheet.folder_id)?.slug ?? ""}
                      spreadsheet={sheet}
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
  workspaceSlug: string | null;
  folderSlug: string;
  spreadsheet: Spreadsheet;
}) {
  const { workspaceSlug, folderSlug, spreadsheet } = props;
  const { id, name } = spreadsheet;

  const { data, isLoading, error } = useCachedPromise(
    async (spreadsheetId: string) => getSpreadsheetInfo(spreadsheetId),
    [id],
    {
      keepPreviousData: true,
    },
  );

  if (isLoading) {
    return <List isLoading navigationTitle={name} />;
  }
  if (error) {
    return (
      <List navigationTitle={name}>
        <List.EmptyView title="Error" description={String(error)} />
      </List>
    );
  }
  if (!data) {
    return (
      <List navigationTitle={name}>
        <List.EmptyView title="No data" />
      </List>
    );
  }

  return (
    <List navigationTitle={data.name} searchBarPlaceholder="Search tables...">
      {data.pages.map((page) => (
        <List.Section key={page.id} title={page.name}>
          {page.tables.map((table) => (
            <List.Item
              key={table.id}
              title={table.name}
              icon={Icon.AppWindowGrid3x3}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser
                    url={getSpreadsheetTableUrl(workspaceSlug, folderSlug, spreadsheet, page.id, table.slug)}
                  />
                  <Action.CopyToClipboard
                    content={getSpreadsheetTableUrl(workspaceSlug, folderSlug, spreadsheet, page.id, table.slug)}
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
