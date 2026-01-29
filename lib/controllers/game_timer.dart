import 'dart:async';

/// Manages game timer functionality
class GameTimer {
  Timer? _timer;
  bool _isRunning = false;
  int _timeLeft = 0;

  // Callbacks
  VoidCallback? onTick;
  VoidCallback? onTimeout;

  bool get isRunning => _isRunning;
  int get timeLeft => _timeLeft;

  /// Start the timer
  void start(
    int initialTime,
    int timeLimit, {
    required VoidCallback onTick,
    required VoidCallback onTimeout,
  }) {
    if (_isRunning) return;

    _timeLeft = initialTime;
    this.onTick = onTick;
    this.onTimeout = onTimeout;
    _isRunning = true;

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _timeLeft--;
      onTick.call();

      if (_timeLeft <= 0) {
        stop();
        onTimeout.call();
      }
    });
  }

  /// Stop the timer
  void stop() {
    _timer?.cancel();
    _isRunning = false;
  }

  /// Pause the timer (keeps time unchanged)
  void pause() {
    if (!_isRunning) return;
    _timer?.cancel();
    _isRunning = false;
  }

  /// Resume the timer
  void resume({required VoidCallback onTick, required VoidCallback onTimeout}) {
    if (_isRunning) return;
    this.onTick = onTick;
    this.onTimeout = onTimeout;
    _isRunning = true;

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _timeLeft--;
      onTick.call();

      if (_timeLeft <= 0) {
        stop();
        onTimeout.call();
      }
    });
  }

  /// Dispose resources
  void dispose() {
    _timer?.cancel();
    _isRunning = false;
  }
}

typedef VoidCallback = void Function();
