import { sync_tw } from "./mod_tw.js";
import { sync_fuglen } from "./mod_fuglen.js";
import { sync_cc } from "./mod_cc.js";

export async function sync_bags() {
  await sync_tw();
  await sync_fuglen();
  await sync_cc();
}

if (import.meta.main) {
  await sync_bags();
}
