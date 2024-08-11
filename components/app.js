import { installRouter } from "https://busy-dog-44.deno.dev/melhosseiny/sourdough/main/router.js";

const to_title_case = function(s) {
  return s.replace(/-/g, ' ')[0].toUpperCase() +
    s.replace(/-/g, ' ').substr(1).toLowerCase();
}

const handle_nav = function(location) {
  const path = decodeURIComponent(location.pathname);
  const page = path === '/' ? 'index' : path.slice(1);

  if (!document.startViewTransition) {
    load_page(page);
    return;
  }

  document.startViewTransition(() => load_page(page));
};

const load_page = async function(page) {
  switch(page) {
    case "index":
      document.title = "bagsbagsbags";
      document.querySelector("#main").innerHTML = `<bbb-market></bbb-market>`;
      break;
    default:
      const title = `${to_title_case(page)} - bagsbagsbags`;
      document.title = title;
      document.querySelector("#main").innerHTML = `<bbb-empty></bbb-empty>`;
  }
}

installRouter((location) => handle_nav(location));
