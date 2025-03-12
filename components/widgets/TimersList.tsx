import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "../ui/button";
import { Plus } from "~/lib/icons/Plus";
import { Eye } from "~/lib/icons/Eye";
import { cn, formatCountdown } from "~/lib/utils";
import { IconButton } from "../iconButton";
import { Move } from "~/lib/icons/Move";
import { Pause } from "~/lib/icons/Pause";
import { Play } from "~/lib/icons/Play";
import { Restart } from "~/lib/icons/Restart";
import { More } from "~/lib/icons/More";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Animated, { FadeIn } from "react-native-reanimated";
import { Trash } from "~/lib/icons/Trash";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Edit } from "~/lib/icons/Edit";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import React from "react";
import { TrashDanger } from "~/lib/icons/TrashDanger";
import { Input } from "../ui/input";

export const TimersListHeader = () => {
  const [modal, setModal] = React.useState<ModalState | null>(null);
  return (
    <>
      <TimerModals modal={modal} setModal={setModal} />
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold">List of Events</Text>
        <Button size="sm" icon={Plus} onPress={() => setModal({ type: "add" })}>
          <Text>Add New Timer</Text>
        </Button>
      </View>
    </>
  );
};

function TimerForm() {
  return (
    <View className="gap-[20]">
      <Input background="modal" label="Event Name" />
      <Input background="modal" label="Event Description" />
      <Input background="modal" label="Speaker Name" />
      <Input background="modal" label="Duration" />
      <View className="flex-row gap-[20]">
        <View className="flex-1">
          <Input background="modal" label="Flash Time" />
        </View>
        <View className="flex-1">
          <Input background="modal" label="Flash Length" />
        </View>
      </View>
    </View>
  );
}

function TimerModals({
  modal,
  setModal,
}: {
  modal: ModalState | null;
  setModal: React.Dispatch<React.SetStateAction<ModalState | null>>;
}) {
  return (
    <>
      <Dialog
        open={modal?.type === "delete"}
        onOpenChange={() => setModal(null)}
      >
        <DialogContent className="w-[400]">
          <View className="gap-[40]">
            <DialogHeader>
              <View className="justify-center items-center gap-[20]">
                <TrashDanger className="text-transparent" size={60} />
                <View className="items-center gap-[12]">
                  <Text className="text-2xl text-primary font-semibold">
                    Delete Timer?
                  </Text>
                  <Text className="text-lg text-primary/60">
                    Are you sure you want to delete this timer?
                  </Text>
                </View>
              </View>
            </DialogHeader>
            <DialogFooter>
              <View className="flex-row justify-between">
                <DialogClose asChild>
                  <Button size="lg" border="none">
                    <Text>Cancel</Text>
                  </Button>
                </DialogClose>
                <Button
                  onPress={() => setModal(null)}
                  size="lg"
                  variant="destructive"
                >
                  <Text>Delete</Text>
                </Button>
              </View>
            </DialogFooter>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.type === "edit"} onOpenChange={() => setModal(null)}>
        <DialogContent className="w-[464]">
          <View className="gap-[40]">
            <DialogHeader>
              <Text className="text-xl text-center font-semibold">
                Edit Timer
              </Text>
            </DialogHeader>
            <TimerForm />
            <DialogFooter>
              <View className="flex-row justify-between">
                <Button size="lg" border="none" onPress={() => setModal(null)}>
                  <Text>Cancel</Text>
                </Button>
                <Button
                  size="lg"
                  border="none"
                  variant="primary"
                  onPress={() => setModal(null)}
                >
                  <Text>Save Changes</Text>
                </Button>
              </View>
            </DialogFooter>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.type === "add"} onOpenChange={() => setModal(null)}>
        <DialogContent className="w-[464]">
          <View className="gap-[40]">
            <DialogHeader>
              <Text className="text-xl text-center font-semibold">
                Add New Timer
              </Text>
            </DialogHeader>
            <TimerForm />
            <DialogFooter>
              <View className="flex-row justify-between">
                <Button size="lg" border="none" onPress={() => setModal(null)}>
                  <Text>Cancel</Text>
                </Button>
                <Button
                  size="lg"
                  border="none"
                  variant="primary"
                  onPress={() => setModal(null)}
                >
                  <Text>Add Timer</Text>
                </Button>
              </View>
            </DialogFooter>
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "medium",
});

type Timer = unknown;

type ModalState =
  | {
      type: "add";
    }
  | {
      type: "delete";
      timer: Timer;
    }
  | {
      type: "edit";
      timer: Timer;
    };

export default function TimersList() {
  const runningTimerIndex = 0;
  const timers = [
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      flashStartTime: 60,
      timerName: "Goals of the evening",
      startedAt: new Date(),
      speakerIndex: 0,
      description: "Moves around a lot",
    },
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      flashStartTime: 60,
      startedAt: null,
      timerName: "Welcome to the Pawnee Townhall",
      speakerIndex: 1,
    },
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      startedAt: null,
      flashStartTime: 60,
      timerName: "Goals of the evening",
      speakerIndex: 2,
    },
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      startedAt: null,
      flashStartTime: 60,
      timerName: "Goals of the evening",
      speakerIndex: 3,
    },
  ];
  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const [modal, setModal] = React.useState<ModalState | null>(null);

  return (
    <>
      <TimerModals modal={modal} setModal={setModal} />
      <View className="gap-[12]">
        {timers.map((timer) => (
          <View
            key={timer.speakerIndex}
            className={cn(
              "flex-row items-center rounded-[8] py-[12] px-[20] gap-[16]",
              timer.speakerIndex === runningTimerIndex && "bg-item-highlight",
              timer.speakerIndex !== runningTimerIndex && "bg-item"
            )}
          >
            <Move color="hsla(213, 5%, 57%, 1)" size={16} />
            <View className="flex-1 flex-row items-center justify-between">
              <View className="flex-row items-center gap-[16]">
                <Text
                  style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                  className="text-md w-[20]"
                >
                  {timer.speakerIndex + 1}
                </Text>
                <Text className="color-primary text-md w-[100]">
                  {timer.startedAt ? dateFormatter.format(timer.startedAt) : ""}
                </Text>
                <View className="w-[60]">
                  <Text className="color-primary">
                    {formatCountdown({
                      countdownTime: timer.countdownTime,
                      elapsedTime: timer.countdownTime,
                    })}
                  </Text>
                </View>
                <View className="gap-[4]">
                  <View className="flex-row gap-[12]">
                    <Text>{timer.timerName}</Text>
                    <Text style={{ color: "hsla(0, 0%, 100%, 0.5)" }}>
                      {timer.speakerName}
                    </Text>
                  </View>
                  {timer.description && (
                    <Text
                      style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                      className="text-sm"
                    >
                      {timer.description}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row gap-[16] self-end">
                {timer.speakerIndex === runningTimerIndex ? (
                  <IconButton size="sm" variant="success" icon={Pause} />
                ) : (
                  <IconButton size="sm" variant="primary" icon={Play} />
                )}
                <IconButton size="sm" icon={Restart} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton size="sm" icon={More} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    avoidCollisions={true}
                    align="end"
                    alignOffset={-32 - 6}
                    sideOffset={-32 - 12}
                    insets={contentInsets}
                    className="w-[148]"
                  >
                    <DropdownMenuGroup className="gap-[8]">
                      <DropdownMenuItem
                        onPress={() => setModal({ type: "edit", timer })}
                      >
                        <View className="flex-1 flex-row justify-between items-center">
                          <Text className="text-sm font-normal">Edit</Text>
                          <Edit size={16} />
                        </View>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onPress={() => setModal({ type: "delete", timer })}
                      >
                        <View className="flex-1 flex-row justify-between items-center">
                          <Text className="text-sm font-normal">Delete</Text>
                          <Trash size={16} />
                        </View>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
