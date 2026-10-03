import { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
    {
        id: "escort",
        name: "ESCORT",
        description:
            "Eliminate the bomber and its escort.",
        terrain: {
            type: "ocean"
        },
        objects: [],
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
        terrain: {
            type: "ocean"
        },
        objects: [],
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
        terrain: {
            type: "ocean"
        },
        objects: [],
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
    {
        id: "depot",
        name: "DEPOT",
        description:
            "Destroy the enemy vehicles at the supply depot.",

        terrain: {
            type: "land"
        },

        objects: [
            {
                id: "depot-building",
                type: "building",
                position: [0, 0, -2500],
                scale: [3, 1, 2],
            },
            {
                id: "depot-tent-1",
                type: "tent",
                position: [-150, 0, -2350],
                rotation: 0.4,
            },
            {
                id: "depot-tent-2",
                type: "tent",
                position: [150, 0, -2350],
                rotation: -0.3,
            },
            {
                id: "depot-container-1",
                type: "container",
                position: [-100, 0, -2600],
            },
            {
                id: "depot-container-2",
                type: "container",
                position: [100, 0, -2600],
            },
            {
                id: "depot-fuel-1",
                type: "fuel-tank",
                position: [-250, 0, -2500],
            },
            {
                id: "depot-fuel-2",
                type: "fuel-tank",
                position: [250, 0, -2500],
            },
        ],

        enemies: [
            {
                id: "depot-tank-1",
                name: "TANK 1",
                type: "tank",
                position: [-75, 0, -2800],
                countermeasures: 0,
                ai: "none",
            },
            {
                id: "depot-tank-2",
                name: "TANK 2",
                type: "tank",
                position: [75, 0, -2800],
                countermeasures: 0,
                ai: "none",
            },
            {
                id: "depot-truck-1",
                name: "TRUCK 1",
                type: "truck",
                position: [-175, 0, -2650],
                countermeasures: 0,
                ai: "none",
            },
            {
                id: "depot-truck-2",
                name: "TRUCK 2",
                type: "truck",
                position: [175, 0, -2650],
                countermeasures: 0,
                ai: "none",
            },
            {
                id: "depot-sam-1",
                name: "SAM 1",
                type: "sam",
                position: [-350, 0, -2500],
                countermeasures: 0,
                ai: "ground",
            },
            {
                id: "depot-sam-2",
                name: "SAM 2",
                type: "sam",
                position: [350, 0, -2500],
                countermeasures: 0,
                ai: "ground",
            },
            {
                id: "depot-aa-1",
                name: "AA 1",
                type: "aa",
                position: [-300, 0, -2900],
                countermeasures: 0,
                ai: "ground",
            },
            {
                id: "depot-aa-2",
                name: "AA 2",
                type: "aa",
                position: [300, 0, -2900],
                countermeasures: 0,
                ai: "ground",
            },
        ],
    },
];