import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Text } from "~/components/ui/text";
import { Button } from "../ui/button";
import { Plus } from "~/lib/icons/Plus";
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
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Trash } from "~/lib/icons/Trash";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Edit } from "~/lib/icons/Edit";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import React from "react";
import { TrashDanger } from "~/lib/icons/TrashDanger";
import { Input } from "../ui/input";
import { getLocale } from "~/lib/locale";
import { eventConfigStore, Event } from "~/lib/store/eventConfig";
import { useSelector } from "@xstate/store/react";
import { TimeInput } from "../ui/time-input";

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

const getFormData = (event: Event): FormData => {
  return {
    name: event.name,
    description: event.description,
    speakerName: event.speakerName,
    countdownTime: event.countdownTime,
    blinkingStartTime: event.blinkingStartTime,
    blinkLength: event.blinkLength,
  };
};

type FormData = Omit<Event, "id" | "startedAt">;
function TimerForm({
  initialValues,
  renderFooter,
  closeModal,
  onSubmit,
}: {
  initialValues?: FormData;
  renderFooter: (submitButton: React.ReactNode) => React.ReactNode;
  onSubmit: (data: FormData) => void;
  closeModal: () => void;
}) {
  const defaultBlinkingStartTime = useSelector(
    eventConfigStore,
    (state) => state.context.blinkingStartTime
  );
  const defaultBlinkLength = useSelector(
    eventConfigStore,
    (state) => state.context.blinkLength
  );
  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      speakerName: initialValues?.speakerName ?? "",
      countdownTime: initialValues?.countdownTime ?? undefined,
      blinkingStartTime:
        initialValues?.blinkingStartTime ??
        defaultBlinkingStartTime ??
        undefined,
      blinkLength:
        initialValues?.blinkLength ?? defaultBlinkLength ?? undefined,
    },
  });
  const submit = handleSubmit((data) => {
    console.log(data);
    onSubmit(data);
    closeModal();
  });

  return (
    <>
      <View className="gap-[20]">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              background="modal"
              label="Event Name"
              // onBlur={onBlur}
              onSubmitEditing={(e) => onChange(e.nativeEvent.text)}
              defaultValue={value}
            />
          )}
          name="name"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              background="modal"
              label="Event Description"
              onBlur={onBlur}
              onSubmitEditing={(e) => onChange(e.nativeEvent.text)}
              defaultValue={value}
            />
          )}
          name="description"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              background="modal"
              label="Speaker Name"
              onBlur={onBlur}
              onSubmitEditing={(e) => onChange(e.nativeEvent.text)}
              defaultValue={value}
            />
          )}
          name="speakerName"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TimeInput
              background="modal"
              label="Duration"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
            />
          )}
          name="countdownTime"
        />
        <View className="flex-row gap-[20]">
          <View className="flex-1">
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TimeInput
                  background="modal"
                  label="Flash Time"
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                />
              )}
              name="blinkingStartTime"
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TimeInput
                  background="modal"
                  label="Flash Length"
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                />
              )}
              name="blinkLength"
            />
          </View>
        </View>
      </View>
      {renderFooter(
        <Button
          size="lg"
          border="none"
          variant="primary"
          onPress={(e) => {
            console.log(
              "onSubmit",
              JSON.stringify(errors, null, 2),
              JSON.stringify(getValues(), null, 2)
            );
            submit(e);
          }}
        >
          <Text>Add Timer</Text>
        </Button>
      )}
    </>
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
                  onPress={() => {
                    if (modal?.type !== "delete") return;
                    eventConfigStore.send({
                      type: "deleteEvent",
                      event: modal.event,
                    });
                    setModal(null);
                  }}
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
            {modal?.type === "edit" && (
              <TimerForm
                initialValues={getFormData(modal.event)}
                closeModal={() => setModal(null)}
                onSubmit={(data) => {
                  eventConfigStore.send({
                    type: "updateEvent",
                    event: {
                      id: modal.event.id,
                      ...data,
                    },
                  });
                }}
                renderFooter={(submitButton) => {
                  return (
                    <DialogFooter>
                      <View className="flex-row justify-between">
                        <Button
                          size="lg"
                          border="none"
                          onPress={() => setModal(null)}
                        >
                          <Text>Cancel</Text>
                        </Button>
                        {submitButton}
                      </View>
                    </DialogFooter>
                  );
                }}
              />
            )}
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
            <TimerForm
              onSubmit={(data) => {
                eventConfigStore.send({
                  type: "addEvent",
                  event: data,
                });
              }}
              closeModal={() => setModal(null)}
              renderFooter={(submitButton) => {
                return (
                  <DialogFooter>
                    <View className="flex-row justify-between">
                      <Button
                        size="lg"
                        border="none"
                        onPress={() => setModal(null)}
                      >
                        <Text>Cancel</Text>
                      </Button>
                      {submitButton}
                    </View>
                  </DialogFooter>
                );
              }}
            />
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
}

const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
  timeStyle: "medium",
});

type ModalState =
  | {
      type: "add";
    }
  | {
      type: "delete";
      event: Event;
    }
  | {
      type: "edit";
      event: Event;
    };

export default function TimersList() {
  const events = useSelector(eventConfigStore, (state) => state.context.events);
  const runningTimerId = events[0]?.id;
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
        {events.map((event, index) => (
          <View
            key={event.id}
            className={cn(
              "flex-row items-center rounded-[8] py-[12] px-[20] gap-[16]",
              event.id === runningTimerId && "bg-item-highlight",
              event.id !== runningTimerId && "bg-item"
            )}
          >
            <Move color="hsla(213, 5%, 57%, 1)" size={16} />
            <View className="flex-1 flex-row items-center justify-between">
              <View className="flex-row items-center gap-[16]">
                <Text
                  style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                  className="text-md w-[20]"
                >
                  {index + 1}
                </Text>
                <Text className="color-primary text-md w-[100]">
                  {event.startedAt ? dateFormatter.format(event.startedAt) : ""}
                </Text>
                <View className="w-[60]">
                  <Text className="color-primary">
                    {formatCountdown({
                      countdownTime: event.countdownTime,
                      elapsedTime: event.countdownTime,
                    })}
                  </Text>
                </View>
                <View className="gap-[4]">
                  <View className="flex-row gap-[12]">
                    <Text>{event.name}</Text>
                    <Text style={{ color: "hsla(0, 0%, 100%, 0.5)" }}>
                      {event.speakerName}
                    </Text>
                  </View>
                  {event.description && (
                    <Text
                      style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                      className="text-sm"
                    >
                      {event.description}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row gap-[16] self-end">
                {event.id === runningTimerId ? (
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
                        onPress={() => setModal({ type: "edit", event })}
                      >
                        <View className="flex-1 flex-row justify-between items-center">
                          <Text className="text-sm font-normal">Edit</Text>
                          <Edit size={16} />
                        </View>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onPress={() => setModal({ type: "delete", event })}
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
