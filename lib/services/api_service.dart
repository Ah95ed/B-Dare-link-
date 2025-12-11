import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/game_level.dart';
import '../models/game_puzzle.dart';

class CloudflareApiService {
  // TODO: Replace with your deployed Worker URL
  final String _workerUrl = 'https://wonder-link-backend.amhmeed31.workers.dev';

  Future<GameLevel?> generateLevel(bool isArabic, int levelId) async {
    try {
      final response = await http.post(
        Uri.parse('$_workerUrl/generate-level'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'language': isArabic ? 'ar' : 'en',
          'level': levelId,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        List<PuzzleStep> steps = [];
        if (data['steps'] != null) {
          for (var s in data['steps']) {
            steps.add(
              PuzzleStep(
                word: s['word'],
                options: List<String>.from(s['options']),
              ),
            );
          }
        }

        final puzzle = GamePuzzle(
          startWordAr: isArabic ? data['startWord'] : "مرحلة",
          endWordAr: isArabic ? data['endWord'] : "جديدة",
          stepsAr: isArabic ? steps : [],

          startWordEn: !isArabic ? data['startWord'] : "New",
          endWordEn: !isArabic ? data['endWord'] : "Stage",
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
      }
    } catch (e) {
      debugPrint("Error generating level: $e");
    }
    return null;
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
