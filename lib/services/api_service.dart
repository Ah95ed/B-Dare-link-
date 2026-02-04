import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import '../models/spot_diff_puzzle.dart';
import '../core/exceptions/app_exceptions.dart';

class CloudflareApiService {
  static const String _defaultWorkerUrl =
      'https://wonder-link-backend.amhmeed31.workers.dev';
  late final String _workerUrl = const String.fromEnvironment(
    'WORKER_URL',
    defaultValue: _defaultWorkerUrl,
  );

  Future<GameLevel?> generateLevel(
    bool isArabic,
    int levelId, {
    bool fresh = false,
  }) async {
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
          throw GameException.puzzleLoadFailed(
            'Unexpected response format from API',
          );
        }
        if (data['error'] != null) {
          throw GameException.puzzleLoadFailed(
            '${data['error']} - ${data['reason']}',
          );
        }

        final startWord = data['startWord']?.toString().trim() ?? '';
        final endWord = data['endWord']?.toString().trim() ?? '';
        if (startWord.isEmpty || endWord.isEmpty || startWord == endWord) {
          throw GameException.puzzleLoadFailed(
            'Invalid start/end words from API',
          );
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

        return GameLevel(id: levelId, puzzles: [puzzle]);
      } else {
        throw NetworkException.badRequest(
          'Failed to generate level: ${response.statusCode}',
        );
      }
    } on NetworkException {
      rethrow;
    } on GameException {
      rethrow;
    } catch (e) {
      throw NetworkException.badRequest('Error generating level: $e');
    }
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

  Future<GamePuzzle?> generatePuzzleFromImage(File image, bool isArabic) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_workerUrl/api/generate-from-image'),
      );

      request.fields['language'] = isArabic ? 'ar' : 'en';
      request.files.add(await http.MultipartFile.fromPath('image', image.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return GamePuzzle.fromJson(data);
      } else {
        throw NetworkException.badRequest(
          'Failed to generate from image: ${response.statusCode}',
        );
      }
    } on NetworkException {
      rethrow;
    } catch (e) {
      throw NetworkException.badRequest('Vision processing error: $e');
    }
  }

  Future<SpotDiffPuzzle?> generateSpotDiffPuzzle({
    required bool isArabic,
    int differencesCount = 5,
    String theme = '',
    String conflict = '',
    String stage = '',
    int width = 512,
    int height = 512,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_workerUrl/api/generate-spot-diff'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'language': isArabic ? 'ar' : 'en',
          'differencesCount': differencesCount,
          'theme': theme,
          'conflict': conflict,
          'stage': stage,
          'width': width,
          'height': height,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is! Map<String, dynamic>) {
          throw GameException.puzzleLoadFailed('Invalid response format');
        }
        return SpotDiffPuzzle.fromJson(data);
      } else {
        debugPrint('[SpotDiff] HTTP ${response.statusCode}: ${response.body}');
        throw NetworkException.badRequest(
          'Failed to generate spot diff: ${response.statusCode}',
        );
      }
    } on NetworkException {
      rethrow;
    } on GameException {
      rethrow;
    } catch (e) {
      throw NetworkException.badRequest('Spot diff error: $e');
    }
  }
}
