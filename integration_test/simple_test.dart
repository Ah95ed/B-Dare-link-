import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter/material.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Simple Environment Check', (WidgetTester tester) async {
    runApp(
      const MaterialApp(
        home: Scaffold(body: Center(child: Text('Test Works'))),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Test Works'), findsOneWidget);
  });
}
