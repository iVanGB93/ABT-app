import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { authReducer } from './authSlice';
import { clientReducer } from './clientSlice';
import { settingReducer } from './settingSlice';
import { jobReducer } from './jobSlice';
import { itemReducer } from './itemSlice';
import { businessReducer } from './businessSlice';

// SecureStore only allows alphanumeric, ".", "-", "_" — redux-persist uses "persist:key" which contains ":"
const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9._-]/g, '_');

// SecureStore adapter for redux-persist (keeps auth tokens encrypted on-device)
const secureStorage = {
  setItem: (key: string, value: string) => SecureStore.setItemAsync(sanitizeKey(key), value),
  getItem: (key: string) => SecureStore.getItemAsync(sanitizeKey(key)),
  removeItem: (key: string) => SecureStore.deleteItemAsync(sanitizeKey(key)),
};

// Auth state is persisted to SecureStore (encrypted) instead of unencrypted AsyncStorage
const authPersistConfig = {
  key: 'auth',
  storage: secureStorage,
};

// Non-sensitive UI settings (theme, color) can stay in AsyncStorage
const settingsPersistConfig = {
  key: 'settings',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  settings: persistReducer(settingsPersistConfig, settingReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  business: businessReducer,
  client: clientReducer,
  job: jobReducer,
  item: itemReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch as () => AppDispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const persistor = persistStore(store);
export default store;