// Trace Forever — $29.99, one time, unlocks both partners.
//
// RevenueCat handles the store transaction; it does NOT decide who is unlocked.
// On purchase RevenueCat calls the `revenuecat-webhook` edge function, which
// writes the entitlement against the buyer's COUPLE. Both phones (and the web
// app) then see it via my_status(). That indirection is why one purchase can
// unlock two accounts, and why a jailbroken client can't unlock itself.
//
// The native module is loaded lazily so the app still runs in Expo Go and in
// any build made before this dependency existed — purchases are simply
// unavailable there instead of crashing on import.

import { Platform } from 'react-native';

export const PRODUCT_ID = 'trace_forever';
export const ENTITLEMENT_ID = 'trace_forever';
export const PRICE_FALLBACK = '$29.99';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

type PurchasesModule = typeof import('react-native-purchases').default;

let cached: PurchasesModule | null = null;
let configured = false;

/** Resolves null when the native module or the API key isn't available. */
async function getPurchases(): Promise<PurchasesModule | null> {
  const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!key) return null;
  if (cached) return cached;
  try {
    const mod = await import('react-native-purchases');
    cached = mod.default;
    return cached;
  } catch {
    return null; // Expo Go, or a build without the SDK linked
  }
}

/** Call once the Supabase user id is known — it becomes the RevenueCat app user id. */
export async function configureIap(userId: string): Promise<boolean> {
  const Purchases = await getPurchases();
  if (!Purchases) return false;
  const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  try {
    if (!configured) {
      await Purchases.configure({ apiKey: key, appUserID: userId });
      configured = true;
    } else {
      await Purchases.logIn(userId);
    }
    return true;
  } catch {
    return false;
  }
}

export const isPurchaseAvailable = async () => (await getPurchases()) !== null;

/** Store-localized price, so we never show USD to someone paying in birr. */
export async function getPrice(): Promise<string> {
  const Purchases = await getPurchases();
  if (!Purchases) return PRICE_FALLBACK;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    return pkg?.product?.priceString ?? PRICE_FALLBACK;
  } catch {
    return PRICE_FALLBACK;
  }
}

export type PurchaseResult =
  | { ok: true }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; message: string };

export async function buyForever(): Promise<PurchaseResult> {
  const Purchases = await getPurchases();
  if (!Purchases) {
    return { ok: false, cancelled: false, message: 'Purchases are not available in this build yet.' };
  }
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) {
      return { ok: false, cancelled: false, message: 'Trace Forever is not on sale yet — try again shortly.' };
    }
    await Purchases.purchasePackage(pkg);
    return { ok: true };
  } catch (e) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err?.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, cancelled: false, message: err?.message ?? 'That purchase did not go through.' };
  }
}

/** For "I already bought this" — e.g. a reinstall, or the partner's device. */
export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getPurchases();
  if (!Purchases) return false;
  try {
    const info = await Purchases.restorePurchases();
    return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}
