import { Redirect } from "expo-router";
import { useAuthStore } from "@/auth/store";

export default function Index() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return <Redirect href={accessToken ? "/(tabs)" : "/(auth)/login"} />;
}
