import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { gemini, gemini_struct, hold_on, clean_html, LINKS_SCHEMA, BAG_SCHEMA } from "./mod_ai.js";

const parser = new DOMParser();

const HOST = "https://www.fuglencoffee.no";

// fuglen no
export async function sync_fuglen() {
  const fuglen_links_html = await (await fetch(`${HOST}/collections/coffee`)).text();
  const fuglen_links_doc_body_html = clean_html(fuglen_links_html);;
  
  console.log(fuglen_links_doc_body_html);
  
  const links = await gemini_struct(`Extract current coffees from ${fuglen_links_doc_body_html}. Skip drip bags, boxes or subscription products. If a name is (e.g. Benjamin Paz / Washed / Honduras / 250g), name would be Benjamin Paz. If a URL is relative (e.g. /products/el-rejo-washed-peru-250g), prepend ${HOST} to make it absolute.`, LINKS_SCHEMA);
  console.log(links);
  const links_json = JSON.parse(links);

  let coffees = [];

  for (const [index, value] of links_json.entries()) {
    await hold_on(30000); // for rate limit

    const fuglen_coffee_html = await (await fetch(value.link)).text();
    const fuglen_coffee_doc_body_html = clean_html(fuglen_coffee_html);

    const coffee = await gemini_struct(`Extract coffee info from ${fuglen_coffee_doc_body_html}. Harvest date if provided would be (e.g. December 2024 or May - June 2025).`, BAG_SCHEMA);
    console.log(coffee);
    coffees.push({name: value.name, link: value.link, ...JSON.parse(coffee)});
  };
  console.log(coffees);
//  // await write_file("data/coffees_2.json", JSON.stringify(coffees));
  console.log("Synced with fuglen.");
  return coffees;
}

if (import.meta.main) {
  await sync_fuglen();
}
