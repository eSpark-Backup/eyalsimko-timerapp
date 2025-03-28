import * as React from "react";
import { useSelector } from "@xstate/store/react";
import { useSelector as useMachineSelector } from "@xstate/react";
import { Text } from "~/components/ui/text";
import { TimerContext } from "~/lib/store/timer";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { useCloseModal, useModal } from "~/lib/context/ModalContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { View } from "react-native";
import { TrashDanger } from "~/lib/icons/TrashDanger";
import { Button } from "~/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Event } from "~/lib/store/eventConfig";
import { Input } from "./ui/input";
import { TimeInput } from "./ui/time-input";
import { getLocale } from "~/lib/locale";
import { SettingsModal } from "./SettingsModal";
import { Help } from "~/lib/icons/Help";
import { IconButton } from "./iconButton";
import { Close } from "~/lib/icons/Close";
import { GreenDot, RedDot } from "~/lib/icons/LogDots";
import { cn } from "~/lib/utils";

type Log = {
  type: "connectionLost" | "connectionRecovered";
  connectionType: "LAN" | "WIFI";
  date: Date;
};

const logs: Log[] = [
  {
    type: "connectionRecovered",
    connectionType: "LAN",
    date: new Date("2023-07-01T04:12:00.000Z"),
  },
  {
    type: "connectionLost",
    connectionType: "WIFI",
    date: new Date("2023-07-02T03:42:00.000Z"),
  },
  {
    type: "connectionRecovered",
    connectionType: "WIFI",
    date: new Date("2023-07-03T02:11:00.000Z"),
  },
];

type LogType = Log["type"];

const connectionTypeToText = (
  connectionType: Log["connectionType"]
): string => {
  if (connectionType === "LAN") return "wired";
  return "wireless";
};

const logToText = (log: Log) => {
  const map: Record<LogType, { title: string; description: string }> = {
    connectionLost: {
      title: "Connection lost",
      description:
        "App can not connect to the Timer module. Please check your connection.",
    },
    connectionRecovered: {
      title: "Connected",
      description: `Connection successful - ${connectionTypeToText(
        log.connectionType
      )} connection has been initiated.`,
    },
  };
  return map[log.type];
};

const timerFormatter = Intl.DateTimeFormat(getLocale(), {
  timeStyle: "medium",
});

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
  submitLabel,
  isTimerRunning,
}: {
  initialValues?: FormData;
  renderFooter: (submitButton: React.ReactNode) => React.ReactNode;
  onSubmit: (data: FormData) => void;
  closeModal: () => void;
  submitLabel: string;
  isTimerRunning?: boolean;
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
    onSubmit({
      ...data,
      blinkingStartTime: data.blinkingStartTime ?? 0,
      blinkLength: data.blinkLength ?? 0,
    });
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
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              hasError={!!error}
              background="modal"
              label="Event Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
        />
        <Controller
          control={control}
          rules={{
            required: false,
          }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              hasError={!!error}
              background="modal"
              label="Event Description"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="description"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              hasError={!!error}
              background="modal"
              label="Speaker Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="speakerName"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <TimeInput
              editable={!isTimerRunning}
              hasError={!!error}
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
                required: false,
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TimeInput
                  editable={!isTimerRunning}
                  hasError={!!error}
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
                required: false,
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TimeInput
                  editable={!isTimerRunning}
                  hasError={!!error}
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
            submit(e);
          }}
        >
          <Text>{submitLabel}</Text>
        </Button>
      )}
    </>
  );
}

const helpContent = [
  {
    title: "Event Description",
    text: [
      "To set the event and room description, click on the text next to the logo in the top left corner.",
    ],
  },
  {
    title: "Setup Timer",
    text: [
      "To set the label for each timer, click the text box with the hint Speaker Name. Change the name and press submit on the keyboard to save.",
      "Click Enter Time to set the countdown timer and the blink start time.",
      "To set a global blink start time, press the 3 dots in the top right corner and click Default blink start time sub-menu.",
    ],
  },
  {
    title: "Select A Timer",
    text: [
      "With the desired timer selected in the top half of the screen, press the Reset button.",
      "You now have control of that timer in the bottom half of the screen.",
    ],
  },
  {
    title: "Settings Menu",
    text: [
      "The settings menu can be opened by pressing the 3 dots in the top-right corner. \n\u2022 Default blink start time – This sets the blink start time for all timers. If all timers should blink with 30 seconds left, set 30 seconds as the default start time.\n\u2022 After setting the default time, you can still edit each timer individually.\n\u2022 Blink length – This sets the amount of time that the screen should blink when it reaches the blink start time.\n\u2022 Clear Timers – This clears all saved data including all timers, event, and description.",
    ],
  },
];

export function Modals() {
  const modal = useModal();
  const closeModal = useCloseModal();

  const actorRef = TimerContext.useActorRef();
  const runningTimerId = useMachineSelector(actorRef, (state) => {
    if (!state.matches({ ACTIVE: "running" })) return null;
    return state.context.timer?.eventId;
  });

  return (
    <>
      <Dialog open={modal?.type === "deleteEvent"} onOpenChange={closeModal}>
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
                    if (modal?.type !== "deleteEvent") return;
                    // eventConfigStore.send({
                    //   type: "deleteEvent",
                    //   event: modal.event,
                    // });
                    closeModal();
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
      <Dialog open={modal?.type === "editEvent"} onOpenChange={closeModal}>
        <DialogContent
          className="w-[464]"
          scrollable
          height={700}
          header={null}
        >
          <View className="gap-[40]">
            <DialogHeader>
              <Text className="text-xl text-center font-semibold">
                Edit Timer
              </Text>
            </DialogHeader>
            {modal?.type === "editEvent" && (
              <TimerForm
                isTimerRunning={modal.event.id === runningTimerId}
                initialValues={getFormData(modal.event)}
                closeModal={closeModal}
                onSubmit={(data) => {
                  eventConfigStore.send({
                    type: "updateEvent",
                    eventId: modal.event.id,
                    event: data,
                  });
                }}
                submitLabel="Save Changes"
                renderFooter={(submitButton) => {
                  return (
                    <DialogFooter>
                      <View className="flex-row justify-between">
                        <Button size="lg" border="none" onPress={closeModal}>
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
      <Dialog open={modal?.type === "addEvent"} onOpenChange={closeModal}>
        <DialogContent
          className="w-[464]"
          scrollable
          height={700}
          header={null}
        >
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
              submitLabel="Add Timer"
              closeModal={closeModal}
              renderFooter={(submitButton) => {
                return (
                  <DialogFooter>
                    <View className="flex-row justify-between">
                      <Button size="lg" border="none" onPress={closeModal}>
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
      <Dialog open={modal?.type === "settings"} onOpenChange={closeModal}>
        <SettingsModal />
      </Dialog>
      <Dialog open={modal?.type === "help"} onOpenChange={closeModal}>
        <DialogContent
          headerHeight={28}
          scrollable
          height={744}
          style={{ width: 718 }}
          header={
            <DialogHeader className="flex-row justify-center relative">
              <Text className="text-3xl text-center font-semibold">Help</Text>
              <Help size={32} className="text-primary-foreground" />
              <View className="absolute right-0 top-1">
                <IconButton
                  variant="outline"
                  size="xl"
                  icon={Close}
                  onPress={closeModal}
                />
              </View>
            </DialogHeader>
          }
        >
          <View className="gap-[32] pt-[30]">
            {helpContent.map(({ title, text }, index) => (
              <View key={index} className="gap-[12]">
                <Text className="text-xl leading-[1.5] font-semibold">
                  {title}
                </Text>
                <Text className="text-md leading-[1.5] text-muted-foreground">
                  {text.join("\n\n")}
                </Text>
              </View>
            ))}
          </View>
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.type === "deleteData"} onOpenChange={closeModal}>
        <DialogContent className="w-[400]">
          <View className="gap-[40]">
            <DialogHeader>
              <View className="justify-center items-center gap-[20]">
                <TrashDanger className="text-transparent" size={60} />
                <View className="items-center gap-[12]">
                  <Text className="text-2xl text-primary font-semibold">
                    Delete All Timers?
                  </Text>
                  <Text className="text-lg text-primary/60">
                    Are you sure you want to delete all timers?
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
                    eventConfigStore.send({ type: "reset" });
                    actorRef.send({ type: "reset" });
                    closeModal();
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
      <Dialog open={modal?.type === "logs"} onOpenChange={closeModal}>
        <DialogContent
          className="w-[464]"
          scrollable
          height={744}
          headerHeight={28}
          header={
            <DialogHeader className="flex-row justify-center relative">
              <Text className="text-xl text-center font-semibold">Logs</Text>
              <View className="absolute right-0 top-1">
                <IconButton
                  variant="outline"
                  size="xl"
                  icon={Close}
                  onPress={closeModal}
                />
              </View>
            </DialogHeader>
          }
        >
          <View className="pt-[40]">
            {logs.map((log, index) => (
              <View key={index} className="flex-row">
                <View className="w-[65] mr-[6] items-center">
                  <Text className="text-sm font-semibold leading-none">
                    {timerFormatter.format(log.date)}
                  </Text>
                </View>
                <View className="w-[21] mr-[16] items-center relative">
                  <View className="w-[3] flex-1 bg-buttonDefaultBorderColor" />
                  <View className="absolute top-[-2]">
                    {log.type === "connectionLost" && <RedDot size={16} />}
                    {log.type === "connectionRecovered" && (
                      <GreenDot size={16} />
                    )}
                  </View>
                </View>
                <View
                  className={cn(
                    "flex-1 gap-[4]",
                    index !== logs.length - 1 && "mb-[24]"
                  )}
                >
                  <Text className="font-semibold leading-none">
                    {logToText(log).title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {logToText(log).description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
}
