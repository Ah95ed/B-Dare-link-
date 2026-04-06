import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import '../models/spot_diff_puzzle.dart';
import '../core/exceptions/app_exceptions.dart';
import '../constants/app_constants.dart';

class CloudflareApiService {
  static const String _defaultWorkerUrl = AppConstants.defaultBaseUrl;
  late final String _workerUrl = const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: String.fromEnvironment(
      'WORKER_URL',
      defaultValue: _defaultWorkerUrl,
    ),
  );

  Future<GameLevel?> generateLevel(
    bool isArabic,
    int levelId, {
    bool fresh = false,
    List<String> excludedQuestionKeys = const [],
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_workerUrl/generate-level'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'language': isArabic ? 'ar' : 'en',
          'level': levelId,
          'source': 'ai',
          'fresh': fresh,
          'excludeQuestionKeys': excludedQuestionKeys,
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
        final String? type = data['type']?.toString();
        final bool isPoetic = type == 'لغز_شعري' || type == 'poetic_riddle';

        if (!isPoetic) {
          if (startWord.isEmpty || endWord.isEmpty || startWord == endWord) {
            throw GameException.puzzleLoadFailed(
              'Invalid start/end words from API',
            );
          }
        }

        final fallbackWords = isArabic
            ? ['كتاب', 'قلم', 'نور', 'علم', 'باب', 'صوت', 'ورق', 'فكر']
            : [
                'Book',
                'Pen',
                'Light',
                'Mind',
                'Door',
                'Sound',
                'Paper',
                'Idea',
              ];

        // Defensive normalization: ensure each step has 4 options and includes the correct word
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
              final word =
                  s['word']?.toString() ?? s['correctAnswer']?.toString() ?? '';
              if (word.trim().isEmpty) {
                continue;
              }
              final stepQuestion = s['stepQuestion']?.toString();
              List<String> options = [];
              if (s['options'] is List) {
                options = List<String>.from(
                  s['options'].map((o) => o.toString()),
                );
              }

              // Ensure the correct word is present
              if (!options.contains(word)) {
                if (options.length >= 4) {
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

              // Fill up to 4 using globalPool (excluding the correct word)
              for (final candidate in globalPool) {
                if (options.length >= 4) break;
                if (candidate != word && !options.contains(candidate)) {
                  options.add(candidate);
                }
              }

              // If still short, append placeholder variants
              while (options.length < 4) {
                for (final fallback in fallbackWords) {
                  if (options.length >= 4) break;
                  if (fallback != word && !options.contains(fallback)) {
                    options.add(fallback);
                  }
                }
                if (options.length < 4) {
                  options.add(word);
                }
              }

              // Enforce exactly 4 options to satisfy client validation.
              if (options.length > 4) {
                final withoutWord = options.where((o) => o != word).toList();
                options = [word, ...withoutWord.take(3)];
              }

              // Shuffle options
              options.shuffle();

              steps.add(
                PuzzleStep(
                  word: word,
                  options: options,
                  stepQuestion: stepQuestion,
                ),
              );
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
          type: type,
          difficulty: data['difficulty']?.toString(),
          riddleTextAr: isArabic ? (data['riddleText']?.toString()) : null,
          riddleTextEn: !isArabic ? (data['riddleText']?.toString()) : null,
          pathOptions: (data['pathOptions'] is List)
              ? List<String>.from(data['pathOptions'].map((o) => o.toString()))
              : null,
          correctPathIndex: data['correctPathIndex'] is int
              ? data['correctPathIndex'] as int
              : int.tryParse(data['correctPathIndex']?.toString() ?? ''),
        );

        return GameLevel(id: levelId, puzzles: [puzzle]);
      } else {
        debugPrint(
          'generateLevel non-200 (${response.statusCode}), using local fallback',
        );
        return _getFallbackLevel(levelId, isArabic);
      }
    } on NetworkException {
      debugPrint('NetworkException in generateLevel, using local fallback');
      return _getFallbackLevel(levelId, isArabic);
    } on GameException {
      debugPrint('GameException in generateLevel, using local fallback');
      return _getFallbackLevel(levelId, isArabic);
    } catch (e) {
      debugPrint('Unexpected error in generateLevel: $e, using local fallback');
      return _getFallbackLevel(levelId, isArabic);
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
      startWordAr: "كتاب",
      endWordAr: "مكتبة",
      stepsAr: isArabic ? steps : [],
      startWordEn: "Book",
      endWordEn: "Library",
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
