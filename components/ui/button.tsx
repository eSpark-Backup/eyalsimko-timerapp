import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable } from "react-native";
import { TextClassContext } from "~/components/ui/text";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group flex flex-row items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-buttonDefaultBackground border border-buttonDefaultBorderColor web:hover:opacity-90 active:opacity-90",
        destructive: "bg-destructive web:hover:opacity-90 active:opacity-90",
        outline:
          "border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        secondary: "bg-secondary web:hover:opacity-80 active:opacity-80",
        ghost:
          "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        link: "web:underline-offset-4 web:hover:underline web:focus:underline ",
      },
      size: {
        default: "h-10 px-4 py-2 native:h-12 native:px-5 native:py-3",
        sm: "h-[32] gap-[8] rounded-[8] px-[12]",
        lg: "h-11 rounded-md px-8 native:h-14",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconSizes = {
  default: 12,
  sm: 12,
  lg: 12,
  icon: 12,
};

const iconVariants = cva("items-center justify-center", {
  variants: {
    variant: {
      default: "color-primary",
      destructive: "",
      outline: "",
      secondary: "",
      ghost: "",
      link: "",
    },
    size: {
      default: "",
      sm: "h-[12] w-[12]",
      lg: "",
      icon: "",
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
        destructive: "text-destructive-foreground",
        outline: "group-active:text-accent-foreground",
        secondary:
          "text-secondary-foreground group-active:text-secondary-foreground",
        ghost: "group-active:text-accent-foreground",
        link: "text-primary group-active:underline",
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "native:text-lg",
        icon: "",
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
>(({ className, variant, size, children, icon: Icon, ...props }, ref) => {
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
          buttonVariants({ variant, size, className })
        )}
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
});
Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
