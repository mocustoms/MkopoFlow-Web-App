import { Toast } from "@heroui/react";
import type { ReactNode } from "react";

type AppToastProviderProps = {
  children: ReactNode;
};

/** Global toast region — use `useAppToast()` to show messages. */
export function AppToastProvider({ children }: AppToastProviderProps) {
  return (
    <>
      {children}
      <Toast.Provider placement="bottom end" maxVisibleToasts={4} />
    </>
  );
}
