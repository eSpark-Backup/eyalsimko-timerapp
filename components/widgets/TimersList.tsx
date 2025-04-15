import {
  findNodeHandle,
  Platform,
  TouchableWithoutFeedback,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";
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
import { useSelector as useMachineSelector } from "@xstate/react";
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
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { TrashDanger } from "~/lib/icons/TrashDanger";
import { Input } from "../ui/input";
import { getLocale } from "~/lib/locale";
import { eventConfigStore, Event } from "~/lib/store/eventConfig";
import { useSelector } from "@xstate/store/react";
import { TimeInput } from "../ui/time-input";
import { SetupEvent, TimerContext } from "~/lib/store/timer";
import { connectionActor } from "~/lib/store/connectionStore";
import { CardScrollPositionContext, CardScrollRefContext } from "../Card";
import Sortable from "react-native-sortables";
import { useModal, useShowModal } from "~/lib/context/ModalContext";
import { Import } from "lucide-react-native";
import { exportEventsToCSV, importEventsFromCSV } from "~/app/utils/csvUtils";
import Toast from "react-native-toast-message";

let SortableJS: any;
if (Platform.OS === "web") {
  const sortableModule = require("sortablejs");
  SortableJS = sortableModule.default || sortableModule; // Access the default export
  }

interface EventItemProps {
  event: Event;
  index: number;
  dragHandleProps?: any;
}

interface TimersListProps {
  events: Event[];
}

export const TimersListHeader = ({ events }: { events: Event[] }) => {
  const showModal = useShowModal();
  console.log("TimersListHeader", events);

  const handleImportCSV = async () => {
    try {
      const importedEvents = await importEventsFromCSV();
      if (importedEvents && importedEvents.length > 0) {
        importedEvents.forEach((event) => {
          eventConfigStore.send({
            type: "addEvent",
            event,
          });
        });
        Toast.show({ type: "success", text1: "Events imported successfully!" });
      } else {
        Toast.show({ type: "info", text1: "No events were imported." });
      }
    } catch (error) {
      console.error("Error importing events:", error);
      Toast.show({ type: "error", text1: "Failed to import events." });
    }
  };

  return (
    <View className="flex-row justify-between items-center mb-[10] flex-wrap gap-5">
      <Text className="text-lg font-semibold font-poppins web:font-poppins">
        List of Events
      </Text>
      <View className="flex-row gap-2">
        <Button
          size="sm"
          icon={Import}
          onPress={() => handleImportCSV()}
        >
          <Text className="font-poppins web:font-poppins">Import</Text>
        </Button>
        <Button size="sm" icon={Plus} onPress={() => exportEventsToCSV(events)}>
          <Text className="font-poppins web:font-poppins">Export</Text>
        </Button>
        <Button
          size="sm"
          icon={Plus}
          onPress={() => showModal({ type: "addEvent" })}
        >
          <Text className="font-poppins web:font-poppins">Add New Timer</Text>
        </Button>
      </View>
    </View>
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
          <Text className="font-normal font-poppins web:font-poppins">
            {submitLabel}
          </Text>
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
  const actorRef = TimerContext.useActorRef();
  const runningTimerId = useMachineSelector(actorRef, (state) => {
    if (!state.matches({ ACTIVE: "running" })) return null;
    return state.context.timer?.eventId;
  });
  return (
    <>
      <Dialog
        open={modal?.type === "delete"}
        onOpenChange={() => setModal(null)}
      >
        <DialogContent className="w-[400]">
          <View className="gap-[40]">
            <DialogHeader>
              <View className="justify-center items-center gap-[20] font-poppins web:font-poppins">
                <TrashDanger className="text-transparent" size={60} />
                <View className="items-center gap-[12]">
                  <Text className="text-2xl text-primary font-semibold font-poppins web:font-poppins">
                    Delete Timer?
                  </Text>
                  <Text className="text-lg text-primary/60 font-poppins web:font-poppins">
                    Are you sure you want to delete this timer?
                  </Text>
                </View>
              </View>
            </DialogHeader>
            <DialogFooter>
              <View className="flex-row justify-between">
                <DialogClose asChild>
                  <Button size="lg" border="none">
                    <Text className="font-normal font-poppins web:font-poppins">
                      Cancel
                    </Text>
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
                  <Text className="font-normal font-poppins web:font-poppins">
                    Delete
                  </Text>
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
              <Text className="text-xl text-center font-semibold font-poppins web:font-poppins">
                Edit Timer
              </Text>
            </DialogHeader>
            {modal?.type === "edit" && (
              <TimerForm
                isTimerRunning={modal.event.id === runningTimerId}
                initialValues={getFormData(modal.event)}
                closeModal={() => setModal(null)}
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
                        <Button
                          size="lg"
                          border="none"
                          onPress={() => setModal(null)}
                        >
                          <Text className="font-normal font-poppins web:font-poppins">
                            Cancel
                          </Text>
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
              <Text className="text-xl text-center font-semibold font-poppins web:font-poppins">
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
                        <Text className="font-normal font-poppins web:font-poppins">
                          Cancel
                        </Text>
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

function EventItem({ event, index, dragHandleProps }: EventItemProps) {
  const showModal = useShowModal();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const actorRef = TimerContext.useActorRef();
  const runningTimerId = useMachineSelector(
    actorRef,
    (state) => state.context.timer?.eventId
  );
  const isRunning = useMachineSelector(actorRef, (state) =>
    state.matches({ ACTIVE: "running" })
  );

  const timerIsStarted = useMachineSelector(actorRef, (state) => {
    return state.context.timer?.elapsed !== null;
  });

  const isPaused = useMachineSelector(actorRef, (state) =>
    state.matches({ ACTIVE: "paused" })
  );
  const canStop = useMachineSelector(actorRef, (state) =>
    state.can({ type: "stop" })
  );

  const setupEvent: SetupEvent = {
    type: "setup",
    data: {
      eventId: event.id,
    },
  } as const;
  const canSetup = useMachineSelector(actorRef, (state) =>
    state.can(setupEvent)
  );
  const isConnected = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 900;

  return (
    <View
      key={event.id}
      className={cn(
        "flex-row items-center rounded-[8] py-[12] px-[20] gap-[16]",
        event.id === runningTimerId && "bg-item-highlight",
        event.id !== runningTimerId && "bg-item"
      )}
    >
      {Platform.OS === "web" ? (
        <View
          className="h-full justify-center"
          style={{ margin: 0, padding: 20 }}
          {...dragHandleProps} // Web drag handle props here
        >
          <Move color="hsla(213, 5%, 57%, 1)" size={16} />
        </View>
      ) : (
        <Sortable.Handle>
          <View
            className="h-full justify-center"
            style={[{ margin: -20, padding: 20 }, 
            isSmallScreen && { position: "absolute", bottom: 10, right: -8},
            ]}
          >
            <Move color="hsla(213, 5%, 57%, 1)" size={16} />
          </View>
        </Sortable.Handle>
      )}
      {!isSmallScreen ? (
        <>
          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-[16]">
              <Text
                style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                className="text-md w-[20] font-poppins"
              >
                {index + 1}
              </Text>
              <Text className="color-primary text-md w-[100] font-poppins">
                {event.startedAt ? dateFormatter.format(event.startedAt) : ""}
              </Text>
              <View className="w-[64]">
                <Text className="color-primary font-poppins">
                  {formatCountdown({
                    countdownTime: event.countdownTime,
                    elapsedTime: event.countdownTime,
                  })}
                </Text>
              </View>
              <View className="gap-[4]">
                <View className="flex-row gap-[12]">
                  <Text className="font-normal font-poppins">{event.name}</Text>
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
              {event.id === runningTimerId && isRunning ? (
                <IconButton
                  disabled={!isConnected}
                  size="sm"
                  variant="success"
                  icon={Pause}
                  onPress={() => actorRef.send({ type: "pause" })}
                />
              ) : (
                <IconButton
                  disabled={!isConnected}
                  size="sm"
                  variant="primary"
                  icon={Play}
                  onPress={() => {
                    if (event.id !== runningTimerId) {
                      actorRef.send(setupEvent);
                      actorRef.send({ type: "start" });
                    } else if (isPaused && event.id === runningTimerId) {
                      actorRef.send({ type: "resume" });
                    }
                  }}
                />
              )}

              <IconButton
                disabled={!isConnected}
                size="sm"
                icon={Restart}
                onPress={() => actorRef.send(setupEvent)}
              />

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
                      onPress={() => showModal({ type: "editEvent", event })}
                    >
                      <View className="flex-1 flex-row justify-between items-center">
                        <Text className="text-sm font-normal font-poppins">
                          Edit
                        </Text>
                        <Edit size={16} />
                      </View>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={event.id === runningTimerId ? isRunning : false}
                      onPress={() => showModal({ type: "deleteEvent", event })}
                    >
                      <View className="flex-1 flex-row justify-between items-center">
                        <Text className="text-sm font-normal font-poppins">
                          Delete
                        </Text>
                        <Trash size={16} />
                      </View>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
        </>
      ) : (
        <>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center justify-between gap-x-[12]">
              <Text
                style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                className="font-poppins text-md"
              >
                {index + 1}
              </Text>

              <Text className="text-md color-primary font-poppins">
                {event.startedAt ? dateFormatter.format(event.startedAt) : ""}
              </Text>

              <Text className="color-primary font-poppins">
                {formatCountdown({
                  countdownTime: event.countdownTime,
                  elapsedTime: event.countdownTime,
                })}
              </Text>

              <Text className="font-poppins font-medium">{event.name}</Text>
              {event.description && (
                <Text
                  numberOfLines={1}
                  className="mt-[4] font-poppins text-sm text-white/50"
                >
                  {event.description}
                </Text>
              )}

              <Text
                style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                className="font-poppins"
              >
                {event.speakerName}
              </Text>
            </View>

            <View className="flex-row gap-[12] self-end mt-[8]">
              {event.id === runningTimerId && isRunning ? (
                <IconButton
                  disabled={!isConnected}
                  size="sm"
                  variant="success"
                  icon={Pause}
                  onPress={() => actorRef.send({ type: "pause" })}
                />
              ) : (
                <IconButton
                  disabled={!isConnected}
                  size="sm"
                  variant="primary"
                  icon={Play}
                  onPress={() => {
                    if (event.id !== runningTimerId) {
                      actorRef.send(setupEvent);
                      actorRef.send({ type: "start" });
                    } else if (isPaused && event.id === runningTimerId) {
                      actorRef.send({ type: "resume" });
                    }
                  }}
                />
              )}

              <IconButton
                disabled={!isConnected}
                size="sm"
                icon={Restart}
                onPress={() => actorRef.send(setupEvent)}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton size="sm" icon={More} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  avoidCollisions
                  align="end"
                  alignOffset={-32 - 6}
                  sideOffset={-32 - 12}
                  insets={contentInsets}
                  className="w-[148]"
                >
                  <DropdownMenuGroup className="gap-[8]">
                    <DropdownMenuItem
                      onPress={() => showModal({ type: "editEvent", event })}
                    >
                      <View className="flex-row justify-between items-center w-full">
                        <Text className="text-sm font-normal font-poppins">
                          Edit
                        </Text>
                        <Edit size={16} />
                      </View>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={event.id === runningTimerId ? isRunning : false}
                      onPress={() => showModal({ type: "deleteEvent", event })}
                    >
                      <View className="flex-row justify-between items-center w-full">
                        <Text className="text-sm font-normal font-poppins">
                          Delete
                        </Text>
                        <Trash size={16} />
                      </View>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const TimersListWeb: React.FC<TimersListProps> = ({ events }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Platform.OS === "web" && listRef.current && SortableJS) {
      const sortable = SortableJS.create(listRef.current, {
        animation: 150, // Smooth animation
        handle: ".drag-handle", // Class for the drag handle
        onEnd: (evt: any) => {
          const { oldIndex, newIndex } = evt;

          if (oldIndex !== undefined && newIndex !== undefined) {
            eventConfigStore.send({
              type: "changeEventOrder",
              fromIndex: oldIndex,
              toIndex: newIndex,
            });
          }
        },
      });

      return () => {
        sortable.destroy(); // Cleanup on unmount
      };
    }
  }, []);

  return (
    <div ref={listRef} style={{ width: "100%" }}>
      {events.map((event: Event, index: number) => (
        <div
          key={event.id}
          className="drag-handle cursor-move"
          style={{ marginBottom: 12 }}
        >
          <EventItem event={event} index={index} />
        </div>
      ))}
    </div>
  );
};

const TimersListNative: React.FC<TimersListProps> = ({ events }) => {
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    eventConfigStore.send({
      type: "changeEventOrder",
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    });
  };

  return (
    <Sortable.Grid
      onDragEnd={onDragEnd}
      data={events}
      rowGap={1}
      columns={1}
      dragActivationDelay={0}
      activeItemScale={1.05}
      overDrag="vertical"
      customHandle
      renderItem={({ item: event, index }) => (
        <View style={{ margin: 5}} key={event.id}>
          <EventItem event={event} index={index} />
        </View>
      )}
    />
  );
};

export default function TimersList() {
  const runningTimerRef = useRef<View>(null);
  const scrollViewRef = React.useContext(CardScrollRefContext);
  const scrollPosition = React.useContext(CardScrollPositionContext);
  const events = useSelector(eventConfigStore, (state) => state.context.events);
  const actorRef = TimerContext.useActorRef();
  const runningTimerId = useMachineSelector(
    actorRef,
    (state) => state.context.timer?.eventId
  );

  const checkVisibility = (timerRef: React.RefObject<View>) => {
    const currentRunningTimerRef = timerRef.current;
    const currentScrollViewRef = scrollViewRef.current;

    if (currentRunningTimerRef && currentScrollViewRef) {
      (currentScrollViewRef as unknown as View).measureInWindow(
        (_sx, scrollY, _sw, scrollViewHeight) => {
          if (scrollViewHeight === 0) return;
          currentRunningTimerRef.measureLayout(
            currentScrollViewRef as unknown as View,
            (_ex, elementY, _ew, elementHeight) => {
              const isVisible =
                elementY < scrollViewHeight + scrollPosition - elementHeight &&
                elementY > scrollPosition;
              if (!isVisible) {
                currentScrollViewRef.scrollTo({
                  y: elementY,
                  animated: true,
                });
              }
            }
          );
        }
      );
    }
  };

  useEffect(() => {
    checkVisibility(runningTimerRef);
  }, [runningTimerId]);

  return (
    <View>
      {Platform.OS === "web" ? (
        <TimersListWeb events={events} />
      ) : (
        <TimersListNative events={events} />
      )}
    </View>
  );
}
