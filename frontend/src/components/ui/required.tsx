import { cn } from "@/lib/utils";
import * as React from "react";

export interface RequiredProps extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string;
}

const Required = React.forwardRef<HTMLSpanElement, RequiredProps>(
  ({ className, content = "*", ...props }, ref) => {
    return (
      <span
        className={cn("inline-flex text-red", className)}
        {...props}
        ref={ref}
      >
        {content}
      </span>
    );
  },
);
Required.displayName = "Required";

export { Required };
