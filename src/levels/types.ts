export type LevelEnemyDefinition = {
    id: string;
    name: string;
    type:
        | "fighter"
        | "bomber"
        | "supply"
        | "destroyer"
        | "cruiser";
    position: [
        number,
        number,
        number
    ];
    countermeasures: number;
    ai:
        | "fighter"
        | "ship"
        | "none";
};

export type LevelDefinition = {
    id: string;
    name: string;
    description: string;
    enemies: LevelEnemyDefinition[];
};