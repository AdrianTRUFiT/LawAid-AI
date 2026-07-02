import { bindRouteArtifact } from './bind-route-artifact';

const route = bindRouteArtifact({
  need: "Deliver medical device from A to B",
  options: ["air", "ground-secure", "express-chain"],
  createdAt: Date.now()
});

console.log("---- ROUTE ARTIFACT ----");
console.log(route);
