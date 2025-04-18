import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { gemini } from "./mod_ai.js";

const parser = new DOMParser();

const to_slug = (name) => name.toLowerCase()
  .replace(/ - .+/g, "")
  .replace(/[^\w ]+/g, "")
  .replace(/ +/g, "-");

const to_title_case = function(s) {
  return s.replace(/-/g, ' ')[0].toUpperCase() +
    s.replace(/-/g, ' ').substr(1).toLowerCase();
}

// coffeecollective
export async function sync_cc() {
  const cc_products_html = await (await fetch("https://coffeecollective.dk/shop/")).text();
  const cc_products_doc = parser.parseFromString(cc_products_html, 'text/html');
  
  const cc_products_coffees = [...cc_products_doc.querySelectorAll(".e1kcwmm22")].slice(0,2).map(element => [...element.querySelectorAll(".e19cusw8")]).flat(1);
  console.log(cc_products_coffees);
  
  const cc_products_coffees_links = cc_products_coffees.map(coffee => {
    const name = coffee.querySelector(".e19cusw6").textContent.trim().replace("Julekaffe ", '');
    return {
      name: name,
      link: `https://coffeecollective.dk/page-data/shop/${to_slug(name)}/page-data.json`
    }
  }).filter(coffee => {
    console.log(
      coffee.name,
      coffee.name.toLowerCase().includes("calendar"),
      !coffee.name.toLowerCase().includes("deal")
    );
    return !coffee.name.toLowerCase().includes("calendar")
      && !coffee.name.toLowerCase().includes("deal");
  });
  
  console.log(cc_products_coffees_links);
  
  let coffees = [];
  
  for (const [index, value] of cc_products_coffees_links.entries()) {
    console.log("debug", index, value);
    const cc_coffee_json = JSON.parse(await (await fetch(value.link)).text());
    const data = cc_coffee_json.result.data.datoCmsFilterCoffee || cc_coffee_json.result.data.datoCmsEspresso;

    const notes = to_title_case(await gemini(`Extract three flavor notes from ${data.description}. Format reply like "Blackcurrant, redcurrant, plum" without any additional tokens.`)).replace(" \n", '');
    
    const cc_coffee_attr = {
      name: data.name,
      price: Number(JSON.parse(data.variations[0].price).USD),
      cultivar: data.details[0].varieties,
      notes,
      producer: data.farmer?.name,
      farm: data.origin[0]?.farm,
      region: data.origin[0]?.region,
      country: data.origin[0]?.country,
      process: data.details[0].process,
      harvest: data.details[0].harvestCalendar,
      altitude: Number(data.details[0].altitude.replace('masl','').replace(',','').trim()),
      blend: data.details[0].blend,
      roast: cc_coffee_json.result.data.datoCmsFilterCoffee ? "light" : "espresso",
      size: data.variations[0].weight * 1000,
      link: `https://coffeecollective.dk/shop/${to_slug(value.name)}`
    };
    
    console.log(cc_coffee_attr);
    
    coffees.push(cc_coffee_attr);
  };
  
  console.log(coffees);
  // await write_file("data/coffees_1.json", JSON.stringify(coffees));
  console.log("Synced with coffee collective.");
  return coffees;
}
