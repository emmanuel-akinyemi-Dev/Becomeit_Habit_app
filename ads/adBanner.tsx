import { View, Text, Pressable } from "react-native";
import { canShowAds } from "./adService";
import { buyRemoveAds } from "@/iap/iapService";
import colors from "@/constants/colors";

export default function AdBanner() {
  if (!canShowAds()) return null;

  return (
    <View
      style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: colors.primary,
        marginVertical: 10,
      }}
    >
      <Text style={{ color: colors.white, marginBottom: 6 }}>
        Remove ads for a better experience
      </Text>

      <Pressable
        onPress={buyRemoveAds}
        style={{
          padding: 10,
          borderRadius: 10,
          backgroundColor: colors.white,
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: "700" }}>
          Upgrade — Remove Ads
        </Text>
      </Pressable>
    </View>
  );
}