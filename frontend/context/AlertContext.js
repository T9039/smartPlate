/**
 * AlertContext.js
 * Global custom alert + toast system.
 *
 * Usage:
 *   const { alert, toast } = useAlert();
 *
 *   // Confirmation / info modal (drop-in for Alert.alert)
 *   alert('Title', 'Message', [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'Delete', style: 'destructive', onPress: () => {} },
 *   ]);
 *
 *   // Auto-dismiss toast
 *   toast('Saved!', 'success');  // 'success' | 'error' | 'info' | 'warning'
 */

import React, {
  createContext, useContext, useState, useRef, useCallback,
} from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Animated, Dimensions, Platform, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW, SPACING } from '../styles/theme';

const AlertContext = createContext(null);

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Toast colours ────────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: { bg: '#1B4332', icon: 'checkmark-circle', text: '#fff' },
  error:   { bg: '#C0392B', icon: 'close-circle', text: '#fff' },
  warning: { bg: '#C96A12', icon: 'warning', text: '#fff' },
  info:    { bg: '#2471A3', icon: 'information-circle',  text: '#fff' },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AlertProvider({ children }) {
  const insets = useSafeAreaInsets();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '', message: '', buttons: [],
  });

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: '', type: 'success' });
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const toastTimer = useRef(null);

  // Modal slide animation
  const slideAnim = useRef(new Animated.Value(300)).current;

  const showModal = (config) => {
    setModalConfig(config);
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 65, friction: 10,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300, duration: 220, useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const attemptDismiss = () => {
    const cancelBtn = modalConfig.buttons.find((b) => b.style === 'cancel');
    if (cancelBtn) handleButtonPress(cancelBtn);
    else {
      // Bounce back if no cancel button exists (forced action)
      Animated.spring(slideAnim, {
        toValue: 0, useNativeDriver: true, tension: 65, friction: 10,
      }).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          attemptDismiss();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0, useNativeDriver: true, tension: 65, friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // Public API: alert(title, message, buttons?)
  const alert = useCallback((title, message = '', buttons = [{ text: 'OK' }]) => {
    showModal({ title, message, buttons });
  }, []);

  // Public API: toast(message, type?)
  const toast = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastConfig({ message, type });
    setToastVisible(true);
    Animated.spring(toastAnim, {
      toValue: 0, useNativeDriver: true, tension: 70, friction: 10,
    }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -120, duration: 300, useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, 2800);
  }, []);

  const handleButtonPress = (btn) => {
    hideModal();
    if (btn.onPress) setTimeout(btn.onPress, 250);
  };

  const tc = TOAST_CONFIG[toastConfig.type] || TOAST_CONFIG.success;

  return (
    <AlertContext.Provider value={{ alert, toast }}>
      {children}

      {/* ── Toast ── */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: tc.bg, top: insets.top + 12 },
            { transform: [{ translateY: toastAnim }] },
          ]}
          pointerEvents="none"
        >
          <Ionicons name={tc.icon} size={18} color={tc.text} />
          <Text style={[styles.toastText, { color: tc.text }]}>{toastConfig.message}</Text>
        </Animated.View>
      )}

      {/* ── Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={hideModal}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={attemptDismiss}
        >
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.sheet, 
              { 
                transform: [{ translateY: slideAnim }],
                paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : SPACING.xl
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Title */}
              <Text style={styles.title}>{modalConfig.title}</Text>

              {/* Message */}
              {!!modalConfig.message && (
                <Text style={styles.message}>{modalConfig.message}</Text>
              )}

              {/* Buttons */}
              <View style={styles.buttonsWrap}>
                {modalConfig.buttons.map((btn, idx) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel     = btn.style === 'cancel';
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.btn,
                        isDestructive && styles.btnDestructive,
                        isCancel      && styles.btnCancel,
                        !isDestructive && !isCancel && styles.btnDefault,
                      ]}
                      activeOpacity={0.82}
                      onPress={() => handleButtonPress(btn)}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          isDestructive && styles.btnTextDestructive,
                          isCancel      && styles.btnTextCancel,
                          !isDestructive && !isCancel && styles.btnTextDefault,
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used inside AlertProvider');
  return ctx;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Toast
  toast: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    ...SHADOW.strong,
  },
  toastText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },

  // Bottom sheet card
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    ...SHADOW.strong,
  },

  // Handle bar
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },

  // Title
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },

  // Message
  message: {
    fontSize: 14,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.xl,
  },

  // Buttons
  buttonsWrap: {
    gap: SPACING.sm,
  },
  btn: {
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDefault: {
    backgroundColor: COLORS.primary,
  },
  btnDestructive: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  btnCancel: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  btnTextDefault:     { color: '#fff' },
  btnTextDestructive: { color: '#C0392B' },
  btnTextCancel:      { color: COLORS.textMid },
});
