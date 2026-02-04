/// Optimized version of RoomGameView
/// Uses Selector to minimize rebuilds and improve performance
library;

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/app_colors.dart';
import '../../providers/competition_provider.dart';

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
    // Use Selector to watch only specific properties
    // This prevents entire widget rebuild when unrelated state changes
    return Selector<CompetitionProvider, bool>(
      selector: (context, provider) =>
          provider.gameStarted && provider.currentPuzzle != null,
      builder: (context, isGameReady, child) {
        if (!isGameReady) {
          return _buildLoadingScreen(context);
        }
        return _buildGameView(context);
      },
    );
  }

  Widget _buildGameView(BuildContext context) {
    return Consumer<CompetitionProvider>(
      builder: (context, provider, _) {
        final puzzle = provider.currentPuzzle!;
        final totalPuzzles = provider.totalPuzzles;
        final currentIndex = provider.currentPuzzleIndex + 1;
        final options = List<String>.from(puzzle['options'] ?? []);
        final isQuizFormat = options.isNotEmpty;
        final playerCount = provider.roomParticipants.length;

        return Scaffold(
          backgroundColor: AppColors.darkBackground,
          endDrawer: _buildActionsDrawer(context, provider),
          appBar: AppBar(
            backgroundColor: AppColors.darkSurface,
            elevation: 0,
            title: _buildAppBarTitle(currentIndex, totalPuzzles, playerCount),
            leading: IconButton(
              icon: Icon(Icons.arrow_back_rounded, color: AppColors.cyan),
              onPressed: () => provider.goBackToLobby(),
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
                    ? _buildQuizView(puzzle, provider)
                    : _buildLegacyView(puzzle, provider),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAppBarTitle(
    int currentIndex,
    int totalPuzzles,
    int playerCount,
  ) {
    return Row(
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
    );
  }

  Widget _buildLoadingScreen(BuildContext context) {
    final provider = context.read<CompetitionProvider>();

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

    // Use Selector to only rebuild this section when puzzle-specific data changes
    return Selector<CompetitionProvider, Map<String, dynamic>?>(
      selector: (context, p) => p.currentPuzzle,
      shouldRebuild: (prev, next) {
        return prev?['puzzleId'] != next?['puzzleId'];
      },
      builder: (context, currentPuzzle, _) {
        if (currentPuzzle == null) {
          return const Center(child: CircularProgressIndicator());
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (category.isNotEmpty) _buildCategoryBadge(category),
              const SizedBox(height: 16),
              _buildQuestionCard(question),
              const SizedBox(height: 24),
              _buildOptionsGrid(options, provider),
              if (hint.isNotEmpty) ...[
                const SizedBox(height: 24),
                _buildHintCard(hint),
              ],
              const SizedBox(height: 24),
              _buildSubmitButton(provider, options),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCategoryBadge(String category) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.magenta.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.magenta.withOpacity(0.3)),
      ),
      child: Text(
        category,
        style: TextStyle(
          color: AppColors.magenta,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildQuestionCard(String question) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cyan.withOpacity(0.2)),
      ),
      child: Text(
        question,
        style: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.5,
        ),
      ),
    );
  }

  Widget _buildOptionsGrid(List<String> options, CompetitionProvider provider) {
    return Column(
      children: List.generate(options.length, (index) {
        return _buildOptionButton(index, options[index], provider);
      }),
    );
  }

  Widget _buildOptionButton(
    int index,
    String option,
    CompetitionProvider provider,
  ) {
    final isSelected = _selectedAnswerIndex == index;
    final isCorrect = provider.correctAnswerIndex == index;
    final lastAnswerWrong =
        provider.lastAnswerCorrect == false &&
        provider.selectedAnswerIndex == index;

    Color backgroundColor = AppColors.darkSurface;
    Color borderColor = AppColors.cyan.withOpacity(0.2);

    if (isSelected && lastAnswerWrong) {
      backgroundColor = Colors.red.withOpacity(0.2);
      borderColor = Colors.red;
    } else if (isCorrect && provider.lastAnswerCorrect == true) {
      backgroundColor = Colors.green.withOpacity(0.2);
      borderColor = Colors.green;
    } else if (isSelected) {
      backgroundColor = AppColors.cyan.withOpacity(0.15);
      borderColor = AppColors.cyan;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isSubmitting
              ? null
              : () {
                  setState(() => _selectedAnswerIndex = index);
                },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor, width: 2),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: borderColor,
                  ),
                  child: Center(
                    child: Text(
                      String.fromCharCode(65 + index),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    option,
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHintCard(String hint) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.lightbulb_outline, color: Colors.amber),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              hint,
              style: TextStyle(color: Colors.amber[200], fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton(
    CompetitionProvider provider,
    List<String> options,
  ) {
    final isAnswered = _selectedAnswerIndex != null;
    final isAdvancing = provider.isAdvancingToNextPuzzle;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: (isAnswered && !_isSubmitting && !isAdvancing)
            ? () => _submitAnswer(provider, options.length)
            : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.cyan,
          disabledBackgroundColor: AppColors.darkSurface,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(
          isAdvancing ? 'الانتقال للسؤال التالي...' : 'إرسال الإجابة',
          style: TextStyle(
            color: isAnswered && !isAdvancing
                ? Colors.white
                : AppColors.textSecondary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Future<void> _submitAnswer(
    CompetitionProvider provider,
    int optionsCount,
  ) async {
    if (_selectedAnswerIndex == null || _selectedAnswerIndex! >= optionsCount) {
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await provider.submitQuizAnswer(_selectedAnswerIndex!);
    } catch (e) {
      debugPrint('Error submitting answer: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('خطأ: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
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
    return Center(
      child: Text(
        'صيغة اللغز غير مدعومة',
        style: TextStyle(color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildActionsDrawer(
    BuildContext context,
    CompetitionProvider provider,
  ) {
    return Drawer(
      backgroundColor: AppColors.darkSurface,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: AppColors.darkBackground),
            child: Text(
              'الإجراءات',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          if (provider.isHost) ...[
            _buildDrawerItem(
              'تغيير الصعوبة',
              Icons.tune_rounded,
              () => _showDifficultyDialog(context, provider),
            ),
            _buildDrawerItem(
              'حذف الغرفة',
              Icons.delete_rounded,
              () => _confirmDeleteRoom(context, provider),
            ),
          ],
          _buildDrawerItem('إعدادات الغرفة', Icons.settings_rounded, () {}),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppColors.cyan),
      title: Text(title, style: TextStyle(color: AppColors.textPrimary)),
      onTap: onTap,
    );
  }

  void _showDifficultyDialog(
    BuildContext context,
    CompetitionProvider provider,
  ) {
    Navigator.pop(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'تغيير الصعوبة',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Slider(
              value: (provider.currentDifficulty ?? 1).toDouble(),
              min: 1,
              max: 5,
              divisions: 4,
              label: 'الصعوبة',
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteRoom(BuildContext context, CompetitionProvider provider) {
    Navigator.pop(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الغرفة'),
        content: const Text('هل أنت متأكد من رغبتك في حذف هذه الغرفة؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(context);
              await provider.deleteRoom();
              if (context.mounted) {
                Navigator.pop(context);
              }
            },
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }
}
