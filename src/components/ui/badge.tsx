import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { HudBadge } from "@/design-system/nightrunner";

const badgeVariants = cva(
  "nr-app-badge inline-flex items-center font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "",
        secondary: "text-muted-foreground",
        destructive: "text-destructive",
        outline: "text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <HudBadge tone={variant === "destructive" ? "danger" : "info"} className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
