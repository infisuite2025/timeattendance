/// Used only the first time Firestore has no saved address.
/// After that, the app reads `app_config/mobile` → `apiBaseUrl`.
const String apiBaseUrl = 'http://192.168.1.11:4000/api/v1';
