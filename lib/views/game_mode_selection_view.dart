import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/game_level.dart';
import '../controllers/game_provider.dart';
import 'game_play_view.dart';

class GameModeSelectionView extends StatelessWidget {
  final GameLevel level;
  final bool isArabic;

  const GameModeSelectionView({
    super.key,
    required this.level,
    required this.isArabic,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isArabic ? "اختر نظام اللعب" : "Choose Game Mode"),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildModeCard(
                context,
                GameMode.multipleChoice,
                Icons.alt_route,
                isArabic ? "اختيارات" : "Choices",
                Colors.blue.shade100,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModeCard(
    BuildContext context,
    GameMode? mode,
    IconData icon,
    String label,
    Color color, {
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap:
          onTap ??
          () {
            if (mode == null) return;
            final provider = Provider.of<GameProvider>(context, listen: false);
            provider.loadLevel(level, isArabic);
            provider.setGameMode(mode);

            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const GamePlayView()),
            );
          },
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.black54),
            const SizedBox(height: 10),
            Text(
              label,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
