export type LevelEnemyDefinition = {
    id: string;
    name: string;
    type:
        | "fighter"
        | "bomber";
    position: [
        number,
        number,
        number
    ];
    countermeasures: number;
    ai:
        | "fighter"
        | "none";
};

export type LevelDefinition = {
    id: string;
    name: string;
    description: string;
    enemies: LevelEnemyDefinition[];
};