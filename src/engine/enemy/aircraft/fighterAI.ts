import * as THREE from "three";

import {
    EnemyControls,
} from "../enemy";

import {
    AircraftEnemy,
} from "@/src/engine/enemy/aircraft/aircraftEnemy";

import {
    Player,
} from "../../player";

import {
    Missile,
} from "../../missile";

import {
    CombatAI,
    type CombatAIOptions,
    type CombatAIOutput,
} from "../combatAI";

export type FighterAIOutput =
    CombatAIOutput & {
    controls: EnemyControls;
};

export class FighterAI {
    private combatAI: CombatAI;

    private yawCommand = 0;
    private pitchCommand = 0;

    constructor(
        target: Player,
        combatOptions?: CombatAIOptions
    ) {
        this.combatAI =
            new CombatAI(
                target,
                combatOptions
            );
    }

    update(
        enemy: AircraftEnemy,
        incomingMissiles: Missile[],
        dt: number = 1 / 60
    ): FighterAIOutput {
        const combat =
            this.combatAI.update(
                enemy,
                incomingMissiles,
                dt
            );

        /*
         * --------------------------------------------------
         * TARGET DEAD
         * --------------------------------------------------
         */

        if (!enemy.alive) {
            this.yawCommand = 0;
            this.pitchCommand = 0;

            return {
                controls: {
                    pitch: 0,
                    roll: 0,
                    yaw: 0,
                    throttle: 0,
                },

                ...combat,
            };
        }

        /*
         * --------------------------------------------------
         * FLIGHT CONTROL
         * --------------------------------------------------
         *
         * CombatAI has already calculated the target
         * geometry. FighterAI uses that geometry to
         * decide how the aircraft should maneuver.
         */

        const horizontalAngle =
            combat.debug.horizontalAngle;

        const verticalAngle =
            combat.debug.verticalAngle;

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
         * OUTPUT
         * --------------------------------------------------
         */

        return {
            ...combat,

            controls: {
                pitch:
                this.pitchCommand,

                roll: 0,

                yaw:
                this.yawCommand,

                throttle:
                    combat.debug.distance > 500
                        ? 0.25
                        : 0.1,
            },
        };
    }
}