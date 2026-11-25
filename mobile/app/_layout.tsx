// mobile/app/_layout.tsx
// Root layout — Clerk provider + Expo Router Stack

import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ClayCard } from '@components/clay/ClayCard';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@constants/theme';
import { getIsDemoUser, subscribeDemoUser } from '../services/demoAuth';

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Token cache: persisted in Expo SecureStore for secure JWT storage
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore write failures
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore delete failures
    }
  },
};

/** Development fallback screen shown when Clerk publishable key is not configured */
function MissingClerkConfigScreen() {
  return (
    <SafeAreaView style={styles.missingContainer}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={styles.missingScroll}>
        <View style={styles.missingHeader}>
          <Text style={styles.missingIcon}>🔐</Text>
          <Text style={styles.missingTitle}>Clerk Configuration Required</Text>
          <Text style={styles.missingSubtitle}>
            Missing Publishable Key
          </Text>
        </View>

        <ClayCard variant="peach" style={styles.errorCard}>
          <Text style={styles.errorCardTitle}>Action Required</Text>
          <Text style={styles.errorCardText}>
            The mobile application requires a valid Clerk Publishable Key to initialize authentication.
          </Text>
        </ClayCard>

        <ClayCard style={styles.instructionCard}>
          <Text style={styles.stepsTitle}>Setup Instructions:</Text>
          <Text style={styles.stepItem}>
            1. Go to <Text style={styles.boldText}>https://dashboard.clerk.com/</Text> and sign in.
          </Text>
          <Text style={styles.stepItem}>
            2. Open your application and navigate to <Text style={styles.boldText}>API Keys</Text>.
          </Text>
          <Text style={styles.stepItem}>
            3. Copy the <Text style={styles.boldText}>Publishable Key</Text> (starts with <Text style={styles.codeText}>pk_test_</Text>).
          </Text>
          <Text style={styles.stepItem}>
            4. Add it to <Text style={styles.codeText}>mobile/.env</Text>:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeBlockText}>
              EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
            </Text>
          </View>
          <Text style={styles.stepItem}>
            5. Restart the Expo development server:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeBlockText}>npx expo start -c</Text>
          </View>
        </ClayCard>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Redirect authenticated/unauthenticated users to the right stack */
function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isDemo, setIsDemo] = useState(getIsDemoUser());
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    return subscribeDemoUser(() => {
      setIsDemo(getIsDemoUser());
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(auth)';
    const authenticated = isSignedIn || isDemo;

    if (authenticated && inAuthGroup) {
      router.replace('/(tabs)/home');
    } else if (!authenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isLoaded, isSignedIn, isDemo, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  // If the key is missing or is an unreplaced template placeholder, display development guidance
  if (!publishableKey || publishableKey.trim() === '' || publishableKey.startsWith('pk_test_xxxx')) {
    console.warn(
      '[Clerk] Missing or unconfigured EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. ' +
        'Please obtain your publishable key from https://dashboard.clerk.com/ and configure mobile/.env',
    );
    return <MissingClerkConfigScreen />;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <AuthGate />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  missingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  missingScroll: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  missingHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  missingIcon: {
    fontSize: 52,
    marginBottom: Spacing.sm,
  },
  missingTitle: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  missingSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  errorCardTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  errorCardText: {
    fontSize: FontSize.caption,
    color: Colors.text,
    lineHeight: 18,
  },
  instructionCard: {
    width: '100%',
  },
  stepsTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  stepItem: {
    fontSize: FontSize.caption,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  boldText: {
    fontWeight: FontWeight.bold,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  codeBlock: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeBlockText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.caption,
    color: Colors.text,
  },
});
