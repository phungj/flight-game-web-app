import * as THREE from "three";

export type EnemyTeam =
    | "friendly"
    | "enemy";

export type EnemyControls = {
    pitch: number;
    roll: number;
    yaw: number;
    throttle: number;
};

export type EnemyOptions = {
    health?: number;
    speed?: number;
    collisionRadius?: number;
    team?: EnemyTeam;

    group?: THREE.Group;
};

export abstract class Enemy {
    readonly position = new THREE.Vector3();
    readonly quaternion = new THREE.Quaternion();

    readonly group = new THREE.Group();

    health: number;
    readonly maxHealth: number;

    readonly collisionRadius: number;

    speed: number;

    readonly team: EnemyTeam;

    alive = true;

    constructor(
        position: THREE.Vector3,
        collisionRadius: number,
        options: EnemyOptions = {}
    ) {
        this.position.copy(
            position
        );

        this.health =
            options.health ?? 100;

        this.maxHealth =
            this.health;

        this.collisionRadius =
            collisionRadius;

        this.speed =
            options.speed ?? 0;

        this.team =
            options.team ?? "enemy";

        this.group =
            options.group ??
            new THREE.Group();

        this.group.position.copy(
            this.position
        );

        this.group.quaternion.copy(
            this.quaternion
        );
    }

    abstract update(
        dt: number,
        controls: EnemyControls
    ): void;

    takeDamage(
        amount: number
    ) {
        if (!this.alive) {
            return;
        }

        this.health -= amount;

        if (
            this.health <= 0
        ) {
            this.health = 0;

            this.destroy();
        }
    }

    destroy() {
        if (!this.alive) {
            return;
        }

        this.health = 0;
        this.alive = false;

        this.group.visible = false;
    }
}