import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/app_colors.dart';
import '../../core/modern_widgets.dart';
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
              'السال $currentIndex/$totalPuzzles',
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
      body: AnimatedBackgroundGradient(
        child: WaveLoadingWidget(
          label: 'جاري تحميل اللغز...',
          waveColor: AppColors.cyan,
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
                        onTap: () {
                          debugPrint(
                            '🔘 Button tapped - Option: $optionText (index: $index)',
                          );

                          if (_isSubmitting) {
                            debugPrint('⚠️ Currently submitting, ignoring tap');
                            return;
                          }

                          if (_selectedAnswerIndex == index) {
                            debugPrint('✓ Same option selected, submitting...');
                            _submitAnswer(provider, index);
                            return;
                          }

                          debugPrint('→ Selecting option...');
                          setState(() => _selectedAnswerIndex = index);

                          Future.delayed(const Duration(milliseconds: 300), () {
                            debugPrint(
                              '→ 300ms delay completed, preparing to submit',
                            );
                            if (mounted && !_isSubmitting) {
                              debugPrint('→ Submitting after delay...');
                              _submitAnswer(provider, index);
                            }
                          });
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

  void _submitAnswer(CompetitionProvider provider, int answerIndex) async {
    if (_isSubmitting) {
      debugPrint('⚠️ Already submitting, ignoring duplicate submission');
      return;
    }

    debugPrint('📤 Submitting answer at index: $answerIndex');
    setState(() => _isSubmitting = true);

    try {
      debugPrint('📡 Calling provider.submitQuizAnswer($answerIndex)...');
      await provider.submitQuizAnswer(answerIndex);
      debugPrint('✅ Answer submitted successfully');
    } catch (e) {
      debugPrint('❌ Error submitting answer: $e');
    } finally {
      if (mounted) {
        debugPrint('🔄 Resetting state...');
        setState(() {
          _isSubmitting = false;
          _selectedAnswerIndex = null;
        });
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
            if (provider.isHost && provider.currentRoomId != null) ...[
              ListTile(
                leading: Icon(
                  Icons.admin_panel_settings,
                  color: AppColors.cyan,
                ),
                title: const Text('إدارة اللاعبين'),
                onTap: () {
                  Navigator.of(context).maybePop();
                  _showPlayersDialog(context, provider);
                },
              ),
              ListTile(
                leading: Icon(
                  Icons.skip_next_rounded,
                  color: AppColors.magenta,
                ),
                title: const Text('تخطي السؤال الحالي'),
                onTap: () async {
                  Navigator.of(context).maybePop();
                  final roomId = provider.currentRoomId!;
                  await provider.skipPuzzle(roomId);
                },
              ),
              ListTile(
                leading: Icon(Icons.refresh_rounded, color: AppColors.warning),
                title: const Text('إعادة تعيين النقاط'),
                onTap: () {
                  Navigator.of(context).maybePop();
                  _confirmResetScores(context, provider);
                },
              ),
              ListTile(
                leading: Icon(Icons.tune_rounded, color: AppColors.cyan),
                title: const Text('تغيير الصعوبة'),
                onTap: () {
                  Navigator.of(context).maybePop();
                  _showDifficultyDialog(context, provider);
                },
              ),
              ListTile(
                leading: Icon(
                  Icons.delete_forever_rounded,
                  color: AppColors.error,
                ),
                title: const Text('حذف الغرفة'),
                onTap: () {
                  Navigator.of(context).maybePop();
                  _confirmDeleteRoom(context, provider);
                },
              ),
              const Divider(height: 1),
            ],
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

  void _confirmResetScores(BuildContext context, CompetitionProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إعادة تعيين النقاط'),
        content: const Text('هل تريد إعادة تعيين نقاط جميع اللاعبين؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () async {
              Navigator.pop(context);
              final roomId = provider.currentRoomId;
              if (roomId != null) {
                await provider.resetScores(roomId);
              }
            },
            child: const Text('تأكيد', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDifficultyDialog(
    BuildContext context,
    CompetitionProvider provider,
  ) {
    final current = provider.currentDifficulty ?? 1;
    int selected = current;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تغيير الصعوبة'),
        content: StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('الصعوبة الحالية: $current'),
              const SizedBox(height: 12),
              Slider(
                value: selected.toDouble(),
                min: 1,
                max: 5,
                divisions: 4,
                label: selected.toString(),
                onChanged: (value) => setState(() => selected = value.toInt()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final roomId = provider.currentRoomId;
              if (roomId != null) {
                await provider.changeDifficulty(roomId, selected);
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  void _showPlayersDialog(BuildContext context, CompetitionProvider provider) {
    final participants = provider.roomParticipants;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إدارة اللاعبين'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: participants.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final p = participants[index];
              final username = p['username']?.toString() ?? 'لاعب';
              final score = (p['score'] as num?)?.toInt() ?? 0;
              final role = p['role']?.toString() ?? 'player';
              final userId = (p['user_id'] ?? p['userId'])?.toString() ?? '';
              final isFrozen = p['is_frozen'] == true || p['is_frozen'] == 1;
              final isManager = role == 'manager' || role == 'admin';

              return ListTile(
                leading: Stack(
                  children: [
                    CircleAvatar(
                      backgroundColor: isManager
                          ? Color(0xFFFFD700).withOpacity(0.3)
                          : AppColors.cyan.withOpacity(0.2),
                      child: Text(
                        username.isNotEmpty ? username[0] : '?',
                        style: TextStyle(
                          color: isManager ? Color(0xFFFFD700) : null,
                          fontWeight: isManager ? FontWeight.bold : null,
                        ),
                      ),
                    ),
                    if (isManager)
                      Positioned(
                        right: -2,
                        top: -2,
                        child: Text('⭐', style: TextStyle(fontSize: 14)),
                      ),
                  ],
                ),
                title: Row(
                  children: [
                    if (isManager) ...[
                      Text('⭐ ', style: TextStyle(fontSize: 14)),
                    ],
                    Expanded(child: Text(username)),
                  ],
                ),
                subtitle: Text(
                  'النقاط: $score • الدور: ${isManager ? "مدير" : role}',
                  style: TextStyle(
                    color: isManager ? Color(0xFFFFD700) : null,
                    fontWeight: isManager ? FontWeight.w600 : null,
                  ),
                ),
                trailing: PopupMenuButton<String>(
                  enabled: provider.isHost || provider.isAdminOrManager,
                  onSelected: (action) async {
                    final roomId = provider.currentRoomId;
                    if (roomId == null || userId.isEmpty) return;
                    if (action == 'freeze') {
                      await provider.freezePlayer(roomId, userId, true);
                      if (provider.errorMessage != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(provider.errorMessage!)),
                        );
                      }
                    }
                    if (action == 'unfreeze') {
                      await provider.freezePlayer(roomId, userId, false);
                      if (provider.errorMessage != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(provider.errorMessage!)),
                        );
                      }
                    }
                    if (action == 'kick') {
                      await provider.kickPlayer(roomId, userId);
                      if (provider.errorMessage != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(provider.errorMessage!)),
                        );
                      }
                    }
                    if (action == 'promote') {
                      await provider.promoteToCoManager(roomId, userId);
                      if (provider.errorMessage != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(provider.errorMessage!)),
                        );
                      }
                    }
                  },
                  itemBuilder: (context) => [
                    if (!isFrozen)
                      const PopupMenuItem(
                        value: 'freeze',
                        child: Text('تجميد'),
                      ),
                    if (isFrozen)
                      const PopupMenuItem(
                        value: 'unfreeze',
                        child: Text('إلغاء التجميد'),
                      ),
                    const PopupMenuItem(
                      value: 'promote',
                      child: Text('ترقية لمدير مساعد'),
                    ),
                    const PopupMenuItem(value: 'kick', child: Text('طرد')),
                  ],
                ),
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteRoom(BuildContext context, CompetitionProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الغرفة'),
        content: const Text(
          'هل تريد حذف هذه الغرفة؟ سيتم طرد جميع اللاعبين ولا يمكن التراجع عن هذا الإجراء.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () async {
              Navigator.pop(context);
              final roomId = provider.currentRoomId;
              if (roomId != null) {
                await provider.deleteRoom();
                if (context.mounted) {
                  Navigator.of(context).pop();
                }
              }
            },
            child: const Text('حذف', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
