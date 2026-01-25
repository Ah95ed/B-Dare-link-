import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:wonder_link_game/main.dart'; // Import your main entry point

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  binding.framePolicy = LiveTestWidgetsFlutterBindingFramePolicy.fullyLive;

  testWidgets('E2E: App Launch and Navigation', (WidgetTester tester) async {
    // 1. Launch the app
    runApp(const WonderLinkApp());
    await tester.pumpAndSettle();

    // 2. Verify Home Screen is present
    expect(find.text('Wonder Link'), findsOneWidget);
    // Note: Adjust 'Wonder Link' if the actual title text in UI is different or localized.
    // Based on HomeView code: l10n.appTitle or hardcoded text.
    // HomeView has "Discover the hidden connection!" subtitle checking that too.
    expect(find.text('Discover the hidden connection!'), findsOneWidget);

    // 3. Find and Tap "Levels" button (Single Player)
    // Key or Icon is safer. HomeView uses Icons.play_circle_fill for Levels.
    final levelsButton = find.byIcon(Icons.play_circle_fill);
    expect(levelsButton, findsOneWidget);

    await tester.tap(levelsButton);
    await tester.pumpAndSettle(); // Wait for navigation animation

    // 4. Verify Levels Screen
    // Look for "Level 1" or similar.
    // Assuming LevelsView shows levels.
    expect(find.text('Level 1'), findsOneWidget);

    // 5. Navigate Back
    final backButton = find.byIcon(
      Icons.arrow_back_rounded,
    ); // Common back icon
    if (backButton.evaluate().isNotEmpty) {
      await tester.tap(backButton);
      await tester.pumpAndSettle();
      // Verify back at home
      expect(find.text('Discover the hidden connection!'), findsOneWidget);
    } else {
      // Maybe default AppBar back button
      await tester.pageBack();
      await tester.pumpAndSettle();
    }
  });
}
