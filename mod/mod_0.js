import { gemini, gemini_struct, hold_on, clean_html, LINKS_SCHEMA, BAG_SCHEMA } from "./mod_ai.js";

const HOST = "https://timwendelboe.no";

// timwendelboe
export async function sync_tw() {
  const tw_links_html = await (await fetch("https://timwendelboe.no/en-no/collections/filter-coffee")).text();
  const tw_links_doc_body_html = clean_html(tw_links_html);
  
  const links = await gemini_struct(`Extract current coffees from ${tw_links_doc_body_html}. Skip products like Coffee Berry Fizz. If a URL is relative (e.g. /en-no/products/finca-el-puente-geisha), prepend ${HOST} to make it absolute.`, LINKS_SCHEMA);
  console.log(links);
  const links_json = JSON.parse(links);

  let coffees = [];

  for (const [index, value] of links_json.entries()) {
    await hold_on(30000); // for rate limit

    const tw_coffee_html = await (await fetch(value.link)).text();
    const tw_coffee_doc_body_html = clean_html(tw_coffee_html);

    const coffee = await gemini_struct(`Extract coffee info from ${tw_coffee_doc_body_html}. Don't include process in name. Harvest date would be (e.g. December 2024 or May - June 2025) if provided.`, BAG_SCHEMA);
    console.log(coffee);
    coffees.push({name: value.name, link: value.link, ...JSON.parse(coffee)});
  };
//  console.log(coffees);
//  // await write_file("data/coffees_1.json", JSON.stringify(coffees));
  console.log("Synced with tim wendelboe.");
  return coffees;
}

if (import.meta.main) {
  await sync_tw()
}
