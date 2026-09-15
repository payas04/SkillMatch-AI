import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Shared color/label logic — exported too, so any page can reuse the same
// thresholds for things like plain text scores (e.g. a list card).
export function scoreMeta(score) {
  if (score === undefined || score === null) {
    return { color: "#818cf8", label: "Not scored" };
  }
  if (score >= 75) return { color: "#34d399", label: "Strong match" };
  if (score >= 50) return { color: "#fbbf24", label: "Partial match" };
  return { color: "#f87171", label: "Needs work" };
}

export default function ScoreGauge({
  score = 0,
  size = 112,
  showLabel = true,
}) {
  const { color, label } = scoreMeta(score);
  return (
    <div className="mx-auto text-center" style={{ width: size }}>
      <CircularProgressbar
        value={score}
        text={`${score}%`}
        styles={buildStyles({
          pathColor: color,
          textColor: "#ffffff",
          trailColor: "rgba(255,255,255,0.08)",
        })}
      />
      {showLabel && (
        <p className="text-xs font-medium mt-3" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}
