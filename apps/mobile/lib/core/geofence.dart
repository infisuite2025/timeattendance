import 'dart:math' as math;

import 'package:geolocator/geolocator.dart';

import 'models.dart';

class OfficeFence {
  static const name = 'Bangalore HQ';
  static const latitude = 12.9716;
  static const longitude = 77.5946;
  static const radiusMeters = 250.0;
}

double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
  const earth = 6371000.0;
  final dLat = _rad(lat2 - lat1);
  final dLon = _rad(lon2 - lon1);
  final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(_rad(lat1)) * math.cos(_rad(lat2)) * math.sin(dLon / 2) * math.sin(dLon / 2);
  return earth * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
}

double _rad(double deg) => deg * math.pi / 180;

/// Captures a punch location on device. If GPS is unavailable, the assigned
/// office site is used so clock-in still works on desktop and simulators.
Future<GeoCapture> capturePunchLocation() async {
  try {
    final serviceOn = await Geolocator.isLocationServiceEnabled();
    if (!serviceOn) return _assignedSite();

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      return _assignedSite();
    }

    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.medium,
      timeLimit: const Duration(seconds: 8),
    );
    final distance = haversineMeters(
      position.latitude,
      position.longitude,
      OfficeFence.latitude,
      OfficeFence.longitude,
    );
    final inside = distance <= OfficeFence.radiusMeters;
    return GeoCapture(
      label: inside ? OfficeFence.name : 'Outside ${OfficeFence.name}',
      insideFence: inside,
      mockFlag: position.isMocked,
      source: 'gps',
      accuracyMeters: position.accuracy,
      latitude: position.latitude,
      longitude: position.longitude,
    );
  } catch (_) {
    return _assignedSite();
  }
}

GeoCapture _assignedSite() {
  return const GeoCapture(
    label: OfficeFence.name,
    insideFence: true,
    mockFlag: false,
    source: 'assigned_site',
  );
}
