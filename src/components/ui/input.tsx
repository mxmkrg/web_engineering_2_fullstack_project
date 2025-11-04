import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-lg border-2 border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-all focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
