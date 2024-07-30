import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import * as base64 from "https://deno.land/std@0.170.0/encoding/base64.ts";
import { content_type } from "media_types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { sync_bags } from "./mod_sync.js";
import { index_bags } from "./mod_index.js";

const env = await load();

const PATHNAME_PREFIX = "/melhosseiny/bagsbagsbags/main";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || env["GEMINI_API_KEY"];

const static_path = [
  "/components",
  "/css",
  "/icons",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/robots.txt",
  "/manifest.webmanifest"
];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const test_gemini = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

const json_or_txt = (txt) => {
  let result;
  try {
    result = ["json", JSON.parse(txt)];
    console.log(result);
  } catch (e) {
    console.log(e);
    result = ["txt", txt];
  }
  return result;
}

//const description = "cheapest coffee from tim wendelboe";
//const index_txt = await Deno.readTextFile("data/coffees_index.json");
//test_gemini(`find cheapest coffee from tim wendelboe in the following JSON ${index_txt}`);

//export const hamming_dist = (str1, str2) => {
//  let i = 0, count = 0;
//  while (i < str1.length) {
//      if (str1[i] != str2[i])
//          count++;
//      i++;
//  }
//  return count;
//}
//
//export const n_substr = (str, n) => {
//  const substrs = [];
//  for (let i = 0; i < str.length - n + 1; i++) {
//      substrs.push(str.substring(i, i+n));
//  }
//  return substrs;
//}
//
//export const match_kw = (sites, kw) => {
//  const distances = [...sites.sort((a, b) => {
//    const str_a = [a.name, a.process, a.cultivar, a.region, a.country, a.notes, a.roaster].join(' ');
//    const str_b = [b.name, b.process, b.cultivar, b.region, b.country, b.notes, b.roaster].join(' ');
//    const subdistances1 = n_substr(str_a, kw.length).map(substr => hamming_dist(substr, kw));
//    const subdistances2 = n_substr(str_b, kw.length).map(substr => hamming_dist(substr, kw));
//    return Math.min(...subdistances1) - Math.min(...subdistances2);
//  })];
//  return distances.slice(0, 5);
//}

const paginate = ({
  after: cursor,
  page_size = 20,
  results,
  // can pass in a function to calculate an item's cursor
  get_cursor = () => null
}) => {
  if (page_size < 1) return [];

  if (!cursor) return results.slice(0, page_size);
  const cursor_index = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let item_cursor = item.cursor ? item.cursor : get_cursor(item);
    // if there's still not a cursor, return false by default
    return item_cursor ? cursor === item_cursor : false;
  });

  return cursor_index >= 0
    ? cursor_index === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursor_index + 1,
          Math.min(results.length, cursor_index + 1 + page_size),
        )
    : results.slice(0, page_size);
}

const get_cursor = item => item.id;

const process_query = async (query, index_txt) => {
  const result = await test_gemini(`You are a barista at a coffee shop. A customer describes the kind of coffee they're looking for, "${query}". Given the following JSON ${index_txt}, recommend one to three coffees. Briefly Explain your choice to the customer, don't state the obvious. Format answer as a JavaScript object { json: , explanation: }. Add a hex color for each flavor note to json in a new property "color". Don't wrap in code block`);
  return result;
}

serve(async (request) => {
  let { pathname, searchParams } = new URL(request.url);

  let response_body;
  let response_status = 200;
  
  pathname = pathname === "/" ? "/index_inline.html" : pathname;

  if (pathname.endsWith("index.json")) {
    const page_size = Number(searchParams.get("page_size"));
    const after = searchParams.get("after");
    const query = searchParams.get("query");
    const index_txt = await Deno.readTextFile("data/coffees_index.json");
    const index_json = JSON.parse(index_txt);
    
    const [type, {json: index, explanation}] = query
      ? json_or_txt(await process_query(query, index_txt))
      : ["json", {json: index_json}];
    
    console.log(type, index);
    
    if (type === "json") {
      const items = paginate({ after, page_size, results: index, get_cursor });
      const page = {
        items,
        explanation,
      cursor: items.length ? get_cursor(items[items.length - 1]) : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
      has_more: items.length
        ? get_cursor(items[items.length - 1]) !== get_cursor(index[index.length - 1])
        : false
      };
      response_body = JSON.stringify(page);
    } else {
      response_body = index;
    }
  } else {
    try {
      response_body = static_path.some(prefix => pathname.startsWith(prefix))
//        ? await Deno.readFile(`.${pathname}`)
        ? (await fetch(new URL(PATHNAME_PREFIX + pathname, "https://raw.githubusercontent.com/"), {
          headers: {
            "Authorization": `token ${Deno.env.get("GITHUB_ACCESS_TOKEN")}`,
          },
        })).body
        : await Deno.readFile(`./index_inline.html`);
    } catch (e) {
      response_status = 404;
      console.error(e);
    }
  }

  return new Response(response_body, {
    status: response_status,
    headers: new Headers({
      "content-type": content_type(pathname),
      "access-control-allow-origin": "*",
      "cache-control": "no-cache"
    })
  });
});

//const cron = async () => {
//  await sync_bags();
//  await index_bags();
//}
//
//await cron();

Deno.cron("Run every ten minutes", "*/10 * * * *", async () => {
  await sync_bags();
  await index_bags();
});

// Run every day at 1am
Deno.cron("sync and index", "0 1 * * *", async () => {
  await sync_bags();
  await index_bags();
});
