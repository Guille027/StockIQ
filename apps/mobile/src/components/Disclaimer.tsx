import { Text, View } from "react-native";

/**
 * Constant reminder on analysis surfaces: StockIQ teaches how to interpret
 * data -- it never recommends buying or selling anything.
 */
export function Disclaimer() {
  return (
    <View className="bg-surface dark:bg-surfaceDark rounded-lg px-3 py-2 mt-3">
      <Text className="text-muted dark:text-mutedDark text-[11px]">
        🎓 Herramienta de análisis para practicar. Nada de lo que ves aquí es una recomendación de compra o venta: las conclusiones son tuyas.
      </Text>
    </View>
  );
}
