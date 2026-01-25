// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wonder_link_game/main.dart';

void main() {
  testWidgets('Home screen renders', (WidgetTester tester) async {
    await tester.pumpWidget(const WonderLinkApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Verify app shows initial loading state
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Wonder Link'), findsOneWidget);
  });
}
