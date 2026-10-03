import * as THREE from "three";

import {
    Enemy,
} from "./enemy";

import {
    Player,
} from "../player";

import {
    Missile,
} from "../missile";

export type CombatAIOutput = {
    gunTarget: Player | null;
    missileTarget: Player | null;
    useCountermeasure: boolean;

    debug: {
        interceptPoint: THREE.Vector3;
        horizontalAngle: number;
        verticalAngle: number;
        distance: number;
    };
};

export type CombatAIOptions = {
    gunRange?: number;
    gunAngle?: number;

    missileRange?: number;
    missileAngle?: number;

    countermeasureRange?: number;
};

export class CombatAI {
    private target: Player;

    private gunRange: number;
    private gunAngle: number;

    private missileRange: number;
    private missileAngle: number;

    private countermeasureRange: number;

    constructor(
        target: Player,
        options: CombatAIOptions = {}
    ) {
        this.target = target;

        this.gunRange =
            options.gunRange ?? 800;

        this.gunAngle =
            THREE.MathUtils.degToRad(
                options.gunAngle ?? 8
            );

        this.missileRange =
            options.missileRange ?? 1500;

        this.missileAngle =
            THREE.MathUtils.degToRad(
                options.missileAngle ?? 25
            );

        this.countermeasureRange =
            options.countermeasureRange ?? 700;
    }

    update(
        enemy: Enemy,
        incomingMissiles: Missile[],
        _dt: number = 1 / 60
    ): CombatAIOutput {
        /*
         * --------------------------------------------------
         * TARGET DEAD
         * --------------------------------------------------
         */

        if (!this.target.alive) {
            return {
                gunTarget: null,
                missileTarget: null,
                useCountermeasure: false,

                debug: {
                    interceptPoint:
                        enemy.position.clone(),

                    horizontalAngle: 0,
                    verticalAngle: 0,
                    distance: 0,
                },
            };
        }

        /*
         * --------------------------------------------------
         * COUNTERMEASURES
         * --------------------------------------------------
         */

        let closestMissile:
            Missile | null = null;

        let closestMissileDistance =
            Infinity;

        for (
            const missile of
            incomingMissiles
            ) {
            if (
                !missile.alive ||
                missile.target !==
                enemy.position
            ) {
                continue;
            }

            const distance =
                missile.position.distanceTo(
                    enemy.position
                );

            if (
                distance <
                closestMissileDistance
            ) {
                closestMissile =
                    missile;

                closestMissileDistance =
                    distance;
            }
        }

        const useCountermeasure =
            closestMissile !== null &&
            closestMissileDistance <
            this.countermeasureRange;

        /*
         * --------------------------------------------------
         * TARGET GEOMETRY
         * --------------------------------------------------
         */

        const toTarget =
            this.target.position
                .clone()
                .sub(
                    enemy.position
                );

        const distance =
            toTarget.length();

        if (
            distance <
            0.000001
        ) {
            return {
                gunTarget: null,
                missileTarget: null,
                useCountermeasure,

                debug: {
                    interceptPoint:
                        this.target.position.clone(),

                    horizontalAngle: 0,
                    verticalAngle: 0,
                    distance,
                },
            };
        }

        const desiredDirection =
            toTarget
                .clone()
                .normalize();

        const localTarget =
            desiredDirection
                .clone()
                .applyQuaternion(
                    enemy.quaternion
                        .clone()
                        .invert()
                );

        const horizontalAngle =
            Math.atan2(
                localTarget.x,
                -localTarget.z
            );

        const verticalAngle =
            Math.atan2(
                localTarget.y,
                Math.sqrt(
                    localTarget.x *
                    localTarget.x +
                    localTarget.z *
                    localTarget.z
                )
            );

        /*
         * --------------------------------------------------
         * WEAPONS
         * --------------------------------------------------
         */

        const canFireGun =
            distance <
            this.gunRange &&
            Math.abs(horizontalAngle) <
            this.gunAngle &&
            Math.abs(verticalAngle) <
            this.gunAngle;

        const canFireMissile =
            distance <
            this.missileRange &&
            Math.abs(horizontalAngle) <
            this.missileAngle &&
            Math.abs(verticalAngle) <
            this.missileAngle;

        /*
         * --------------------------------------------------
         * OUTPUT
         * --------------------------------------------------
         */

        return {
            gunTarget:
                canFireGun
                    ? this.target
                    : null,

            missileTarget:
                canFireMissile
                    ? this.target
                    : null,

            useCountermeasure,

            debug: {
                interceptPoint:
                    this.target.position.clone(),

                horizontalAngle,
                verticalAngle,
                distance,
            },
        };
    }
}