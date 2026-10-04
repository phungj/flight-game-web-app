import {
    EnemyTeam,
} from "@/src/engine/enemy/enemy";


// --------------------------------------------------
// Terrain
// --------------------------------------------------

export type LevelTerrainDefinition = {
    type:
        | "ocean"
        | "land";
};


// --------------------------------------------------
// Object enemy configuration
// --------------------------------------------------

export type LevelObjectEnemyDefinition = {
    health: number;

    team?: EnemyTeam;
};


// --------------------------------------------------
// Level objects
// --------------------------------------------------

export type LevelObjectDefinition = {
    id: string;

    type:
        | "tent"
        | "container"
        | "fuel-tank"
        | "building"
        | "crate";

    position: [
        number,
        number,
        number
    ];

    rotation?: number;

    scale?: [
        number,
        number,
        number
    ];

    enemy?:
        LevelObjectEnemyDefinition;
};


// --------------------------------------------------
// Dedicated enemies
// --------------------------------------------------

export type LevelEnemyDefinition = {
    id: string;

    name: string;

    type:
        | "fighter"
        | "bomber"
        | "supply"
        | "destroyer"
        | "cruiser"
        | "truck"
        | "tank"
        | "aa"
        | "sam";

    position: [
        number,
        number,
        number
    ];

    countermeasures: number;

    team?: EnemyTeam;

    ai:
        | "fighter"
        | "ship"
        | "ground"
        | "none";
};


// --------------------------------------------------
// Level
// --------------------------------------------------

export type LevelDefinition = {
    id: string;

    name: string;

    description: string;

    terrain:
        LevelTerrainDefinition;

    objects:
        LevelObjectDefinition[];

    enemies:
        LevelEnemyDefinition[];
};