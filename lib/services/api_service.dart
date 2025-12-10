import 'dart:convert';
import 'package:flutter/foundation.dart';

import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

class CloudflareApiService {
  // TODO: Replace with your actual Cloudflare Worker URL after deployment
  // e.g., 'https://wonder-link-backend.your-subdomain.workers.dev'
  final String _apiKey =
      'AIzaSyBoAP_hZwOJY4rRIwxRJ8sgwWFE1WYGLlM'; // Using the key provided in context
  late final GenerativeModel _model;

  CloudflareApiService() {
    _model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: _apiKey);
  }

  Future<GameLevel?> generateLevel(bool isArabic) async {
    try {
      final prompt =
          'Generate a "Wonder Link" puzzle in ${isArabic ? 'Arabic' : 'English'}. '
          'Output strict JSON format only: '
          '{ "startWord": "Word1", "endWord": "Word2", "validSteps": ["step1", "step2", "step3"], "hint": "short hint" }';

      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);

      if (response.text != null) {
        // Clean JSON string (remove markdown blocks if present)
        String jsonText = response.text!
            .replaceAll('```json', '')
            .replaceAll('```', '')
            .trim();
        final data = jsonDecode(jsonText);

        final puzzle = GamePuzzle(
          startWordAr: isArabic ? data['startWord'] : "مرحلة",
          endWordAr: isArabic ? data['endWord'] : "جديدة",
          startWordEn: !isArabic ? data['startWord'] : "New",
          endWordEn: !isArabic ? data['endWord'] : "Stage",
          solutionStepsAr: isArabic
              ? List<String>.from(data['validSteps'])
              : [],
          solutionStepsEn: !isArabic
              ? List<String>.from(data['validSteps'])
              : [],
        );

        return GameLevel(
          id: DateTime.now().millisecondsSinceEpoch, // Temp ID
          puzzles: [puzzle],
        );
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
    // Mock validation locally since backend is unavailable
    return true;
  }
}
