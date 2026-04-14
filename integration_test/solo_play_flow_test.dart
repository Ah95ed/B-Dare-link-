import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mystery_joy/main.dart';

/// Solo path on device/emulator. Requires network (Google Fonts + Worker API).
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Solo: home → levels → level 1 → game screen', (tester) async {
    runApp(const WonderLinkApp());
    await tester.pump();

    // Auth bootstrap + first frame (can show loading scaffold briefly).
    final soloBtn = find.byKey(const ValueKey('home_solo_play'));
    for (var i = 0; i < 120; i++) {
      await tester.pump(const Duration(milliseconds: 500));
      if (soloBtn.evaluate().isNotEmpty) break;
    }

    expect(soloBtn, findsOneWidget);

    await tester.tap(soloBtn);
    await tester.pumpAndSettle(const Duration(seconds: 3));

    expect(find.byKey(const ValueKey('level_tile_1')), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('level_tile_1')));
    await tester.pump();

    final loading = find.byKey(const ValueKey('solo_game_loading'));
    final playing = find.byKey(const ValueKey('solo_game_play'));

    var reachedPlay = false;
    for (var s = 0; s < 180; s++) {
      await tester.pump(const Duration(seconds: 1));
      if (playing.evaluate().isNotEmpty) {
        reachedPlay = true;
        break;
      }
      if (loading.evaluate().isEmpty && playing.evaluate().isEmpty) {
        await tester.pump(const Duration(seconds: 1));
        if (playing.evaluate().isNotEmpty) {
          reachedPlay = true;
          break;
        }
      }
    }

    expect(
      reachedPlay,
      isTrue,
      reason:
          'Game did not leave loading within 180s (check network / Worker / batch deploy).',
    );
    expect(playing, findsOneWidget);
  });
}
