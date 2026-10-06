type ScenarioPanelProps = {
    description: string;
};

export function ScenarioPanel({
                                  description,
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
                {description}
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
                W / S &nbsp; Pitch
            </div>

            <div>
                A / D &nbsp; Roll
            </div>

            <div>
                Q / E &nbsp; Yaw
            </div>

            <div>
                SHIFT / CTRL &nbsp; Throttle
            </div>

            <div
                style={{
                    marginTop:
                        "6px",
                }}
            >
                F &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Gun
            </div>

            <div>
                SPACE &nbsp; Missile
            </div>

            <div>
                TAB &nbsp;&nbsp;&nbsp; Change Target
            </div>

            <div
                style={{
                    marginTop:
                        "6px",
                    color:
                        "rgba(255, 255, 255, 0.6)",
                }}
            >
                ESC &nbsp;&nbsp;&nbsp; Mission Select
            </div>

            <div
                style={{
                    color:
                        "rgba(255, 255, 255, 0.6)",
                }}
            >
                R &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Restart Mission
            </div>
        </div>
    );
}