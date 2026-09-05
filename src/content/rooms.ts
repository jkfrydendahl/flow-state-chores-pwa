export const rooms = {
  "kitchen": {
    "name": "Kitchen",
    "victory": {
      "minimal": "Things that have a home are put away, dishes are gathered/dealt with, and any surfaces that are now clear are wiped.",
      "photoshoot": "Counters empty, table empty, dishes gone, sink presentable, floor looks okay.",
      "tidy": "Photoshoot complete, then all surfaces and fixtures properly cleaned, fronts/handles wiped, sink and stovetop cleaned, and floor thoroughly cleaned."
    }
  },
  "living-room": {
    "name": "Living room",
    "victory": {
      "minimal": "Things that have a home are put away, obvious rubbish/cups are removed, and cleared tables or surfaces are wiped.",
      "photoshoot": "Tables and visible surfaces clear, sofa tidy, floor clear, stray items gone, room looks ready to photograph.",
      "tidy": "Photoshoot complete, then dusting, furniture/surfaces cleaned, sofa attended to, edges/corners cleaned, and floor thoroughly vacuumed/washed as appropriate."
    }
  },
  "bathroom": {
    "name": "Bathroom",
    "victory": {
      "minimal": "Toiletries and objects with a home are put away, rubbish removed, and newly cleared sink/counter areas wiped.",
      "photoshoot": "Sink and counter clear, toiletries neatly away, towels tidy, toilet area clear, floor looks okay.",
      "tidy": "Photoshoot complete, then toilet, sink, taps, mirror, shower/bath and other surfaces fully cleaned, with the floor thoroughly cleaned."
    }
  },
  "bedroom": {
    "name": "Bedroom",
    "victory": {
      "minimal": "Clothes and objects that already have a home are put away, rubbish/cups removed, and cleared surfaces wiped.",
      "photoshoot": "Bed made, floor clear, bedside tables/dresser clear, clothes put away, visible clutter gone.",
      "tidy": "Photoshoot complete, then dusting and surface cleaning, bedding dealt with if needed, furniture/edges cleaned, and floor thoroughly vacuumed/washed."
    }
  },
  "bryggers": {
    "name": "Bryggers",
    "victory": {
      "minimal": "Clothes, shoes, cleaning supplies and other items that already have a proper place are returned there, obvious rubbish is removed, and cleared surfaces are wiped.",
      "photoshoot": "Counters and work surfaces clear, laundry contained or put away, shoes/coats orderly, floor clear, loose household items returned to their places, room looks calm and usable.",
      "tidy": "Photoshoot complete, then appliances, sink, shelves and surfaces properly cleaned, dust/cobwebs removed, storage areas straightened where needed, and the floor thoroughly cleaned."
    }
  },
  "entrance": {
    "name": "Entrance",
    "victory": {
      "minimal": "Shoes, coats and objects with assigned places are returned there, obvious clutter removed, and cleared surfaces wiped.",
      "photoshoot": "Floor clear, shoes/coats orderly, surfaces clear, nothing visibly dumped or waiting to be dealt with.",
      "tidy": "Photoshoot complete, then doors, handles, mirrors/surfaces and edges cleaned, with the floor thoroughly cleaned."
    }
  },
  "kids-rooms": {
    "name": "Kids' rooms",
    "victory": {
      "minimal": "Toys and belongings with obvious homes are returned there, rubbish removed, and any cleared surfaces cleaned.",
      "photoshoot": "Floor largely clear, toys put away, surfaces clear, bed/seating tidy, room visually calm.",
      "tidy": "Photoshoot complete, then surfaces, shelves and furniture cleaned, dust removed, and floor thoroughly cleaned."
    }
  },
  "carport": {
    "name": "Carport",
    "victory": {
      "minimal": "Tools, shoes, bikes and other items that already have a proper place are returned there, obvious rubbish is removed, and any cleared shelves/work surfaces are wiped or brushed down.",
      "photoshoot": "Floor area clear enough to move freely, tools and equipment orderly, shelves/workbench visually tidy, loose items put away, obvious dirt/leaves/debris removed.",
      "tidy": "Photoshoot complete, then shelves, work surfaces and accessible fixtures properly cleaned, cobwebs/dust removed, stored items straightened where needed, and the floor thoroughly swept or washed as appropriate."
    }
  }
} as const;
export type Room = keyof typeof rooms;
export const roomOrder = Object.keys(rooms) as Room[];
