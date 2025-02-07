import "./style.css";
import { runGame } from "./runGame.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="container">
    <svg id="main-svg"></svg>
    <button id="place-hex-button">Place Hex</button>
  </div>
`;

runGame(
  document.querySelector<SVGElement>("#main-svg")!,
  document.querySelector<HTMLButtonElement>("#place-hex-button")!
);
