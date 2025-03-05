import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable } from "react-native";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group flex flex-row items-center rounded-full justify-center web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-highlight",
        success: "bg-green-highlight",
        default:
          "bg-buttonDefaultBackground web:hover:opacity-90 active:opacity-90",
      },
      size: {
        xs: "h-[24] w-[24]",
        sm: "h-[32] w-[32]",
        default: "h-[44] w-[44]",
        lg: "h-[48] w-[48]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconSizes = {
  xs: 12,
  default: 12,
  sm: 12,
  lg: 18,
  icon: 12,
};

const iconVariants = cva("items-center justify-center", {
  variants: {
    variant: {
      success: "color-primary",
      primary: "color-primary",
      default: "color-primary",
    },
    size: {
      xs: "h-[12] w-[12]",
      default: "",
      sm: "h-[12] w-[12]",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type IconProps = React.ComponentProps<LucideIcon>;

type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Pressable>,
  "children"
> &
  VariantProps<typeof buttonVariants> & {
    icon: React.ComponentType<IconProps>;
  };

const IconButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, icon: Icon, ...props }, ref) => {
  return (
    <Pressable
      className={cn(
        props.disabled && "opacity-50 web:pointer-events-none",
        buttonVariants({ variant, size, className })
      )}
      ref={ref}
      role="button"
      {...props}
    >
      {Icon && (
        <Icon
          size={iconSizes[size ?? "default"]}
          className={iconVariants({ variant, size })}
        />
      )}
    </Pressable>
  );
});
IconButton.displayName = "Button";

export { IconButton, buttonVariants };
export type { ButtonProps };
