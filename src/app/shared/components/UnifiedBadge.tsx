interface UnifiedBadgeProps {
  variant: "plan" | "status" | "billing" | "role";
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
      switch (value.toLowerCase()) {
        case "active":
          return "bg-green-50 text-green-700 border-green-200";
        case "trial":
        case "invited":
          return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "suspended":
        case "inactive":
          return "bg-red-50 text-red-700 border-red-200";
        case "pending":
          return "bg-blue-50 text-blue-700 border-blue-200";
        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
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
