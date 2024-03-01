// Copyright 2019-2025 @polka-labs/townhall authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Action, ThunkAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, createTransform, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { profileStore } from './profile';
import { IProfileStore } from './profile/@types';

const ProfileTransform = createTransform<IProfileStore, IProfileStore>(
	// transform state on its way to being serialized and persisted.
	(inboundState) => {
		// Selectively persist only certain parts of the state
		return {
			...inboundState,
			error: null,
			loading: false,
		};
	},
	// transform state being rehydrated
	(outboundState) => {
		// Return what you want rehydrated

		return {
			...outboundState,
			error: null,
			loading: false,
			privy_loading: false,
		};
	},
	// define which reducer this transform gets called for.
	{ whitelist: ['profile'] }
);

export const makeStore = () => {
	const isServer = typeof window === 'undefined';
	const rootReducer = combineReducers({
		[profileStore.name]: profileStore.reducer,
	});

	if (isServer) {
		const store = configureStore({
			devTools: true,
			middleware: (getDefaultMiddleware) =>
				getDefaultMiddleware({
					immutableCheck: false,
					serializableCheck: false
				}),
			reducer: rootReducer
		});
		return store;
	} else {
		// we need it only on client side
		const persistConfig = {
			key: `bountybird${process.env.NEXT_PUBLIC_ENVIRONMENT? `_${process.env.NEXT_PUBLIC_ENVIRONMENT}`: ''}`,
			storage,
			transforms: [ProfileTransform],
			whitelist: [profileStore.name, ] // make sure it does not clash with server keys
		};
		const persistedReducer = persistReducer(persistConfig, rootReducer as any);
		const store: any = configureStore({
			devTools: process.env.NODE_ENV !== 'production',
			middleware: (getDefaultMiddleware) =>
				getDefaultMiddleware({
					immutableCheck: false,
					serializableCheck: {
						ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
					}
				}),
			reducer: persistedReducer
		});
		store.__persistor = persistStore(store); // Nasty hack
		return store;
	}
};

export type TAppStore = ReturnType<typeof makeStore>;
export type TAppState = ReturnType<TAppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  TAppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<TAppStore>(makeStore);