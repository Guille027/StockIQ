import { useFonts, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_600SemiBold, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";

/**
 * Three typefaces, three jobs (see the StockIQ Claude Design project):
 * Space Grotesk for headlines, Inter for everything read as prose, JetBrains
 * Mono reserved exclusively for numbers (prices, XP, %, scores). Loaded once
 * at the root layout, gating render the same way the color-scheme sync does.
 */
export function useAppFonts() {
  return useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });
}
