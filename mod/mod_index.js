import * as base64 from "https://deno.land/std@0.170.0/encoding/base64.ts";
import roasters from "../data/roasters.json" with { type: "json" };

import { sync_tw } from "./mod_0.js";
import { sync_cc } from "./mod_1.js";
import { sync_fuglen } from "./mod_2.js";
import { sync_sey } from "./mod_3.js";
import { sync_langora } from "./mod_4.js";

const to_slug = (name) => name.toLowerCase()
  .replace(/[^\w ]+/g, "")
  .replace(/ +/g, "-");

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
        content: base64.encode(contents),
        sha
      })
    });
  } catch (error) {
    console.error(error);
  }
}

const roaster_syncf_map = new Map();
roaster_syncf_map.set(0, sync_tw);
roaster_syncf_map.set(1, sync_cc);
roaster_syncf_map.set(2, sync_fuglen);
roaster_syncf_map.set(3, sync_sey);
roaster_syncf_map.set(4, sync_langora);

export async function index_bags() {
  const index = [];
  
  for (const roaster of roasters) {
    let roaster_coffees = await roaster_syncf_map.get(roaster.id)();
    console.log(roaster_coffees, typeof roaster_coffees);
    roaster_coffees = roaster_coffees.map(coffee => {
      return {
        ...coffee,
        roaster: { name: roaster.name, country: roaster.country },
        id: to_slug(coffee.name)
      }
    });
    
    //console.log(roaster_coffees);
    
    index.push(roaster_coffees);
  }
  
  console.log(index.flat(1));

//  await Deno.writeTextFile("data/coffees_index.json", JSON.stringify(index.flat(1)));
  await write_file("data/coffees_index.json", JSON.stringify(index.flat(1)));
}

if (import.meta.main) {
  await index_bags();
}
