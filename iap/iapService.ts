import * as IAP from "expo-in-app-purchases";
import { PRODUCTS } from "./products";
import { useEntitlementStore } from "@/store/entitlementStore";

export async function initIAP() {
  await IAP.connectAsync();
  await IAP.getProductsAsync([PRODUCTS.REMOVE_ADS]);
}

export async function buyRemoveAds() {
  await IAP.purchaseItemAsync(PRODUCTS.REMOVE_ADS);
}

export async function restorePurchases() {
  const history = await IAP.getPurchaseHistoryAsync();
  const hasRemoveAds = history.results?.some(
    (p) => p.productId === PRODUCTS.REMOVE_ADS,
  );

  if (hasRemoveAds) {
    useEntitlementStore.getState().setAdFree(true);
  }
}
