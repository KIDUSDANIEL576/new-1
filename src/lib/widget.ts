import { Platform } from 'react-native';
import { EDGE_FUNCTIONS, TABLES } from '@/lib/backend';
import { supabase } from '@/lib/supabase';

const APP_GROUP = 'group.com.digirafthub.trace';
const SNAPSHOT_URL_KEY = 'widgetSnapshotUrl';

/**
 * Debounced fire-and-forget: re-renders the couple's widget snapshot PNG
 * server-side. Called after stroke end / undo / clear.
 */
let snapTimer: ReturnType<typeof setTimeout> | null = null;
export function renderSnapshot(coupleId: string): void {
  if (snapTimer) clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    supabase.functions.invoke(EDGE_FUNCTIONS.renderSnapshot, { body: { coupleId } }).catch(() => {});
  }, 2500);
}

/** Returns the user's long-lived widget token, minting one on first use. */
async function ensureWidgetToken(userId: string): Promise<string | null> {
  try {
    const { data: existing } = await supabase
      .from(TABLES.widgetTokens)
      .select('token')
      .eq('user_id', userId)
      .maybeSingle();
    if (existing?.token) return existing.token;
    const Crypto = await import('expo-crypto');
    const token = `${Crypto.randomUUID()}${Crypto.randomUUID()}`.replace(/-/g, '');
    const { error } = await supabase.from(TABLES.widgetTokens).insert({ token, user_id: userId });
    return error ? null : token;
  } catch {
    return null;
  }
}

/**
 * Hands the snapshot URL to the native widgets (iOS app-group defaults /
 * Android AsyncStorage) and nudges them to refresh. Best-effort: quietly
 * no-ops in Expo Go or before the native modules exist.
 */
export async function publishWidgetUrl(userId: string): Promise<void> {
  const token = await ensureWidgetToken(userId);
  if (!token) return;
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/${EDGE_FUNCTIONS.widgetSnapshot}?token=${token}`;

  if (Platform.OS === 'ios') {
    try {
      const { ExtensionStorage } = await import('@bacons/apple-targets');
      const storage = new ExtensionStorage(APP_GROUP);
      storage.set(SNAPSHOT_URL_KEY, url);
      ExtensionStorage.reloadWidget();
    } catch {
      // Expo Go / web — widget arrives with the dev build
    }
  } else if (Platform.OS === 'android') {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem(SNAPSHOT_URL_KEY, url);
      const React = await import('react');
      const { requestWidgetUpdate } = await import('react-native-android-widget');
      const { TraceWidget } = await import('@/widgets/TraceWidget');
      requestWidgetUpdate({
        widgetName: 'Trace',
        renderWidget: () => React.createElement(TraceWidget, { imageUrl: url }),
        widgetNotFound: () => {},
      }).catch(() => {});
    } catch {
      // Expo Go / web — widget arrives with the dev build
    }
  }
}
