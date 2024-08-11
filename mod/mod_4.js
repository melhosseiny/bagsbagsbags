import * as base64 from "https://deno.land/std@0.170.0/encoding/base64.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { parse } from "https://deno.land/x/xml@4.0.0/mod.ts";

import { gemini } from "./mod_ai.js";

const parser = new DOMParser();

const currency_xml = await( await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")).text();
const currency_json = parse(currency_xml);
const rates = Object.fromEntries(currency_json["gesmes:Envelope"].Cube.Cube.Cube.map(cube => [cube["@currency"], cube["@rate"]]));

const nok_to_usd = (price_in_nok) => price_in_nok * (rates.USD / rates.NOK);
console.log(nok_to_usd(1));

const round = num => Math.round((num + Number.EPSILON) * 100) / 100;

const to_title_case = function(s) {
  return s.replace(/-/g, ' ')[0].toUpperCase() +
    s.replace(/-/g, ' ').substr(1).toLowerCase();
}

const remove_html_comments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');

// langøra
export async function sync_langora() {
  const langora_products_html = await (await fetch("https://www.langorakaffe.no/store/kaffe")).text();
  const langora_products_doc = parser.parseFromString(langora_products_html, "text/html");
  
  const langora_product_coffees = Array.from(langora_products_doc.querySelectorAll(".grid-item:not(.category-kaffeutstyr):not(.category-blkaffe)"));
  console.log(langora_product_coffees);

  const langora_product_coffees_links = langora_product_coffees.map(coffee => {
    return {
      name: coffee.querySelector(".grid-title").textContent.split(',')[0].trim(),
      link: `https://www.langorakaffe.no${coffee.querySelector("a").getAttribute("href")}`
    }
  }).filter(coffee => {
    const lc_name = coffee.name.toLowerCase();
    return !lc_name.includes("2-pack")
      && !lc_name.includes("subscription")
      && !lc_name.includes("abonnement")
      && !lc_name.includes("gift")
      && !lc_name.includes("cascara")
      && !lc_name.includes("test")
      && !lc_name.includes("tasting")
      && !lc_name.includes("trakterfilter")
  });;
  
  console.log(langora_product_coffees_links);
  
  let coffees = [];

  await new Promise(r => setTimeout(r, 60000)); // wait a minute
    
  for (const [index, value] of langora_product_coffees_links.entries()) {
    const langora_coffee_html = await (await fetch(`${value.link}`)).text();
    const langora_coffee_doc = parser.parseFromString(langora_coffee_html, "text/html");
        
    const meta = langora_coffee_doc.querySelector(".ProductItem-details-excerpt").textContent.replaceAll(/\s{2,}/g, ' ').trim();
    const meta_additional = langora_coffee_doc.querySelector(".ProductItem-additional").textContent.replaceAll(/\s{2,}/g, ' ').trim();
    
    const meta_gemini = await gemini(`Extract cultivar, process, flavor notes, producer, country, region, altitude and harves t date from "${meta} ${meta_additional}". Format answer as a JavaScript object { cultivar:, process:, notes:, producer:, country:, region:, altitude, harvest:, size: }. Extract only three flavor notes like "Stone fruit, clementine, apple.". Format altitude either as a Number like 1500 or a range like [1500, 1800]. Extract smallest size like 250 not "250g". Translate any norwegian text to english, don't keep the original. Don't include anything other than the JSON object. Don't wrap in code block.`);
    
    //console.log(meta_gemini);
    
    const meta_gemini_json = JSON.parse(meta_gemini);
    
    const langora_coffee_attr = {
      name: value.name,
      price: round(nok_to_usd(Number(langora_coffee_doc.querySelector(".product-price").textContent.replace('fra','').replace('kr','').replace(',','.')))),
      roast: name.toLowerCase().includes("espresso") ? "espresso" : "light",
      link: value.link,
      ...meta_gemini_json
    };
    
    console.log(langora_coffee_attr);
    coffees.push(langora_coffee_attr);
  };
  console.log(coffees);
  // await write_file("data/coffees_0.json", JSON.stringify(coffees));
  console.log("Synced with langøra.");
  return coffees;
}

if (import.meta.main) {
  await sync_langora();
}

