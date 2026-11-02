import { useEffect, useState } from "react";
import { useCart, useFans, useOrders } from "@/lib/store";

export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void Promise.all([
      useCart.persist.rehydrate(),
      useOrders.persist.rehydrate(),
      useFans.persist.rehydrate(),
    ]).finally(() => setReady(true));
  }, []);
  return ready;
}
