import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../lib/api';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import PrimaryButton from '../components/PrimaryButton';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email address');
    setIsLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setStep(2);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) return Alert.alert('Error', 'Please enter the code and a new password');
    setIsLoading(true);
    try {
      await api.resetPassword(email.trim(), code.trim(), newPassword);
      Alert.alert('Success', 'Password has been reset successfully!', [
        { text: 'Log In', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? "Enter your email and we'll send you a 6-digit reset code." : "Enter the code sent to your email and your new password."}
          </Text>
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <PrimaryButton
              title={isLoading ? "Sending..." : "Send Reset Code"}
              onPress={handleSendCode}
              disabled={isLoading}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="6-Digit Reset Code"
                placeholderTextColor={COLORS.textMuted}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={COLORS.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <PrimaryButton
              title={isLoading ? "Resetting..." : "Set New Password"}
              onPress={handleResetPassword}
              disabled={isLoading}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: SPACING.xl, paddingTop: 60 },
  backBtn: { alignSelf: 'flex-start', padding: SPACING.sm, marginLeft: -SPACING.sm, marginBottom: SPACING.lg },
  header: { marginBottom: SPACING.xxl },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textDark, marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.textMid, lineHeight: 24 },
  form: { flex: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.soft,
  },
  inputIcon: { marginRight: SPACING.md },
  input: { flex: 1, height: 50, fontSize: 16, color: COLORS.textDark },
});
