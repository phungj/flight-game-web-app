import * as THREE from "three";

import {
    EnemyControls,
} from "./enemy";

import {
    AircraftEnemy,
} from "@/src/engine/enemy/aircraftEnemy";

import { Player } from "../player";
import { Missile } from "../missile";

export type FighterAIOutput = {
    controls: EnemyControls;
    fireGun: boolean;
    fireMissile: boolean;
    useCountermeasure: boolean;

    debug: {
        interceptPoint: THREE.Vector3;
        horizontalAngle: number;
        verticalAngle: number;
        distance: number;
    };
};

export class FighterAI {
    private target: Player;

    private yawCommand = 0;
    private pitchCommand = 0;

    constructor(
        target: Player
    ) {
        this.target = target;
    }

    update(
        enemy: AircraftEnemy,
        incomingMissiles: Missile[],
        dt: number = 1 / 60
    ): FighterAIOutput {
        if (!this.target.alive) {
            this.yawCommand = 0;
            this.pitchCommand = 0;

            return {
                controls: {
                    pitch: 0,
                    roll: 0,
                    yaw: 0,
                    throttle: 0,
                },

                fireGun: false,
                fireMissile: false,
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
            700;

        /*
         * --------------------------------------------------
         * TARGET
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
            this.yawCommand =
                THREE.MathUtils.damp(
                    this.yawCommand,
                    0,
                    8,
                    dt
                );

            this.pitchCommand =
                THREE.MathUtils.damp(
                    this.pitchCommand,
                    0,
                    8,
                    dt
                );

            return {
                controls: {
                    pitch:
                    this.pitchCommand,

                    roll: 0,

                    yaw:
                    this.yawCommand,

                    throttle: 0.1,
                },

                fireGun: false,
                fireMissile: false,
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

        /*
         * --------------------------------------------------
         * LOCAL TARGET
         * --------------------------------------------------
         */

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
         * DESIRED YAW
         * --------------------------------------------------
         */

        const yawFullPowerAngle =
            THREE.MathUtils.degToRad(
                45
            );

        let desiredYaw = 0;

        if (
            Math.abs(horizontalAngle) >
            THREE.MathUtils.degToRad(2)
        ) {
            desiredYaw =
                -THREE.MathUtils.clamp(
                    horizontalAngle /
                    yawFullPowerAngle,
                    -1,
                    1
                );
        }

        /*
         * --------------------------------------------------
         * DESIRED PITCH
         * --------------------------------------------------
         *
         * Positive vertical angle means the target is
         * above the aircraft, so pitch up.
         *
         * We use a smaller full-power angle than yaw,
         * because pitch is more sensitive in this model.
         */

        const pitchFullPowerAngle =
            THREE.MathUtils.degToRad(
                30
            );

        let desiredPitch = 0;

        if (
            Math.abs(verticalAngle) >
            THREE.MathUtils.degToRad(2)
        ) {
            desiredPitch =
                THREE.MathUtils.clamp(
                    verticalAngle /
                    pitchFullPowerAngle,
                    -1,
                    1
                );
        }

        /*
         * --------------------------------------------------
         * DAMP CONTROLS
         * --------------------------------------------------
         */

        this.yawCommand =
            THREE.MathUtils.damp(
                this.yawCommand,
                desiredYaw,
                5,
                dt
            );

        this.pitchCommand =
            THREE.MathUtils.damp(
                this.pitchCommand,
                desiredPitch,
                5,
                dt
            );

        /*
         * --------------------------------------------------
         * WEAPONS
         * --------------------------------------------------
         */

        const gunAngle =
            THREE.MathUtils.degToRad(
                8
            );

        const missileAngle =
            THREE.MathUtils.degToRad(
                25
            );

        const fireGun =
            distance < 800 &&
            Math.abs(horizontalAngle) <
            gunAngle &&
            Math.abs(verticalAngle) <
            gunAngle;

        const fireMissile =
            distance < 1500 &&
            Math.abs(horizontalAngle) <
            missileAngle &&
            Math.abs(verticalAngle) <
            missileAngle;

        /*
         * --------------------------------------------------
         * OUTPUT
         * --------------------------------------------------
         */

        return {
            controls: {
                pitch:
                this.pitchCommand,

                roll: 0,

                yaw:
                this.yawCommand,

                throttle:
                    distance > 500
                        ? 0.25
                        : 0.1,
            },

            fireGun,
            fireMissile,
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