import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "~/lib/utils";

const variants = cva("", {
  variants: {
    size: {
      small: "native:h-[36] p-[8] rounded-[8] text-md",
      default: "native:h-12 rounded-md text-base lg:text-sm native:text-lg",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const Input = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  TextInputProps & VariantProps<typeof variants>
>(({ className, placeholderClassName, size, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "web:flex web:w-full bg-input-background border-input  native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
        props.editable === false && "opacity-50 web:cursor-not-allowed",
        variants({ size, className })
      )}
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
