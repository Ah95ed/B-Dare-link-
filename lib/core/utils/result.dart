/// Result wrapper class for better error handling and state management
class Result<T> {
  final T? data;
  final Exception? error;
  final bool isLoading;

  const Result({this.data, this.error, this.isLoading = false});

  /// Factory constructor for success
  factory Result.success(T data) => Result(data: data);

  /// Factory constructor for error
  factory Result.error(Exception error) => Result(error: error);

  /// Factory constructor for loading
  factory Result.loading() => const Result(isLoading: true);

  bool get isSuccess => data != null && error == null;
  bool get isError => error != null;
}
