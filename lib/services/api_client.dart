import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/app_constants.dart';
import '../core/exceptions/app_exceptions.dart';

typedef TokenProvider = Future<String?> Function();

typedef ResponseMiddleware =
    Future<http.Response> Function(http.Response response);

typedef RequestMiddleware =
    Future<http.BaseRequest> Function(http.BaseRequest request);

/// HTTP client with middleware support for API communication
/// Implements proper resource management and error handling
class ApiClient {
  final String baseUrl;
  final TokenProvider getToken;
  final http.Client _client;

  final List<RequestMiddleware> _requestMiddleware = [];
  final List<ResponseMiddleware> _responseMiddleware = [];

  /// Constructor with dependency injection
  ApiClient({
    required this.baseUrl,
    required this.getToken,
    http.Client? client,
  }) : _client = client ?? http.Client();

  /// Add request middleware for intercepting requests
  void addRequestMiddleware(RequestMiddleware middleware) {
    _requestMiddleware.add(middleware);
  }

  /// Add response middleware for intercepting responses
  void addResponseMiddleware(ResponseMiddleware middleware) {
    _responseMiddleware.add(middleware);
  }

  /// Perform HTTP request with middleware chain
  Future<http.Response> request(
    String method,
    String path, {
    Map<String, String>? headers,
    Object? body,
    bool auth = false,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$path');
      final request = http.Request(method, uri);

      _setupHeaders(request, headers, auth);
      _setupBody(request, body);

      http.BaseRequest finalRequest = request;
      for (final middleware in _requestMiddleware) {
        finalRequest = await middleware(finalRequest);
      }

      final streamed = await _client
          .send(finalRequest)
          .timeout(
            AppConstants.networkTimeout,
            onTimeout: () => throw TimeoutException('Network request timeout'),
          );
      http.Response response = await http.Response.fromStream(streamed);

      for (final middleware in _responseMiddleware) {
        response = await middleware(response);
      }

      return response;
    } on TimeoutException catch (e) {
      throw NetworkException.timeout(e.toString());
    } on http.ClientException catch (e) {
      throw NetworkException.noConnection(e.toString());
    } catch (e) {
      throw NetworkException.badRequest('Request failed: $e');
    }
  }

  /// Setup request headers
  void _setupHeaders(
    http.Request request,
    Map<String, String>? headers,
    bool auth,
  ) {
    request.headers.addAll({
      'Content-Type': 'application/json',
      if (headers != null) ...headers,
    });

    if (auth) {
      _addAuthHeader(request);
    }
  }

  /// Add authentication header if token exists
  Future<void> _addAuthHeader(http.Request request) async {
    final token = await getToken();
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
  }

  /// Setup request body
  void _setupBody(http.Request request, Object? body) {
    if (body != null) {
      try {
        request.body = jsonEncode(body);
      } catch (e) {
        throw ValidationException.invalidData(
          'Failed to encode request body: $e',
        );
      }
    }
  }

  /// Dispose of resources
  void dispose() {
    _client.close();
  }
}
