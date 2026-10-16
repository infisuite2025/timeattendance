import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import 'api_client.dart';

typedef PushHandler = void Function(String title, String body);

PushHandler? _onMessage;

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

class PushMessaging {
  static bool ready = false;

  static Future<void> start() async {
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) return;
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
      await FirebaseMessaging.instance.requestPermission(alert: true, badge: true, sound: true);
      await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(alert: true, badge: true, sound: true);
      FirebaseMessaging.onMessage.listen((message) {
        final title = message.notification?.title ?? message.data['title']?.toString() ?? 'InfiTimePro';
        final body = message.notification?.body ?? message.data['body']?.toString() ?? '';
        _onMessage?.call(title, body);
      });
      ready = true;
    } catch (error) {
      debugPrint('Firebase messaging did not start: $error');
    }
  }

  static void listen(PushHandler handler) {
    _onMessage = handler;
  }

  static Future<void> register(WorkspaceApi api) async {
    if (!ready || api.token == null || api.token!.isEmpty) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null || token.isEmpty) return;
      await api.post('/notifications/device', {
        'token': token,
        'platform': Platform.isIOS ? 'ios' : 'android',
      });
    } catch (error) {
      debugPrint('Push token was not saved: $error');
    }
  }
}
