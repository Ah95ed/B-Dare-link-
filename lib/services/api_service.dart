import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import '../models/spot_diff_puzzle.dart';
import '../core/exceptions/app_exceptions.dart';
import '../constants/app_constants.dart';

/// نتيجة جلب حزمة السولو من D1 عبر Worker.
class SoloLevelPackResult {
  final GameLevel? level;
  final bool emptyBank;

  const SoloLevelPackResult({this.level, this.emptyBank = false});
}

class CloudflareApiService {
  static const String _defaultWorkerUrl = AppConstants.defaultBaseUrl;
  late final String _workerUrl = const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: String.fromEnvironment(
      'WORKER_URL',
      defaultValue: _defaultWorkerUrl,
    ),
  );

  GamePuzzle? _parseGeneratedPuzzleMap(
    Map<String, dynamic> data,
    bool isArabic,
  ) {
    if (data['error'] != null) return null;

    String pickStart(Map<String, dynamic> m) {
      for (final k in [
        'startWord',
        'start',
        'from',
        'sourceWord',
        'wordStart',
      ]) {
        final v = m[k]?.toString().trim();
        if (v != null && v.isNotEmpty) return v;
      }
      return '';
    }

    String pickEnd(Map<String, dynamic> m) {
      for (final k in ['endWord', 'end', 'to', 'targetWord', 'wordEnd']) {
        final v = m[k]?.toString().trim();
        if (v != null && v.isNotEmpty) return v;
      }
      return '';
    }

    final startWord = pickStart(data);
    final endWord = pickEnd(data);
    final String? type = data['type']?.toString();
    final bool isPoetic = type == 'لغز_شعري' || type == 'poetic_riddle';

    if (!isPoetic) {
      if (startWord.isEmpty || endWord.isEmpty || startWord == endWord) {
        return null;
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

    final steps = <PuzzleStep>[];
    dynamic stepsRaw = data['steps'];
    if (stepsRaw is! List && data['chain'] is List) {
      stepsRaw = data['chain'];
    }
    if (stepsRaw != null && stepsRaw is List) {
      final globalPool = <String>[];
      if (startWord.isNotEmpty) globalPool.add(startWord);
      if (endWord.isNotEmpty) globalPool.add(endWord);
      for (final s in stepsRaw) {
        try {
          if (s != null && s is Map) {
            final w =
                s['word']?.toString().trim() ??
                s['correctAnswer']?.toString().trim() ??
                s['answer']?.toString().trim() ??
                '';
            if (w.isNotEmpty) globalPool.add(w);
          }
        } catch (_) {}
      }

      for (final s in stepsRaw) {
        try {
          if (s == null || s is! Map) continue;
          final sm = Map<String, dynamic>.from(s);
          final word = sm['word']?.toString() ??
              sm['correctAnswer']?.toString() ??
              sm['answer']?.toString() ??
              '';
          if (word.trim().isEmpty) {
            continue;
          }
          final stepQuestion = sm['stepQuestion']?.toString();
          List<String> options = [];
          if (sm['options'] is List) {
            options = List<String>.from(
              (sm['options'] as List).map((o) => o.toString()),
            );
          }

          if (!options.contains(word)) {
            if (options.length >= 4) {
              options[options.length - 1] = word;
            } else {
              options.add(word);
            }
          }

          final seen = <String>{};
          options = options.where((o) {
            if (seen.contains(o)) return false;
            seen.add(o);
            return true;
          }).toList();

          for (final candidate in globalPool) {
            if (options.length >= 4) break;
            if (candidate != word && !options.contains(candidate)) {
              options.add(candidate);
            }
          }

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

          if (options.length > 4) {
            final withoutWord = options.where((o) => o != word).toList();
            options = [word, ...withoutWord.take(3)];
          }

          options.shuffle();

          steps.add(
            PuzzleStep(
              word: word,
              options: options,
              stepQuestion: stepQuestion,
            ),
          );
        } catch (e) {
          debugPrint('Malformed step from API: $e');
        }
      }
    }

    if (!isPoetic && steps.isEmpty) {
      debugPrint(
        '_parseGeneratedPuzzleMap: no steps after parse (type=${data['type']})',
      );
      return null;
    }

    return GamePuzzle(
      puzzleId: data['puzzleId']?.toString(),
      startWordAr: isArabic ? startWord : "مرحلة",
      endWordAr: isArabic ? endWord : "جديدة",
      stepsAr: isArabic ? steps : [],
      startWordEn: !isArabic ? startWord : "New",
      endWordEn: !isArabic ? endWord : "Stage",
      stepsEn: !isArabic ? steps : [],
      hintAr: isArabic ? (data['hint'] ?? "") : "",
      hintEn: !isArabic ? (data['hint'] ?? "") : "",
      type: type,
      difficulty: data['difficulty']?.toString(),
      riddleTextAr: isArabic ? (data['riddleText']?.toString()) : null,
      riddleTextEn: !isArabic ? (data['riddleText']?.toString()) : null,
      pathOptions: (data['pathOptions'] is List)
          ? List<String>.from(data['pathOptions']!.map((o) => o.toString()))
          : null,
      correctPathIndex: data['correctPathIndex'] is int
          ? data['correctPathIndex'] as int
          : int.tryParse(data['correctPathIndex']?.toString() ?? ''),
    );
  }

  /// One HTTP call asks the Worker for [count] puzzles (solo fast-path).
  Future<GameLevel?> generateLevelBatch(
    bool isArabic,
    int levelId, {
    required int count,
    bool fresh = true,
    List<String> excludedQuestionKeys = const [],
  }) async {
    final n = count.clamp(1, 8);
    try {
      final response = await http
          .post(
            Uri.parse('$_workerUrl/generate-level'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'language': isArabic ? 'ar' : 'en',
              'level': levelId,
              'source': 'd1',
              'fresh': fresh,
              'excludeQuestionKeys': excludedQuestionKeys,
              'count': n,
            }),
          )
          .timeout(AppConstants.soloBatchTimeout);

      if (response.statusCode != 200) {
        debugPrint(
          'generateLevelBatch non-200 (${response.statusCode})',
        );
        return null;
      }
      final decoded = jsonDecode(response.body);
      if (decoded is! Map) return null;
      final data = Map<String, dynamic>.from(decoded);
      if (data['error'] != null) return null;
      final rawList = data['puzzles'];
      if (rawList is! List) return null;

      final puzzles = <GamePuzzle>[];
      for (final item in rawList) {
        if (item is! Map) continue;
        final p = _parseGeneratedPuzzleMap(
          Map<String, dynamic>.from(item),
          isArabic,
        );
        if (p != null) puzzles.add(p);
      }
      if (puzzles.isEmpty) return null;
      return GameLevel(id: levelId, puzzles: puzzles);
    } catch (e) {
      debugPrint('generateLevelBatch failed: $e');
      return null;
    }
  }

  /// Solo: جلب ألغاز من D1 عبر Worker — `AppConstants.soloLevelPackPath`.
  Future<SoloLevelPackResult> fetchSoloLevelPackFromD1({
    required bool isArabic,
    required int levelId,
    required int count,
    required String guestId,
    String? authToken,
  }) async {
    final n = count.clamp(1, 100);
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (authToken != null && authToken.isNotEmpty)
        'Authorization': 'Bearer $authToken',
    };
    try {
      final uri = Uri.parse('$_workerUrl${AppConstants.soloLevelPackPath}');
      final payload = {
        'language': isArabic ? 'ar' : 'en',
        'level': levelId,
        'count': n,
        'guestId': guestId,
      };
      if (kDebugMode) {
        debugPrint('[SoloD1] POST $uri');
        debugPrint('[SoloD1] request body: ${jsonEncode(payload)}');
      }
      final response = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode(payload),
          )
          .timeout(AppConstants.soloBatchTimeout);

      if (response.statusCode != 200) {
        debugPrint(
          '[SoloD1] HTTP ${response.statusCode} body=${response.body.length > 600 ? "${response.body.substring(0, 600)}…" : response.body}',
        );
        return const SoloLevelPackResult();
      }
      if (kDebugMode) {
        final h = response.headers['x-solo-bank'];
        debugPrint('[SoloD1] OK headers x-solo-bank=$h bytes=${response.body.length}');
        if (response.body.length <= 2000) {
          debugPrint('[SoloD1] response body: ${response.body}');
        } else {
          debugPrint('[SoloD1] response body (head): ${response.body.substring(0, 1500)}…');
        }
      }
      final emptyBankHeader =
          (response.headers['x-solo-bank'] ?? '').toLowerCase() == 'empty';
      final decoded = jsonDecode(response.body);
      if (decoded is! Map) return const SoloLevelPackResult();
      final data = Map<String, dynamic>.from(decoded);
      final err = data['error']?.toString();
      final rawList = data['puzzles'];
      final emptyBank =
          emptyBankHeader || err == 'EMPTY_BANK';

      if (rawList is! List) {
        if (emptyBank) {
          return SoloLevelPackResult(
            level: GameLevel(id: levelId, puzzles: const []),
            emptyBank: true,
          );
        }
        return const SoloLevelPackResult();
      }

      final puzzles = <GamePuzzle>[];
      for (final item in rawList) {
        if (item is! Map) continue;
        final p = _parseGeneratedPuzzleMap(
          Map<String, dynamic>.from(item),
          isArabic,
        );
        if (p != null) {
          puzzles.add(p);
        } else {
          if (kDebugMode) {
            final keys = Map<String, dynamic>.from(item).keys.join(',');
            debugPrint(
              '[SoloD1] skip parse keys=[$keys] type=${item['type']} stepsLen=${item['steps'] is List ? (item['steps'] as List).length : "n/a"}',
            );
          }
        }
      }
      if (puzzles.isEmpty && rawList.isNotEmpty && !emptyBank) {
        debugPrint(
          'fetchSoloLevelPackFromD1: server returned ${rawList.length} rows but none parsed — check JSON shape (startWord, endWord, steps).',
        );
      }
      if (puzzles.isEmpty && emptyBank) {
        if (kDebugMode) {
          debugPrint('[SoloD1] empty bank (EMPTY_BANK or X-Solo-Bank header)');
        }
        return SoloLevelPackResult(
          level: GameLevel(id: levelId, puzzles: const []),
          emptyBank: true,
        );
      }
      if (puzzles.isEmpty) {
        if (kDebugMode) {
          debugPrint('[SoloD1] parsed 0 puzzles (see skip messages above)');
        }
        return const SoloLevelPackResult();
      }
      if (kDebugMode) {
        for (var i = 0; i < puzzles.length; i++) {
          final p = puzzles[i];
          final s = isArabic ? p.startWordAr : p.startWordEn;
          final e = isArabic ? p.endWordAr : p.endWordEn;
          final st = isArabic ? p.stepsAr.length : p.stepsEn.length;
          debugPrint(
            '[SoloD1] puzzle[$i] id=${p.puzzleId} chain="$s"→"$e" steps=$st',
          );
        }
      }
      return SoloLevelPackResult(
        level: GameLevel(id: levelId, puzzles: puzzles),
      );
    } catch (e) {
      debugPrint('fetchSoloLevelPackFromD1 failed: $e');
      return const SoloLevelPackResult();
    }
  }

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
          'source': 'd1',
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

        final puzzle = _parseGeneratedPuzzleMap(
          Map<String, dynamic>.from(data),
          isArabic,
        );
        if (puzzle == null) {
          throw GameException.puzzleLoadFailed(
            'Invalid puzzle payload from API',
          );
        }

        return GameLevel(id: levelId, puzzles: [puzzle]);
      } else {
        debugPrint(
          'generateLevel non-200 (${response.statusCode}); no local fallback (D1 only).',
        );
        return null;
      }
    } on NetworkException {
      debugPrint('NetworkException in generateLevel; no local fallback (D1 only).');
      return null;
    } on GameException {
      debugPrint('GameException in generateLevel; no local fallback (D1 only).');
      return null;
    } catch (e) {
      debugPrint('Unexpected error in generateLevel: $e; no local fallback (D1 only).');
      return null;
    }
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
