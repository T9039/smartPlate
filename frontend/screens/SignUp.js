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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';

export default function SignUpScreen({ navigation }) {
  const { register } = useAppContext();
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popiAccepted, setPopiAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (!popiAccepted) {
      alert('Required', 'You must accept the POPIA data policy to create an account.');
      return;
    }
    if (!email.includes('@')) {
      alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match', 'Please make sure your passwords match.');
      return;
    }
    register(fullName.trim(), email.trim(), password);
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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>SmartPlate</Text>
          <Text style={styles.tagline}>Join thousands reducing food waste at home.</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create account</Text>

          {[
            { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Jane Doe', secure: false, keyboard: 'default' },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'you@email.com', secure: false, keyboard: 'email-address' },
            { label: 'Password', value: password, setter: setPassword, placeholder: 'Min. 6 characters', secure: true, keyboard: 'default', toggleable: true },
            { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Repeat password', secure: true, keyboard: 'default', toggleable: true },
          ].map((field) => (
            <View key={field.label} style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              {field.toggleable ? (
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                    keyboardType={field.keyboard}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={field.secure}
                  keyboardType={field.keyboard}
                  autoCapitalize={field.keyboard === 'email-address' || field.secure ? 'none' : 'words'}
                  autoCorrect={false}
                />
              )}
            </View>
          ))}

          {/* POPIA Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setPopiAccepted(!popiAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, popiAccepted && styles.checkboxChecked]}>
              {popiAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>I agree to the POPIA Data Policy</Text>
          </TouchableOpacity>

          <PrimaryButton title="Create Account" onPress={handleSignUp} style={styles.signUpBtn} />
        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* POPI ACT */}
        <TouchableOpacity 
          style={styles.popiBtn}
          onPress={() => alert('POPI Act Compliance', 'We strictly adhere to the Protection of Personal Information Act (POPIA). Your data is encrypted, never sold to third parties, and only used to enhance your SmartPlate experience.')}
        >
          <Text style={styles.popiText}>POPI ACT</Text>
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
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.medium,
  },
  logoEmoji: { fontSize: 32 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
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
  inputWrap: { marginBottom: SPACING.md },
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
  signUpBtn: { marginTop: SPACING.md },
  loginRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  loginText: { fontSize: 14, color: COLORS.textLight },
  loginLink: { fontSize: 14, color: COLORS.primaryMed, fontWeight: '700' },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  popiBtn: {
    marginTop: 'auto',
    padding: SPACING.lg,
  },
  popiText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMid,
    textDecorationLine: 'underline',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textDark,
  },
  eyeIcon: {
    padding: SPACING.sm,
    marginRight: 4,
  },
});
