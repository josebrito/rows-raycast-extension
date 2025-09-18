import React, { useEffect, useMemo, useState } from "react";
import {
  Action,
  ActionPanel,
  Icon,
  List,
  Toast,
  closeMainWindow,
  getSelectedFinderItems,
  open,
  showToast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getWorkspaceInfo } from "./api/workspace/get-workspace-info";
import { listFolders } from "./api/workspace/list-folders";
import { listSpreadsheets } from "./api/workspace/list-spreadsheets";
import { getSpreadsheetInfo } from "./api/spreadsheet/get-spreadsheet-info";
import { createSpreadsheetTable } from "./api/spreadsheet/create-spreadsheet-table";
import { appendValuesToTable } from "./api/cells/append-values-to-table";
import type { Folder, Spreadsheet, Table } from "./common/types";
import { getSpreadsheetTableUrl } from "./common/utils";
import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

interface SelectedFile {
  path: string;
  name: string;
}

export default function Command() {
  const [csvFile, setCsvFile] = useState<SelectedFile | null>(null);
  const [csvValidationError, setCsvValidationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const selection = await getSelectedFinderItems();
        if (!selection || selection.length !== 1) {
          setCsvValidationError("Select exactly one CSV file in Finder and run this command again.");
          return;
        }
        const file = selection[0];
        const filePath = file.path || "";
        if (!filePath || path.extname(filePath).toLowerCase() !== ".csv") {
          setCsvValidationError("Selected item must be a .csv file.");
          return;
        }
        setCsvFile({ path: filePath, name: path.basename(filePath) });
      } catch (err) {
        setCsvValidationError(String(err));
      }
    })();
  }, []);

  const { data, isLoading, error } = useCachedPromise(
    async () => {
      const [workspace, folders, sheets] = await Promise.all([getWorkspaceInfo(), listFolders(), listSpreadsheets()]);
      const folderMap: Map<string, Folder> = new Map(folders.map((folder) => [folder.id, folder]));
      return {
        workspaceSlug: (workspace.slug as string) ?? null,
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

  const csvStatus = useMemo(() => {
    if (csvValidationError) return `CSV error: ${csvValidationError}`;
    if (csvFile) return `Selected CSV: ${csvFile.name}`;
    return "Waiting for CSV selection...";
  }, [csvFile, csvValidationError]);

  if (isLoading) {
    return <List isLoading searchBarPlaceholder={csvStatus} />;
  }

  if (error || csvValidationError) {
    return (
      <List isLoading={false} searchBarPlaceholder={csvStatus}>
        <List.EmptyView title="Cannot import CSV" description={csvValidationError || String(error)} />
      </List>
    );
  }

  if (spreadsheets.length === 0) {
    return (
      <List isLoading={false} searchBarPlaceholder={csvStatus}>
        <List.EmptyView title="No spreadsheets found" />
      </List>
    );
  }

  return (
    <List isLoading={false} searchBarPlaceholder={csvStatus} isShowingDetail={false}>
      {spreadsheets.map((sheet) => (
        <List.Item
          key={sheet.id}
          title={sheet.name}
          subtitle={folderMap.get(sheet.folder_id)?.name || ""}
          icon={Icon.List}
          actions={
            <ActionPanel>
              <Action
                title="Import File to Spreadsheet"
                onAction={() =>
                  handleImportIntoSpreadsheet(
                    workspaceSlug ?? "",
                    folderMap.get(sheet.folder_id)?.slug ?? "",
                    sheet,
                    csvFile,
                  )
                }
                icon={Icon.Upload}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function toColumnLetters(n: number): string {
  let s = "";
  let num = n;
  while (num > 0) {
    const mod = (num - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    num = Math.floor((num - 1) / 26);
  }
  return s || "A";
}

async function handleImportIntoSpreadsheet(
  workspaceSlug: string,
  folderSlug: string,
  spreadsheet: Spreadsheet,
  selectedFile: SelectedFile | null,
) {
  if (!selectedFile) {
    await showToast(Toast.Style.Failure, "No CSV selected", "Select a .csv file in Finder");
    return;
  }

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Importing CSV",
    message: selectedFile.name ?? "",
  });
  try {
    // 1) Read and parse CSV
    const raw = await fs.readFile(selectedFile.path, "utf8");
    const rows: unknown[] = parse(raw, { relax_column_count: true, skip_empty_lines: true });
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("CSV is empty or invalid");
    }
    const values: string[][] = (rows as unknown[] as string[][]).map((r) => r.map((v) => String(v ?? "")));
    const numCols = Math.max(...values.map((r) => r.length));
    if (numCols < 1) throw new Error("CSV has no columns");

    // 2) Get default page
    const info = await getSpreadsheetInfo(spreadsheet.id);
    const page = info.pages?.[0];
    if (!page) throw new Error("Spreadsheet has no pages");

    // 3) Create a new table
    const baseName = selectedFile.name ? selectedFile.name.replace(/\.csv$/i, "") : "Imported CSV";
    const table: Table = await createSpreadsheetTable(spreadsheet.id, page.id, { name: baseName });

    // 4) Append values to the table starting at first columns
    const range = `A:${toColumnLetters(numCols)}`;
    await appendValuesToTable(spreadsheet.id, table.id, range, { values });

    // 5) Open in browser
    const url = getSpreadsheetTableUrl(workspaceSlug, folderSlug, spreadsheet, page.id, table.slug);
    if (url) {
      await open(url);
      await closeMainWindow();
    }

    toast.style = Toast.Style.Success;
    toast.title = "Import complete";
    toast.message = baseName;
  } catch (err) {
    toast.style = Toast.Style.Failure;
    toast.title = "Import failed";
    toast.message = String(err);
  }
}
