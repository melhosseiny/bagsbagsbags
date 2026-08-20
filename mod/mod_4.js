import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { gemini, gemini_struct, hold_on, scrape_html_with_retry, clean_html, LINKS_SCHEMA, BAG_SCHEMA } from "./mod_ai.js";

const parser = new DOMParser();

const HOST = "https://www.langorakaffe.no";

// langøra
export async function sync_langora() {
  const langora_links_html = await scrape_html_with_retry(`${HOST}/store/kaffe`);
  const langora_links_doc_body_html = clean_html(langora_links_html);
  
  const links = await gemini_struct(`Extract current coffees from ${langora_links_doc_body_html}. Skip test roast, drip bags, 2-packs or n-packs, cascara, bålkaffe, tasting box, and subscription products. Don't include origin in name. If a URL is relative (e.g. /store/p/brasil), prepend ${HOST} to make it absolute.`, LINKS_SCHEMA);
  console.log(links);
  const links_json = JSON.parse(links);

  let coffees = [];
    
  for (const [index, value] of links_json.entries()) {
    await hold_on(30000); // for rate limit

    const langora_coffee_html = await scrape_html_with_retry(value.link);
    const langora_coffee_doc_body_html = clean_html(langora_coffee_html);

    const coffee = await gemini_struct(`Extract coffee info from ${langora_coffee_doc_body_html}, translating norwegian text to english. Harvest date would be (e.g. December 2024 or May - June 2025) if provided.`, BAG_SCHEMA);
    console.log(coffee);
    coffees.push({name: value.name, link: value.link, ...JSON.parse(coffee)});
  };
//  console.log(coffees);
  // await write_file("data/coffees_0.json", JSON.stringify(coffees));
  console.log("Synced with langøra.");
  return coffees;
}

if (import.meta.main) {
  await sync_langora();
}

