import { createContext, useContext, useState, ReactNode } from "react";
import { BookingDialog } from "@/components/BookingDialog";

const Ctx = createContext<{ open: () => void } | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <BookingDialog open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

export function useBooking() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBooking must be used within BookingProvider");
  return c;
}