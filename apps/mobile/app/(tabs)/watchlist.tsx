import { SafeAreaView } from "react-native-safe-area-context";
import { ComingSoon } from "@/components/ComingSoon";

export default function WatchlistScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
      <ComingSoon
        title="Watchlist y Paper Trading"
        description="Sigue tus empresas favoritas y opera con dinero virtual. Esta sección se activa en la fase 2 -- el backend ya tiene el esquema de datos listo."
      />
    </SafeAreaView>
  );
}
