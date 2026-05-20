import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {appSliceThunk, searchResultThunk} from './SliceThunks/utils';
import {authSliceReducer} from './SliceThunks/userSliceThunks';
import { api } from './Services/api';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from "redux-persist";
import {cartSliceReducer} from './SliceThunks/cartSliceThunks';
import orderSlice from './SliceThunks/orderSliceThunks';
import middleware from './Services/middleware';
import {createStateSyncMiddleware, initMessageListener, initStateWithPrevTab} from 'redux-state-sync';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'order'],
}

const combinedReducer = combineReducers({
  searchResult: searchResultThunk,
  cart: cartSliceReducer,
  order: orderSlice,
  app: appSliceThunk,
  auth: authSliceReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    })
    .prepend(middleware)
    .concat(createStateSyncMiddleware({
      predicate: (action) => {
        if (action.type.startsWith('@@')) return false;
        if (action.type.startsWith('persist/')) return false;
        if (action.type.includes('executeQuery') || action.type.includes('executeMutation')) return false;
        const allowedPrefixes = ['order/', 'cart/', 'auth/', 'app/'];
        const isAllowedFeature = allowedPrefixes.some((prefix) => action.type.startsWith(prefix));
        return isAllowedFeature;
      }
    }))
    .concat(api.middleware),
});

initStateWithPrevTab(store);

setupListeners(store.dispatch);
initMessageListener(store);


export const persistor = persistStore(store);