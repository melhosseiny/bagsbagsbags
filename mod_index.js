import roasters from "./data/roasters.json" with { type: "json" };

const to_slug = (name) => name.toLowerCase()
  .replace(/[^\w ]+/g, "")
  .replace(/ +/g, "-");

const index = [];

for (const roaster of roasters) {
  let roaster_coffees = JSON.parse(await Deno.readTextFile(`data/coffees_${roaster.id}.json`));
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
await Deno.writeTextFile("data/coffees_index.json", JSON.stringify(index.flat(1)));
