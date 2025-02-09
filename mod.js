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

const get_diff_summary = async () => {
  const data_file_commits = await (await fetch("https://api.github.com/repos/melhosseiny/bagsbagsbags/commits?path=data/coffees_index.json", {
    method: "GET",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${Deno.env.get('GITHUB_ACCESS_TOKEN')}`,
      "X-GitHub-Api-Version": "2022-11-28"
    },
    cache: "no-store",
  })).json();
  const last_commit_sha = data_file_commits[0].sha
//  const last_commit_sha = "8503bedb89cdd3d6b6aba3343ae6dc0fc5e5d2d9";
  console.log(last_commit_sha);
  const raw_diff = await( await fetch(`https://github.com/melhosseiny/bagsbagsbags/commit/${last_commit_sha}.diff`)).text()
  console.log(raw_diff);
  const result = await gemini(`Given the raw git diff ${raw_diff}, briefly list all new coffees. Id change doesn't mean it's a new coffee. Ignore other minor changes like price, process, and notes. Format answer as JSON { new_coffees: , summary: }. new_coffees should be an array of new coffee ids, while summary should very briefly highlight new coffees stating varietal, origin and roaster and be suitable for a social media post titled today's new coffees. Don't wrap in code block`, true)
  console.log(result);
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
  } else if (pathname.endsWith("summary")) {
    try {
      response_body = await get_diff_summary();
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

// Run every day at 1am
Deno.cron("sync and index", "0 1 * * *", async () => {
  await index_bags();
});
