type BaseElement = {
  id: string;
  slug: string;
  name: string;
};

export type Workspace = BaseElement;
export type Folder = BaseElement;
export type Spreadsheet = BaseElement & {
  folder_id: string;
};
export type SpreadsheetInfo = BaseElement & {
  created_at: string;
  pages: Page[];
};
export type Page = BaseElement & {
  created_at: string;
  tables: Table[];
};
export type Table = BaseElement & {
  created_at: string;
};

export interface CellPosition {
  col: number;
  row: number;
}

export interface CellContent {
  value: number | string | null;
  formula: string | null;
}

export type Cell = CellPosition & CellContent;

// ----------------------------
// Requests
// ----------------------------

interface BaseRequestPayload {
  name: string;
}

export type CreateSpreadsheetRequest = BaseRequestPayload;
export type UpdateSpreadsheetRequest = BaseRequestPayload;
export type CreatePageRequest = BaseRequestPayload;
export type UpdatePageRequest = BaseRequestPayload;
export type CreateTableRequest = BaseRequestPayload;
export type UpdateTableRequest = BaseRequestPayload;

export interface GetValuesResponse {
  items: string[];
  next_page_token: string;
}

export interface GetCellsResponse {
  items: Cell[];
  next_page_token: string;
}

type RowOfCells = CellContent[];
type RowOfCellValues = string[];

export interface OverwriteRangeRequest {
  cells: RowOfCells[];
}

export interface AppendValuesRequest {
  values: RowOfCellValues[];
}

// ----------------------------
// Query parameter types
// ----------------------------

export type ValueRenderOption = "FORMATTED" | "RAW";
export type DateTimeRenderOption = "FORMATTED" | "RAW";
export type MajorDimension = "ROW" | "COLUMN";

export interface CellGetterQueryParameters {
  value_render_option?: ValueRenderOption;
  datetime_render_option?: DateTimeRenderOption;
  major_dimension?: MajorDimension;
  limit?: number; // 1..10000; server defaults to 10000
  page_token?: string;
}

export interface BadResponse {
  code: number;
  message: string;
}
