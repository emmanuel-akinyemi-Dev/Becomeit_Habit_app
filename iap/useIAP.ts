import { useEffect } from "react";
import { restorePurchases, initIAP } from "./iapService";

export function useIAP() {
  useEffect(() => {
    initIAP();
    restorePurchases();
  }, []);
}
