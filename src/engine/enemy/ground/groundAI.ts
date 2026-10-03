import {
    EnemyControls,
} from "../enemy";

import {
    GroundEnemy,
} from "./groundEnemy";

import {
    Player,
} from "../../player";

import {
    Missile,
} from "../../missile";

import {
    CombatAI,
    type CombatAIOutput,
} from "../combatAI";

export type GroundAIOutput =
    CombatAIOutput & {
    aaTarget: Player | null;
    controls: EnemyControls;
};

export class GroundAI {
    private combatAI: CombatAI;

    constructor(
        target: Player
    ) {
        this.combatAI =
            new CombatAI(
                target,
                {
                    /*
                     * --------------------------------------------------
                     * AA gun
                     * --------------------------------------------------
                     */

                    gunRange: 800,
                    gunAngle: 180,

                    /*
                     * --------------------------------------------------
                     * SAM
                     * --------------------------------------------------
                     */

                    missileRange: 1500,
                    missileAngle: 180,

                    /*
                     * Ground units have no countermeasures.
                     */
                    countermeasureRange: 0,
                }
            );
    }

    update(
        enemy: GroundEnemy,
        incomingMissiles: Missile[],
        dt: number = 1 / 60
    ): GroundAIOutput {
        const combat =
            this.combatAI.update(
                enemy,
                incomingMissiles,
                dt
            );

        let aaTarget:
            Player | null = null;

        let missileTarget =
            combat.missileTarget;

        /*
         * --------------------------------------------------
         * Unit-specific weapon selection
         * --------------------------------------------------
         */

        switch (enemy.type) {
            case "truck":
            case "tank":
                /*
                 * Dummy ground targets have no weapons.
                 */
                missileTarget = null;
                break;

            case "aa":
                /*
                 * The CombatAI gun solution becomes the
                 * ground AA target.
                 */
                aaTarget =
                    combat.gunTarget;

                missileTarget = null;
                break;

            case "sam":
                /*
                 * SAMs use the missile solution.
                 */
                aaTarget = null;
                break;
        }

        return {
            ...combat,

            /*
             * Ground AI does not use the generic gunTarget.
             * AA explicitly gets its own target field.
             */
            gunTarget: null,

            missileTarget,

            aaTarget,

            controls: {
                pitch: 0,
                roll: 0,
                yaw: 0,
                throttle: 0,
            },
        };
    }
}