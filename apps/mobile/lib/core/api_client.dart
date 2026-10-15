import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Live InfiTimePro API. Same host as the web app at attendance.digixlabs.io.
///
/// Override for a local API with `--dart-define=API_BASE_URL=http://127.0.0.1:4000/api/v1`
/// or `--dart-define=API_HOST=127.0.0.1`.
const String liveWorkspaceBaseUrl = 'https://attendance.digixlabs.io/api/v1';

String workspaceBaseUrl() {
  const explicit = String.fromEnvironment('API_BASE_URL', defaultValue: '');
  if (explicit.isNotEmpty) return explicit;
  const host = String.fromEnvironment('API_HOST', defaultValue: '');
  if (host.isNotEmpty) {
    const port = String.fromEnvironment('API_PORT', defaultValue: '4000');
    return 'http://$host:$port/api/v1';
  }
  return liveWorkspaceBaseUrl;
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

void appLog(String message) {
  debugPrint('[InfiTimePro] $message');
}

class WorkspaceApi {
  WorkspaceApi({Dio? dio, String? baseUrl})
      : dio = dio ??
            Dio(BaseOptions(
              baseUrl: baseUrl ?? workspaceBaseUrl(),
              connectTimeout: const Duration(seconds: 8),
              receiveTimeout: const Duration(seconds: 12),
              headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            ));

  final Dio dio;
  String? token;
  String? refreshToken;
  String tenantId = 'ten_acme_001';

  /// Called after a silent refresh so the app can store the new tokens.
  void Function()? onSessionRefreshed;

  Future<bool>? _refreshing;

  Map<String, String> _headers({required bool authenticated}) => {
        if (authenticated && token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
        'x-tenant-id': tenantId,
      };

  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    // A saved access token must not ride along. An expired bearer makes the
    // server reject the login itself, and the user can never sign in again.
    final data = await _send(
      'POST',
      '/auth/login',
      body: {'email': email, 'password': password},
      authenticated: false,
      retry: false,
    );
    if (data is! Map) throw ApiException('The workspace did not return a session.');
    return Map<String, dynamic>.from(data);
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) {
    return _send('GET', path, query: query);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) {
    return _send('POST', path, body: body);
  }

  Future<dynamic> patch(String path, [Map<String, dynamic>? body]) {
    return _send('PATCH', path, body: body ?? {});
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? query,
    Map<String, dynamic>? body,
    bool authenticated = true,
    bool retry = true,
  }) async {
    final started = DateTime.now();
    appLog('-> $method $path');
    try {
      final response = await dio.request<dynamic>(
        path,
        data: body,
        queryParameters: query,
        options: Options(
          method: method,
          headers: _headers(authenticated: authenticated),
          validateStatus: (status) => status != null && status < 500,
        ),
      );
      final elapsed = DateTime.now().difference(started).inMilliseconds;
      final json = response.data;
      if ((response.statusCode ?? 500) == 401) {
        appLog('<- $method $path 401 ${elapsed}ms UNAUTHORIZED');
        if (retry && path != '/auth/login' && path != '/auth/refresh' && await _refreshSession()) {
          return _send(method, path, query: query, body: body, authenticated: authenticated, retry: false);
        }
        final serverMessage = _serverMessage(json);
        if (path == '/auth/login') {
          throw ApiException(serverMessage ?? 'Invalid email or password.');
        }
        throw ApiException(serverMessage ?? 'Your workspace session expired. Sign in again.');
      }
      if (json is Map && json['success'] == false) {
        final error = json['error'];
        final message = error is Map ? error['message']?.toString() : null;
        appLog('<- $method $path ${response.statusCode} ${elapsed}ms FAILED ${message ?? 'rejected'}');
        throw ApiException(message ?? 'The workspace rejected this request.');
      }
      if ((response.statusCode ?? 500) >= 400) {
        appLog('<- $method $path ${response.statusCode} ${elapsed}ms FAILED');
        throw ApiException('Workspace request failed (${response.statusCode}).');
      }
      final data = json is Map && json.containsKey('data') ? json['data'] : json;
      final size = data is List ? ' count=${data.length}' : '';
      appLog('<- $method $path ${response.statusCode} ${elapsed}ms$size');
      return data;
    } on DioException catch (error) {
      final message = _networkMessage(error);
      appLog('xx $method $path FAILED $message');
      throw ApiException(message);
    }
  }

  String? _serverMessage(dynamic json) {
    if (json is Map && json['error'] is Map) {
      final message = json['error']['message']?.toString();
      if (message != null && message.isNotEmpty) return message;
    }
    return null;
  }

  Future<bool> _refreshSession() {
    final inFlight = _refreshing;
    if (inFlight != null) return inFlight;
    final run = _refreshSessionOnce();
    _refreshing = run;
    return run.whenComplete(() => _refreshing = null);
  }

  Future<bool> _refreshSessionOnce() async {
    final currentRefresh = refreshToken;
    if (currentRefresh == null || currentRefresh.isEmpty) return false;
    try {
      final data = await _send(
        'POST',
        '/auth/refresh',
        body: {'refreshToken': currentRefresh},
        authenticated: false,
        retry: false,
      );
      if (data is! Map || data['token'] == null) return false;
      token = data['token'].toString();
      final nextRefresh = data['refreshToken']?.toString();
      if (nextRefresh != null && nextRefresh.isNotEmpty) refreshToken = nextRefresh;
      onSessionRefreshed?.call();
      appLog('session refreshed');
      return true;
    } catch (error) {
      appLog('session refresh FAILED $error');
      return false;
    }
  }

  String _networkMessage(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout || error.type == DioExceptionType.receiveTimeout) {
      return 'The workspace took too long to answer.';
    }
    if (error.type == DioExceptionType.connectionError) {
      return 'The phone cannot reach the workspace at ${dio.options.baseUrl}.';
    }
    return 'The workspace could not be reached.';
  }
}
