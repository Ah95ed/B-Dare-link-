import 'dart:convert';
import 'dart:developer';

import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// ⚠️ ملاحظة: لا تضع المفتاح مباشرة في ملف Dart للمنتجات النهائية!
const String _apiKey = "AIzaSyBoAP_hZwOJY4rRIwxRJ8sgwWFE1WYGLlM";

class GeminiRequestExample extends StatefulWidget {
  const GeminiRequestExample({super.key});

  @override
  _GeminiRequestExampleState createState() => _GeminiRequestExampleState();
}

class _GeminiRequestExampleState extends State<GeminiRequestExample> {
  late GroqAI ai;
  List<Map<String, dynamic>> questions = [];
  bool loading = false;

  Future<void> loadQuestions() async {
    setState(() => loading = true);

    final result = await ai.generateQuestions(
      subject: "الرياضيات",
      level: "سهل",
      count: 5,
    );

    setState(() {
      questions = result;
      loading = false;
      print('object === $result');
    });
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    ai = GroqAI("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");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Gemini API في Flutter')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            ElevatedButton(
              onPressed: loadQuestions,
              child: Text('اطلب من Gemini'),
            ),
            SizedBox(height: 20),
            Text('سؤالك: ', style: TextStyle(fontWeight: FontWeight.bold)),
            Divider(),
            Expanded(child: SingleChildScrollView(child: Text('ششششششش'))),
          ],
        ),
      ),
    );
  }
}

class GroqAI {
  final String apiKey;

  GroqAI(this.apiKey);

  Future<List<Map<String, dynamic>>> generateQuestions({
    required String subject,
    required String level,
    required int count,
  }) async {
    final prompt =
        """
اكتب $count اسئلة عن موضوع: $subject
المستوى: $level
الصيغة يجب ان تكون JSON هكذا:
[
  { "question": "?", "answer": "?" }
]
""";

    final response = await http.post(
      Uri.parse("https://api.groq.com/openai/v1/chat/completions"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $apiKey",
      },
      body: jsonEncode({
        "model": "llama-3.1-70b-versatile",
        "messages": [
          {"role": "user", "content": prompt},
        ],
      }),
    );

    final data = jsonDecode(response.body);

    final content = data["choices"][0]["message"]["content"];

    // حاول نحلل JSON حتى لو AI رجع نص إضافي
    try {
      final cleanJson = jsonDecode(content);
      log('message ==message ==== $cleanJson');
      print('message ==== $cleanJson');
      return List<Map<String, dynamic>>.from(cleanJson);
    } catch (_) {
      // fallback: إرجاع نص خام
      return [
        {"question": "Error parsing AI response", "answer": content},
      ];
    }
  }
}
