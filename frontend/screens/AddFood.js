import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';

const CATEGORY_EMOJIS = {
  Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Meat: '🍗',
  Pantry: '🥫', Snacks: '🍿', Beverages: '🧃', Leftovers: '🍱',
};

export default function AddFoodScreen({ navigation }) {
  const { addToInventory } = useAppContext();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pieces');
  const [price, setPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !category || !quantity || !expiryDate.trim()) {
      Alert.alert('Missing fields', 'Please fill in Name, Category, Quantity, and Expiry Date.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate.trim())) {
      Alert.alert('Invalid date', 'Please enter the date in YYYY-MM-DD format (e.g. 2026-05-10).');
      return;
    }

    addToInventory({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit: unit.trim() || 'pieces',
      price: Number(price) || 0,
      expiryDate: expiryDate.trim(),
      expiringSoon: false,
      emoji: CATEGORY_EMOJIS[category] || '🥗',
    });

    Alert.alert('Added! ✅', `${name.trim()} has been added to your inventory.`, [
      {
        text: 'Go to Inventory',
        onPress: () => navigation.navigate('Inventory'),
      },
      {
        text: 'Add Another',
        onPress: () => {
          setName(''); setCategory(''); setQuantity('');
          setUnit('pieces'); setPrice(''); setExpiryDate('');
        },
        style: 'cancel',
      },
    ]);
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Add Food Item"
        subtitle="Track a new item in your inventory"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Image placeholder */}
        <TouchableOpacity style={styles.imagePicker} activeOpacity={0.7}>
          <Text style={styles.imageEmoji}>📷</Text>
          <Text style={styles.imageLabel}>Add Pic (Optional)</Text>
          <Text style={styles.imageSub}>Tap to upload from gallery</Text>
        </TouchableOpacity>

        {/* Food Name */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Food Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ripe Tomatoes"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Category */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Category *</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput]}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !category && styles.placeholderText]}>
              {category ? `${CATEGORY_EMOJIS[category] || ''} ${category}` : 'Select a category'}
            </Text>
            <Text style={styles.selectChevron}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity and Price row */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldWrap, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Quantity *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={{ width: SPACING.md }} />
          <View style={[styles.fieldWrap, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Unit</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="pieces"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Price (R)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Expiry date */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Expiry Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="e.g. 2026-05-15"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <PrimaryButton title="Save to Inventory" onPress={handleAdd} style={styles.saveBtn} />
      </ScrollView>

      {/* Category picker modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.catOption, category === item && styles.catOptionActive]}
                  onPress={() => { setCategory(item); setCategoryModalVisible(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catEmoji}>{CATEGORY_EMOJIS[item] || '🥗'}</Text>
                  <Text style={[styles.catLabel, category === item && styles.catLabelActive]}>
                    {item}
                  </Text>
                  {category === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  imagePicker: {
    backgroundColor: COLORS.paleGreen,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.sage,
    borderStyle: 'dashed',
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  imageEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  imageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryMed,
    marginBottom: 4,
  },
  imageSub: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  fieldWrap: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMid,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textDark,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: COLORS.textDark,
    flex: 1,
  },
  placeholderText: { color: COLORS.textMuted },
  selectChevron: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  rowFields: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  saveBtn: { marginTop: SPACING.sm },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    ...SHADOW.strong,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalClose: { fontSize: 18, color: COLORS.textLight },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: SPACING.md,
  },
  catOptionActive: {
    backgroundColor: COLORS.paleGreen,
  },
  catEmoji: { fontSize: 22 },
  catLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  catLabelActive: {
    color: COLORS.primaryMed,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.primaryMed,
    fontWeight: '700',
  },
});
