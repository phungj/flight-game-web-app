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
                enemy: {
                    name: "FUEL TANK",
                    health: 75,
                    team: "enemy",
                },
            },
            {
                id: "depot-fuel-2",
                type: "fuel-tank",
                position: [250, 0, -2500],
                enemy: {
                    name: "FUEL TANK",
                    health: 75,
                    team: "enemy",
                },
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
    {
        id: "furball",
        name: "FURBALL",
        description:
            "Join friendlies in a furball and eliminate the enemy fighters.",
        terrain: {
            type: "ocean"
        },
        objects: [],

        enemies: [
            /*
             * --------------------------------------------------
             * FRIENDLY FLIGHT
             * --------------------------------------------------
             */

            {
                id: "friendly-1",
                name: "FRIENDLY 1",
                type: "fighter",
                position: [-900, 700, -2600],
                countermeasures: 2,
                ai: "fighter",
                team: "friendly",
            },
            {
                id: "friendly-2",
                name: "FRIENDLY 2",
                type: "fighter",
                position: [-350, 900, -3100],
                countermeasures: 2,
                ai: "fighter",
                team: "friendly",
            },
            {
                id: "friendly-3",
                name: "FRIENDLY 3",
                type: "fighter",
                position: [250, 650, -2900],
                countermeasures: 2,
                ai: "fighter",
                team: "friendly",
            },
            {
                id: "friendly-4",
                name: "FRIENDLY 4",
                type: "fighter",
                position: [850, 850, -3400],
                countermeasures: 2,
                ai: "fighter",
                team: "friendly",
            },

            {
                id: "friendly-5",
                name: "FRIENDLY 5",
                type: "fighter",
                position: [-750, 1100, -3900],
                countermeasures: 3,
                ai: "fighter",
                team: "friendly",
            },
            {
                id: "friendly-6",
                name: "FRIENDLY 6",
                type: "fighter",
                position: [-100, 550, -4200],
                countermeasures: 3,
                ai: "fighter",
                team: "friendly",
            },
            {
                id: "friendly-7",
                name: "FRIENDLY 7",
                type: "fighter",
                position: [500, 1000, -4000],
                countermeasures: 3,
                ai: "fighter",
                team: "friendly",
            },
            {
                id: "friendly-8",
                name: "FRIENDLY 8",
                type: "fighter",
                position: [1100, 750, -4500],
                countermeasures: 3,
                ai: "fighter",
                team: "friendly",
            },

            /*
             * --------------------------------------------------
             * ENEMY FLIGHT
             * --------------------------------------------------
             */

            {
                id: "enemy-1",
                name: "ENEMY 1",
                type: "fighter",
                position: [1000, 800, -2700],
                countermeasures: 2,
                ai: "fighter",
                team: "enemy",
            },
            {
                id: "enemy-2",
                name: "ENEMY 2",
                type: "fighter",
                position: [400, 600, -3200],
                countermeasures: 2,
                ai: "fighter",
                team: "enemy",
            },
            {
                id: "enemy-3",
                name: "ENEMY 3",
                type: "fighter",
                position: [-250, 950, -2850],
                countermeasures: 2,
                ai: "fighter",
                team: "enemy",
            },
            {
                id: "enemy-4",
                name: "ENEMY 4",
                type: "fighter",
                position: [-900, 700, -3500],
                countermeasures: 2,
                ai: "fighter",
                team: "enemy",
            },

            {
                id: "enemy-5",
                name: "ENEMY 5",
                type: "fighter",
                position: [800, 1150, -3900],
                countermeasures: 3,
                ai: "fighter",
                team: "enemy",
            },
            {
                id: "enemy-6",
                name: "ENEMY 6",
                type: "fighter",
                position: [150, 500, -4300],
                countermeasures: 3,
                ai: "fighter",
                team: "enemy",
            },
            {
                id: "enemy-7",
                name: "ENEMY 7",
                type: "fighter",
                position: [-550, 1050, -4100],
                countermeasures: 3,
                ai: "fighter",
                team: "enemy",
            },
            {
                id: "enemy-8",
                name: "ENEMY 8",
                type: "fighter",
                position: [-1100, 750, -4600],
                countermeasures: 3,
                ai: "fighter",
                team: "enemy",
            },
        ],
    },
];