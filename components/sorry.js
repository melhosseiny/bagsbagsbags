import { html, state, web_component, define_component } from "https://busy-dog-44.deno.dev/melhosseiny/sourdough/main/sourdough.js";

const template = (data) => html`
  <div id="sorry">
    <svg class="symbol" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 19.8486 21.5527">
     <g>
      <rect height="21.5527" opacity="0" width="19.8486" x="0" y="0"/>
      <path d="M18.4766 14.79C19.0381 14.79 19.4873 14.3457 19.4873 13.7891L19.4873 7.75879C19.4873 7.20215 19.0381 6.74805 18.4766 6.74805C17.915 6.74805 17.4805 7.20215 17.4805 7.75879L17.4805 13.7891C17.4805 14.3457 17.915 14.79 18.4766 14.79Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M14.9854 19.4141C15.5469 19.4141 15.9912 18.9697 15.9912 18.4131L15.9912 3.13965C15.9912 2.58301 15.5469 2.12891 14.9854 2.12891C14.4189 2.12891 13.9844 2.58301 13.9844 3.13965L13.9844 18.4131C13.9844 18.9697 14.4189 19.4141 14.9854 19.4141Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M11.4844 16.5918C12.0508 16.5918 12.4951 16.1523 12.4951 15.5908L12.4951 5.95703C12.4951 5.39551 12.0508 4.94629 11.4844 4.94629C10.9229 4.94629 10.4883 5.39551 10.4883 5.95703L10.4883 15.5908C10.4883 16.1523 10.9229 16.5918 11.4844 16.5918Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M7.9834 21.5479C8.5498 21.5479 8.99902 21.1035 8.99902 20.542L8.99902 1.01074C8.99902 0.449219 8.5498 0 7.9834 0C7.42676 0 6.99219 0.449219 6.99219 1.01074L6.99219 20.542C6.99219 21.1035 7.42676 21.5479 7.9834 21.5479Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M4.4873 17.9932C5.05371 17.9932 5.50293 17.5488 5.50293 16.9873L5.50293 4.56055C5.50293 3.99902 5.05371 3.54492 4.4873 3.54492C3.93555 3.54492 3.49609 3.99902 3.49609 4.56055L3.49609 16.9873C3.49609 17.5488 3.93555 17.9932 4.4873 17.9932Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M0.991211 14.1553C1.5625 14.1553 2.00684 13.7061 2.00684 13.1494L2.00684 8.39844C2.00684 7.83691 1.5625 7.38281 0.991211 7.38281C0.43457 7.38281 0 7.83691 0 8.39844L0 13.1494C0 13.7061 0.43457 14.1553 0.991211 14.1553Z" fill="currentColor" fill-opacity="0.85"/>
     </g>
    </svg>
    <p>Sorry, I can't find what you're looking for today.</p>
  </div>
`

const style = `
  #sorry {
    display: flex;
    align-items: center;
    gap: 1em;
    background-color: rgb(90 110 220);
    border-radius: var(--border-radius);
    padding: 1em;
    margin-bottom: var(--line-height-body);
    height: calc(3 * var(--line-height-body));
  }
  
  .symbol {
    color: oklch(from rgb(90 110 220) calc(l + .3) c h);
    width: calc(2 * var(--line-height-body));
    max-height: calc(2 * var(--line-height-body));
  }
  
  p {
    color: oklch(from rgb(90 110 220) calc(l + .3) c h);
    margin-bottom: 0;
  }
`

export function sorry(spec) {
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
  name: "bbb-sorry",
  component: sorry,
  template,
  style
});
