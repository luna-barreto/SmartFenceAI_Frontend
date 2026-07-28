# Clerk Frontend Integration Design

**Date:** 2026-07-27  
**Status:** Approved

## Overview

Wire `@clerk/clerk-expo` into the existing Expo/React Native frontend. Clerk owns all authentication logic (sign-in, sign-out, session tokens, OAuth). The existing custom UI (LoginScreen, LoginScreen.web) and the `AuthContext` public interface remain unchanged so all downstream screens require zero edits.

## What Changes

| File | Change |
|------|--------|
| `App.tsx` | Wrap tree with `<ClerkProvider>` |
| `src/context/AuthContext.tsx` | Rewrite internals to use Clerk hooks; keep same public interface |
| `src/services/api.ts` | Axios interceptor reads token from `clerkTokenRef` instead of SecureStore |
| `src/services/socket.ts` | `conectarSocket` signature unchanged; token passed from AuthContext |
| `src/services/clerkTokenRef.ts` | **New** — module-level mutable ref holding Clerk's `getToken` fn |
| `src/screens/LoginScreen.tsx` | Wire `useOAuth` to Google/Apple buttons; email/password calls Clerk |
| `src/screens/LoginScreen.web.tsx` | Same changes as native variant |
| `.env` | **New** — `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` |

## Out of Scope

- Any UI/style changes to LoginScreen files
- Navigation structure changes
- Push notification token logic (unchanged)

## Package

Install: `@clerk/clerk-expo`

`expo-secure-store` is already installed — Clerk uses it as its token cache on native.

## Architecture

### ClerkProvider (App.tsx)

Wrap the entire provider tree. `tokenCache` uses `expo-secure-store` on native so Clerk persists sessions across app restarts. On web, omit `tokenCache` (Clerk handles web storage automatically).

```
ClerkProvider
  GestureHandlerRootView
    SafeAreaProvider
      ThemeProvider
        AuthProvider          ← uses Clerk hooks internally
          AnimalsProvider
            NotificationsProvider
              AppNavigator
              ToastNotificacion
```

### clerkTokenRef.ts (new)

The axios interceptor runs outside React — it cannot call hooks. This file exports a mutable ref that `AuthContext` writes Clerk's `getToken` into on mount, and the interceptor reads from it.

```typescript
export const clerkTokenRef: { getToken: (() => Promise<string | null>) | null } = {
  getToken: null,
};
```

### AuthContext rewrite

Same public interface (`usuario`, `cargando`, `iniciarSesion`, `cerrarSesion`, `actualizarUsuario`). Internals:

- `cargando` → `!isLoaded` from Clerk
- `usuario` built from `useUser().user` on sign-in (`user.id` = Clerk userId, `user.firstName`/`user.lastName`, `user.publicMetadata.rol`)
- `fincaId` fetched from backend via `FincaAPI` after authentication (same as before)
- On mount: writes `getToken` into `clerkTokenRef`, connects socket if user is already signed in
- `iniciarSesion` → `useSignIn().signIn.create({ identifier, password })` + `setActive`
- `cerrarSesion` → `useClerk().signOut()` + disconnect socket + clear AsyncStorage cache

### Axios interceptor (api.ts)

Replace `SecureStore.getItemAsync("sf_token")` with `clerkTokenRef.getToken?.()`. Response interceptor 401 handling stays the same (call `signOut` via the ref or just clear state).

### OAuth buttons (LoginScreen.tsx / LoginScreen.web.tsx)

Google button: `useOAuth({ strategy: "oauth_google" })` → `startOAuthFlow()`  
Apple button: `useOAuth({ strategy: "oauth_apple" })` → `startOAuthFlow()`

Both flows call `setActive({ session: createdSessionId })` on success. No UI changes — only the `onPress` handler changes.

### Socket

`conectarSocket` accepts a token string (unchanged). `AuthContext` calls `await getToken()` and passes it before connecting.

## Environment Variables

| Variable | Where |
|----------|-------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env` at project root |

Get the value from Clerk dashboard → API Keys → Publishable key (starts with `pk_test_` or `pk_live_`).
