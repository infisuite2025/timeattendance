import 'dart:math' as math;

import 'package:geolocator/geolocator.dart';

import 'models.dart';

class PunchFence {
  const PunchFence({
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.radiusMeters,
  });

  final String name;
  final double latitude;
  final double longitude;
  final double radiusMeters;
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
Future<GeoCapture> capturePunchLocation(List<PunchFence> fences) async {
  try {
    final serviceOn = await Geolocator.isLocationServiceEnabled();
    if (!serviceOn) return _assignedSite(fences);

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      return _assignedSite(fences);
    }

    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.medium,
      timeLimit: const Duration(seconds: 8),
    );
    PunchFence? nearest;
    var nearestDistance = double.infinity;
    for (final fence in fences) {
      final distance = haversineMeters(position.latitude, position.longitude, fence.latitude, fence.longitude);
      if (distance < nearestDistance) {
        nearest = fence;
        nearestDistance = distance;
      }
    }
    final inside = nearest != null && nearestDistance <= nearest.radiusMeters;
    final label = nearest == null
        ? 'Current location'
        : inside
            ? nearest.name
            : 'Outside ${nearest.name}';
    return GeoCapture(
      label: label,
      insideFence: inside,
      mockFlag: position.isMocked,
      source: 'gps',
      accuracyMeters: position.accuracy,
      latitude: position.latitude,
      longitude: position.longitude,
    );
  } catch (_) {
    return _assignedSite(fences);
  }
}

GeoCapture _assignedSite(List<PunchFence> fences) {
  final name = fences.isEmpty ? 'Location unavailable' : fences.first.name;
  return GeoCapture(
    label: name,
    insideFence: fences.isNotEmpty,
    mockFlag: false,
    source: 'assigned_site',
  );
}
