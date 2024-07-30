import roasters from "./data/roasters.json" with { type: "json" };
import { write_file } from "./mod_tw.js";

const to_slug = (name) => name.toLowerCase()
  .replace(/[^\w ]+/g, "")
  .replace(/ +/g, "-");

export async function index_bags() {
  const index = [];
  
  for (const roaster of roasters) {
    let roaster_coffees = JSON.parse(await Deno.readTextFile(`data/coffees_${roaster.id}.json`));
    console.log(typeof roaster_coffees);
    roaster_coffees = roaster_coffees.map(coffee => {
      return {
        ...coffee,
      roaster: roaster.name,
      id: to_slug(coffee.name)
      }
    });
    
    //console.log(roaster_coffees);
    
    index.push(roaster_coffees);
  }
  
  console.log(index.flat(1));
  await write_file("data/coffees_index.json", JSON.stringify(index.flat(1)));
}

if (import.meta.main) {
  await index_bags();
}
