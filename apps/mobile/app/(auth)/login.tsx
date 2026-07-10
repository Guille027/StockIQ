import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogin } from "@/api/hooks";
import { ApiError } from "@/api/client";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  const handleSubmit = () => {
    setError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (err) => setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión."),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-ink dark:text-inkDark mb-1">StockIQ</Text>
        <Text className="text-muted dark:text-mutedDark mb-8">Analiza grandes empresas cotizadas con IA</Text>

        <Text className="text-ink dark:text-inkDark mb-1 text-sm font-medium">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="border border-border dark:border-borderDark rounded-xl px-4 py-3 mb-4 text-ink dark:text-inkDark"
          placeholder="tu@email.com"
          placeholderTextColor="#8B93A7"
        />

        <Text className="text-ink dark:text-inkDark mb-1 text-sm font-medium">Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-border dark:border-borderDark rounded-xl px-4 py-3 mb-2 text-ink dark:text-inkDark"
          placeholder="••••••••"
          placeholderTextColor="#8B93A7"
        />

        {error ? <Text className="text-negative dark:text-negativeDark text-sm mb-2">{error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={login.isPending}
          className="bg-primary dark:bg-primaryDark rounded-xl py-3.5 items-center mt-4"
        >
          <Text className="text-white font-semibold">{login.isPending ? "Entrando..." : "Iniciar sesión"}</Text>
        </Pressable>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted dark:text-mutedDark">¿No tienes cuenta? </Text>
          <Link href="/(auth)/register" className="text-primary dark:text-primaryDark font-medium">
            Regístrate
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
