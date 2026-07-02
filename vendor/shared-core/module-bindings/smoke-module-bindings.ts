import { bindFundTrackerAI, bindLawAidAI, bindLAIW } from './moduleBindings';

console.log("MODULE_BINDINGS_V1=START");

console.log("----");
console.log("FUNDTRACKERAI_BINDING");
console.log(bindFundTrackerAI());

console.log("----");
console.log("LAWAIDAI_BINDING");
console.log(bindLawAidAI());

console.log("----");
console.log("LAIW_BINDING");
console.log(bindLAIW());

console.log("MODULE_BINDINGS_V1=COMPLETE");
