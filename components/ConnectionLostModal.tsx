import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { set } from "zod";
import { View } from "react-native";
import { Text } from "./ui/text";
import { Warning } from "~/lib/icons/Warning";
import { Button } from "./ui/button";

export const ConnectionLostModalContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

let ref: { current: any } = { current: null };

export function ConnectionLostModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  React.useEffect(() => {
    ref.current = { show, hide };
    return () => {
      ref.current = null;
    };
  }, []);

  return (
    <ConnectionLostModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ConnectionLostModalContext.Provider>
  );
}

export const show = () => ref.current?.show();
export const hide = () => ref.current?.hide();

export function ConnectionLostModal() {
  const { isOpen, setIsOpen } = React.useContext(ConnectionLostModalContext);
  const [isLocalOpen, setIsLocalOpen] = React.useState(isOpen);

  React.useEffect(() => {
    if (isLocalOpen === false && isOpen === true) {
      const timeoutId = setTimeout(() => setIsLocalOpen(isOpen), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setIsLocalOpen(isOpen);
    }
  }, [isOpen, isLocalOpen]);

  return (
    <Dialog open={isLocalOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[442]">
        <View className="gap-[40]">
          <DialogHeader className="items-center gap-[20]">
            <Warning size={80} />
            <View className="items-center gap-[12]">
              <Text className="text-2xl font-semibold">Connection Lost</Text>
              <Text className="text-lg text-muted-foreground text-center">
                You have lost the connection with the Screen. Please check the
                WiFi or Wired connection.
              </Text>
            </View>
          </DialogHeader>
          <DialogFooter className="items-center">
            <DialogClose asChild>
              <Button size="lg" border="none">
                <Text>Close</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </View>
      </DialogContent>
    </Dialog>
  );
}
