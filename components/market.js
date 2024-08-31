import { html, state, web_component, define_component } from "https://busy-dog-44.deno.dev/melhosseiny/sourdough/main/sourdough.js";

const PAGE_SIZE = 9;

const template = (data) => html`
  <form id="search_form" action="" method="">
    <div id="prompt">
      <input required type="search" id="query" name="query" autocomplete="off" placeholder="What are you looking for today?">
      <button type="submit" id="submit-btn">
        <svg class="symbol" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20.6543 20.3027">
         <g>
          <rect height="20.3027" opacity="0" width="20.6543" x="0" y="0"/>
          <path d="M10.1465 20.293C10.6787 20.293 11.1133 19.9023 11.1914 19.3408C12.0947 12.8271 12.998 11.9092 19.3115 11.2012C19.873 11.1377 20.293 10.6885 20.293 10.1465C20.293 9.59961 19.8779 9.16016 19.3164 9.08203C13.0225 8.30078 12.1777 7.45605 11.1914 0.942383C11.0986 0.385742 10.6738 0 10.1465 0C9.60938 0 9.17969 0.385742 9.0918 0.947266C8.19824 7.46094 7.29492 8.37891 0.986328 9.08203C0.415039 9.15527 0 9.59473 0 10.1465C0 10.6885 0.405273 11.1279 0.976562 11.2012C7.27539 12.0654 8.08594 12.8418 9.0918 19.3457C9.19434 19.9072 9.62402 20.293 10.1465 20.293Z" fill="currentColor" fill-opacity="0.85"/>
         </g>
        </svg>
      </button>
    </div>
    <div id="market" ref="bags">
      ${ data.bags && data.bags.explanation ? `<p id="explanation">${data.bags.explanation}</p>` : '' }
      <bbb-sorry status="200" status-text="ok"></bbb-sorry>
      <div class="items">
        ${ data.bags && data.bags.items
          ? data.bags.items.map(bag =>`<a href="${bag.link}" target="_blank">
            <ad-card class="bag">
              <p slot="text">
                <span class="scene">
                  <span class="cube">
                    <span class="face front">
                      <span class="label" ${ bag.color ? `style="background: linear-gradient(to right, rgb(from ${bag.color[0]} r g b / 0.5), rgb(from ${bag.color[1]} r g b / 0.5), rgb(from ${bag.color[2]} r g b / 0.5));"` : ''}>
                        <span class="country">${bag.country ? bag.country : "Blend" }</span><br>
                        <span class="name">${bag.name}</span><br>
                        <span class="roaster">${bag.roaster.name}</span>
                      </span>
                      <span class="cultivar">${bag.process} ${bag.cultivar}</span>
                      <span class="notes">${bag.notes}</span>
                      <span class="size">${bag.size}g</span>
                      <span class="price">$${bag.price.toFixed ? bag.price.toFixed(2) : bag.price}</span>
                    </span>
                    <span class="face back" ${bag.altitude ? (Array.isArray(bag.altitude) ? `style="--alt: ${(bag.altitude[0] + bag.altitude[1]) * 100 / 6000}%"` :  `style="--alt: ${bag.altitude * 100 / 3000}%"`) : ''}>
                      <span class="from">${bag.region ? bag.region : ''}</span>
                      <span class="alt">${bag.altitude ? (Array.isArray(bag.altitude) ? `${bag.altitude[0]}-${bag.altitude[1]} masl` :  `${bag.altitude} masl`) : ''}</span>
                    </span>
                    <span class="face right"></span>
                    <span class="face left"></span>
                    <span class="face top"></span>
                    <span class="face bottom"></span>
                  </span>
                </span>
              </p>
            </ad-card></a>`).join('')
          : `<ad-card class="empty bag">
              <p slot="text">
                <span class="scene">
                  <span class="cube">
                    <span class="face front"></span>
                    <span class="face back"></span>
                    <span class="face right"></span>
                    <span class="face left"></span>
                    <span class="face top"></span>
                    <span class="face bottom"></span>
                  </span>
                </span>
              </p>
            </ad-card>
            <ad-card class="empty bag">
              <p slot="text">
                <span class="scene">
                  <span class="cube">
                    <span class="face front"></span>
                    <span class="face back"></span>
                    <span class="face right"></span>
                    <span class="face left"></span>
                    <span class="face top"></span>
                    <span class="face bottom"></span>
                  </span>
                </span>
              </p>
            </ad-card>
            <ad-card class="empty bag">
              <p slot="text">
                <span class="scene">
                  <span class="cube">
                    <span class="face front"></span>
                    <span class="face back"></span>
                    <span class="face right"></span>
                    <span class="face left"></span>
                    <span class="face top"></span>
                    <span class="face bottom"></span>
                  </span>
                </span>
              </p>
            </ad-card>`
        }
      </div>
      ${ data.bags && data.bags.has_more
        ? `<a id="more" class="button" href="#">More
            <svg class="symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.252 11.2207">
             <g>
              <rect height="11.2207" opacity="0" width="18.252" x="0" y="0"/>
              <path d="M8.9502 11.2207C9.43848 11.2158 9.83887 11.0352 10.2295 10.6445L17.4463 3.25195C17.7441 2.9541 17.8906 2.60254 17.8906 2.17773C17.8906 1.30859 17.1924 0.605469 16.3379 0.605469C15.9131 0.605469 15.5127 0.776367 15.1953 1.10352L8.55957 7.9541L9.35547 7.9541L2.7002 1.10352C2.38281 0.786133 1.9873 0.605469 1.55273 0.605469C0.693359 0.605469 0 1.30859 0 2.17773C0 2.59766 0.151367 2.94922 0.439453 3.25684L7.66602 10.6445C8.06641 11.0449 8.46191 11.2207 8.9502 11.2207Z" fill="currentColor" fill-opacity="0.85"/>
             </g>
            </svg>
          </a>`
        : ''
      }
    </div>
  </form>
`

const style = `
  :host {
    width: 100%;
    height: 100%;
  }

  #prompt {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--line-height-body);
    background-color: white;
    padding: 0.5em 0.5em 0.5em 1em;
    border-radius: var(--border-radius);
    border-radius: 48px;
  }
  
  #search_form input {
    font-size: var(--font-size-body);
    width: 100%;
    padding: 0;
    border: none;
    box-sizing: border-box;
    border-radius: 0;
    outline-style: none;
    background: transparent;
    caret-color: black;
    caret-shape: block;
    color: black;

    &::placeholder {
      color: oklch(from white calc(l - .2) c h);
    }
  }

  #submit-btn {
    --button-color: 0,0,0;
    color: white;
    margin-bottom: 0;
    border-radius: 50%;
    min-width: calc(1.5 * var(--line-height-body));
    height: calc(1.5 * var(--line-height-body));
    animation: none;
  }

  #submit-btn.gemini {
    animation: 3s infinite alternate gemini;
  }

  @keyframes gemini {
    from {
      color: oklch(75% .2 0);
      transform: rotate(0deg);
    }

    15% { color: oklch(75% .2 50); }
    30% { color: oklch(75% .2 100); }
    45% { color: oklch(75% .2 150); }
    60% { color: oklch(75% .2 200); }
    75% { color: oklch(75% .2 250); }
    90% { color: oklch(75% .2 300); }

    to {
      color: oklch(75% .2 360);
      transform: rotate(360deg);
    }
  }

  #more {
    --opacity-enabled: 0;
    width: calc(100vw - 4rem);
    padding: 11px 22px 11px 22px;
    box-sizing: border-box;
    border: 1px solid black;
    height: calc(2 * var(--line-height-body));
    font-weight: bold;
    color: oklch(from var(--pale-yellow) calc(l - .6) c h);
  }

  #market .items {
    padding-left: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-auto-flow: dense;
    grid-gap: 30px;
    margin-bottom: 30px;
  }

  .empty.bag {
    animation: pulse 1000ms linear infinite forwards;
  }

  #market .items .empty,  #market bbb-sorry  {
    display: none;
  }

  #market .items.loading .empty, #market bbb-sorry.visible {
    display: block;
  }
  
  @media screen and (max-width: 60em) {
    #market .items {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .scene {
    --w: 200px;
    --h: 200px;
    --d: 100px;
    display: block;
    margin: 1em auto;
    flex: 1;
    width: var(--w);
    height: var(--h);
    box-sizing: border-box;
    perspective: 700px;
  }

  .cube {
    display: block;
    width: var(--w);
    height: var(--h);
    position: relative;
    box-sizing: border-box;
    transform-style: preserve-3d;
    transform: translateZ(-100px) rotateX(-15deg) rotateY(15deg);
    transition: transform 1s;
  }

  .scene:hover .cube {
    transform: translateZ(-100px) rotateX(-15deg) rotateY(165deg);
  }

  .cube .face {
    display: block;
    position: absolute;
    width: var(--w);
    height: var(--h);
    box-sizing: border-box;
    background-color: rgb(243 241 228 / 0.9);
    transform-style: preserve-3d;
    font-family: "SF Pro Display";
    font-synthesis: none;
    line-height: 1em;
  }

  .face.left, .face.right {
    width: var(--d);
    height: var(--h);
    left: calc(var(--w) / 2 - 50px);
  }

  .face.top, .face.bottom {
    width: var(--w);
    height: var(--d);
    top: calc(var(--h) / 2 - 50px);
  }

  .face.front {
    transform: rotateY(0deg) translateZ(calc(var(--d) / 2));
  }
  .face.back { transform: rotateY(180deg) translateZ(calc(var(--d) / 2)); }
  .face.right { transform: rotateY( 90deg) translateZ(calc(var(--w) / 2)); }
  .face.left { transform: rotateY(-90deg) translateZ(calc(var(--w) / 2)); }
  .face.top { transform: rotateX( 90deg) translateZ(calc(var(--h) / 2)); }
  .face.bottom { transform: rotateX(-90deg) translateZ(calc(var(--h) / 2)); }

  .face.front, .face.back {
    background: rgb(247 245 233 / 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
  }

  .face.front .size {
    font-family: "SF Mono";
    font-variant: all-small-caps;
    font-size: small;
    color: rgb(from black r g b / 0.5);
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .face.front .price {
    font-family: "SF Mono";
    font-variant: all-small-caps;
    text-transform: uppercase;
    font-size: small;
    position: absolute;
    top: 0;
    right: 0;
    transform: rotateZ(10deg) translateX(100%);
    background-color: transparent;
    border: 1px solid black;
    border-radius: 4px;
    padding: 0 4px;

  }

  .face.back {
    --alt: 0%;
    justify-content: center;
    text-align: center;
    padding: 0.5em;
    background: linear-gradient(to bottom, rgb(247 245 233 / 0.9) calc(100% - var(--alt)), rgb(90 110 220 / 0.9) calc(100% - var(--alt)));
  }

  .face.left, .face.right {
    background: rgb(234 229 214 / 0.9);
  }

  .face.front .label {
    font-variant: all-small-caps;
    text-align: center;
    background: pink;
    padding: 0.5em ;
    padding-top: 0;
    margin: 0 1em;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .name {
    font-weight: 400;
  }

  .country, .roaster {
    font-size: calc(0.7 * var(--font-size-body));
    line-height: 1em;
  }

  ad-card::part(title) {
    font-weight: bold;
    white-space: normal;
  }

  ad-card::part(text) {
    font-weight: 300;
  }

  .alt {
    color: rgb(var(--text-color), 0.5);
  }

  .price {
    font-family: "SF Pro Text";
    font-weight: 300;
  }

  .cultivar {
    font-family: "SF Pro Text";
    font-weight: 300;
    font-size: small;
    text-align: center;
    padding: 0.5em;
  }

  .notes {
    font-family: "SF Pro Text";
    font-weight: 300;
    font-size: small;
    text-align: center;
    padding: 0.5em;
    justify-self: bottom;
    margin-top: auto;
    margin-bottom: 1em;

  }

  @keyframes pulse {
    0% { opacity: 0.75; }
    50% { opacity: 1; }
    100% { opacity: 0.75; }
  }
`

export function market(spec) {
  let { _root } = spec;
  const _web_component = web_component(spec);
  const _state = _web_component.state;

  const fetch_bags = async (query) => {
    _state.bags = undefined;
    show_loading();
    try {
      const response = query
        ? await fetch(`/index.json?page_size=${PAGE_SIZE}&query=${query}`)
        : await fetch(`/index.json?page_size=${PAGE_SIZE}`);
      if (!response.ok) {
        throw { status: response.status, statusText: response.statusText };
      }
      const text = await response.text();
      try {
        _state.bags = JSON.parse(text);
      } catch (e) {
        _state.bags = undefined;
      }
    } catch (error) {
      _root.shadowRoot.querySelector("bbb-sorry")?.classList.toggle("visible");
      _root.shadowRoot.querySelector("bbb-sorry")?.setAttribute("status", error.status);
      _root.shadowRoot.querySelector("bbb-sorry")?.setAttribute("status-text", error.statusText);
      _root.shadowRoot.querySelector("bbb-sorry")?.component.set_error(error.status, error.statusText);
      console.error(error);
    } finally {
      hide_loading();
      window.history.pushState('{}', 'bagsbagsbags', query ? '/prompt' : '/');
    }
  }
  
  const fetch_more_bags = async (after) => {
    const response = await fetch(`/index.json?page_size=${PAGE_SIZE}&after=${after}`);
    const fetched_bags = _state.bags.items;
    const bags = await response.json();
    _state.bags = {
      ...bags,
      items: [...fetched_bags, ...bags.items]
    }
  }

  const init = () => {
    fetch_bags();
  }
  
  const handle_fetch_more = (event) => {
    event.preventDefault();
    fetch_more_bags(_state.bags.cursor);
  }
  
  const update_bags = () => {
    const val = _root.shadowRoot.querySelector('#query').value;
    fetch_bags(val);
  }
  
  const show_loading = () => {
    _root.shadowRoot.querySelector("#submit-btn")?.classList.toggle("gemini");
    _root.shadowRoot.querySelector(".items")?.classList.toggle("loading");
  }
  
  const hide_loading = () => {
    console.log("hide_loading");
    _root.shadowRoot.querySelector("#submit-btn")?.classList.toggle("gemini");
    _root.shadowRoot.querySelector(".items")?.classList.toggle("loading");
  }
  
  const submit_form = (event) => {
    submit(event, _root.shadowRoot.querySelector('#search_form'))
  }
  
  const submit = (event, form) => {
    event.preventDefault();
    form.reportValidity()
    update_bags();
  }

  const effects = () => {
    _root.shadowRoot.querySelector('#submit-btn').addEventListener("click", submit_form);
    const more_btn = _root.shadowRoot.querySelector('#more');
    if (more_btn) {
      more_btn.addEventListener("click", handle_fetch_more);
    }
  }

  const cleanup_effects = () => {
    _root.shadowRoot.querySelector('#submit-btn').removeEventListener("click", submit_form);
    const more_btn = _root.shadowRoot.querySelector('#more');
    if (more_btn) {
      more_btn.removeEventListener("click", handle_fetch_more);
    }
  }

  return Object.freeze({
    ..._web_component,
    init,
    effects,
    cleanup_effects
  })
}

define_component({
  name: "bbb-market",
  component: market,
  template,
  style
});
