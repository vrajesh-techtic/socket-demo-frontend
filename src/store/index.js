import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

const persistConfig = {
  key: "root",
  storage,
};

// const rootReducer = combineReducers({ user: userReducer });

const persistedReducer = persistReducer(persistConfig, userReducer);
// Load persisted state from storage, or use initial state if no persisted state found
const loadPersistedState = () => {
  try {
    const serializedState = storage.getItem("root");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const startState = loadPersistedState() || {
  user: {
    _id: "",
    email: "",
    name: "",
    lastSeen: null,
  },
  currUser: {
    convoId: "",
    email: "",
    name: "",
    receiverId: "",
  },
};

const store = configureStore({
  reducer: persistedReducer,
  preloadedState: startState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// const store = createStore(persistedReducer);

export const persistor = persistStore(store);

export default store;
