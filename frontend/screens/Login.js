import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAppContext();
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (!email.includes('@')) {
      alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    login(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero area */}
        <View style={styles.hero}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          <Text style={styles.appName}>SmartPlate</Text>
          <Text style={styles.tagline}>Reduce food waste. Save money. Share more.</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

            <View style={styles.passwordRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
            />
          </View>

          <PrimaryButton title="Log In" onPress={handleLogin} style={styles.loginBtn} />
        </View>

        {/* Sign up link */}
        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* POPI Inlined */}
        <TouchableOpacity 
          style={styles.popiBtn}
          onPress={() => alert('POPI Act Compliance', 'We strictly adhere to the Protection of Personal Information Act (POPIA). Your data is encrypted, never sold to third parties, and only used to enhance your SmartPlate experience.')}
        >
          <Text style={styles.popiText}>POPI Inlined</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: SPACING.md,
    borderRadius: 20,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.medium,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.lg,
  },
  inputWrap: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMid,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textDark,
  },
  loginBtn: {
    marginTop: SPACING.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  demoBtn: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  demoBtnText: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: '600',
  },
  adminDemoBtn: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#B8860B',
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#FFFBEF',
    marginTop: SPACING.sm,
  },
  adminDemoBtnText: {
    fontSize: 14,
    color: '#8B6914',
    fontWeight: '600',
  },
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  signUpText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  signUpLink: {
    fontSize: 14,
    color: COLORS.primaryMed,
    fontWeight: '700',
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  forgotPassword: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  popiBtn: {
    marginTop: 'auto',
    padding: SPACING.md,
  },
  popiText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
