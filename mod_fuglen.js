import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { parse } from "https://deno.land/x/xml@4.0.0/mod.ts";

const parser = new DOMParser();
const currency_xml = await( await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")).text();
const currency_json = parse(currency_xml);
const rates = Object.fromEntries(currency_json["gesmes:Envelope"].Cube.Cube.Cube.map(cube => [cube["@currency"], cube["@rate"]]));

const nok_to_usd = (price_in_nok) => price_in_nok * (rates.USD / rates.NOK);
console.log(nok_to_usd(1));

const parse_altitude = (altitude_str) => {
  let altitude = altitude_str.replace("masl", '').replace("m.a.s.l.", '');
  if (altitude?.includes('-')) {
    altitude = altitude.split('-');
    return [Number(altitude[0].trim()), Number(altitude[1].trim())];
  }
  return Number(altitude.trim());
}

// fuglen no
export async function sync_fuglen() {
  const fuglen_products_html = await (await fetch("https://www.fuglencoffee.no/collections/coffee")).text();
  const fuglen_products_doc = parser.parseFromString(fuglen_products_html, 'text/html');
  
  const fuglen_product_coffees = Array.from(fuglen_products_doc.querySelectorAll(".products > div.thumbnail")).filter(coffee => coffee.querySelector(".title").textContent.trim().endsWith('g'));
  
  console.log(fuglen_product_coffees);
  
  const fuglen_product_coffees_links = fuglen_product_coffees.map(coffee => {
    return {
    name: coffee.querySelector(".title").textContent.trim(),
    link: `https://www.fuglencoffee.no${coffee.querySelector("a").getAttribute("href")}`
    }
  })
  
  console.log(fuglen_product_coffees_links);

  let coffees = [];
  
  for (const [index, value] of fuglen_product_coffees_links.entries()) {
    const fuglen_coffee_html = await (await fetch(value.link)).text();
    const fuglen_coffee_doc = parser.parseFromString(fuglen_coffee_html, 'text/html');
    
    console.log(fuglen_coffee_doc);
    
    const name = fuglen_coffee_doc.querySelector(".product_name").textContent;
    const desc_text = fuglen_coffee_doc.querySelector(".description").innerHTML.replaceAll('<br>','\n').trim();
    console.log(desc_text);
    const desc_text_doc = parser.parseFromString(desc_text, 'text/html');
    const desc_text_2 = desc_text_doc.textContent;
    console.log(desc_text_2);
    const desc = Object.fromEntries([...desc_text_2.split('\n')].map(d => d.trim()).filter(d => d.includes(':')).map(d => d.split(':')).map(d => [d[0].trim().toLowerCase().replace(' ', '_'), d[1].trim()]));
    
    console.log(desc);
    
    const fuglen_coffee_attr = {
      name: name.split('/')[0].trim(),
      price: nok_to_usd(Number(fuglen_coffee_doc.querySelector(".money").textContent.replace('kr','').replace(',','.'))),
      cultivar: desc.varieties,
      notes: desc.flavour_profile,
      producer: desc.producer,
      country: desc.origin,
      region: desc.coffee_region,
      process: desc.process,
      harvest: desc.harvest,
      altitude: desc.altitude ? parse_altitude(desc.altitude) : desc.altitude,
        //    roast: get_coffee_attr(tw_coffee_doc, "roast_profile"),
      size: Number(name.split(' ')[name.split(' ').length - 1].replace('g','')),
      link: value.link
    };
    
    console.log(fuglen_coffee_attr);
    
    coffees.push(fuglen_coffee_attr);
  };
  
  console.log(coffees);
  await Deno.writeTextFile("data/coffees_2.json", JSON.stringify(coffees));
  console.log("Synced with fuglen.");
}
