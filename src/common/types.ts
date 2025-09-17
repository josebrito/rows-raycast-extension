export interface Workspace {
  id: string;
  slug: string;
  name?: string;
}

export interface Folder {
  id: string;
  slug: string;
  name: string;
}

export interface Spreadsheet {
  id: string;
  name: string;
  slug: string;
  folder_id: string;
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  pages: Page[];
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  tables: Table[];
}

export interface Table {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}
