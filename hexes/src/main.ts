import "./style.css";
import { runGame } from "./runGame.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="container">
    <svg id="main-svg"></svg>
  </div>
`;

runGame(document.querySelector<SVGElement>("#main-svg")!);
