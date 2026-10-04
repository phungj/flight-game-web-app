import {
    EnemyControls,
} from "../enemy";

import {
    ShipEnemy,
} from "./shipEnemy";

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

export type ShipAIOutput =
    CombatAIOutput & {
    ciwsTarget: Player | null;

    controls: EnemyControls;
};

export class ShipAI {
    private target: Player;

    private combatAI: CombatAI;

    constructor(
        target: Player,
        combatOptions?: CombatAIOptions
    ) {
        this.target = target;

        this.combatAI =
            new CombatAI(
                {
                    missileRange: 1500,
                    missileAngle: 180,
                    ...combatOptions,
                }
            );
    }

    update(
        enemy: ShipEnemy,
        incomingMissiles: Missile[],
        dt: number = 1 / 60
    ): ShipAIOutput {
        const combat =
            this.combatAI.update(
                enemy,
                this.target,
                incomingMissiles,
                dt
            );

        let ciwsTarget:
            Player | null = null;

        if (
            enemy.alive &&
            this.target.alive
        ) {
            const distance =
                enemy.position.distanceTo(
                    this.target.position
                );

            if (
                distance <=
                enemy.ciwsRange
            ) {
                ciwsTarget =
                    this.target;
            }
        }

        return {
            ...combat,

            ciwsTarget,

            /*
             * Ships don't maneuver toward their target.
             *
             * ShipEnemy continues along its existing
             * heading independently.
             */
            controls: {
                pitch: 0,
                roll: 0,
                yaw: 0,
                throttle: 0,
            },
        };
    }
}