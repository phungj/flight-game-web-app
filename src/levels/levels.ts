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

    {
        id: "convoy",
        name: "CONVOY",
        description:
            "Destroy the convoy and its air escort.",
        enemies: [
            {
                id: "convoy-fighter-1",
                name: "FIGHTER 1",
                type: "fighter",
                position: [-600, 900, -3500],
                countermeasures: 2,
                ai: "fighter",
            },
            {
                id: "convoy-fighter-2",
                name: "FIGHTER 2",
                type: "fighter",
                position: [600, 850, -3700],
                countermeasures: 2,
                ai: "fighter",
            },

            {
                id: "convoy-destroyer",
                name: "DESTROYER",
                type: "destroyer",
                position: [-250, 0, -5000],
                countermeasures: 0,
                ai: "ship",
            },
            {
                id: "convoy-supply",
                name: "SUPPLY SHIP",
                type: "supply",
                position: [0, 0, -5300],
                countermeasures: 0,
                ai: "none",
            },
            {
                id: "convoy-cruiser",
                name: "CRUISER",
                type: "cruiser",
                position: [300, 0, -5600],
                countermeasures: 0,
                ai: "ship",
            },
        ],
    },
];