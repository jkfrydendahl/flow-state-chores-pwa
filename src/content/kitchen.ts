import { rooms } from "./rooms.ts";
export const victoryConditions = rooms.kitchen.victory;
export type Mode = keyof typeof victoryConditions;
export const modeOrder: Mode[] = ["minimal", "photoshoot", "tidy"];
export type Quest = {
  name: string; description: string; entry: string; boundary: string;
  stages: readonly { title: string; guidance: string; feedback: string }[];
};
export const quests: Record<Mode, Quest> = {
  minimal: {
    name: "Minimal plain", description: "Put away the obvious. Wipe what’s clear.",
    entry: "Put away the nearest thing whose home you know. If nothing qualifies, gather the nearest dish.",
    boundary: "Things without a home can stay. You do not need an empty sink or a finished dishwasher cycle.",
    stages: [
      { title: "Put away the obvious", guidance: "Start at the nearest counter, work around the kitchen, then across the table. Return things with known homes and gather dishes by the sink. Leave anything without an obvious home.", feedback: "Spaces appear, even if some things remain." },
      { title: "Gather the dishes", guidance: "Bring the remaining dishes together at the washing-up area. Load or wash them where straightforward; gathering them is enough for this mode. Unload the dishwasher only if you need that space.", feedback: "Dishes are together instead of scattered." },
      { title: "Wipe what’s clear", guidance: "Follow the same route with a cloth. Wipe the surfaces now clear, finishing by the sink if that area is clear. Leave unresolved clutter in place.", feedback: "The clear areas are wiped and usable." },
    ],
  },
  photoshoot: {
    name: "Photoshoot", description: "A clear, calm kitchen, ready to use.",
    entry: "Take the nearest item off the table. Put it in its home, or take it to the sink if it’s a dish.",
    boundary: "The dishwasher may still be running. Stop at presentable; deep cleaning belongs to Tidy whitie.",
    stages: [
      { title: "Clear table and counters", guidance: "Finish the table, then work around the counters toward the sink. Return belongings and gather dishes. If something has no home, use one temporary container out of view without blocking another space; sorting it is a separate task.", feedback: "First the table, then the counters are empty." },
      { title: "Finish the dish area", guidance: "Put clean dishes away, then load or wash the remaining dishes. Put hand-washed dishes away when ready and make the sink presentable.", feedback: "The dishes are gone and the sink looks ready to use." },
      { title: "Finish the visible reset", guidance: "Remove obvious floor crumbs and debris, working toward the exit. Address obvious marks that prevent a presentable finish. A thorough floor clean is not needed.", feedback: "From the doorway, the kitchen looks clear and presentable." },
    ],
  },
  tidy: {
    name: "Tidy whitie", description: "Clear first. Then give the kitchen a proper clean.",
    entry: "If Photoshoot is complete, pick up the cloth and clean the nearest surface. Otherwise, start by clearing the table.",
    boundary: "Skip work already done. Cupboard reorganization, freezer defrosting and appliance descaling are separate projects.",
    stages: [
      { title: "Complete Photoshoot", guidance: "Clear the table and counters, put dishes away or in the dishwasher, make the sink presentable and leave the floor looking okay. Use the Photoshoot route below if helpful; skip anything already done.", feedback: "The kitchen is clear enough to clean without handling clutter again." },
      { title: "Clean above floor level", guidance: "Work around the room in one direction, higher surfaces before lower ones. Clean all surfaces and fixtures, then fronts and handles in each section. Lift movable objects to clean beneath them and return them. Clean the stovetop; finish with the sink after the other rinsing.", feedback: "Each section loses its dust, grease, splashes and fingerprints." },
      { title: "Clean the floor thoroughly", guidance: "Remove loose dirt first, then thoroughly clean the floor using the usual method appropriate to it. Include edges and corners; work from the farthest point toward the exit.", feedback: "The floor is clean and no dirty work remains above it." },
    ],
  },
};
