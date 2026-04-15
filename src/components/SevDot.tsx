"use client";

export default function SevDot({
  severity,
  size = "w-2.5 h-2.5",
}: {
  severity: string;
  size?: string;
}) {
  const c =
    severity === "serious"
      ? "bg-red-500"
      : severity === "moderate"
        ? "bg-amber-500"
        : "bg-emerald-500";
  return <div className={`${size} rounded-full ${c} flex-shrink-0`} />;
}
