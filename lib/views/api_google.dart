import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:flutter/material.dart';

// ⚠️ ملاحظة: لا تضع المفتاح مباشرة في ملف Dart للمنتجات النهائية!
const String _apiKey = "AIzaSyBoAP_hZwOJY4rRIwxRJ8sgwWFE1WYGLlM";

class GeminiRequestExample extends StatefulWidget {
  const GeminiRequestExample({super.key});

  @override
  _GeminiRequestExampleState createState() => _GeminiRequestExampleState();
}

class _GeminiRequestExampleState extends State<GeminiRequestExample> {
  String _response = "الاستجابة ستظهر هنا...";
  final String _prompt = "اكتب ثلاثة حقائق مدهشة عن المحيط الهادئ.";

  // 1. إنشاء النموذج (Generative Model)
  final model = GenerativeModel(
    model: 'gemini-1.5-flash', // النموذج الذي اخترته
    apiKey: _apiKey,
  );

  Future<void> generateText() async {
    setState(() {
      _response = "جاري الاتصال بـ Gemini...";
    });

    try {
      // 2. إرسال طلب (Request)
      final content = [Content.text(_prompt)];
      final response = await model.generateContent(content);

      // 3. عرض الاستجابة
      setState(() {
        _response = response.text ?? "لم يتم تلقي نص استجابة.";
      });
    } catch (e) {
      setState(() {
        _response = "حدث خطأ: $e";
      });
    }
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
              onPressed: generateText,
              child: Text('اطلب من Gemini'),
            ),
            SizedBox(height: 20),
            Text(
              'سؤالك: $_prompt',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Divider(),
            Expanded(child: SingleChildScrollView(child: Text(_response))),
          ],
        ),
      ),
    );
  }
}

// لإطلاق التطبيق في main.dart
// void main() {
//   runApp(MaterialApp(home: GeminiRequestExample()));
// }
