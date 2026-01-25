import { View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { canShowAds } from "./adService";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-3940256099942544~3347511713";

export default function AdBanner() {
  if (!canShowAds()) return null;

  return (
    <View style={{ alignItems: "center", marginVertical: 12 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
