import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { gemini, gemini_struct, hold_on, scrape_html_with_retry, clean_html, LINKS_SCHEMA, BAG_SCHEMA } from "./mod_ai.js";

const parser = new DOMParser();

const HOST = "https://coffeecollective.dk";

// coffeecollective
export async function sync_cc() {
  const cc_links_html = await scrape_html_with_retry(`${HOST}/collections/filter-coffee`);
  const cc_links_doc_body_html = clean_html(cc_links_html);
  
  const links = await gemini_struct(`Extract current coffees from ${cc_links_doc_body_html}. Skip products that include multiple coffees (e.g. Taster Pack). If a URL is relative (e.g. /products/aga-250g), prepend ${HOST} to make it absolute.`, LINKS_SCHEMA);
  console.log(links);
  const links_json = JSON.parse(links);

  let coffees = [];

  for (const [index, value] of links_json.entries()) {
    await hold_on(30000); // for rate limit

    const cc_coffee_html = await scrape_html_with_retry(value.link);
    const cc_coffee_doc_body_html = clean_html(cc_coffee_html);

    const coffee = await gemini_struct(`Extract coffee info from ${cc_coffee_doc_body_html}. Harvest date would be (e.g. December 2024 or May - June 2025) if provided.`, BAG_SCHEMA);
    console.log(coffee);
    coffees.push({name: value.name, link: value.link, ...JSON.parse(coffee)});
  };
//  console.log(coffees);
//  // await write_file("data/coffees_1.json", JSON.stringify(coffees));
  console.log("Synced with coffee collective.");
  return coffees;
}

if (import.meta.main) {
  await sync_cc()
}
