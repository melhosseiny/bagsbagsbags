import * as base64 from "https://deno.land/std@0.170.0/encoding/base64.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { parse } from "https://deno.land/x/xml@4.0.0/mod.ts";

const parser = new DOMParser();
const currency_xml = await( await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")).text();
const currency_json = parse(currency_xml);
const rates = Object.fromEntries(currency_json["gesmes:Envelope"].Cube.Cube.Cube.map(cube => [cube["@currency"], cube["@rate"]]));

const nok_to_usd = (price_in_nok) => price_in_nok * (rates.USD / rates.NOK);
console.log(nok_to_usd(1));

// timwendelboe
export async function sync_tw() {
  const tw_products_html = await (await fetch("https://timwendelboe.no/product-category/coffee/")).text();
  const tw_products_doc = parser.parseFromString(tw_products_html, 'text/html');
  
  const tw_product_coffees = Array.from(tw_products_doc.querySelectorAll(".product_cat-coffee"));
  console.log(tw_product_coffees);
  
  const tw_product_coffees_links = tw_product_coffees.map(coffee => {
    return {
    name: coffee.querySelector(".woocommerce-loop-product__title").textContent,
    link: coffee.querySelector(".ast-loop-product__link").getAttribute("href")
    }
  }).filter(coffee => {
    console.log(coffee.name, coffee.name.includes("Fizz"));
    return !coffee.name.includes("Fizz") && !coffee.name.includes("Subscription")
    
  });
  
  console.log(tw_product_coffees_links);
  
  let coffees = [];
  
  const get_coffee_attr = (doc, attr) =>
  doc.querySelector(`.woocommerce-product-attributes-item--attribute_pa_${attr}`)?.querySelector(".woocommerce-product-attributes-item__value p").textContent
  
  for (const [index, value] of tw_product_coffees_links.entries()) {
    const tw_coffee_html = await (await fetch(value.link)).text();
    const tw_coffee_doc = parser.parseFromString(tw_coffee_html, 'text/html');
    
    console.log(tw_coffee_doc, index, value);
    
    const tw_coffee_attr = {
      name: tw_coffee_doc.querySelector(".product_title").textContent,
      price: nok_to_usd(Number(tw_coffee_doc.querySelector(".price").textContent.replace('kr',''))),
      cultivar: get_coffee_attr(tw_coffee_doc, "cultivar"),
      notes: get_coffee_attr(tw_coffee_doc, "flavour_description"),
      producer: get_coffee_attr(tw_coffee_doc, "manufacturer"),
      country: get_coffee_attr(tw_coffee_doc, "country"),
      region: get_coffee_attr(tw_coffee_doc, "region"),
      process: get_coffee_attr(tw_coffee_doc, "process"),
      harvest: get_coffee_attr(tw_coffee_doc, "harvest"),
      roast: get_coffee_attr(tw_coffee_doc, "roast_profile").split(' ')[0].toLowerCase(),
      size: Number(get_coffee_attr(tw_coffee_doc, "bag-size").replace('g','')),
      link: value.link
    };
    
    console.log(tw_coffee_attr);
    
    const out_of_stock = tw_coffee_doc.querySelector(".stock")?.textContent ? true : false;
    console.log(out_of_stock);
    
    if (!out_of_stock) {
      coffees.push(tw_coffee_attr);
    }
  };
  
  console.log(coffees);
  await write_file("data/coffees_0.json", JSON.stringify(coffees));
  console.log("Synced with tim wendelboe.");
}

export const write_file = async (path, contents) => {
  try {
    const file_res = await (await fetch(`https://api.github.com/repos/melhosseiny/bagsbagsbags/contents/${path}`, {
      method: "GET",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${Deno.env.get('GITHUB_ACCESS_TOKEN')}`,
        "X-GitHub-Api-Version": "2022-11-28"
      },
      cache: "no-store",
    })).json();
    const sha = file_res.sha;
    const response = await fetch(`https://api.github.com/repos/melhosseiny/bagsbagsbags/contents/${path}`, {
      method: "PUT",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${Deno.env.get('GITHUB_ACCESS_TOKEN')}`,
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        message: `write ${path}`,
        content: base64.encode((JSON.stringify(contents))),
        sha
      })
    });
  } catch (error) {
    console.error(error);
  }
}
