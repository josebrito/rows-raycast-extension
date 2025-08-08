import { closeMainWindow, open } from "@raycast/api";

export default async function Command() {
  await open("https://rows.new");
  await closeMainWindow();
}
