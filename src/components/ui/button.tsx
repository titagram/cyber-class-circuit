import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { HudButton } from "@/design-system/nightrunner";

const buttonVariants = cva(
  "nr-button nr-app-button inline-flex items-center justify-center gap-2 font-semibold cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "nr-action-primary",
        destructive: "nr-action-danger",
        outline: "nr-action-secondary",
        secondary: "nr-action-secondary",
        ghost: "nr-action-ghost",
        link: "nr-action-link underline-offset-4 hover:underline",
      },
      size: {
        default: "nr-size-default",
        sm: "nr-size-sm",
        lg: "nr-size-lg",
        icon: "nr-size-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const hudVariant = variant === "destructive" ? "danger" : variant === "default" || !variant ? "primary" : "secondary";
    if (!asChild) return <HudButton variant={hudVariant} className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    return (
      <Slot data-variant={hudVariant} className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
