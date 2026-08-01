import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { EDGE_FUNCTIONS, TABLES } from '@/lib/backend';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  // A buzz is the one notification that should make noise even with the app
  // open — that's the entire feature. Ordinary traces stay quiet.
  handleNotification: async (notification) => {
    const isBuzz = notification.request.content.data?.kind === 'buzz';
    return {
      shouldShowAlert: true,
      shouldPlaySound: isBuzz,
      shouldSetBadge: false,
    };
  },
});

/**
 * Registers for Expo push and stores the token so the notify-partner edge
 * function can reach this device. No-ops quietly on simulators/Expo Go,
 * where remote push isn't available.
 */
export async function registerPushToken(userId: string): Promise<void> {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('traces', {
        name: 'Traces',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#e23343',
      });
      // A buzz is meant to be felt, so it gets its own MAX-importance channel
      // with the ring sound and a long vibration. Separate from 'traces' so
      // someone can mute ordinary traces and still be reachable — or mute
      // buzzes and keep the quiet ones.
      await Notifications.setNotificationChannelAsync('buzz', {
        name: 'Buzz',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'buzz.wav',
        vibrationPattern: [0, 400, 200, 400, 200, 600],
        enableVibrate: true,
        lightColor: '#f4c66b',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    await supabase
      .from(TABLES.pushTokens)
      .upsert({ user_id: userId, token, updated_at: new Date().toISOString() });
  } catch {
    // Push is best-effort in Phase 1 — drawing must work without it.
  }
}

/** Fire-and-forget: asks the edge function to notify the partner (throttled server-side). */
export function notifyPartner(coupleId: string): void {
  supabase.functions.invoke(EDGE_FUNCTIONS.notifyPartner, { body: { coupleId } }).catch(() => {});
}

export interface BuzzResult {
  sent: boolean;
  /** Seconds until another buzz is allowed, when the server refused this one. */
  retryAfter?: number;
  reason?: string;
}

/**
 * Rings the partner's phone. The server owns the rate limit, so this reports
 * back what actually happened rather than assuming it worked.
 */
export async function buzzPartner(coupleId: string): Promise<BuzzResult> {
  try {
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.buzzPartner, {
      body: { coupleId },
    });
    if (error) return { sent: false, reason: 'offline' };
    if (data?.sent) return { sent: true };
    return { sent: false, retryAfter: data?.retryAfter, reason: data?.skipped };
  } catch {
    return { sent: false, reason: 'offline' };
  }
}
