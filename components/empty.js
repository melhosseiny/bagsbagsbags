import { html, state, web_component, define_component } from "https://busy-dog-44.deno.dev/melhosseiny/sourdough/main/sourdough.js";

const template = (data) => html`
  <div id="empty">
    <svg class="symbol" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 23.1787 18.6914">
     <g>
      <rect height="18.6914" opacity="0" width="23.1787" x="0" y="0"/>
      <path d="M18.6377 18.6914L20.3027 18.6914C22.0068 18.6914 22.8174 17.8857 22.8174 16.1523L22.8174 12.5684C22.8174 10.8447 22.0068 10.0342 20.3027 10.0342L18.6377 10.0342C16.9287 10.0342 16.1182 10.8447 16.1182 12.5684L16.1182 16.1523C16.1182 17.8857 16.9287 18.6914 18.6377 18.6914Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M10.5762 18.6914L12.2461 18.6914C13.9502 18.6914 14.7559 17.8857 14.7559 16.1523L14.7559 12.5684C14.7559 10.8447 13.9502 10.0342 12.2461 10.0342L10.5762 10.0342C8.87207 10.0342 8.06152 10.8447 8.06152 12.5684L8.06152 16.1523C8.06152 17.8857 8.87207 18.6914 10.5762 18.6914Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M2.51465 18.6914L4.17969 18.6914C5.88379 18.6914 6.69434 17.8857 6.69434 16.1523L6.69434 12.5684C6.69434 10.8447 5.88379 10.0342 4.17969 10.0342L2.51465 10.0342C0.810547 10.0342 0 10.8447 0 12.5684L0 16.1523C0 17.8857 0.810547 18.6914 2.51465 18.6914Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M18.6377 8.67188L20.3027 8.67188C22.0068 8.67188 22.8174 7.86133 22.8174 6.13281L22.8174 2.55371C22.8174 0.820312 22.0068 0.0195312 20.3027 0.0195312L18.6377 0.0195312C16.9287 0.0195312 16.1182 0.820312 16.1182 2.55371L16.1182 6.13281C16.1182 7.86133 16.9287 8.67188 18.6377 8.67188Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M10.5762 8.67188L12.2461 8.67188C13.9502 8.67188 14.7559 7.86133 14.7559 6.13281L14.7559 2.55371C14.7559 0.820312 13.9502 0.0195312 12.2461 0.0195312L10.5762 0.0195312C8.87207 0.0195312 8.06152 0.820312 8.06152 2.55371L8.06152 6.13281C8.06152 7.86133 8.87207 8.67188 10.5762 8.67188Z" fill="currentColor" fill-opacity="0.85"/>
      <path d="M2.51465 8.67188L4.17969 8.67188C5.88379 8.67188 6.69434 7.86133 6.69434 6.13281L6.69434 2.55371C6.69434 0.820312 5.88379 0.0195312 4.17969 0.0195312L2.51465 0.0195312C0.810547 0.0195312 0 0.820312 0 2.55371L0 6.13281C0 7.86133 0.810547 8.67188 2.51465 8.67188Z" fill="currentColor" fill-opacity="0.85"/>
     </g>
    </svg>
    <p>Finding coffee bags</p>
  </div>
`

const style = `
  #empty {
    display: flex;
    align-items: center;
    gap: 1em;
//    background-color: oklch(from rgb(90 110 220) calc(l + .3) c h);
    border-radius: var(--border-radius);
    padding: 1em;
    margin-bottom: var(--line-height-body);
    height: calc(3 * var(--line-height-body));
  }
  
  .symbol {
    color: rgb(90 110 220);
    width: calc(2 * var(--line-height-body));
    max-height: calc(2 * var(--line-height-body));
    animation: pulse 1000ms linear infinite forwards;
  }
  
  p {
    color: rgb(90 110 220);
    margin-bottom: 0;
  }
  
  p::after {
    display: inline-block;
    animation: dotty steps(1,end) 1s infinite;
    content: ' ';
    margin-left: 8px;
  }
    
  @keyframes dotty {
    0%   { content: ' '; }
    25%  { content: ' .'; }
    50%  { content: ' ..'; }
    75%  { content: ' ...'; }
    100% { content: ' '; }
  }

  @keyframes pulse {
    0% { opacity: 0.75; }
    50% { opacity: 1; }
    100% { opacity: 0.75; }
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
