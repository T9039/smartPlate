import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import { CATEGORIES, CATEGORY_ICONS } from '../data/mockData';
import { getFoodIcon } from '../data/foodDictionary';
import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import BottomSheetModal from '../components/BottomSheetModal';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';


export default function AddFoodScreen({ navigation }) {
  const { addToInventory } = useAppContext();
  const { alert, toast } = useAlert();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pieces');
  const [price, setPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());
  const [brand, setBrand] = useState('');
  const [packaging, setPackaging] = useState('None');
  const [ecoscore, setEcoscore] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  const scrollRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Barcode scanning state
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        alert('Permission required', 'We need your permission to show the camera');
        return;
      }
    }
    setScannerVisible(true);
    setIsScanning(false);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (isScanning) return; // Prevent multiple scans
    setIsScanning(true);
    setScannerVisible(false);
    
    toast('Searching database...', 'info');
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();
      
      if (result.status === 1 && result.product) {
        const product = result.product;
        // Set name
        if (product.product_name) {
          setName(product.product_name);
        }
        
        // Attempt to parse category
        if (product.categories) {
          const lowerCats = product.categories.toLowerCase();
          if (lowerCats.includes('dairy') || lowerCats.includes('milk') || lowerCats.includes('cheese')) setCategory('Dairy');
          else if (lowerCats.includes('meat') || lowerCats.includes('chicken') || lowerCats.includes('beef')) setCategory('Meat');
          else if (lowerCats.includes('fruit') || lowerCats.includes('vegetable')) setCategory('Produce');
          else if (lowerCats.includes('beverage') || lowerCats.includes('drink')) setCategory('Beverages');
          else if (lowerCats.includes('bakery') || lowerCats.includes('bread')) setCategory('Bakery');
          else setCategory('Pantry');
        } else {
          setCategory('Pantry'); // Default fallback
        }
        
        if (product.brands) setBrand(product.brands.split(',')[0]);
        if (product.image_front_url) setImageUrl(product.image_front_url);
        if (product.ecoscore_grade) setEcoscore(product.ecoscore_grade.toUpperCase());
        
        if (product.packaging) {
          const p = product.packaging.toLowerCase();
          if (p.includes('plastic')) setPackaging('Plastic');
          else if (p.includes('glass')) setPackaging('Glass');
          else if (p.includes('paper') || p.includes('cardboard') || p.includes('carton')) setPackaging('Paper');
          else if (p.includes('metal') || p.includes('tin') || p.includes('can')) setPackaging('Metal');
          else setPackaging('Other');
        }
        
        toast(`Found: ${product.product_name}`, 'success');
      } else {
        toast('Product not found in database.', 'warning');
      }
    } catch (error) {
      console.error(error);
      toast('Failed to fetch product data.', 'error');
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Auto-format date as user types: insert dashes at positions 4 and 7
  const handleDateChange = (text) => {
    // Strip non-numeric
    const digits = text.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    }
    if (digits.length > 6) {
      formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6, 8);
    }
    setExpiryDate(formatted);
  };

  const onDateSelected = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateObj(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setExpiryDate(`${year}-${month}-${day}`);
    }
  };

  // Scroll so the focused input is visible above the keyboard
  const handleFocus = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: event.nativeEvent.target,
        animated: true,
      });
      // Use the safer scrollIntoView-style approach via measureInWindow
      event.target?.measureInWindow?.((x, y) => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ y: y - 120, animated: true });
        }
      });
    }
  };

  const handleAdd = () => {
    if (!name.trim() || !category || !quantity || !expiryDate.trim()) {
      alert('Missing fields', 'Please fill in Name, Category, Quantity, and Expiry Date.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate.trim())) {
      alert('Invalid date', 'Please enter the date in YYYY-MM-DD format (e.g. 2026-05-10).');
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
      emoji: getFoodIcon(name, category),
      image_url: imageUrl,
      brand: brand.trim(),
      packaging,
      ecoscore
    });

    toast(`${name.trim()} added to inventory ✅`, 'success');
    alert('Item added!', `${name.trim()} has been added to your inventory.`, [
      { text: 'Go to Inventory', onPress: () => navigation.navigate('Inventory') },
      {
        text: 'Add Another',
        style: 'cancel',
        onPress: () => {
          setName(''); setCategory(''); setQuantity('');
          setUnit('pieces'); setPrice(''); setExpiryDate('');
          setBrand(''); setPackaging('None'); setImageUrl(null); setEcoscore('');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <AppHeader
        title="Add Food Item"
        subtitle="Track a new item in your inventory"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Camera / Barcode Options */}
        <View style={styles.imageActionRow}>
          <TouchableOpacity 
            style={[styles.imagePicker, { flex: 1, marginRight: SPACING.sm, overflow: 'hidden' }, imageUrl && { padding: 0, borderWidth: 0 }]} 
            activeOpacity={0.7}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={32} color={COLORS.primaryMed} style={{ marginBottom: SPACING.sm }} />
                <Text style={styles.imageLabel}>Add Pic</Text>
                <Text style={styles.imageSub}>(Optional)</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.imagePicker, { flex: 1, marginLeft: SPACING.sm, borderColor: COLORS.primary }]} 
            activeOpacity={0.7}
            onPress={openScanner}
          >
            <Ionicons name="barcode-outline" size={32} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
            <Text style={[styles.imageLabel, { color: COLORS.primary }]}>Scan Barcode</Text>
            <Text style={styles.imageSub}>Auto-fill details</Text>
          </TouchableOpacity>
        </View>

        {/* Food Name */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Food Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ripe Tomatoes"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="next"
            onFocus={handleFocus}
          />
        </View>

        {/* Brand */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Brand (Optional)</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Koo, Bakers"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="next"
            onFocus={handleFocus}
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
              {category ? `${category}` : 'Select a category'}
            </Text>
            <Text style={styles.selectChevron}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity and Unit row */}
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
              returnKeyType="next"
              onFocus={handleFocus}
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
              returnKeyType="next"
              onFocus={handleFocus}
            />
          </View>
        </View>

        {/* Price */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Price (R)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onFocus={handleFocus}
          />
        </View>

        {/* Packaging Type */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Packaging Type</Text>
          <View style={styles.rowFields}>
            {['None', 'Plastic', 'Glass', 'Paper', 'Metal'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.pkgOption, packaging === p && styles.pkgOptionActive]}
                onPress={() => setPackaging(p)}
              >
                <Text style={[styles.pkgText, packaging === p && styles.pkgTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Expiry date — auto-formatted */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Expiry Date *</Text>
          <View style={styles.dateInputWrap}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={expiryDate}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="done"
              onFocus={handleFocus}
            />
            <TouchableOpacity 
              style={styles.dateBadge} 
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primaryMed} />
            </TouchableOpacity>
          </View>
          <Text style={styles.dateHint}>Enter digits — dashes are added automatically</Text>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            onChange={onDateSelected}
          />
        )}

        <PrimaryButton title="Save to Inventory" onPress={handleAdd} style={styles.saveBtn} />

        {/* Extra bottom padding while keyboard is visible */}
        {keyboardVisible && <View style={{ height: SPACING.xxl }} />}
      </ScrollView>

      {/* Category picker modal */}
      <BottomSheetModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        title="Select Category"
      >
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.catOption, category === item && styles.catOptionActive]}
                  onPress={() => { setCategory(item); setCategoryModalVisible(false); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={CATEGORY_ICONS[item] || 'nutrition-outline'} size={24} color={COLORS.primaryMed} />
                  <Text style={[styles.catLabel, category === item && styles.catLabelActive]}>
                    {item}
                  </Text>
                  {category === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
      </BottomSheetModal>

      {/* Barcode Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Scan Product Barcode</Text>
            <TouchableOpacity onPress={() => setScannerVisible(false)}>
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"],
              }}
              onBarcodeScanned={handleBarCodeScanned}
            />
            
            {/* Scanner overlay guide */}
            <View style={{ width: 250, height: 150, borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent', borderRadius: 10 }} />
            <Text style={{ color: '#fff', marginTop: 20, fontSize: 14 }}>Center the barcode inside the box</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  imageActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    height: 120,
  },
  imagePicker: {
    backgroundColor: COLORS.paleGreen,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.sage,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  // Date field
  dateInputWrap: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 48,
  },
  dateBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    bottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    backgroundColor: COLORS.paleGreen,
    borderRadius: RADIUS.sm,
  },
  dateHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    paddingLeft: 2,
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
  pkgOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  pkgOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pkgText: {
    fontSize: 12,
    color: COLORS.textMid,
  },
  pkgTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
