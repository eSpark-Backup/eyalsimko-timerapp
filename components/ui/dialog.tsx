import * as DialogPrimitive from "@rn-primitives/dialog";
import * as React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Text } from "./text";
import { X } from "~/lib/icons/X";
import { cn } from "~/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlayWeb = React.forwardRef<
  DialogPrimitive.OverlayRef,
  DialogPrimitive.OverlayProps
>(({ className, ...props }, ref) => {
  const { open } = DialogPrimitive.useRootContext();
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "flex justify-center items-center p-2 absolute top-0 right-0 bottom-0 left-0",
        open
          ? "web:animate-in web:fade-in-0"
          : "web:animate-out web:fade-out-0",
        className
      )}
      {...props}
      ref={ref}
    />
  );
});

DialogOverlayWeb.displayName = "DialogOverlayWeb";

const DialogOverlayNative = React.forwardRef<
  DialogPrimitive.OverlayRef,
  DialogPrimitive.OverlayProps
>(({ className, children, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "hsla(211, 25%, 26%, 0.41)",
      }}
      className={cn("flex justify-center items-center p-2", className)}
      {...props}
      ref={ref}
    >
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
      >
        {children as any}
      </Animated.View>
    </DialogPrimitive.Overlay>
  );
});

DialogOverlayNative.displayName = "DialogOverlayNative";

const DialogOverlay = Platform.select({
  web: DialogOverlayWeb,
  default: DialogOverlayNative,
});

type ScrollableContentProps =
  | { scrollable?: false }
  | {
      scrollable: true;
      height: number;
      header: React.ReactNode;
    };

const DialogContent = React.forwardRef<
  DialogPrimitive.ContentRef,
  DialogPrimitive.ContentProps & {
    portalHost?: string;
  } & ScrollableContentProps
>(({ className, children, portalHost, style = {}, ...props }, ref) => {
  const { open } = DialogPrimitive.useRootContext();
  const [maxContentHeight, setMaxContentHeight] = React.useState(0);
  const headerRef = React.useRef<View>(null);

  if (!props.scrollable) {
    return (
      <DialogPortal hostName={portalHost}>
        <DialogOverlay>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              "web:cursor-default bg-modal-background px-[24] py-[24] web:duration-200 rounded-[20]",
              open
                ? "web:animate-in web:fade-in-0 web:zoom-in-95"
                : "web:animate-out web:fade-out-0 web:zoom-out-95",

              className
            )}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        </DialogOverlay>
      </DialogPortal>
    );
  }
  if (props.scrollable) {
    const { height, ...restProps } = props;
    return (
      <DialogPortal hostName={portalHost}>
        <DialogOverlay>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              "web:cursor-default bg-modal-background web:duration-200 rounded-[20]",
              maxContentHeight === 0 && "opacity-0",
              open
                ? "web:animate-in web:fade-in-0 web:zoom-in-95"
                : "web:animate-out web:fade-out-0 web:zoom-out-95",
              className
            )}
            style={[
              style,
              {
                maxHeight: height,
              },
            ]}
            {...restProps}
          >
            <View
              className="pt-[24] px-[24]"
              onLayout={(e) => {
                e.nativeEvent.layout.height &&
                  setMaxContentHeight(
                    props.height - e.nativeEvent.layout.height
                  );
              }}
              ref={headerRef}
            >
              {props.header}
            </View>
            <ScrollView
              className="pb-[24] px-[12] mx-[12]"
              style={{
                maxHeight: maxContentHeight,
              }}
            >
              <Pressable>{children}</Pressable>
            </ScrollView>
          </DialogPrimitive.Content>
        </DialogOverlay>
      </DialogPortal>
    );
  }
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: ViewProps) => (
  <View
    className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: ViewProps) => (
  <View className={cn("flex", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  DialogPrimitive.TitleRef,
  DialogPrimitive.TitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-2xlg native:text-2xl text-foreground font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  DialogPrimitive.DescriptionRef,
  DialogPrimitive.DescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm native:text-base text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
