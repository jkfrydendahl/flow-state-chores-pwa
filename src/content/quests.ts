import { quests as kitchen, type Quest, type Mode } from "./kitchen.ts";
import type { Room } from "./rooms.ts";

// Guidance supports the finish lines in rooms.ts; it does not add requirements.
const stage = (title: string, guidance: string, feedback: string) => ({ title, guidance, feedback });
const minimalBoundary = "Things without an obvious home can stay. Stop after the cleared surfaces are wiped; organizing is a separate task.";
const photoBoundary = "Stop at the visible reset. Deep cleaning and finding permanent homes for unresolved items are separate tasks.";
const tidyBoundary = "Skip work already done. Stop at this room’s finish line; repairs, sorting projects and extra rooms can wait.";
function quest(name: string, description: string, entry: string, boundary: string, stages: Quest["stages"]): Quest {
  return { name, description, entry, boundary, stages };
}
export const roomQuests: Record<Room, Record<Mode, Quest>> = {
  kitchen,
  "living-room": {
    minimal: quest("Minimal plain", "Return the obvious. Wipe the clear spaces.", "Put the nearest item with a known home back there.", minimalBoundary, [
      stage("Return the obvious", "Start beside the sofa and work around the room once. Return belongings with known homes; leave things that need a storage decision.", "Useful spaces start to reappear."),
      stage("Take cups and rubbish out", "Gather obvious cups and rubbish as you go, then take them to the kitchen and bin in one trip where practical.", "Cups and rubbish no longer interrupt the room."),
      stage("Wipe the clear surfaces", "Follow the same route with a cloth, wiping cleared tables and surfaces. Leave unresolved clutter in place.", "The cleared areas are clean and usable."),
    ]),
    photoshoot: quest("Photoshoot", "Clear surfaces, a tidy sofa and an open floor.", "Return one thing from the coffee table to its home.", photoBoundary, [
      stage("Clear tables and surfaces", "Finish the nearest table, then move around the visible surfaces. Put belongings away and remove stray items. For unresolved items, use one temporary container out of view without blocking another space; sorting it is separate.", "Whole surfaces become clear."),
      stage("Tidy the sofa", "Return items left on the sofa. Straighten cushions and fold or arrange the blanket if there is one.", "The main place to sit looks inviting."),
      stage("Open the floor", "Put away remaining floor items, working toward the exit. Look back once to check the room looks ready to photograph.", "The floor is clear and the room looks orderly."),
    ]),
    tidy: quest("Tidy whitie", "Reset the room, then clean furniture and floors.", "If Photoshoot is complete, pick up the duster. Otherwise, clear the nearest table.", tidyBoundary, [
      stage("Complete Photoshoot", "Clear tables and visible surfaces, tidy the sofa, put away floor items and remove stray belongings. The Photoshoot route below is there if needed.", "The room is open enough to clean."),
      stage("Clean surfaces and sofa", "Work around the room from higher surfaces to lower ones. Dust and clean furniture and surfaces. Attend to the sofa, including loose debris in its accessible gaps, using a method suitable for its material.", "Dust and crumbs disappear from each finished section."),
      stage("Clean edges and floor", "Clean the edges and corners, then thoroughly vacuum or wash the floor as appropriate. Work from the farthest point toward the exit.", "The furniture and floor are both clean."),
    ]),
  },
  bathroom: {
    minimal: quest("Minimal plain", "Put toiletries away and wipe what’s clear.", "Put the nearest toiletry with a known home away.", minimalBoundary, [
      stage("Put familiar items away", "Start at the sink and work along the counter. Return toiletries and objects with known homes, leaving anything that needs a storage decision.", "Space opens around the sink."),
      stage("Remove rubbish", "Pick up the obvious rubbish and put it in the bin. Remove the collected rubbish from the bathroom.", "Loose rubbish is gone."),
      stage("Wipe the cleared areas", "Wipe newly cleared sink and counter areas, working toward the sink so you finish there.", "The areas you cleared are visibly clean."),
    ]),
    photoshoot: quest("Photoshoot", "A clear sink, tidy towels and an orderly room.", "Put one item from the sink or counter away.", photoBoundary, [
      stage("Clear sink and counter", "Put toiletries neatly away and clear the sink and counter. Use one temporary container out of view for unresolved items if needed, without blocking another space.", "The sink and counter are clear."),
      stage("Tidy towels and toilet area", "Straighten or hang the towels. Put away loose items around the toilet so the area is clear.", "The towels and toilet area look orderly."),
      stage("Finish the visible floor", "Remove obvious floor clutter, hair or marks that stop it looking okay. Work toward the door; a full bathroom clean is not needed.", "The room looks settled from the doorway."),
    ]),
    tidy: quest("Tidy whitie", "Reset first, then clean the bathroom fully.", "If Photoshoot is complete, take the bathroom cloth. Otherwise, put one item from the counter away.", tidyBoundary, [
      stage("Complete Photoshoot", "Clear the sink and counter, put toiletries neatly away, tidy towels and the toilet area, and leave the floor looking okay.", "The bathroom is ready to clean."),
      stage("Clean fixtures and surfaces", "Work from higher to lower surfaces: mirror, other surfaces, shower or bath, then sink and taps. Clean the toilet last using separate toilet-cleaning equipment. Follow product directions for any contact time.", "The mirror, fixtures and surfaces are clean."),
      stage("Clean the floor thoroughly", "Remove loose debris, then thoroughly clean the floor, finishing at the door.", "The final surface is clean as you leave."),
    ]),
  },
  bedroom: {
    minimal: quest("Minimal plain", "Return familiar items and wipe clear surfaces.", "Put away the nearest item of clothing whose place you know.", minimalBoundary, [
      stage("Return clothes and belongings", "Start nearest the doorway and work around the bed. Put clothes and objects in their existing places; leave storage decisions for another task.", "Belongings return to familiar places."),
      stage("Remove cups and rubbish", "Gather cups and obvious rubbish along the route, then take them out together where practical.", "The room loses its obvious leftovers."),
      stage("Wipe cleared surfaces", "Wipe any cleared bedside tables, dresser areas and other surfaces in the same direction around the room.", "The cleared spaces are clean and usable."),
    ]),
    photoshoot: quest("Photoshoot", "Make the bed and clear the visible clutter.", "Lift the nearest loose item off the bed and put it away.", photoBoundary, [
      stage("Clear and make the bed", "Put away things left on the bed, then straighten the bedding and pillows to make it.", "The largest visible surface looks finished."),
      stage("Put clothes and clutter away", "Work around the bed, putting clothes away and clearing the bedside tables and dresser. For unresolved items, use one temporary container out of view without blocking another space.", "The bed is framed by clear surfaces."),
      stage("Clear the floor", "Put away remaining floor items, working toward the door. Check once for visible clutter.", "The floor is clear and the room looks calm."),
    ]),
    tidy: quest("Tidy whitie", "Reset the bedroom, then clean bedding and surfaces as needed.", "If Photoshoot is complete, take the duster. Otherwise, clear one item from the bed.", "Bedding is dealt with if needed. A laundry cycle need not finish before the room is done. Stop at the stated finish line.", [
      stage("Complete Photoshoot", "Make the bed, put clothes away, clear the floor and bedside tables or dresser, and remove visible clutter.", "The bedroom is ready for cleaning."),
      stage("Deal with bedding and surfaces", "If bedding needs attention, deal with it first using your usual routine. Then dust and clean surfaces and furniture from higher to lower, including edges, working around the bed in one direction.", "The bedding is attended to and surfaces lose their dust."),
      stage("Clean the floor thoroughly", "Thoroughly vacuum or wash the floor as appropriate, working from the farthest part of the room toward the door.", "The last dust and floor dirt are gone."),
    ]),
  },
  bryggers: {
    minimal: quest("Minimal plain", "Return familiar items and wipe clear workspaces.", "Return the nearest shoe, supply or item of clothing to its known place.", "Items without a proper place can stay. Laundry does not need to be finished; wipe the surfaces you have cleared and stop.", [
      stage("Return items with places", "Start at the nearest work surface and work around the room. Return clothes, shoes, cleaning supplies and other items that already have proper places.", "Work areas become easier to use."),
      stage("Remove obvious rubbish", "Gather obvious rubbish along the route and take it to the bin.", "Loose rubbish is gone."),
      stage("Wipe cleared surfaces", "Wipe the work surfaces now clear, following the same route. Leave items that require storage decisions in place.", "The cleared areas are clean."),
    ]),
    photoshoot: quest("Photoshoot", "Clear workspaces and contain the laundry.", "Put the nearest loose laundry item in its usual basket or place.", "Contained laundry counts. Washing, drying and folding do not all need to be finished for the room to be done.", [
      stage("Contain laundry; order shoes and coats", "Gather loose laundry into its usual containers or put it away. Make shoes and coats orderly without opening a new sorting task.", "Laundry is contained and clothing no longer spreads through the room."),
      stage("Clear the work surfaces", "Work along the counters and workspaces. Return loose household items to their places so these surfaces are clear.", "Whole work surfaces become usable."),
      stage("Clear the floor", "Return remaining floor items to their places, working toward the exit. Check the room looks calm and usable.", "There is a clear floor and room to work."),
    ]),
    tidy: quest("Tidy whitie", "Reset the workspace, then clean appliances and surfaces.", "If Photoshoot is complete, pick up the cleaning cloth. Otherwise, contain the nearest loose laundry item.", "Laundry can remain contained or in progress. Straighten storage only where needed; do not turn this into a storage overhaul.", [
      stage("Complete Photoshoot", "Clear counters and work surfaces, contain or put away laundry, order shoes and coats, return loose items and clear the floor.", "The room is calm and usable."),
      stage("Clean appliances, shelves and sink", "Remove dust and cobwebs first, then work around the appliances, shelves and surfaces from higher to lower. Straighten storage areas where needed. Clean the sink last, after rinsing equipment.", "The working surfaces and fixtures are properly cleaned."),
      stage("Clean the floor thoroughly", "Remove loose dirt, then thoroughly clean the floor with the usual suitable method, ending at the exit.", "The floor is clean around the orderly laundry and equipment."),
    ]),
  },
  entrance: {
    minimal: quest("Minimal plain", "Return shoes and coats. Wipe the clear spaces.", "Return the nearest shoe or coat to its assigned place.", minimalBoundary, [
      stage("Return familiar belongings", "Start by the door and move along the storage area. Return shoes, coats and objects with assigned places.", "The entrance becomes easier to move through."),
      stage("Remove obvious clutter", "Remove obvious rubbish and take items with known destinations out of the entrance. Leave things that need a new storage decision.", "The obvious clutter is reduced."),
      stage("Wipe cleared surfaces", "Wipe the cleared shelf, bench or other surfaces, following the same route.", "The cleared spaces are clean."),
    ]),
    photoshoot: quest("Photoshoot", "An open floor and belongings neatly away.", "Put the nearest pair of shoes in its place.", photoBoundary, [
      stage("Order shoes and coats", "Work along the usual shoe and coat storage, returning and straightening items as you go.", "Shoes and coats look orderly."),
      stage("Clear surfaces and dumped items", "Clear the visible surfaces and put loose belongings away. Nothing should remain visibly dumped or waiting. If needed, use one temporary container out of view without blocking another space.", "Surfaces are clear, with no visible waiting pile."),
      stage("Clear the floor", "Return remaining floor items to their places, finishing at the door.", "The entrance is open and ready to walk through."),
    ]),
    tidy: quest("Tidy whitie", "Reset the entrance, then clean from door to floor.", "If Photoshoot is complete, pick up the cloth. Otherwise, put the nearest shoes away.", tidyBoundary, [
      stage("Complete Photoshoot", "Order shoes and coats, clear surfaces and the floor, and put away anything visibly dumped or waiting.", "The entrance is ready to clean."),
      stage("Clean doors, mirrors and surfaces", "Work around the entrance, higher surfaces before lower ones. Clean doors, handles, mirrors and other surfaces, then the edges.", "Marks and dust are gone from the surfaces you pass."),
      stage("Clean the floor thoroughly", "Remove loose dirt and thoroughly clean the floor using the usual suitable method, finishing at the exit.", "The doorway and the floor are clean."),
    ]),
  },
  "kids-rooms": {
    minimal: quest("Minimal plain", "Put familiar toys away and clean clear surfaces.", "Put the nearest toy with an obvious home back there.", minimalBoundary, [
      stage("Return toys with homes", "Start near the door and work around the play area. Return toys and belongings with obvious homes. Leave anything that needs a new organizing decision.", "Familiar play spaces reappear."),
      stage("Remove rubbish", "Gather obvious rubbish as you go and put it in the bin.", "Rubbish no longer mixes with toys."),
      stage("Clean cleared surfaces", "Clean the surfaces now clear, following the same route around the room.", "The cleared spaces are ready to use."),
    ]),
    photoshoot: quest("Photoshoot", "Put toys away and make the room visually calm.", "Put one loose toy in its usual place.", "The floor needs to be largely clear, not perfect. Stop at a visually calm room; toy sorting is separate.", [
      stage("Put toys and belongings away", "Work around the play area, returning toys to their usual places and making the floor largely clear. For unresolved items, use one temporary container out of view without blocking another space.", "The main floor area opens up."),
      stage("Clear surfaces", "Clear the visible tables, shelves and other surfaces of loose items, returning them to their places.", "The room has clear surfaces again."),
      stage("Tidy bed and seating", "Straighten the bed or seating and take one look back from the door. Stop when the room is visually calm.", "The places to rest and play look settled."),
    ]),
    tidy: quest("Tidy whitie", "Reset the room, then clean furniture and floors.", "If Photoshoot is complete, take the duster. Otherwise, put one toy away.", tidyBoundary, [
      stage("Complete Photoshoot", "Put toys away, leave the floor largely clear, clear surfaces and tidy the bed or seating.", "The room is visually calm and ready to clean."),
      stage("Dust and clean furniture", "Work around the room from higher to lower surfaces. Remove dust and clean shelves, other surfaces and furniture, lifting and returning objects as needed.", "Each section loses its dust and marks."),
      stage("Clean the floor thoroughly", "Thoroughly clean the floor using the usual suitable method, working from the farthest point to the doorway.", "The final surface is clean."),
    ]),
  },
  carport: {
    minimal: quest("Minimal plain", "Return equipment and brush clear workspaces.", "Return the nearest tool or shoe whose place you know.", "Items without a proper place can stay. Only wipe or brush the shelves and work surfaces you have cleared.", [
      stage("Return familiar equipment", "Start at the workbench or nearest storage area and move around the carport. Return tools, shoes, bikes and other items that already have proper places.", "The work and access areas open up."),
      stage("Remove obvious rubbish", "Gather obvious rubbish along the route and put it in the bin.", "Rubbish is gone from the working area."),
      stage("Brush or wipe clear surfaces", "Brush down or wipe cleared shelves and work surfaces, following the same route.", "The cleared workspaces are usable."),
    ]),
    photoshoot: quest("Photoshoot", "Order the equipment and clear a way through.", "Return one loose tool to its place.", "The floor needs enough clear space to move freely. Stop at orderly and visibly tidy; a full storage sort is separate.", [
      stage("Order equipment and loose items", "Work around the carport, putting loose items away and making tools and equipment orderly. Arrange bikes and other equipment in their usual places.", "Equipment no longer interrupts the route through."),
      stage("Tidy shelves and workbench", "Make shelves and the workbench visually tidy, keeping related equipment in its usual places.", "The work and storage areas look orderly."),
      stage("Clear access and visible debris", "Leave enough floor area to move freely. Remove obvious dirt, leaves and debris, working toward the opening.", "There is a clear route through without obvious debris."),
    ]),
    tidy: quest("Tidy whitie", "Reset the carport, then clean storage and floor.", "If Photoshoot is complete, pick up the brush. Otherwise, return the nearest tool.", "Clean accessible fixtures and straighten stored items where needed. Repairs and a full equipment sort are separate tasks.", [
      stage("Complete Photoshoot", "Order tools and equipment, tidy shelves and workbench, put loose items away, clear access and remove obvious dirt, leaves and debris.", "The carport is orderly and accessible."),
      stage("Clean shelves and fixtures", "Remove cobwebs and dust first. Then clean shelves, work surfaces and accessible fixtures, higher areas before lower ones. Straighten stored items where needed.", "Dust and cobwebs are gone from the finished sections."),
      stage("Clean the floor thoroughly", "Thoroughly sweep or wash the floor as appropriate, working from the back toward the opening.", "The floor is clean through to the opening."),
    ]),
  },
};
