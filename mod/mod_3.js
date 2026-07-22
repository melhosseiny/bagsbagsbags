import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { gemini, gemini_struct, hold_on, clean_html, LINKS_SCHEMA, BAG_SCHEMA } from "./mod_ai.js";

const parser = new DOMParser();

const HOST = "https://www.seycoffee.com";

// sey
export async function sync_sey() {
  const sey_links_html = await (await fetch(`${HOST}/collections/coffee`)).text();
  const sey_links_doc_body_html = clean_html(sey_links_html);
  
  const links = await gemini_struct(`Extract current coffees from ${sey_links_doc_body_html}. If a name is (e.g. Pepe Jijon FINCA SOLEDAD - 2ND HARVEST MEJORADO - TYOXY WASHED Ecuador), name would be Finca Soledad Mejorado. If a name is (e.g. Danche ETHIOPIAN LANDRACE - WASHED Ethiopia), name would be Danche Ethiopian Landrace. If a URL is relative (e.g. /collections/coffee/products/2025-danche-ethiopia), prepend ${HOST} to make it absolute.`, LINKS_SCHEMA);
  console.log(links);
  const links_json = JSON.parse(links);

  let coffees = [];
  
  for (const [index, value] of links_json.entries()) {
    await hold_on(30000); // for rate limit

    const sey_coffee_html = await (await fetch(value.link)).text();
    const sey_coffee_doc_body_html = clean_html(sey_coffee_html);

    const coffee = await gemini_struct(`Extract coffee info from ${sey_coffee_doc_body_html}. Process should be 1-2 words (e.g., washed, natural). Harvest date if provided would be (e.g. December 2024 or May - June 2025).`, BAG_SCHEMA);
    console.log(coffee);
    coffees.push({name: value.name, link: value.link, ...JSON.parse(coffee)});
  };
  console.log(coffees);
  // await write_file("data/coffees_0.json", JSON.stringify(coffees));
  console.log("Synced with sey.");
  return coffees;
}

if (import.meta.main) {
  await sync_sey();
}
