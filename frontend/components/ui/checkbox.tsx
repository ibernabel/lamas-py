"use client";

import * as React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onChange, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        onChange={(e) => {
          if (onChange) onChange(e);
          if (onCheckedChange) onCheckedChange(e.target.checked);
        }}
        className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer ${
          className || ""
        }`}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
