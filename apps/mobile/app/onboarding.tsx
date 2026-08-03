import { useRef, useState } from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { useRoadmap } from "@/api/hooks";
import { ONBOARDING_SEEN_KEY } from "@/theme/onboarding-key";
import { cn } from "@/utils/cn";

const { width: SCREEN_W } = Dimensions.get("window");

const SLIDES = [
  {
    step: "1 / 4 · La promesa",
    title: "Aprende invirtiendo,\nno memorizando",
    body: "Lecciones de 5 minutos con quizzes reales -- nunca un muro de texto.",
    visual: "lessons" as const,
  },
  {
    step: "2 / 4 · La práctica",
    title: "Practica sin arriesgar\nun euro",
    body: "Dinero ficticio, decisiones reales -- cada orden te pide un plan antes de ejecutarse.",
    visual: "shield" as const,
  },
  {
    step: "3 / 4 · El mentor",
    title: "Un mentor que analiza\ntu proceso",
    body: "Nunca te dice qué comprar. Te pregunta si seguiste tu propio plan.",
    visual: "mentor" as const,
  },
  {
    step: "4 / 4 · Empieza",
    title: "Empieza tu racha hoy",
    body: "Tu primera lección dura 4 minutos. El día 1 de tu racha empieza en cuanto la termines.",
    visual: "flame" as const,
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { data: roadmap } = useRoadmap();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
  };

  const finish = async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_SEEN_KEY, "1");
    } catch {
      // storage unavailable -- proceed anyway, just won't skip onboarding next time
    }
    const firstLesson = roadmap?.levels[0]?.lessons[0]?.id;
    router.replace(firstLesson ? `/lesson/${firstLesson}` : "/(tabs)");
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={{ width: SCREEN_W }} className="px-8 items-center justify-center">
            <Text className="font-mono text-primary dark:text-primaryDark text-xs tracking-widest">{slide.step}</Text>
            <View className="my-10">
              <Illustration kind={slide.visual} isDark={isDark} />
            </View>
            <Text className="font-display text-2xl text-ink dark:text-inkDark text-center">{slide.title}</Text>
            <Text className="text-muted dark:text-mutedDark text-[15px] text-center mt-3 max-w-[30ch]">{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="items-center pb-2">
        <View className="flex-row gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <View key={i} className={cn("h-1.5 rounded-full", i === index ? "w-6 bg-primary dark:bg-primaryDark" : "w-1.5 bg-border dark:bg-borderDark")} />
          ))}
        </View>
        <View className="flex-row gap-3 px-6 w-full pb-4">
          {!isLast ? (
            <Pressable className="flex-1 items-center py-3.5" onPress={finish}>
              <Text className="font-sans-semibold text-muted dark:text-mutedDark">Saltar</Text>
            </Pressable>
          ) : null}
          <Pressable
            className="flex-[2] bg-primary dark:bg-primaryDark rounded-xl py-3.5 items-center"
            onPress={() => (isLast ? finish() : scrollRef.current?.scrollTo({ x: SCREEN_W * (index + 1), animated: true }))}
          >
            <Text className="font-sans-bold text-white">{isLast ? "Empieza tu primera lección" : "Siguiente"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Illustration({ kind, isDark }: { kind: "lessons" | "shield" | "mentor" | "flame"; isDark: boolean }) {
  const indigo = isDark ? "#8B89EE" : "#5B5BD6";
  const indigoSoft = isDark ? "#262456" : "#ECEBFA";
  const teal = isDark ? "#4FCBAD" : "#178F72";
  const amber = isDark ? "#F5B03D" : "#E0930A";
  const surface2 = isDark ? "#242838" : "#F1ECDE";
  const line = isDark ? "#2B3040" : "#E7E0CE";

  if (kind === "lessons") {
    return (
      <Svg width={140} height={120} viewBox="0 0 100 100">
        <Rect x="20" y="55" width="10" height="30" rx="3" fill={teal} />
        <Rect x="38" y="35" width="10" height="50" rx="3" fill={indigo} />
        <Rect x="56" y="45" width="10" height="40" rx="3" fill={teal} />
        <Rect x="74" y="20" width="10" height="65" rx="3" fill={amber} />
      </Svg>
    );
  }
  if (kind === "shield") {
    return (
      <Svg width={130} height={130} viewBox="0 0 100 100">
        <Path d="M50 10l32 12v22c0 22-14 34-32 46-18-12-32-24-32-46V22z" fill={indigoSoft} stroke={indigo} strokeWidth={2.5} />
        <Path d="M38 52l9 9 17-19" stroke={teal} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (kind === "mentor") {
    return (
      <Svg width={130} height={110} viewBox="0 0 100 100">
        <Rect x="14" y="24" width="72" height="46" rx="14" fill={surface2} stroke={line} strokeWidth={1.5} />
        <Circle cx="38" cy="47" r="4" fill={indigo} />
        <Circle cx="62" cy="47" r="4" fill={indigo} />
        <Path d="M30 66l10-8M70 66l-10-8" stroke={indigo} strokeWidth={3} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={80} height={80} viewBox="0 0 24 24">
      <Path d="M12 2C10 6 6 8 6 13a6 6 0 1012 0c0-2-1-3-2-4 .3 2-1 3-2 2 1-3-1-5-2-9z" fill={amber} />
    </Svg>
  );
}
