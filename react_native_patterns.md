# smartPlate: Web to React Native (Expo) Migration Guide

This prototype was built using React (Vite) to allow immediate previewing in the browser. 
To move this to **React Native (Expo)**, follow these patterns:

## 1. Components
Replace standard HTML tags with React Native equivalents:
- `<div>` → `<View>`
- `<span>`, `<p>`, `<h1>` → `<Text>`
- `<img>` → `<Image>`
- `<button>` → `<TouchableOpacity>` or `<Pressable>`
- `input` → `<TextInput>`

## 2. Styling (NativeWind)
You are using **NativeWind** (Tailwind for React Native).
- Most `className` props will work as is, but you may need to wrap components in `styled` if they are custom.
- Colors like `text-stone-900` and `bg-emerald-500` will work normally.
- Shadow classes (`shadow-lg`) behave differently on Android vs iOS. Use `shadow-black shadow-offset-[0,4] shadow-opacity-[0.1] shadow-radius-[10] elevation-5`.

## 3. Navigation
Instead of `react-router-dom`, use **Expo Router** or **React Navigation**.
- `App.tsx` tab bar logic should be moved to a `_layout.tsx` file in an `app/` directory (if using Expo Router).

## 4. State Management
- **Zustand**: Works exactly the same in React Native. Use `create`.
- **TanStack Query**: Works exactly the same. Ensure you use `NetInfo` or similar if you need to detect offline state.

## 5. Specific Features
- **Barcode Scanner**: Replace the mock simulator with `expo-camera`.
- **Maps**: Replace the SVG/Mock with `react-native-maps`.
- **Icons**: Use `@expo/vector-icons` or `lucide-react-native`.

## 6. Arch Linux (i3/Hyprland) environment
- To run on your phone: `npx expo start --tunnel` or `adb reverse tcp:3000 tcp:3000`.
- Ensure your backend uses `app.listen(3000, "0.0.0.0", ...)` to accept connections from your phone.
