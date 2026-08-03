import { useFonts, PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";

/**
 * Three typefaces, three jobs (see docs/design-system): Jakarta for
 * headlines, Manrope for everything read as prose, Plex Mono reserved
 * exclusively for numbers (prices, XP, %, scores). Loaded once at the root
 * layout, gating render the same way the color-scheme sync already does.
 */
export function useAppFonts() {
  return useFonts({
    PlusJakartaSans_800ExtraBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
}
