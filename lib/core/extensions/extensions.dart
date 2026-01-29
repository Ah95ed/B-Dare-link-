import 'package:flutter/material.dart';

/// String extensions for clean code
extension StringExtensions on String {
  /// Check if string is valid email
  bool get isValidEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Check if string is strong password
  bool get isStrongPassword {
    return length >= 8 &&
        contains(RegExp(r'[A-Z]')) &&
        contains(RegExp(r'[0-9]')) &&
        contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
  }

  /// Truncate string with ellipsis
  String truncate(int length) {
    return this.length > length ? '${substring(0, length)}...' : this;
  }

  /// Capitalize first letter
  String get capitalize =>
      isEmpty ? '' : '${this[0].toUpperCase()}${substring(1)}';

  /// Remove extra spaces
  String get removeExtraSpaces => trim().replaceAll(RegExp(r'\s+'), ' ');
}

/// Number extensions
extension NumExtensions on num {
  /// Convert seconds to MM:SS format
  String toTimeFormat() {
    final minutes = (this / 60).floor();
    final seconds = (this % 60).toInt();
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  /// Format number with thousand separator
  String toFormattedString() {
    return toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match match) => '${match[1]},',
    );
  }

  /// Check if number is positive
  bool get isPositive => this > 0;

  /// Check if number is negative
  bool get isNegative => this < 0;

  /// Check if number is between range
  bool isBetween(num min, num max) => this >= min && this <= max;
}

/// List extensions
extension ListExtensions<T> on List<T> {
  /// Get random element
  T get random => this[DateTime.now().microsecond % length];

  /// Shuffle list safely
  List<T> get shuffled {
    final list = List<T>.from(this);
    list.shuffle();
    return list;
  }

  /// Get element safely
  T? getOrNull(int index) => index >= 0 && index < length ? this[index] : null;

  /// Remove duplicates
  List<T> get unique => toSet().toList();

  /// Check if empty
  bool get isEmpty => length == 0;

  /// Check if not empty
  bool get isNotEmpty => length > 0;
}

/// Map extensions
extension MapExtensions<K, V> on Map<K, V> {
  /// Get value safely
  V? getOrNull(K key) => containsKey(key) ? this[key] : null;

  /// Merge maps
  Map<K, V> merge(Map<K, V> other) {
    return {...this, ...other};
  }

  /// Filter by key
  Map<K, V> filterByKey(bool Function(K) test) {
    return Map.fromEntries(entries.where((entry) => test(entry.key)));
  }

  /// Filter by value
  Map<K, V> filterByValue(bool Function(V) test) {
    return Map.fromEntries(entries.where((entry) => test(entry.value)));
  }
}

/// DateTime extensions
extension DateTimeExtensions on DateTime {
  /// Check if today
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Check if yesterday
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Format date as DD/MM/YYYY
  String toDateString() => '$day/$month/$year';

  /// Format time as HH:MM
  String toTimeString() =>
      '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';

  /// Get days until date
  int daysUntil() {
    final now = DateTime.now();
    return DateTime(
      year,
      month,
      day,
    ).difference(DateTime(now.year, now.month, now.day)).inDays;
  }
}

/// BuildContext extensions
extension BuildContextExtensions on BuildContext {
  /// Get screen size
  Size get screenSize => MediaQuery.of(this).size;

  /// Get screen width
  double get screenWidth => screenSize.width;

  /// Get screen height
  double get screenHeight => screenSize.height;

  /// Check if device is in landscape
  bool get isLandscape => screenWidth > screenHeight;

  /// Check if device is in portrait
  bool get isPortrait => screenWidth < screenHeight;

  /// Check if device is tablet
  bool get isTablet => screenWidth > 600;

  /// Get responsive value
  T responsive<T>({required T mobile, required T tablet, required T desktop}) {
    if (isTablet && screenWidth > 1024) {
      return desktop;
    } else if (isTablet) {
      return tablet;
    }
    return mobile;
  }

  /// Show snackbar
  void showSnackBar(
    String message, {
    Duration duration = const Duration(seconds: 2),
  }) {
    ScaffoldMessenger.of(
      this,
    ).showSnackBar(SnackBar(content: Text(message), duration: duration));
  }

  /// Show error snackbar
  void showErrorSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Show success snackbar
  void showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  /// Pop with result
  void pop<T>([T? result]) => Navigator.of(this).pop<T>(result);

  /// Push named route
  Future<T?> pushNamed<T extends Object?>(
    String routeName, {
    Object? arguments,
  }) => Navigator.of(this).pushNamed<T>(routeName, arguments: arguments);

  /// Replace route
  Future<T?> pushReplacementNamed<T extends Object?>(
    String routeName, {
    Object? arguments,
  }) =>
      Navigator.of(this).pushReplacementNamed(routeName, arguments: arguments);
}

/// Widget extensions
extension WidgetExtensions on Widget {
  /// Add padding to widget
  Padding withPadding(EdgeInsets padding) =>
      Padding(padding: padding, child: this);

  /// Add center to widget
  Center centered() => Center(child: this);

  /// Add transparent wrapper
  GestureDetector onTap(VoidCallback onTap) {
    return GestureDetector(onTap: onTap, child: this);
  }
}
