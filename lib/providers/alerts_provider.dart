import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:collection';
import '../models/game_alert_model.dart';

/// Provider لإدارة التنبيهات
class AlertsProvider extends ChangeNotifier {
  final Queue<GameAlert> _alertQueue = Queue();
  GameAlert? _currentAlert;
  Timer? _alertTimer;
  bool _isShowingAlert = false;

  GameAlert? get currentAlert => _currentAlert;
  bool get isShowingAlert => _isShowingAlert;
  int get queuedAlertsCount => _alertQueue.length;

  /// إضافة تنبيه إلى قائمة الانتظار
  void showAlert(GameAlert alert) {
    _alertQueue.addLast(alert);
    if (!_isShowingAlert) {
      _showNextAlert();
    }
  }

  /// إضافة عدة تنبيهات دفعة واحدة
  void showAlerts(List<GameAlert> alerts) {
    for (final alert in alerts) {
      _alertQueue.addLast(alert);
    }
    if (!_isShowingAlert) {
      _showNextAlert();
    }
  }

  /// عرض التنبيه التالي في الطابور
  void _showNextAlert() {
    if (_alertQueue.isEmpty) {
      _isShowingAlert = false;
      _currentAlert = null;
      notifyListeners();
      return;
    }

    _isShowingAlert = true;
    _currentAlert = _alertQueue.removeFirst();
    notifyListeners();

    // إلغاء المؤقت السابق إن وجد
    _alertTimer?.cancel();

    // بدء مؤقت جديد لحذف التنبيه التالي
    _alertTimer = Timer(_currentAlert!.duration, () {
      dismissCurrentAlert();
    });
  }

  /// إغلاق التنبيه الحالي
  void dismissCurrentAlert() {
    _alertTimer?.cancel();
    if (_alertQueue.isNotEmpty) {
      _showNextAlert();
    } else {
      _isShowingAlert = false;
      _currentAlert = null;
      notifyListeners();
    }
  }

  /// إغلاق جميع التنبيهات
  void clearAllAlerts() {
    _alertTimer?.cancel();
    _alertQueue.clear();
    _isShowingAlert = false;
    _currentAlert = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _alertTimer?.cancel();
    super.dispose();
  }
}
