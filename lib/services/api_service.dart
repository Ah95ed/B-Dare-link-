import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/game_level.dart';
import '../models/game_puzzle.dart';

class CloudflareApiService {
  // TODO: Replace with your deployed Worker URL
  final String _workerUrl = 'https://wonder-link-backend.amhmeed31.workers.dev';

  Future<GameLevel?> generateLevel(bool isArabic, int levelId, {bool fresh = false}) async {
    try {
      final response = await http.post(
        Uri.parse('$_workerUrl/generate-level'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'language': isArabic ? 'ar' : 'en',
          'level': levelId,
          'fresh': fresh,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is! Map) {
          debugPrint("Worker Error: unexpected response shape");
          return _getFallbackLevelSafe(levelId, isArabic);
        }
        if (data['error'] != null) {
          debugPrint("Worker Error Payload: ${data['error']} - ${data['reason']}");
          return _getFallbackLevelSafe(levelId, isArabic);
        }

        final startWord = data['startWord']?.toString().trim() ?? '';
        final endWord = data['endWord']?.toString().trim() ?? '';
        if (startWord.isEmpty || endWord.isEmpty || startWord == endWord) {
          debugPrint("Worker Error: invalid start/end words");
          return _getFallbackLevelSafe(levelId, isArabic);
        }

        // Defensive normalization: ensure each step has 3 options and includes the correct word
        List<PuzzleStep> steps = [];
        if (data['steps'] != null && data['steps'] is List) {
          // Prepare a global pool of candidate distractors
          final globalPool = <String>[];
          if (data['startWord'] is String) globalPool.add(data['startWord']);
          if (data['endWord'] is String) globalPool.add(data['endWord']);
          for (final s in data['steps']) {
            try {
              if (s != null && s['word'] is String) globalPool.add(s['word']);
            } catch (_) {}
          }

          for (var s in data['steps']) {
            try {
              final word = s['word']?.toString() ?? '';
              List<String> options = [];
              if (s['options'] is List) {
                options = List<String>.from(
                  s['options'].map((o) => o.toString()),
                );
              }

              // Ensure the correct word is present
              if (!options.contains(word)) {
                if (options.length >= 3) {
                  options[options.length - 1] = word;
                } else {
                  options.add(word);
                }
              }

              // Remove duplicates while preserving order
              final seen = <String>{};
              options = options.where((o) {
                if (seen.contains(o)) return false;
                seen.add(o);
                return true;
              }).toList();

              // Fill up to 3 using globalPool (excluding the correct word)
              for (final candidate in globalPool) {
                if (options.length >= 3) break;
                if (candidate != word && !options.contains(candidate)) {
                  options.add(candidate);
                }
              }

              // If still short, append placeholder variants
              while (options.length < 3) {
                options.add('${word}_opt');
              }

              // Shuffle options
              options.shuffle();

              steps.add(PuzzleStep(word: word, options: options));
            } catch (e) {
              // skip malformed step
              debugPrint('Malformed step from API: $e');
            }
          }
        }

        final puzzle = GamePuzzle(
          puzzleId: data['puzzleId']?.toString(),
          startWordAr: isArabic ? (data['startWord'] ?? '') : "مرحلة",
          endWordAr: isArabic ? (data['endWord'] ?? '') : "جديدة",
          stepsAr: isArabic ? steps : [],

          startWordEn: !isArabic ? (data['startWord'] ?? '') : "New",
          endWordEn: !isArabic ? (data['endWord'] ?? '') : "Stage",
          stepsEn: !isArabic ? steps : [],

          hintAr: isArabic ? (data['hint'] ?? "") : "",
          hintEn: !isArabic ? (data['hint'] ?? "") : "",
        );

        return GameLevel(
          id: levelId, // Use the actual level ID
          puzzles: [puzzle],
        );
      } else {
        debugPrint("Worker Error: ${response.statusCode} - ${response.body}");
        return _getFallbackLevelSafe(levelId, isArabic);
      }
    } catch (e) {
      debugPrint("Error generating level: $e");
      return _getFallbackLevelSafe(levelId, isArabic);
    }
  }

  GameLevel _getFallbackLevelSafe(int levelId, bool isArabic) {
    final steps = isArabic
        ? [
            PuzzleStep(
              word: "تفاحة",
              options: ["تفاحة", "موز", "برتقال"]..shuffle(),
            ),
            PuzzleStep(
              word: "أحمر",
              options: ["أحمر", "أزرق", "أخضر"]..shuffle(),
            ),
          ]
        : [
            PuzzleStep(
              word: "Apple",
              options: ["Apple", "Banana", "Grape"]..shuffle(),
            ),
            PuzzleStep(
              word: "Red",
              options: ["Red", "Blue", "Green"]..shuffle(),
            ),
          ];

    final puzzle = GamePuzzle(
      startWordAr: "فاكهة",
      endWordAr: "لون",
      stepsAr: isArabic ? steps : [],
      startWordEn: "Fruit",
      endWordEn: "Color",
      stepsEn: isArabic ? [] : steps,
      hintAr: "فكّر في مثال بسيط يربط بين الشيء وصفته.",
      hintEn: "Think of a simple object and its attribute.",
    );

    return GameLevel(id: levelId, puzzles: [puzzle]);
  }

  // ignore: unused_element
  GameLevel _getFallbackLevel(int levelId, bool isArabic) {
    // Basic fallback puzzle to ensure playable state
    final steps = isArabic
        ? [
            PuzzleStep(
              word: "تفاحة",
              options: ["تفاحة", "موز", "عنب", "برتقال"]..shuffle(),
            ),
            PuzzleStep(
              word: "أحمر",
              options: ["أحمر", "أزرق", "أخضر", "أصفر"]..shuffle(),
            ),
            PuzzleStep(
              word: "لون",
              options: ["لون", "شكل", "حجم", "وزن"]..shuffle(),
            ),
          ]
        : [
            PuzzleStep(
              word: "Apple",
              options: ["Apple", "Banana", "Grape", "Orange"]..shuffle(),
            ),
            PuzzleStep(
              word: "Red",
              options: ["Red", "Blue", "Green", "Yellow"]..shuffle(),
            ),
            PuzzleStep(
              word: "Color",
              options: ["Color", "Shape", "Size", "Weight"]..shuffle(),
            ),
          ];

    final puzzle = GamePuzzle(
      startWordAr: "بداية",
      endWordAr: "نهاية",
      stepsAr: isArabic ? steps : [],
      startWordEn: "Start",
      endWordEn: "End",
      stepsEn: isArabic ? [] : steps,
      hintAr: "مثال توضيحي",
      hintEn: "Fallback Example",
    );

    return GameLevel(id: levelId, puzzles: [puzzle]);
  }

  Future<bool> validateConnection(
    String start,
    String end,
    List<String> steps,
  ) async {
    // Ideally this would also validate via backend,
    // but for now we trust the local client logic or implement similar backend endpoint.
    return true;
  }
}
