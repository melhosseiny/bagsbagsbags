import { GoogleGenAI } from "@google/genai";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import {
  DOMParser,
} from "@b-fuze/deno-dom";

const env = await load();

const FLASH_MODEL = "gemini-3.1-flash-lite";
const PRO_MODEL = "gemini-3.1-pro-preview";

const GEMINI_API_KEY =
  Deno.env.get("GEMINI_API_KEY") ??
  env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error(
    "Missing GEMINI_API_KEY. Add it to your environment or .env file.",
  );
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const get_model = (use_pro) => {
  return use_pro ? PRO_MODEL : FLASH_MODEL;
};

export const gemini = async (prompt, use_pro = false) => {
  const response = await ai.interactions.create({
    model: get_model(use_pro),
    input: prompt,
    store: false,
  });
  return response.output_text;
};

export const gemini_struct = async (
  prompt,
  schema,
  use_pro = false,
) => {
  const result = await ai.models.countTokens({
      model: get_model(use_pro),
      contents: prompt,
    });

  console.log(`Input tokens: ${result.totalTokens}`);

  try {
    const response = await ai.interactions.create({
      model: get_model(use_pro),
      input: prompt,
      store: false,
      response_format: [
                        {
                          type: "text",
                          mime_type: "application/json",
                          schema
                        }
                        ],
    });
    //console.log(prompt);
    return response.output_text;
  } catch (error) {
    console.dir({
      name: error.name,
      status: error.status,
      message: error.message,
      details: error.errorDetails,
    }, { depth: 10 });
  }
};

export const hold_on = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const scrape_html = async (url_str) => {
  const url = new URL(url_str);

  const response = await fetch(url, {
    cache: "no-store"
  });
  
  const html = await response.text();
  
  if (
    response.status === 429 ||
    html.includes("local_rate_limited")
  ) {
    throw new Error("RATE_LIMITED");
  }

  return html;
}

export const scrape_html_with_retry = async (
  url,
  max_attempts = 30,
) => {
  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      return await scrape_html(url);
    } catch (error) {
      const rate_limited =
        error instanceof Error &&
        error.message === "RATE_LIMITED";

      if (!rate_limited || attempt === max_attempts) {
        throw error;
      }

      const delay_ms = 2000 * 2 ** (attempt - 1);

      console.warn(
        `Rate limited. Retry ${attempt}/${max_attempts} in ${delay_ms} ms.`,
      );

      await hold_on(delay_ms);
    }
  }

  throw new Error("Scrape failed unexpectedly.");
};

export const clean_html = (html) => {
  const document = new DOMParser().parseFromString(html, "text/html");

  if (!document) {
    throw new Error("Unable to parse HTML.");
  }

  const selectors_to_remove = [
    "script",
    "style",
    "noscript",
    "svg",
    "canvas",
    "iframe",
    "video",
    "audio",
    "input",
    "select",
    "textarea",
    "nav",
    "footer",
    "header",
    "aside",
    "[aria-hidden='true']",
    "[hidden]",
  ];

  for (const selector of selectors_to_remove) {
    for (const element of document.querySelectorAll(selector)) {
      element.remove();
    }
  }

  // Remove comments.
  const remove_comments = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 8) {
        child.remove();
      } else {
        remove_comments(child);
      }
    }
  };

  remove_comments(document);

  const main =
    document.body;

  if (!main) {
    return "";
  }

  return main.innerHTML
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
};

// Schemas

export const LINKS_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      link: {
        type: "string",
        format: "uri",
      },
    },
    required: ["name", "link"],
    additionalProperties: false,
  },
};

export const BAG_SCHEMA = {
  type: "object",
  properties: {
    price: {
      type: "number",
    },
    priceCurrency: {
      type: "string",
    },
    cultivar: {
      type: "string",
    },
    notes: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 3,
    },
    producer: {
      type: "string",
    },
    region: {
      type: "string",
    },
    country: {
      type: "string",
    },
    process: {
      type: "string",
    },
    harvest: {
      type: "string",
    },
    altitude: {
      type: "array",
      items: {
        type: "integer",
      },
      minItems: 1,
      maxItems: 2,
    },
    roast: {
      type: "string",
      enum: ["filter", "espresso"],
    },
    size: {
      type: "integer",
    },
  },
  required: [
    "price",
    "priceCurrency",
    "cultivar",
    "notes",
    "producer",
    "region",
    "country",
    "process",
    "roast",
    "size",
  ],
  additionalProperties: false,
};

//
//    const cc_coffee_attr = {
//      name: data.name,
//      price: Number(JSON.parse(data.variations[0].price).USD),
//      cultivar: data.details[0].varieties,
//      notes,
//      producer: data.farmer?.name,
//      farm: data.origin[0]?.farm,
//      region: data.origin[0]?.region,
//      country: data.origin[0]?.country,
//      process: data.details[0].process,
//      harvest: data.details[0].harvestCalendar,
//      altitude: Number(data.details[0].altitude.replace('masl','').replace(',','').trim()),
//      blend: data.details[0].blend,
//      roast: cc_coffee_json.result.data.datoCmsFilterCoffee ? "light" : "espresso",
//      size: data.variations[0].weight * 1000,
//      link: `https://coffeecollective.dk/shop/${to_slug(value.name)}`
//    };
