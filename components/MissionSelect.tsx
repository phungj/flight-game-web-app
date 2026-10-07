"use client";

import type {
    LevelDefinition,
} from "@/src/levels/types";

type MissionSelectProps = {
    levels: LevelDefinition[];
    onSelectLevel: (
        level: LevelDefinition
    ) => void;
    onOpenOptions: () => void;
};

export function MissionSelect({
    levels,
    onSelectLevel,
    onOpenOptions,
}: MissionSelectProps) {
    return (
        <main
            style={{
                width: "100vw",
                height: "100vh",
                background: "#111",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
            }}
        >
            <div
                style={{
                    width:
                        "min(700px, 90vw)",
                }}
            >
                <div
                    style={{
                        fontSize: "36px",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                        marginBottom: "6px",
                    }}
                >
                    FLIGHT COMBAT
                </div>

                <div
                    style={{
                        color: "#777",
                        fontSize: "14px",
                        marginBottom: "32px",
                        letterSpacing: "1px",
                    }}
                >
                    SELECT MISSION
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    {levels.map(
                        level => (
                            <button
                                key={
                                    level.id
                                }
                                type="button"
                                onClick={() =>
                                    onSelectLevel(
                                        level
                                    )
                                }
                                style={{
                                    display:
                                        "block",
                                    width:
                                        "100%",
                                    padding:
                                        "18px 20px",
                                    background:
                                        "#1c1c1c",
                                    color:
                                        "white",
                                    border:
                                        "1px solid #444",
                                    cursor:
                                        "pointer",
                                    fontFamily:
                                        "monospace",
                                    textAlign:
                                        "left",
                                }}
                                onMouseEnter={event => {
                                    event.currentTarget.style.background =
                                        "#292929";

                                    event.currentTarget.style.borderColor =
                                        "#777";
                                }}
                                onMouseLeave={event => {
                                    event.currentTarget.style.background =
                                        "#1c1c1c";

                                    event.currentTarget.style.borderColor =
                                        "#444";
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            "20px",
                                        fontWeight:
                                            "bold",
                                        marginBottom:
                                            "6px",
                                    }}
                                >
                                    {
                                        level.name
                                    }
                                </div>

                                <div
                                    style={{
                                        color:
                                            "#999",
                                        fontSize:
                                            "14px",
                                    }}
                                >
                                    {
                                        level.description
                                    }
                                </div>
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={
                        onOpenOptions
                    }
                    style={{
                        marginTop: "24px",
                        padding:
                            "12px 20px",
                        background:
                            "#1c1c1c",
                        color: "white",
                        border:
                            "1px solid #444",
                        cursor: "pointer",
                        fontFamily:
                            "monospace",
                    }}
                >
                    OPTIONS
                </button>
            </div>
        </main>
    );
}
