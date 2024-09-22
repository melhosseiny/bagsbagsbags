import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { parse } from "https://deno.land/x/xml@4.0.0/mod.ts";

import { gemini } from "./mod_ai.js";

const parser = new DOMParser();

const to_title_case = function(s) {
  return s.replace(/-/g, ' ')[0].toUpperCase() +
    s.replace(/-/g, ' ').substr(1).toLowerCase();
}

const remove_html_comments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');

// sey
export async function sync_sey() {
  const sey_products_html = await (await fetch("https://www.seycoffee.com/collections/coffee")).text();
  const sey_products_doc = parser.parseFromString(sey_products_html, "text/html");
  
  const sey_product_coffees = Array.from(sey_products_doc.querySelectorAll(".coffees_products_product"));
  console.log(sey_product_coffees);
  
  const sey_product_coffees_links = sey_product_coffees.map(coffee => {
    return {
      name: coffee.querySelector(".coffeeTitle_producer").textContent.trim(),
      link: `https://www.seycoffee.com${coffee.querySelector("a").getAttribute("href")}`
    }
  });
  
  console.log(sey_product_coffees_links);
  
  let coffees = [];

  await new Promise(r => setTimeout(r, 60000)); // wait a minute
  
  for (const [index, value] of sey_product_coffees_links.entries()) {
    const sey_coffee_html = await (await fetch(`${value.link}?country=US`)).text();
    const sey_coffee_doc = parser.parseFromString(sey_coffee_html, "text/html");
    
    const short_blurb = remove_html_comments(sey_coffee_doc.querySelector(".coffee_keyInfo_shortBlurb").textContent);
    const notes = to_title_case(await gemini(`Extract flavor notes from ${short_blurb}. Format reply as: "a, b, and c." where a, b, and c are the flavor notes.`)).replace(" \n", '');
    
    const sey_coffee_attr = {
      name: value.name,
      price: sey_coffee_doc.querySelector(".product-form__variants option").textContent.split('-')[1].replace('$','').trim(),
      cultivar: sey_coffee_doc.querySelector(".coffee_technicalDetails_detail:nth-child(1) .coffee_technicalDetails_detail_description").textContent.trim(),
      notes,
      producer: sey_coffee_doc.querySelector(".coffeeTitle_producer").textContent.trim(),
      country: sey_coffee_doc.querySelector(".coffeeTitle_country").textContent.trim(),
      region: sey_coffee_doc.querySelector(".coffee_technicalDetails_detail:nth-child(2) .coffee_technicalDetails_detail_description").textContent.trim(),
      process: to_title_case(sey_coffee_doc.querySelector(".coffeeTitle_varietyProcess").textContent.split(' - ')[1].trim()),
      harvest: sey_coffee_doc.querySelector(".coffee_technicalDetails_detail:nth-child(4) .coffee_technicalDetails_detail_description").textContent.trim(),
      roast: "light",
      size: Number(sey_coffee_doc.querySelector(".product-form__variants option").textContent.split('-')[0].replace('g','').trim()),
      link: value.link
    };
    
    console.log(sey_coffee_attr);
    coffees.push(sey_coffee_attr);
  };
  console.log(coffees);
  // await write_file("data/coffees_0.json", JSON.stringify(coffees));
  console.log("Synced with sey.");
  return coffees;
}

if (import.meta.main) {
  await sync_sey();
}
