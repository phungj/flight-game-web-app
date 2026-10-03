export type LevelTerrainDefinition = {
    type:
        | "ocean"
        | "land";
};

export type LevelObjectDefinition = {
    id: string;
    type:
        | "tent"
        | "container"
        | "fuel-tank"
        | "building"
        | "crate";
    position: [number, number, number];
    rotation?: number;
    scale?: [number, number, number];
};

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

    ai:
        | "fighter"
        | "ship"
        | "ground"
        | "none";
};

export type LevelDefinition = {
    id: string;
    name: string;
    description: string;

    terrain:
        LevelTerrainDefinition;

    objects: LevelObjectDefinition[];

    enemies:
        LevelEnemyDefinition[];
};