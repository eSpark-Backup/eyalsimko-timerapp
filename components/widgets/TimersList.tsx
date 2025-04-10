import {
  findNodeHandle,
  Platform,
  TouchableWithoutFeedback,
  UIManager,
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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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

interface EventItemProps {
  event: Event;
  index: number;
  dragHandleProps?: any;
}

interface TimersListProps {
  events: Event[];
}

export const TimersListHeader = () => {
  const showModal = useShowModal();

  return (
    <>
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold">List of Events</Text>
        <Button
          size="sm"
          icon={Plus}
          onPress={() => showModal({ type: "addEvent" })}
        >
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
            style={{ margin: -20, padding: 20 }}
          >
            <Move color="hsla(213, 5%, 57%, 1)" size={16} />
          </View>
        </Sortable.Handle>
      )}
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-[16]">
          <Text
            style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
            className="text-md w-[20]"
          >
            {index + 1}
          </Text>
          <Text className="color-primary text-md w-[100] font-cousine">
            {event.startedAt ? dateFormatter.format(event.startedAt) : ""}
          </Text>
          <View className="w-[64]">
            <Text className="color-primary font-cousine">
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
                    <Text className="text-sm font-normal">Edit</Text>
                    <Edit size={16} />
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={
                    event.id === runningTimerId ? timerIsStarted : false
                  }
                  onPress={() => showModal({ type: "deleteEvent", event })}
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
  );
}

const TimersListWeb: React.FC<TimersListProps> = ({ events }) => {
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    eventConfigStore.send({
      type: "changeEventOrder",
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ width: "100%" }}
          >
            {events.map((event: Event, index: number) => (
              <Draggable key={event.id} draggableId={event.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps} // Ensures that drag handle is applied
                    style={{
                      ...provided.draggableProps.style,
                      marginBottom: 12, // Space between items
                    }}
                  >
                    <EventItem
                      event={event}
                      index={index}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}{" "}
            {/* Ensures the layout is updated during drag */}
          </div>
        )}
      </Droppable>
    </DragDropContext>
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
      rowGap={12}
      columns={1}
      dragActivationDelay={0}
      activeItemScale={1.05}
      overDrag="vertical"
      customHandle
      renderItem={({ item: event, index }) => (
        <View key={event.id}>
          <Sortable.Handle>
            <View style={{ margin: 10, padding: 10 }}>
              <Move color="hsla(213, 5%, 57%, 1)" size={16} />
            </View>
          </Sortable.Handle>
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
