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
}
