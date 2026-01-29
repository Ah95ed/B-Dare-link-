/// Mock data for admin page development mode
class AdminMockData {
  static List<Map<String, dynamic>> mockPuzzles() {
    return [
      {
        'id': 1,
        'level': 1,
        'lang': 'ar',
        'created_at': DateTime.now()
            .subtract(const Duration(minutes: 5))
            .toIso8601String(),
        'puzzle': {
          'startWord': 'تفاحة',
          'endWord': 'لون',
          'puzzleId': 'MOCK-1',
          'hint': 'مثال للتجربة',
          'steps': [
            {
              'word': 'تفاحة',
              'options': ['تفاحة', 'موز', 'برتقال'],
            },
            {
              'word': 'أحمر',
              'options': ['أحمر', 'أخضر', 'أزرق'],
            },
          ],
        },
      },
      {
        'id': 2,
        'level': 2,
        'lang': 'en',
        'created_at': DateTime.now()
            .subtract(const Duration(minutes: 2))
            .toIso8601String(),
        'puzzle': {
          'startWord': 'Sun',
          'endWord': 'Energy',
          'puzzleId': 'MOCK-2',
          'hint': 'Sample EN data',
          'steps': [
            {
              'word': 'Sun',
              'options': ['Sun', 'Moon', 'Star'],
            },
            {
              'word': 'Light',
              'options': ['Light', 'Heat', 'Cold'],
            },
          ],
        },
      },
    ];
  }
}

/// Utility functions for admin page
class AdminUtils {
  /// Format ISO date string to readable format
  static String formatDate(String? iso) {
    if (iso == null) return '-';
    final dt = DateTime.tryParse(iso);
    if (dt == null) return iso;
    return '${dt.toLocal()}'.split('.').first;
  }

  /// Extract puzzle content safely
  static String extractPuzzleWord(dynamic item, String field) {
    final puzzle = item['puzzle'] ?? {};
    return puzzle[field] ?? puzzle['${field}Ar'] ?? '';
  }

  /// Extract steps from puzzle
  static List<dynamic> extractSteps(dynamic item) {
    final puzzle = item['puzzle'] ?? {};
    return (puzzle['steps'] as List?) ?? [];
  }

  /// Extract hint from puzzle
  static String extractHint(dynamic item) {
    final puzzle = item['puzzle'] ?? {};
    return puzzle['hint'] ?? puzzle['hintAr'] ?? '';
  }

  /// Format steps for display
  static String formatStepsPreview(List<dynamic> steps) {
    if (steps.isEmpty) return 'لا توجد خطوات';
    return '${steps.length} خطوات';
  }
}
