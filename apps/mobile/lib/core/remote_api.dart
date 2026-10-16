import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

import 'api_config.dart';

String activeApiBaseUrl = apiBaseUrl;

/// Reads `app_config/mobile.apiBaseUrl` from Firestore.
/// The first successful open writes [apiBaseUrl] when that field is missing.
Future<void> loadRemoteApiBaseUrl() async {
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp();
    }
    final ref = FirebaseFirestore.instance.collection('app_config').doc('mobile');
    final snapshot = await ref.get();
    final stored = snapshot.data()?['apiBaseUrl']?.toString().trim() ?? '';
    if (stored.isNotEmpty) {
      activeApiBaseUrl = stored;
      return;
    }
    await ref.set({'apiBaseUrl': apiBaseUrl}, SetOptions(merge: true));
    activeApiBaseUrl = apiBaseUrl;
  } catch (error) {
    debugPrint('Firestore API address was not loaded: $error');
    activeApiBaseUrl = apiBaseUrl;
  }
}
