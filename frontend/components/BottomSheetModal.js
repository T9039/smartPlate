import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../context/AppContext';
import { RADIUS, SHADOW, SPACING } from '../styles/theme';

export default function BottomSheetModal({ 
  visible, 
  onClose, 
  title, 
  children, 
  contentStyle 
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  
  // Slide animation for drag gesture
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Reset translation when modal opens
  React.useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1) {
          // Swipe down enough to close
          Animated.timing(slideAnim, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          // Snap back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              backgroundColor: C.surface, 
              paddingBottom: insets.bottom > 0 ? insets.bottom + SPACING.md : SPACING.xl,
              transform: [{ translateY: slideAnim }]
            },
            contentStyle
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Draggable Header */}
            <View {...panResponder.panHandlers} style={styles.dragHeader}>
              {/* Handle bar */}
              <View style={[styles.handle, { backgroundColor: C.border }]} />

              {/* Title */}
              {!!title && <Text style={[styles.title, { color: C.textDark }]}>{title}</Text>}
            </View>

            {/* Content */}
            {children}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    ...SHADOW.strong,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  dragHeader: {
    paddingVertical: SPACING.sm,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },
});
