import {ControlBindings} from "@/src/engine/controls";
import {formatBindings} from "@/src/engine/controls/formatBinding";

type ScenarioPanelProps = {
    description: string;
    bindings: ControlBindings;
    won: boolean;
};

export function ScenarioPanel({
                                  description,
                                  bindings,
                                  won,
                              }: ScenarioPanelProps) {
    return (
        <div
            style={{
                position: "absolute",
                top: 14,
                left: 14,
                zIndex: 10,
                padding:
                    "12px 16px",
                background:
                    "rgba(0, 0, 0, 0.55)",
                border:
                    "1px solid rgba(255, 255, 255, 0.35)",
                color: "white",
                fontFamily:
                    "monospace",
                fontSize: "14px",
                lineHeight: "1.6",
                textShadow:
                    "0 0 3px black",
                pointerEvents:
                    "none",
                minWidth: "220px",
            }}
        >
            <div
                style={{
                    fontWeight:
                        "bold",
                    marginBottom:
                        "3px",
                    fontSize:
                        "15px",
                }}
            >
                SCENARIO
            </div>

            <div
                style={{
                    marginBottom:
                        "10px",
                }}
            >
                {won
                    ? "MISSION COMPLETE"
                    : description}
            </div>

            <div
                style={{
                    borderTop:
                        "1px solid rgba(255, 255, 255, 0.25)",
                    paddingTop:
                        "8px",
                    fontWeight:
                        "bold",
                    marginBottom:
                        "4px",
                }}
            >
                CONTROLS
            </div>

            <div>
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.pitchUp
                    )} /{" "}
                    {formatBindings(
                        bindings.pitchDown
                    )}
                </span>
                Pitch
            </div>

            <div>
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.rollLeft
                    )} /{" "}
                    {formatBindings(
                        bindings.rollRight
                    )}
                </span>
                Roll
            </div>

            <div>
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.yawLeft
                    )} /{" "}
                    {formatBindings(
                        bindings.yawRight
                    )}
                </span>
                Yaw
            </div>

            <div>
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.throttleUp
                    )} /{" "}
                    {formatBindings(
                        bindings.throttleDown
                    )}
                </span>
                Throttle
            </div>

            <div
                style={{
                    marginTop: "6px",
                }}
            >
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.fireGun
                    )}
                </span>
                Gun
            </div>

            <div>
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.launchMissile
                    )}
                </span>
                Missile
            </div>

            <div>
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.nextTarget
                    )}
                </span>
                Change Target
            </div>

            <div
                style={{
                    marginTop: "6px",
                    color: "rgba(255, 255, 255, 0.6)",
                }}
            >
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.exit
                    )}
                </span>
                Mission Select
            </div>

            <div
                style={{
                    color: "rgba(255, 255, 255, 0.6)",
                }}
            >
                <span
                    style={{
                        display:
                            "inline-block",
                        width: "120px",
                    }}
                >
                    {formatBindings(
                        bindings.reset
                    )}
                </span>
                Restart Mission
            </div>
        </div>
    );
}