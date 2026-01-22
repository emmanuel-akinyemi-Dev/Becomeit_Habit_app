import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import * as MailComposer from "expo-mail-composer";
import { Alert, Platform } from "react-native";

export const openFeatureSuggestion = async () => {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    Alert.alert("No Email App", "No email app is configured on this device.");
    return;
  }
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  await MailComposer.composeAsync({
    recipients: ["emizlife2014@gmail.com"], // Your email
    subject: "Feature Suggestion",
    body:
      `Hi,\n\nI’d love to suggest the following feature:\n\n• \n\n` +
      `---\n` +
      `App Version: ${Constants.expoConfig?.version}\n` +
      `Platform: ${Platform.OS}\n`,
  });
};
