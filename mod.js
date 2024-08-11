import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import * as base64 from "https://deno.land/std@0.170.0/encoding/base64.ts";
import { content_type } from "media_types";

import { gemini } from "./mod/mod_ai.js";
import { index_bags } from "./mod/mod_index.js";

const PATHNAME_PREFIX = "/melhosseiny/bagsbagsbags/main";

const static_path = [
  "/components",
  "/css",
  "/img",
  "/icons",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/robots.txt",
  "/manifest.webmanifest"
];

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
  const result = await gemini(`You are a barista at a coffee shop. A customer describes the kind of coffee they're looking for, "${query}". Given the following JSON ${index_txt}, recommend one to three coffees. Briefly Explain your choice to the customer, don't state the obvious. Format answer as a JavaScript object { json: , explanation: }. Add a hex color for each flavor note to json in a new property "color". Don't wrap in code block`);
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
    
    try {
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
    } catch (error) {
      response_status = error.status;
      console.error(error);
    }
  } else {
    try {
      response_body = static_path.some(prefix => pathname.startsWith(prefix))
//      ? await Deno.readFile(`.${pathname}`)
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
//  await index_bags();
//}
//
//await cron();

//Deno.cron("Run every ten minutes", "*/10 * * * *", async () => {
//  await index_bags();
//});

// Run every day at 1am
//Deno.cron("sync and index", "0 1 * * *", async () => {
//  await index_bags();
//});
