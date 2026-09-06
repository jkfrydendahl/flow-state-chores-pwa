import type { Room } from "./rooms.ts";
import type { Mode } from "./kitchen.ts";
const firstWins: Record<Room, string> = {
  kitchen: "Finish the table before moving around the counters.",
  "living-room": "Finish the nearest table before moving to the next surface.",
  bathroom: "Clear the sink and counter before moving on to towels.",
  bedroom: "Make the bed first, then work outward from it.",
  bryggers: "Contain the loose laundry first, then clear the work surfaces.",
  entrance: "Make the shoes and coats orderly before clearing the other surfaces.",
  "kids-rooms": "Put the toys in one part of the play area away before moving on.",
  carport: "Put equipment in one section back in place before moving on.",
};
export function challengeFor(room: Room, mode: Mode) {
  if (mode === "minimal") return { title: "Keep the rhythm", text: "Know its home? Put it there. No obvious home? Move on. Keep that simple rhythm through the first pass." };
  if (mode === "photoshoot") return { title: "One visible win", text: firstWins[room] };
  return { title: "One smooth pass", text: "Once Photoshoot is complete, clean one section at a time, higher surfaces before lower ones. Let each finished section lead you around the room. Trips to rinse or fetch equipment are part of the route." };
}
