import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/app_colors.dart';
import '../../core/room_design_components.dart';
import '../../providers/competition_provider.dart';
import 'room_settings_view.dart';

class RoomGameView extends StatefulWidget {
  const RoomGameView({super.key});

  @override
  State<RoomGameView> createState() => _RoomGameViewState();
}

class _RoomGameViewState extends State<RoomGameView> {
  int? _selectedAnswerIndex;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();

    if (!competitionProvider.gameStarted ||
        competitionProvider.currentPuzzle == null) {
      return _buildLoadingScreen(competitionProvider);
    }

    final puzzle = competitionProvider.currentPuzzle!;
    final totalPuzzles = competitionProvider.totalPuzzles;
    final currentIndex = competitionProvider.currentPuzzleIndex + 1;
    final options = List<String>.from(puzzle['options'] ?? []);
    final isQuizFormat = options.isNotEmpty;
    final playerCount = competitionProvider.roomParticipants.length;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      endDrawer: _buildActionsDrawer(context, competitionProvider),
      appBar: AppBar(
        backgroundColor: AppColors.darkSurface,
        elevation: 0,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'السؤال $currentIndex/$totalPuzzles',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.cyan.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.group, size: 16, color: AppColors.cyan),
                  const SizedBox(width: 6),
                  Text(
                    '$playerCount',
                    style: TextStyle(
                      color: AppColors.cyan,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: AppColors.cyan),
          onPressed: () => competitionProvider.goBackToLobby(),
        ),
        actions: [
          Builder(
            builder: (innerContext) => IconButton(
              icon: Icon(Icons.menu_rounded, color: AppColors.cyan),
              onPressed: () => Scaffold.of(innerContext).openEndDrawer(),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: isQuizFormat
                ? _buildQuizView(puzzle, competitionProvider)
                : _buildLegacyView(puzzle, competitionProvider),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingScreen(CompetitionProvider provider) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkSurface,
        elevation: 0,
        title: Text(
          'انتظار اللغز...',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: AppColors.cyan),
          onPressed: () => provider.goBackToLobby(),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    AppColors.cyan.withOpacity(0.2),
                    AppColors.magenta.withOpacity(0.2),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.cyan.withOpacity(0.3),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Center(
                child: SizedBox(
                  width: 50,
                  height: 50,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.cyan),
                    strokeWidth: 3,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'جاري تحميل اللغز...',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => provider.refreshRoomStatus(),
              icon: const Icon(Icons.refresh_rounded),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.cyan,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              label: const Text('تحديث'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => provider.goBackToLobby(),
              style: TextButton.styleFrom(foregroundColor: AppColors.magenta),
              child: const Text('العودة للغرفة'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuizView(
    Map<String, dynamic> puzzle,
    CompetitionProvider provider,
  ) {
    final question = puzzle['question']?.toString() ?? '';
    final options = List<String>.from(puzzle['options'] ?? []);
    final hint = puzzle['hint']?.toString() ?? '';
    final category = puzzle['category']?.toString() ?? '';

    return LayoutBuilder(
      builder: (context, constraints) {
        final bool isWide = constraints.maxWidth >= 720;
        final int crossAxisCount = isWide ? 3 : 2;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 6),

              // Compact question card with capped height to avoid vertical scroll
              ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: 140,
                  maxHeight: isWide
                      ? 260
                      : (constraints.maxHeight * 0.36).clamp(180, 320),
                ),
                child: QuestionCard(
                  question: question,
                  questionNumber: provider.currentPuzzleIndex + 1,
                  totalQuestions: provider.totalPuzzles,
                  category: category.isNotEmpty ? category : null,
                ),
              ),

              if (hint.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: AppColors.magenta.withOpacity(0.1),
                    border: Border.all(
                      color: AppColors.magenta.withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.lightbulb_rounded,
                        size: 18,
                        color: AppColors.magenta,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          hint,
                          style: TextStyle(
                            color: AppColors.magenta,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // Answers grid; stays within the available height
              // Answers vertical list
              Expanded(
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  itemCount: options.length,
                  itemBuilder: (context, index) {
                    final optionText = options[index];
                    final isSelected = _selectedAnswerIndex == index;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AnswerButton(
                        answer: optionText,
                        index: index,
                        isSelected: isSelected,
                        isCorrect: false,
                        isRevealed: false,
                        onTap: _isSubmitting
                            ? () {} // Disable tap while submitting
                            : () async {
                                if (_selectedAnswerIndex == index) return;
                                setState(() => _selectedAnswerIndex = index);
                                // Show selection feedback before submitting
                                await Future.delayed(
                                  const Duration(milliseconds: 400),
                                );
                                if (mounted) {
                                  _submitAnswer(provider, optionText);
                                }
                              },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _submitAnswer(
    CompetitionProvider provider,
    String selectedOption,
  ) async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await provider.submitAnswer([selectedOption]);
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Widget _buildLegacyView(
    Map<String, dynamic> puzzle,
    CompetitionProvider provider,
  ) {
    final startWord = puzzle['startWord']?.toString() ?? '';
    final endWord = puzzle['endWord']?.toString() ?? '';
    final hint = puzzle['hint']?.toString() ?? '';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'ابدأ من: $startWord',
            style: TextStyle(
              color: AppColors.cyan,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'انتهِ عند: $endWord',
            style: TextStyle(
              color: AppColors.success,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          if (hint.isNotEmpty)
            Text(
              'تلميح: $hint',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
        ],
      ),
    );
  }

  Drawer _buildActionsDrawer(
    BuildContext context,
    CompetitionProvider provider,
  ) {
    return Drawer(
      backgroundColor: AppColors.darkSurface,
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 12),
          children: [
            if (provider.currentRoomId != null)
              ListTile(
                leading: Icon(Icons.settings, color: AppColors.cyan),
                title: const Text('إعدادات الغرفة'),
                onTap: () {
                  Navigator.of(context).maybePop();
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => RoomSettingsView(
                        roomId: provider.currentRoomId!,
                        isCreator: provider.isHost,
                      ),
                    ),
                  );
                },
              ),
            if (provider.currentRoomId != null) const Divider(height: 1),
            ListTile(
              leading: Icon(Icons.refresh_rounded, color: AppColors.cyan),
              title: const Text('تحديث الحالة'),
              onTap: () {
                Navigator.of(context).maybePop();
                provider.refreshRoomStatus();
              },
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(
                Icons.meeting_room_outlined,
                color: AppColors.magenta,
              ),
              title: const Text('العودة للغرفة'),
              onTap: () {
                Navigator.of(context).maybePop();
                provider.goBackToLobby();
              },
            ),
          ],
        ),
      ),
    );
  }
}
