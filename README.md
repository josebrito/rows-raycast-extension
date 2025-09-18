# Rows

Manage your Rows spreadsheets from your keyboard.

## Setup Instructions

1. Obtain your API Key from the Rows workspace settings page:
   - Go to Dashboard > Settings > Rows API > “New API Key”
2. In Raycast, open the extension preferences and enter your API Key in the "Rows API Token" field.

## Available Commands

### Open Spreadsheet

- Open a spreadsheet from your Rows workspace.
- Press **CMD + O** to view the spreadsheet tables.

### Create New Spreadsheet

- Opens `https://rows.new` to create a new spreadsheet.

## Available AI Tools

### Get Workspace Info

- Retrieve the current Rows workspace information for the authenticated user.

### List Folders

- List folders available in the current workspace.

### List Spreadsheets

- List spreadsheets you have access to; optionally filter by folder ID.

### Get Spreadsheet

- Get a spreadsheet's structure (pages and tables) by spreadsheet ID.

### Get Table Contents

- Read cell values from a table range with optional render and pagination settings.

### Append Values to Table

- Append rows of values to a table range for a given spreadsheet.

### Modify Cells in Table

- Modify rows of values and formulas in a table range for a given spreadsheet.

### Create Spreadsheet

- Create a new spreadsheet in the workspace (Enterprise-only).
