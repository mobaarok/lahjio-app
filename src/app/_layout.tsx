// Root of the app: shared providers and the screen stack.
// Stack.Protected shows the learner screens only when logged in, and the
// welcome and login screens only when logged out. Expo Router moves the
// learner to the right place by itself after login or logout.
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { colors } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { LocaleProvider, useLocale } from "@/context/LocaleContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { useVisitTracker } from "@/hooks/useVisitTracker";

// Keep the splash screen until we know who is logged in and which language to use
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ContentProvider>
          <ProgressProvider>
            <StatusBar style="dark" />
            <RootStack />
          </ProgressProvider>
        </ContentProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

function RootStack() {
  const { user, loading } = useAuth();
  const { t, ready } = useLocale();
  const starting = loading || !ready;
  useVisitTracker();

  useEffect(() => {
    if (!starting) SplashScreen.hideAsync();
  }, [starting]);

  if (starting) return null;

  const loggedIn = Boolean(user);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primaryDark,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={loggedIn} redirectTo="/welcome">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[courseId]" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="lesson/[courseId]/[lessonId]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="progress" options={{ headerShown: true, title: t("nav.progress") }} />
      </Stack.Protected>

      <Stack.Protected guard={!loggedIn} redirectTo="/">
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="signup" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: true, title: "" }} />
      </Stack.Protected>

      {/* Open to everyone: guests can play a quiz and read the policies */}
      <Stack.Screen name="quiz" />
      <Stack.Screen name="privacy" options={{ headerShown: true, title: t("footer.privacy") }} />
      <Stack.Screen name="terms" options={{ headerShown: true, title: t("footer.terms") }} />
    </Stack>
  );
}
