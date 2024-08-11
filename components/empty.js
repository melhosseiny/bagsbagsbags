import { html, state, web_component, define_component } from "https://busy-dog-44.deno.dev/melhosseiny/sourdough/main/sourdough.js";

const template = (data) => html`
  <div id="empty">
    <p>Sorry, looks like the page went missing.</p>
    <img src="/img/404_fx.jpg" alt="Page not found">
  </div>
`

const style = `
  :host {
    display: block;
  }

  #empty {
    margin-bottom: var(--line-height-body);
  }

  img {
    width: 100%;
    box-sizing: border-box;
    max-width: 360px;
  }
`

export function empty(spec) {
  let { _root } = spec;
  const _web_component = web_component(spec);
  const _state = _web_component.state;

  const init = () => {
  }

  return Object.freeze({
    ..._web_component,
    init
  })
}

define_component({
  name: "bbb-empty",
  component: empty,
  template,
  style
});
