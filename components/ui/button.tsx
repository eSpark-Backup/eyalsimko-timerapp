import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable } from "react-native";
import { TextClassContext } from "~/components/ui/text";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group flex flex-row items-center justify-center web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-buttonDefaultBackground border-buttonDefaultBorderColor web:hover:opacity-90 active:opacity-90",
        primary: "bg-highlight border-cardBorder",
        "primary-muted": "bg-highlight-muted border-cardBorder",
        destructive: "bg-destructive web:hover:opacity-90 active:opacity-90",
        "destructive-muted": "web:hover:opacity-90 active:opacity-90",
        outline:
          "border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        secondary: "bg-transparent web:hover:opacity-80 active:opacity-80",
        ghost:
          "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
      },
      border: {
        none: "",
        default: "border",
      },
      size: {
        xs: "h-[24] gap-[8] rounded-[4] px-[12]",
        sm: "h-[32] gap-[8] rounded-[8] px-[12]",
        default: "h-[36] gap-[8] rounded-[8] px-[12]",
        lg: "h-[44] rounded-[8] px-8 native:h-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      border: "default",
    },
  }
);

const iconSizes = {
  xs: 12,
  default: 20,
  sm: 12,
  lg: 12,
  icon: 12,
};

const iconVariants = cva("items-center justify-center", {
  variants: {
    variant: {
      default: "color-primary",
      primary: "color-primary",
      "primary-muted": "color-primary",
      destructive: "text-destructive-foreground",
      "destructive-muted": "",
      outline: "",
      secondary: "text-primary/60",
      ghost: "",
      link: "",
    },
    size: {
      xs: "h-[12] w-[12]",
      default: "h-[20] w-[20]",
      sm: "h-[12] w-[12]",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const buttonTextVariants = cva(
  "web:whitespace-nowrap text-sm native:text-base font-medium text-foreground web:transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary",
        primary: "text-primary",
        "primary-muted": "text-primary",
        destructive: "text-destructive-foreground",
        "destructive-muted": "text-destructive-foreground",
        outline: "group-active:text-accent-foreground",
        secondary: "text-primary/60 group-active:text-secondary-foreground",
        ghost: "group-active:text-accent-foreground",
      },
      size: {
        default: "",
        xs: "text-sm",
        sm: "text-sm",
        lg: "native:text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type IconProps = React.ComponentProps<LucideIcon>;

type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Pressable>,
  "children"
> &
  VariantProps<typeof buttonVariants> & {
    children: React.ReactNode;
    icon?: React.ComponentType<IconProps>;
  };

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    { className, border, variant, size, children, icon: Icon, ...props },
    ref
  ) => {
    return (
      <TextClassContext.Provider
        value={cn(
          props.disabled && "web:pointer-events-none",
          buttonTextVariants({ variant, size })
        )}
      >
        <Pressable
          className={cn(
            props.disabled && "opacity-50 web:pointer-events-none",
            buttonVariants({ variant, size, className, border })
          )}
          style={{
            ...(variant === "destructive-muted"
              ? {
                  backgroundColor: "hsla(349, 86%, 61%, 0.25)",
                }
              : {}),
          }}
          ref={ref}
          role="button"
          {...props}
        >
          {children}
          {Icon && (
            <Icon
              height={iconSizes[size ?? "default"]}
              width={iconSizes[size ?? "default"]}
              className={iconVariants({ variant, size })}
            />
          )}
        </Pressable>
      </TextClassContext.Provider>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
