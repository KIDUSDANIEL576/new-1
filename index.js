import { Platform } from 'react-native';
import 'expo-router/entry';

// Android widgets render from JS: register the task handler at app entry.
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widgets/widget-task-handler');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch {
    // Expo Go — native widget module arrives with the dev build
  }
}
