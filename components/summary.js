import {
  define_component,
  html,
  state,
  web_component,
} from "https://busy-dog-44.deno.dev/melhosseiny/sourdough/main/sourdough.js";

const template = (data) =>
  html`
  <p id="summary" ref="summary">
      ${data.summary && data.summary.summary ? `${data.summary.summary}` : ""}
  </p>
`;

const style = `
`;

export function summary(spec) {
  let { _root } = spec;
  const _web_component = web_component(spec);
  const _state = _web_component.state;

  const fetch_summary = async () => {
    _state.summary = undefined;
    show_loading();
    try {
      const response = await fetch("/summary");
      if (!response.ok) {
        throw { status: response.status, statusText: response.statusText };
      }
      const text = await response.text();
      try {
        _state.summary = JSON.parse(text);
      } catch (e) {
        _state.summary = undefined;
      }
    } catch (error) {
      console.error(error);
    } finally {
      hide_loading();
    }
  };

  const init = () => {
    fetch_summary();
  };

  const show_loading = () => {
  };

  const hide_loading = () => {
  };

  return Object.freeze({
    ..._web_component,
    init,
  });
}

define_component({
  name: "bbb-summary",
  component: summary,
  template,
  style,
});
