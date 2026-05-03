interface UnifiedBadgeProps {
  variant: "plan" | "status" | "billing" | "role" | "integration";
  value: string;
  size?: "sm" | "md";
}

export function UnifiedBadge({ variant, value, size = "md" }: UnifiedBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]";

  const getColorClasses = () => {
    if (variant === "plan") {
      switch (value.toLowerCase()) {
        case "enterprise":
          return "bg-purple-50 text-purple-700 border-purple-200";
        case "professional":
        case "pro":
          return "bg-blue-50 text-blue-700 border-blue-200";
        case "starter":
          return "bg-gray-50 text-gray-700 border-gray-200";
        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
    }

    if (variant === "status") {
      const s = value.toLowerCase();
      if (s === "active" || s === "linked") {
        return "bg-green-50 text-green-700 border-green-200";
      }
      if (s.includes("pending") || s === "draft" || s === "trial" || s === "invited") {
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      }
      if (s.includes("suspended") || s === "inactive" || s.includes("disabled") || s.includes("archived")) {
        return "bg-red-50 text-red-700 border-red-200";
      }
      if (s === "yes" || s === "no") {
        return s === "yes"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-gray-50 text-gray-700 border-gray-200";
      }
      return "bg-gray-50 text-gray-700 border-gray-200";
    }

    if (variant === "billing") {
      switch (value.toLowerCase()) {
        case "current":
        case "paid":
          return "bg-green-50 text-green-700 border-green-200";
        case "overdue":
          return "bg-orange-50 text-orange-700 border-orange-200";
        case "failed":
          return "bg-red-50 text-red-700 border-red-200";
        case "pending":
          return "bg-yellow-50 text-yellow-700 border-yellow-200";
        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
    }

    if (variant === "role") {
      switch (value.toLowerCase()) {
        case "owner":
          return "bg-purple-50 text-purple-700 border-purple-200";
        case "admin":
          return "bg-blue-50 text-blue-700 border-blue-200";
        case "member":
          return "bg-gray-50 text-gray-700 border-gray-200";
        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
    }

    if (variant === "integration") {
      const v = value.toLowerCase();
      if (v.includes("production") || v === "active") {
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      }
      if (v.includes("sandbox")) {
        return "bg-sky-50 text-sky-800 border-sky-200";
      }
      if (v.includes("ready") || v.includes("pending")) {
        return "bg-amber-50 text-amber-800 border-amber-200";
      }
      if (v.includes("missing") || v.includes("not configured") || v.includes("error")) {
        return "bg-orange-50 text-orange-800 border-orange-200";
      }
      return "bg-slate-50 text-slate-700 border-slate-200";
    }

    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${sizeClasses} ${getColorClasses()}`}
    >
      {value}
    </span>
  );
}
