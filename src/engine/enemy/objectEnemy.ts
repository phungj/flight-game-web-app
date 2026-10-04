import * as THREE from "three";

import {
    Enemy,
    type EnemyOptions,
} from "./enemy";

export type ObjectEnemyOptions =
    EnemyOptions & {
    group: THREE.Group;
};

export class ObjectEnemy extends Enemy {
    constructor(
        position: THREE.Vector3,
        options: ObjectEnemyOptions
    ) {
        super(
            position,
            1,
            options
        );
    }

    update(
        _dt: number
    ) {
        // Object enemies don't move.
    }
}