import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';

class RoomGameView extends StatefulWidget {
  const RoomGameView({super.key});

  @override
  State<RoomGameView> createState() => _RoomGameViewState();
}

class _RoomGameViewState extends State<RoomGameView> {
  int? _selectedAnswerIndex;
  bool _isSubmitting = false;
  late CompetitionProvider _provider;

  @override
  void initState() {
    super.initState();
    _provider = context.read<CompetitionProvider>();
    _provider.addListener(_onProviderUpdate);
  }

  @override
  void dispose() {
    _provider.removeListener(_onProviderUpdate);
    super.dispose();
  }

  void _onProviderUpdate() {
    // Reset selected answer when puzzle changes
    if (mounted) {
      setState(() {
        _selectedAnswerIndex = null;
        _isSubmitting = false;
      });
    }
  }

  // Helper to get current user role
  String? _getCurrentUserRole(CompetitionProvider provider) {
    try {
      // Find the first participant (current user)
      final participant = provider.roomParticipants.isNotEmpty
          ? provider.roomParticipants.first
          : null;
      return participant?['role'] as String?;
    } catch (e) {
      return null;
    }
  }

  // Check if current user is manager
  bool _isManager(CompetitionProvider provider) {
    final role = _getCurrentUserRole(provider);
    return role == 'manager' || role == 'co_manager';
  }

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();
    final puzzle = competitionProvider.currentPuzzle;

    if (puzzle == null) {
      return _buildLoadingScreen(competitionProvider);
    }

    // Check if it's quiz format (has question and options)
    final isQuizFormat =
        puzzle['question'] != null && puzzle['options'] != null;

    return Scaffold(
      appBar: AppBar(
        title: Text('السؤال ${competitionProvider.currentPuzzleIndex + 1}'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => competitionProvider.goBackToLobby(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.leaderboard),
            onPressed: () => _showLeaderboard(context),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => _showSettingsDialog(context, competitionProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // Score Bar
          _buildScoreBar(competitionProvider),

          // Puzzle Content
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
      appBar: AppBar(
        title: const Text('انتظار اللغز...'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => provider.goBackToLobby(),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            const Text('جاري تحميل اللغز...'),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => provider.refreshRoomStatus(),
              icon: const Icon(Icons.refresh),
              label: const Text('تحديث'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => provider.goBackToLobby(),
              child: const Text('إلغاء والعودة للغرفة'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreBar(CompetitionProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor.withOpacity(0.2),
            Theme.of(context).primaryColor.withOpacity(0.1),
          ],
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _scoreItem('النقاط', '${provider.score}', Icons.stars),
              _scoreItem(
                'المحلولة',
                '${provider.puzzlesSolved}',
                Icons.check_circle,
              ),
              _scoreItem(
                'السؤال',
                '${provider.currentPuzzleIndex + 1}/${provider.totalPuzzles}',
                Icons.quiz,
              ),
            ],
          ),
          // Show who solved first
          if (provider.solvedByUsername != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.amber.shade100,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.amber.shade400),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.emoji_events,
                    color: Colors.amber.shade900,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '🎉 ${provider.solvedByUsername} حل أولاً!',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.amber.shade900,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _scoreItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 20, color: Theme.of(context).primaryColor),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
      ],
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

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Category badge
          if (category.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                category,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).primaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),

          const SizedBox(height: 20),

          // Question
          Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                question,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  height: 1.5,
                ),
              ),
            ),
          ),

          // Hint
          if (hint.isNotEmpty) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.lightbulb_outline,
                  size: 16,
                  color: Colors.orange.shade700,
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    hint,
                    style: TextStyle(
                      color: Colors.orange.shade700,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 24),

          // Help & Report Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Get Hint Button
              ElevatedButton.icon(
                onPressed: () => _getHint(context, _provider),
                icon: const Icon(Icons.lightbulb),
                label: const Text('احصل على مساعدة'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              ),
              // Report Bad Question Button
              ElevatedButton.icon(
                onPressed: () => _reportBadQuestion(context, _provider),
                icon: const Icon(Icons.flag),
                label: const Text('سؤال غير واضح'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade400,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Options
          Expanded(
            child: ListView.builder(
              itemCount: options.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedAnswerIndex == index;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Material(
                    elevation: isSelected ? 6 : 2,
                    borderRadius: BorderRadius.circular(16),
                    child: InkWell(
                      onTap: _isSubmitting
                          ? null
                          : () => _selectAnswer(index, provider),
                      borderRadius: BorderRadius.circular(16),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? Theme.of(context).primaryColor
                                : Colors.grey.shade300,
                            width: isSelected ? 3 : 1,
                          ),
                          color: isSelected
                              ? Theme.of(context).primaryColor.withOpacity(0.1)
                              : Colors.white,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected
                                    ? Theme.of(context).primaryColor
                                    : Colors.grey.shade200,
                              ),
                              child: Center(
                                child: Text(
                                  String.fromCharCode(65 + index), // A, B, C, D
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.grey.shade700,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                options[index],
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                            ),
                            if (isSelected)
                              Icon(
                                Icons.check_circle,
                                color: Theme.of(context).primaryColor,
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectAnswer(int index, CompetitionProvider provider) async {
    setState(() {
      _selectedAnswerIndex = index;
      _isSubmitting = true;
    });

    // Submit immediately when option is selected (speed competition!)
    await provider.submitQuizAnswer(index);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم إرسال الإجابة! ⚡'),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  // Legacy view for word chain puzzles (kept for backwards compatibility)
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
          // Start and End Words
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Card(
                  color: Colors.blue.shade100,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      startWord,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
              const Icon(Icons.arrow_forward, size: 32),
              Expanded(
                child: Card(
                  color: Colors.green.shade100,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      endWord,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (hint.isNotEmpty) ...[
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Icon(Icons.lightbulb_outline),
                    const SizedBox(width: 8),
                    Expanded(child: Text(hint)),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          const Text(
            'هذا اللغز يستخدم النظام القديم - يرجى تحديث الغرفة',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  void _showLeaderboard(BuildContext context) {
    final competitionProvider = context.read<CompetitionProvider>();
    final participants = List<Map<String, dynamic>>.from(
      competitionProvider.roomParticipants,
    );

    // Sort by score descending
    participants.sort((a, b) => (b['score'] ?? 0).compareTo(a['score'] ?? 0));

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.leaderboard, color: Theme.of(context).primaryColor),
                const SizedBox(width: 8),
                const Text(
                  '🏆 الترتيب',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...participants.asMap().entries.map((entry) {
              final index = entry.key;
              final p = entry.value;
              final isFirst = index == 0;
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: isFirst
                      ? Colors.amber
                      : Colors.grey.shade300,
                  child: Text(
                    '${index + 1}',
                    style: TextStyle(
                      color: isFirst ? Colors.white : Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(p['username'] ?? 'مجهول'),
                trailing: Text(
                  '${p['score'] ?? 0} نقطة',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isFirst ? Colors.amber.shade700 : null,
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Future<void> _getHint(
    BuildContext context,
    CompetitionProvider provider,
  ) async {
    try {
      final result = await provider.getHint(
        provider.currentRoomId ?? 0,
        provider.currentPuzzleIndex,
      );

      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('💡 المساعدة'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(result['hint'] ?? 'لا توجد مساعدة متاحة'),
                const SizedBox(height: 12),
                Text(
                  'المساعدات المتبقية: ${result['hintsRemaining'] ?? 0}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('حسناً'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
      }
    }
  }

  Future<void> _reportBadQuestion(
    BuildContext context,
    CompetitionProvider provider,
  ) async {
    final reasonController = TextEditingController();
    const reportTypes = [
      'bad_wording',
      'wrong_answer',
      'unclear',
      'offensive',
      'duplicate',
      'other',
    ];
    const reportLabels = {
      'bad_wording': 'خطأ في الصياغة',
      'wrong_answer': 'الإجابة الصحيحة خاطئة',
      'unclear': 'السؤال غير واضح',
      'offensive': 'محتوى مسيء',
      'duplicate': 'سؤال مكرر',
      'other': 'أخرى',
    };

    String selectedType = 'unclear';

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('⚠️ الإبلاغ عن سؤال'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('نوع المشكلة:'),
              const SizedBox(height: 12),
              DropdownButton<String>(
                value: selectedType,
                isExpanded: true,
                items: reportTypes.map((type) {
                  return DropdownMenuItem(
                    value: type,
                    child: Text(reportLabels[type] ?? type),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => selectedType = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              const Text('تفاصيل إضافية (اختياري):'),
              const SizedBox(height: 8),
              TextField(
                controller: reasonController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'اشرح المشكلة...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  await provider.reportBadPuzzle(
                    provider.currentRoomId ?? 0,
                    provider.currentPuzzleIndex,
                    selectedType,
                    reasonController.text,
                  );

                  if (mounted) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('شكراً على تقريرك. سيتم مراجعته قريباً.'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(
                      context,
                    ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('إرسال التقرير'),
            ),
          ],
        ),
      ),
    );
  }

  // Settings Dialog
  void _showSettingsDialog(BuildContext context, CompetitionProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => FutureBuilder<Map<String, dynamic>>(
          future: provider.getRoomSettings(provider.currentRoomId ?? 0),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const AlertDialog(
                content: SizedBox(
                  height: 100,
                  child: Center(child: CircularProgressIndicator()),
                ),
              );
            }

            if (snapshot.hasError) {
              return AlertDialog(
                title: const Text('خطأ'),
                content: Text('فشل تحميل الإعدادات: ${snapshot.error}'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('حسناً'),
                  ),
                ],
              );
            }

            final settings = snapshot.data ?? {};

            return AlertDialog(
              title: const Text('⚙️ إعدادات الغرفة'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // المساعدات (Hints)
                    _buildSettingSection('المساعدات', [
                      SwitchListTile(
                        title: const Text('تفعيل المساعدات'),
                        subtitle: const Text('السماح للاعبين بطلب مساعدات'),
                        value: settings['hints_enabled'] ?? true,
                        onChanged: (value) {
                          setState(() {
                            settings['hints_enabled'] = value;
                          });
                        },
                      ),
                      if (settings['hints_enabled'] ?? true) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 8),
                              Text(
                                'عدد المساعدات: ${settings['hints_per_player'] ?? 3}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              Slider(
                                value: (settings['hints_per_player'] ?? 3)
                                    .toDouble(),
                                min: 0,
                                max: 10,
                                divisions: 10,
                                onChanged: (value) {
                                  setState(() {
                                    settings['hints_per_player'] = value
                                        .toInt();
                                  });
                                },
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'خصم النقاط: ${settings['hint_penalty_percent'] ?? 10}%',
                                style: const TextStyle(fontSize: 12),
                              ),
                              Slider(
                                value: (settings['hint_penalty_percent'] ?? 10)
                                    .toDouble(),
                                min: 0,
                                max: 50,
                                divisions: 10,
                                onChanged: (value) {
                                  setState(() {
                                    settings['hint_penalty_percent'] = value;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ]),
                    const SizedBox(height: 16),
                    // الخيارات
                    _buildSettingSection('الخيارات', [
                      SwitchListTile(
                        title: const Text('خلط الخيارات'),
                        subtitle: const Text('إعادة ترتيب خيارات الإجابة'),
                        value: settings['shuffle_options'] ?? true,
                        onChanged: (value) {
                          setState(() {
                            settings['shuffle_options'] = value;
                          });
                        },
                      ),
                      SwitchListTile(
                        title: const Text('عرض الترتيب الحي'),
                        subtitle: const Text(
                          'إظهار ترتيب اللاعبين أثناء اللعبة',
                        ),
                        value: settings['show_rankings_live'] ?? true,
                        onChanged: (value) {
                          setState(() {
                            settings['show_rankings_live'] = value;
                          });
                        },
                      ),
                      SwitchListTile(
                        title: const Text('السماح بالإبلاغ عن أسئلة سيئة'),
                        subtitle: const Text('يمكن للاعبين الإبلاغ عن مشاكل'),
                        value: settings['allow_report_bad_puzzle'] ?? true,
                        onChanged: (value) {
                          setState(() {
                            settings['allow_report_bad_puzzle'] = value;
                          });
                        },
                      ),
                    ]),
                    const SizedBox(height: 16),
                    // الوقت
                    _buildSettingSection('الوقت والسرعة', [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'الانتقال التلقائي: ${settings['auto_advance_seconds'] ?? 2} ثانية',
                              style: const TextStyle(fontSize: 12),
                            ),
                            Slider(
                              value: (settings['auto_advance_seconds'] ?? 2)
                                  .toDouble(),
                              min: 0,
                              max: 10,
                              divisions: 10,
                              label:
                                  '${settings['auto_advance_seconds'] ?? 2}s',
                              onChanged: (value) {
                                setState(() {
                                  settings['auto_advance_seconds'] = value
                                      .toInt();
                                });
                              },
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'الحد الأدنى للوقت: ${settings['min_time_per_puzzle'] ?? 5} ثانية',
                              style: const TextStyle(fontSize: 12),
                            ),
                            Slider(
                              value: (settings['min_time_per_puzzle'] ?? 5)
                                  .toDouble(),
                              min: 0,
                              max: 30,
                              divisions: 6,
                              label: '${settings['min_time_per_puzzle'] ?? 5}s',
                              onChanged: (value) {
                                setState(() {
                                  settings['min_time_per_puzzle'] = value
                                      .toInt();
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ]),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('إلغاء'),
                ),
                if (_isManager(provider)) ...[
                  PopupMenuButton(
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'skip',
                        onTap: () {
                          Navigator.pop(ctx);
                          _skipPuzzle(context, provider);
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.skip_next),
                            SizedBox(width: 8),
                            Text('تخطي السؤال'),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'reset',
                        onTap: () {
                          Navigator.pop(ctx);
                          _resetScores(context, provider);
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.restart_alt),
                            SizedBox(width: 8),
                            Text('إعادة تعيين النقاط'),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'difficulty',
                        onTap: () {
                          Navigator.pop(ctx);
                          _showDifficultyDialog(context, provider);
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.engineering),
                            SizedBox(width: 8),
                            Text('تغيير الصعوبة'),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'players',
                        onTap: () {
                          Navigator.pop(ctx);
                          _showPlayersDialog(context, provider);
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.people),
                            SizedBox(width: 8),
                            Text('إدارة اللاعبين'),
                          ],
                        ),
                      ),
                    ],
                    child: const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.admin_panel_settings),
                          SizedBox(width: 4),
                          Text('أدوات المدير'),
                        ],
                      ),
                    ),
                  ),
                ],
                ElevatedButton.icon(
                  icon: const Icon(Icons.save),
                  label: const Text('حفظ'),
                  onPressed: () async {
                    try {
                      await provider.updateRoomSettings(
                        provider.currentRoomId ?? 0,
                        settings,
                      );

                      if (mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('تم حفظ الإعدادات بنجاح'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('خطأ: $e'),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    }
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  // Helper to build setting sections
  Widget _buildSettingSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ),
        ...children,
      ],
    );
  }

  // Skip Puzzle (Manager Only)
  void _skipPuzzle(BuildContext context, CompetitionProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('⏭️ تخطي السؤال'),
        content: const Text(
          'هل تريد فعلاً تخطي السؤال الحالي والانتقال للسؤال التالي؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await provider.skipPuzzle(provider.currentRoomId ?? 0);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('تم تخطي السؤال بنجاح'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                }
              }
            },
            child: const Text('تخطي'),
          ),
        ],
      ),
    );
  }

  // Reset Scores (Manager Only)
  void _resetScores(BuildContext context, CompetitionProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('⚠️ إعادة تعيين النقاط'),
        content: const Text(
          'سيتم إعادة تعيين نقاط جميع اللاعبين إلى 0. هل أنت متأكد؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await provider.resetScores(provider.currentRoomId ?? 0);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('تم إعادة تعيين النقاط بنجاح'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                }
              }
            },
            child: const Text('إعادة تعيين'),
          ),
        ],
      ),
    );
  }

  // Change Difficulty (Manager Only)
  void _showDifficultyDialog(
    BuildContext context,
    CompetitionProvider provider,
  ) {
    int newDifficulty = provider.currentDifficulty ?? 3;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('📊 تغيير الصعوبة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('اختر مستوى الصعوبة الجديد:'),
              const SizedBox(height: 16),
              Text(
                'الصعوبة: $newDifficulty / 10',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Slider(
                value: newDifficulty.toDouble(),
                min: 1,
                max: 10,
                divisions: 9,
                label: '$newDifficulty',
                onChanged: (value) {
                  setState(() => newDifficulty = value.toInt());
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  await provider.changeDifficulty(
                    provider.currentRoomId ?? 0,
                    newDifficulty,
                  );
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('تم تغيير الصعوبة إلى $newDifficulty'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(
                      context,
                    ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                  }
                }
              },
              child: const Text('تطبيق'),
            ),
          ],
        ),
      ),
    );
  }

  // Manage Players (Manager Only)
  void _showPlayersDialog(BuildContext context, CompetitionProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('👥 إدارة اللاعبين'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: provider.roomParticipants.length,
            itemBuilder: (context, index) {
              final participant = provider.roomParticipants[index];
              final isFrozen = participant['is_frozen'] ?? false;
              final role = participant['role'] ?? 'player';

              return ListTile(
                leading: CircleAvatar(
                  child: Text(
                    (participant['username'] ?? '?')[0].toUpperCase(),
                  ),
                ),
                title: Text(
                  participant['username'] ?? 'اللاعب ${index + 1}',
                  style: TextStyle(
                    decoration: participant['is_kicked'] ?? false
                        ? TextDecoration.lineThrough
                        : null,
                  ),
                ),
                subtitle: Text('النقاط: ${participant['score'] ?? 0}'),
                trailing: PopupMenuButton(
                  itemBuilder: (context) => [
                    if (!isFrozen)
                      PopupMenuItem(
                        value: 'freeze',
                        child: const Row(
                          children: [
                            Icon(Icons.lock, color: Colors.blue),
                            SizedBox(width: 8),
                            Text('تجميد'),
                          ],
                        ),
                      )
                    else
                      PopupMenuItem(
                        value: 'unfreeze',
                        child: const Row(
                          children: [
                            Icon(Icons.lock_open, color: Colors.green),
                            SizedBox(width: 8),
                            Text('إلغاء التجميد'),
                          ],
                        ),
                      ),
                    if (role == 'player')
                      PopupMenuItem(
                        value: 'promote',
                        child: const Row(
                          children: [
                            Icon(
                              Icons.admin_panel_settings,
                              color: Colors.orange,
                            ),
                            SizedBox(width: 8),
                            Text('ترقية لمدير'),
                          ],
                        ),
                      ),
                    PopupMenuItem(
                      value: 'kick',
                      child: const Row(
                        children: [
                          Icon(Icons.delete, color: Colors.red),
                          SizedBox(width: 8),
                          Text('طرد'),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) async {
                    try {
                      if (value == 'freeze') {
                        await provider.freezePlayer(
                          provider.currentRoomId ?? 0,
                          participant['user_id'],
                          true,
                        );
                      } else if (value == 'unfreeze') {
                        await provider.freezePlayer(
                          provider.currentRoomId ?? 0,
                          participant['user_id'],
                          false,
                        );
                      } else if (value == 'kick') {
                        await provider.kickPlayer(
                          provider.currentRoomId ?? 0,
                          participant['user_id'],
                        );
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(
                          context,
                        ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                      }
                    }
                  },
                ),
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }
}
