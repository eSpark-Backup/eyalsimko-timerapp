import * as React from "react";
import { useSelector } from "@xstate/store/react";
import { useSelector as useMachineSelector } from "@xstate/react";
import { Text } from "~/components/ui/text";
import { modalStore } from "~/lib/store/modalStore";
import { TimerContext } from "~/lib/store/timer";
import { eventConfigStore } from "~/lib/store/eventConfig";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { KeyboardAvoidingView, View } from "react-native";
import { TrashDanger } from "~/lib/icons/TrashDanger";
import { Button } from "~/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Event } from "~/lib/store/eventConfig";
import { Input } from "./ui/input";
import { TimeInput } from "./ui/time-input";

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

export function Modals() {
  const modal = useSelector(modalStore, (state) => state.context.modal);

  const actorRef = TimerContext.useActorRef();
  const runningTimerId = useMachineSelector(actorRef, (state) => {
    if (!state.matches({ ACTIVE: "running" })) return null;
    return state.context.timer?.eventId;
  });

  const closeModal = () => modalStore.send({ type: "hideModal" });

  console.log({ modal });

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
                    eventConfigStore.send({
                      type: "deleteEvent",
                      event: modal.event,
                    });
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
        <DialogContent className="w-[464]">
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
          header={
            <DialogHeader>
              <Text className="text-xl text-center font-semibold">
                Add New Timer
              </Text>
            </DialogHeader>
          }
          height={600}
          className="w-[464]"
          scrollable
        >
          <KeyboardAvoidingView
            behavior={"padding"}
            keyboardVerticalOffset={0}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="gap-[40]">
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
          </KeyboardAvoidingView>
        </DialogContent>
      </Dialog>
    </>
  );
}
