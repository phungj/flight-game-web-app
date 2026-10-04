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
    type CombatTarget,
} from "../combatAI";

export type FighterAIOutput =
    CombatAIOutput & {
    controls: EnemyControls;
};

export class FighterAI {
    private player: Player;

    private combatAI: CombatAI;

    private yawCommand = 0;
    private pitchCommand = 0;

    constructor(
        player: Player,
        combatOptions?: CombatAIOptions
    ) {
        this.player =
            player;

        this.combatAI =
            new CombatAI(
                combatOptions
            );
    }

    update(
        enemy: AircraftEnemy,
        aircraftEnemies: AircraftEnemy[],
        incomingMissiles: Missile[],
        dt: number = 1 / 60
    ): FighterAIOutput {
        const target =
            this.findTarget(
                enemy,
                aircraftEnemies
            );

        const combat =
            this.combatAI.update(
                enemy,
                target,
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

    private findTarget(
        enemy: AircraftEnemy,
        aircraftEnemies: AircraftEnemy[]
    ): CombatTarget | null {
        let closestTarget:
            CombatTarget | null = null;

        let closestDistance =
            Infinity;

        /*
         * --------------------------------------------------
         * PLAYER
         * --------------------------------------------------
         *
         * Enemy aircraft can engage the player.
         *
         * Friendly aircraft must never engage the player.
         */

        if (
            enemy.team === "enemy" &&
            this.player.alive
        ) {
            closestTarget =
                this.player;

            closestDistance =
                enemy.position.distanceTo(
                    this.player.position
                );
        }

        /*
         * --------------------------------------------------
         * OTHER AIRCRAFT
         * --------------------------------------------------
         *
         * Only consider aircraft on the opposing team.
         */

        for (
            const candidate of
            aircraftEnemies
            ) {
            if (
                candidate === enemy ||
                !candidate.alive
            ) {
                continue;
            }

            if (
                candidate.team ===
                enemy.team
            ) {
                continue;
            }

            const distance =
                enemy.position.distanceTo(
                    candidate.position
                );

            if (
                distance <
                closestDistance
            ) {
                closestTarget =
                    candidate;

                closestDistance =
                    distance;
            }
        }

        return closestTarget;
    }
}