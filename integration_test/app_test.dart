import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mystery_joy/main.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  binding.framePolicy = LiveTestWidgetsFlutterBindingFramePolicy.fullyLive;

  // Superseded by solo_play_flow_test.dart (Arabic default + stable keys).
  testWidgets(
    'E2E legacy: App Launch and Navigation',
    (WidgetTester tester) async {
      runApp(const WonderLinkApp());
      await tester.pumpAndSettle();
      expect(find.text('Wonder Link'), findsOneWidget);
    },
    skip: true,
  );
}
