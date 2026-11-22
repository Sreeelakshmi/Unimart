// mobile/app/(auth)/login.tsx
// Login screen with Clerk authentication, 2FA/MFA factor support, and automatic database synchronization

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { ClayCard, ClayInput, ClayButton } from '@components/index';
import { Colors, Spacing, FontSize, FontWeight, Typography } from '@constants/theme';
import { syncUserWithBackend } from '../../services/api';

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { getToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA / Secondary factor verification state
  const [pendingFactor, setPendingFactor] = useState(false);
  const [factorCode, setFactorCode] = useState('');
  const [factorStrategy, setFactorStrategy] = useState<'totp' | 'email_code' | 'phone_code'>('totp');
  const [factorMessage, setFactorMessage] = useState('');

  const completeAuthAndSync = async (sessionId: string, userData?: { firstName?: string | null; lastName?: string | null }) => {
    if (setActive) {
      await setActive({ session: sessionId });
    }

    // Synchronize user to Neon PostgreSQL database
    try {
      const token = await getToken();
      if (token) {
        await syncUserWithBackend(token, {
          fullName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Campus Student',
          email: email.trim(),
        });
      }
    } catch (syncErr) {
      console.warn('[Sync warning]', syncErr);
    }

    router.replace('/(tabs)/home');
  };

  const handleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    if (!email.trim() || !password) {
      setError('Please enter both your university email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await completeAuthAndSync(result.createdSessionId, result.userData);
        }
      } else if (result.status === 'needs_second_factor') {
        // Multi-Factor Authentication (2FA) or Device Trust required
        const isTotp = result.supportedSecondFactors?.some((f) => f.strategy === 'totp');
        const emailFactor = result.supportedSecondFactors?.find((f) => f.strategy === 'email_code');
        const phoneFactor = result.supportedSecondFactors?.find((f) => f.strategy === 'phone_code');

        if (isTotp) {
          setFactorStrategy('totp');
          setFactorMessage('Please enter the 6-digit code from your Authenticator app.');
          setPendingFactor(true);
        } else if (emailFactor) {
          await signIn.prepareSecondFactor({ strategy: 'email_code' });
          setFactorStrategy('email_code');
          setFactorMessage(`A verification code was sent to ${email.trim()}.`);
          setPendingFactor(true);
        } else if (phoneFactor) {
          await signIn.prepareSecondFactor({ strategy: 'phone_code' });
          setFactorStrategy('phone_code');
          setFactorMessage('A verification code was sent via SMS.');
          setPendingFactor(true);
        } else {
          setError(
            'Two-factor authentication is required by your Clerk configuration. Please complete 2FA or turn off Multi-factor in dashboard.clerk.com.',
          );
        }
      } else if (result.status === 'needs_first_factor') {
        // Email verification code or first factor required
        const emailCodeFactor = result.supportedFirstFactors?.find(
          (f) => f.strategy === 'email_code',
        );

        if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setFactorStrategy('email_code');
          setFactorMessage('Your email requires verification. A code has been sent to your inbox.');
          setPendingFactor(true);
        } else {
          setError(
            'Email verification required. Please check your inbox or verify your account via sign up.',
          );
        }
      } else {
        setError(`Sign in incomplete (status: ${result.status}). Please check your Clerk dashboard settings.`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { errors?: Array<{ message: string }> })?.errors?.[0]?.message ||
            'Sign in failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFactor = async () => {
    if (!isLoaded || !signIn) return;
    if (!factorCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let completeResult;
      if (signIn.status === 'needs_second_factor') {
        if (factorStrategy === 'totp') {
          completeResult = await signIn.attemptSecondFactor({
            strategy: 'totp',
            code: factorCode.trim(),
          });
        } else if (factorStrategy === 'email_code') {
          completeResult = await signIn.attemptSecondFactor({
            strategy: 'email_code',
            code: factorCode.trim(),
          });
        } else {
          completeResult = await signIn.attemptSecondFactor({
            strategy: 'phone_code',
            code: factorCode.trim(),
          });
        }
      } else if (signIn.status === 'needs_first_factor') {
        completeResult = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: factorCode.trim(),
        });
      }

      if (completeResult?.status === 'complete' && completeResult.createdSessionId) {
        await completeAuthAndSync(completeResult.createdSessionId, completeResult.userData);
      } else {
        setError('Verification incomplete. Please verify the code and try again.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { errors?: Array<{ message: string }> })?.errors?.[0]?.message ||
            'Verification failed. Invalid code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / branding */}
        <View style={styles.branding}>
          <Text style={styles.emoji}>🛍️</Text>
          <Text style={Typography.h1}>Campus Marketplace</Text>
          <Text style={[Typography.caption, styles.tagline]}>
            Buy · Sell · Connect — on campus
          </Text>
        </View>

        {/* Login or 2FA card */}
        <ClayCard style={styles.card}>
          {pendingFactor ? (
            <>
              <Text style={[Typography.h2, styles.cardTitle]}>Two-Factor Verification</Text>
              <Text style={[Typography.caption, styles.cardSubtitle]}>
                {factorMessage || 'Enter the code to complete sign in'}
              </Text>

              <ClayInput
                label="Verification Code"
                value={factorCode}
                onChangeText={(text) => {
                  setFactorCode(text);
                  if (error) setError('');
                }}
                placeholder="123456"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                error={error}
                containerStyle={styles.field}
              />

              <ClayButton
                label="Verify & Sign In"
                onPress={handleVerifyFactor}
                loading={loading}
                style={styles.button}
              />

              <ClayButton
                label="Cancel"
                variant="ghost"
                onPress={() => {
                  setPendingFactor(false);
                  setFactorCode('');
                  setError('');
                }}
                style={styles.cancelButton}
              />
            </>
          ) : (
            <>
              <Text style={[Typography.h2, styles.cardTitle]}>Welcome back</Text>
              <Text style={[Typography.caption, styles.cardSubtitle]}>
                Sign in with your university account
              </Text>

              <ClayInput
                label="University Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                placeholder="student@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                containerStyle={styles.field}
              />

              <ClayInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="current-password"
                error={error}
                containerStyle={styles.field}
              />

              <ClayButton
                label="Sign In"
                onPress={handleSignIn}
                loading={loading}
                style={styles.button}
              />

              <View style={styles.footer}>
                <Text style={Typography.caption}>Don't have an account? </Text>
                <Link href="/(auth)/signup">
                  <Text style={styles.link}>Sign Up</Text>
                </Link>
              </View>
            </>
          )}
        </ClayCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xxxl,
    gap: Spacing.xl,
  },
  branding: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  tagline: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  card: {
    gap: Spacing.sm,
  },
  cardTitle: {
    marginBottom: 2,
  },
  cardSubtitle: {
    marginBottom: Spacing.sm,
  },
  field: {
    marginVertical: Spacing.xs,
  },
  button: {
    marginTop: Spacing.sm,
  },
  cancelButton: {
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  link: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
});
