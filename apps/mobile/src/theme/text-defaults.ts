import { Text, TextInput } from "react-native";

/**
 * Sets Inter as the default body font for every <Text>/<TextInput> in the
 * app, so ordinary text picks up the new type system without touching every
 * screen. This is RN's own documented pattern for a global default font
 * (Text.defaultProps.style is still respected regardless of Text's internal
 * implementation). Deliberately does NOT set fontWeight: emphasis/headings/
 * numbers still need explicit font-sans-bold/font-display/font-mono classes
 * -- those are distinct loaded font files, not weight variants of one family.
 */
let applied = false;

export function applyDefaultTextFont() {
  if (applied) return; // idempotent -- called on every RootLayout render
  applied = true;

  const anyText = Text as unknown as { defaultProps?: { style?: unknown } };
  anyText.defaultProps = anyText.defaultProps || {};
  anyText.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, anyText.defaultProps.style];

  const anyInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
  anyInput.defaultProps = anyInput.defaultProps || {};
  anyInput.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, anyInput.defaultProps.style];
}
