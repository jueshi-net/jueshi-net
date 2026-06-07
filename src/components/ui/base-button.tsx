import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * BaseButton — 统一按钮组件
 *
 * 变体：primary, secondary, ghost, danger, outline
 * 尺寸：sm (32px), md (40px), lg (48px)
 * 移动端最小触控区域：44px
 */
export function BaseButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: BaseButtonProps) {
  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 disabled:bg-teal-300",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50",
    ghost: "text-teal-600 hover:bg-teal-50 active:bg-teal-100 disabled:text-teal-300",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
    outline: "border border-gray-300 text-gray-700 hover:border-teal-500 hover:text-teal-600 active:bg-gray-50 disabled:border-gray-200",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-xs px-3 py-1.5 h-8 min-h-[32px]",
    md: "text-sm px-4 py-2 h-10 min-h-[40px]",
    lg: "text-base px-6 py-3 h-12 min-h-[48px]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
