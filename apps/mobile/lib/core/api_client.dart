import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Workspace API used by the phone. Override [host] with `--dart-define=API_HOST=...`.
String workspaceBaseUrl() {
  const host = String.fromEnvironment('API_HOST', defaultValue: '');
  const port = String.fromEnvironment('API_PORT', defaultValue: '4000');
  if (host.isNotEmpty) return 'http://$host:$port/api/v1';
  if (kIsWeb) return 'http://localhost:$port/api/v1';
  if (defaultTargetPlatform == TargetPlatform.android) {
    return 'http://127.0.0.1:$port/api/v1';
  }
  return 'http://localhost:$port/api/v1';
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
  String tenantId = 'ten_acme_001';

  Map<String, String> get _headers => {
        if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
        'x-tenant-id': tenantId,
      };

  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    final data = await _send('POST', '/auth/login', body: {'email': email, 'password': password});
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

  Future<dynamic> _send(String method, String path, {Map<String, dynamic>? query, Map<String, dynamic>? body}) async {
    final started = DateTime.now();
    appLog('-> $method $path');
    try {
      final response = await dio.request<dynamic>(
        path,
        data: body,
        queryParameters: query,
        options: Options(method: method, headers: _headers, validateStatus: (status) => status != null && status < 500),
      );
      final elapsed = DateTime.now().difference(started).inMilliseconds;
      final json = response.data;
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
