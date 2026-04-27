# SmartPlate — Food Waste Reduction App (Frontend)

A React Native frontend for a mobile app that helps users reduce food waste by tracking inventory, getting AI recipe suggestions, and donating surplus food.

---

## Tech Stack

- React Native 0.73 (JavaScript, no TypeScript)
- React Navigation v6 (Stack + Bottom Tabs)
- React Context API (local state management)
- Mock local data only — no backend

---

## Project Structure

```
frontend/
├── App.js                    # Root component
├── index.js                  # Entry point
├── package.json
├── context/
│   └── AppContext.js         # Global state (auth, inventory, donations)
├── navigation/
│   └── AppNavigator.js       # Auth stack + main tabs + detail screens
├── screens/
│   ├── Login.js
│   ├── SignUp.js
│   ├── Home.js               # Dashboard
│   ├── AddFood.js            # Add food item form
│   ├── AIInsightsDetails.js  # Expiring items detail view
│   ├── Inventory.js          # Food inventory list
│   ├── Recipes.js            # Recipe suggestions
│   ├── RecipeDetails.js      # Full recipe view
│   ├── Donations.js          # Donation hamper manager
│   └── Profile.js            # User profile & settings
├── components/               # Reusable UI components
├── data/
│   └── mockData.js           # All seed/mock data
├── styles/
│   └── theme.js              # Color palette, spacing, shadows
└── assets/                   # Static assets (icons, images)
```

---

## How to Run Locally (Android Studio)

### Prerequisites
- Node.js 18+
- Java 17
- Android Studio with an Android emulator (API 33+ recommended)
- React Native CLI (`npm install -g react-native-cli`)

### Steps

1. **Navigate into the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Metro bundler:**
   ```bash
   npm start
   ```

4. **In a new terminal, run on Android:**
   ```bash
   npm run android
   ```
   This will build and launch the app on your connected emulator or device.

---

## Demo Notes

- Use **"Continue as Demo User"** on the Login screen for instant access.
- All data is mocked locally — no backend or internet connection needed.
- Inventory, donations, and profile updates persist within the session.
- Expiry dates are set relative to **April 2026** to show expiring-soon alerts.

---

## Key App Flows

| From | Action | To |
|------|--------|----|
| Home | Add Food card | AddFood screen |
| Home | Donate Food card | Donations tab |
| Home | View Details (AI) | AIInsightsDetails screen |
| Inventory | Use Up | Recipes tab |
| Inventory | Donate | Donations tab |
| Recipes | Tap recipe card | RecipeDetails screen |
| RecipeDetails | Cooked It! | Returns to Recipes |
| Donations | Add button | DonationModal → Inventory or AddFood |
| Profile | Log Out | Login screen |

---

## Dependencies

```json
"@react-navigation/native": "^6.x",
"@react-navigation/stack": "^6.x",
"@react-navigation/bottom-tabs": "^6.x",
"react-native-screens": "^3.x",
"react-native-safe-area-context": "^4.x",
"react-native-gesture-handler": "^2.x",
"@react-native-masked-view/masked-view": "^0.3.x"
```
