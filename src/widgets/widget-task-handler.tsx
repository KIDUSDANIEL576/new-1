import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TraceWidget } from './TraceWidget';

/**
 * Android calls this on the widget's update schedule (and when the app
 * requests a refresh). The snapshot URL is written by publishWidgetUrl()
 * after sign-in; before that the widget shows the wordmark placeholder.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  let url: string | null = null;
  try {
    url = await AsyncStorage.getItem('widgetSnapshotUrl');
  } catch {
    // fall through to placeholder
  }
  props.renderWidget(<TraceWidget imageUrl={url} />);
}
