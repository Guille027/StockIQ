import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ONBOARDING_SEEN_KEY } from "@/theme/onboarding-key";

export default function Index() {
  const [target, setTarget] = useState<"tabs" | "onboarding" | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDING_SEEN_KEY)
      .then((v) => setTarget(v ? "tabs" : "onboarding"))
      .catch(() => setTarget("tabs")); // storage unavailable -> don't block entry
  }, []);

  if (!target) return null;
  return <Redirect href={target === "tabs" ? "/(tabs)" : "/onboarding"} />;
}
