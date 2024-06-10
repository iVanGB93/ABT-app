import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { authReducer } from './authSlice';
import { clientReducer } from './clientSlice';
import { settingReducer } from './settingSlice';
import { jobReducer } from './jobSlice';


const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'],
};

const rootReducer = combineReducers({
  settings: settingReducer,
  auth: authReducer,
  client: clientReducer,
  job: jobReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch as () => AppDispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const persistor = persistStore(store);