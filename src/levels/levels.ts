import { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
    {
        id: "escort",
        name: "ESCORT",
        description:
            "Eliminate the bomber and its escort.",
        enemies: [
            {
                id: "fighter",
                name: "FIGHTER",
                type: "fighter",
                position: [500, 750, -3200],
                countermeasures: 2,
                ai: "fighter",
            },
            {
                id: "bomber",
                name: "BOMBER",
                type: "bomber",
                position: [0, 700, -4000],
                countermeasures: 0,
                ai: "none",
            },
        ],
    },

    {
        id: "dogfight",
        name: "DOGFIGHT",
        description:
            "Eliminate all four fighters.",
        enemies: [
            {
                id: "fighter-1",
                name: "FIGHTER 1",
                type: "fighter",
                position: [-450, 650, -3000],
                countermeasures: 0,
                ai: "fighter",
            },
            {
                id: "fighter-2",
                name: "FIGHTER 2",
                type: "fighter",
                position: [450, 650, -3000],
                countermeasures: 0,
                ai: "fighter",
            },
            {
                id: "fighter-3",
                name: "FIGHTER 3",
                type: "fighter",
                position: [-450, 850, -3400],
                countermeasures: 0,
                ai: "fighter",
            },
            {
                id: "fighter-4",
                name: "FIGHTER 4",
                type: "fighter",
                position: [450, 850, -3400],
                countermeasures: 0,
                ai: "fighter",
            },
        ],
    },
];