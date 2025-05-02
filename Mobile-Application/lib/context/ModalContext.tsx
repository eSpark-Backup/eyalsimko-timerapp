import * as React from "react";
import { Event } from "~/lib/store/eventConfig";

export type Modal =
  | {
      type: "addEvent";
    }
  | {
      type: "editEvent";
      event: Event;
    }
  | {
      type: "deleteEvent";
      event: Event;
    }
  | { type: "settings" }
  | { type: "help" }
  | { type: "deleteData" }
  | { type: "logs" }
  | { type: "none" };

const ModalContext = React.createContext<Modal>({ type: "none" });
const ModalHideContext = React.createContext<(() => void) | null>(null);
const ModalShowContext = React.createContext<((modal: Modal) => void) | null>(
  null
);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = React.useState<Modal>({ type: "none" });

  const showModal = React.useCallback((newModal: Modal) => {
    setModal(newModal);
  }, []);

  const hideModal = React.useCallback(() => {
    setModal({ type: "none" });
  }, []);

  return (
    <ModalContext.Provider value={modal}>
      <ModalShowContext.Provider value={showModal}>
        <ModalHideContext.Provider value={hideModal}>
          {children}
        </ModalHideContext.Provider>
      </ModalShowContext.Provider>
    </ModalContext.Provider>
  );
}

export const useCloseModal = () => {
  const context = React.useContext(ModalHideContext);
  if (!context) {
    throw new Error("useCloseModal must be used within a ModalHideContext");
  }
  return context;
};

export const useShowModal = () => {
  const context = React.useContext(ModalShowContext);
  if (!context) {
    throw new Error("useShowModal must be used within a ModalShowContext");
  }
  return React.useCallback((modal: Modal) => context(modal), []);
};

export function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalContext");
  }
  return context;
}
