"use client";

import { differenceInDays, parseISO } from "date-fns";

interface StatusBadgeProps {
  date: string | null;
  label?: string;
}

export default function StatusBadge({ date, label }: StatusBadgeProps) {
  if (!date) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
        {label ?? "No date"}
      </span>
    );
  }

  const days = differenceInDays(parseISO(date), new Date());

  if (days < 0) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
        Expired
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
        {days}d left
      </span>
    );
  }

  if (days <= 90) {
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
        {days}d left
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
      Active
    </span>
  );
}

export function LicenseTypeBadge({ type }: { type: "paid" | "free" }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${
        type === "paid"
          ? "bg-purple-100 text-purple-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {type === "paid" ? "Paid" : "Free"}
    </span>
  );
}
