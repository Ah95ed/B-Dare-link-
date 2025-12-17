import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../../controllers/game_provider.dart';
import '../../models/game_puzzle.dart';
import '../../models/game_level.dart';

class RoomGameView extends StatefulWidget {
  const RoomGameView({super.key});

  @override
  State<RoomGameView> createState() => _RoomGameViewState();
}

class _RoomGameViewState extends State<RoomGameView> {
  List<String> _selectedSteps = [];
  int _currentStepIndex = 0;

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();
    final puzzle = competitionProvider.currentPuzzle;
    final participants = competitionProvider.roomParticipants;

    if (puzzle == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final startWord = puzzle['startWord'] ?? '';
    final endWord = puzzle['endWord'] ?? '';
    final steps = List<Map<String, dynamic>>.from(puzzle['steps'] ?? []);
    final hint = puzzle['hint'] ?? '';

    return Scaffold(
      appBar: AppBar(
        title: Text('اللغز ${competitionProvider.currentPuzzleIndex + 1}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.leaderboard),
            onPressed: () => _showLeaderboard(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Score and Timer
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).primaryColor.withOpacity(0.1),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    const Text('النقاط'),
                    Text(
                      '${competitionProvider.score}',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Column(
                  children: [
                    const Text('الألغاز المحلولة'),
                    Text(
                      '${competitionProvider.puzzlesSolved}',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Puzzle
          Expanded(
            child: SingleChildScrollView(
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
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
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
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
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

                  const SizedBox(height: 24),
                  const Text(
                    'اختر الخطوات:',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  // Steps
                  ...steps.asMap().entries.map((entry) {
                    final stepIndex = entry.key;
                    final step = entry.value;
                    final word = step['word'] ?? '';
                    final options = List<String>.from(step['options'] ?? []);

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'الخطوة ${stepIndex + 1}',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: options.map((option) {
                                final isSelected = _selectedSteps.length > stepIndex &&
                                    _selectedSteps[stepIndex] == option;

                                return ChoiceChip(
                                  label: Text(option),
                                  selected: isSelected,
                                  onSelected: (selected) {
                                    setState(() {
                                      if (_selectedSteps.length <= stepIndex) {
                                        _selectedSteps = List.filled(stepIndex + 1, '');
                                      }
                                      _selectedSteps[stepIndex] = selected ? option : '';
                                    });
                                  },
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),

                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _selectedSteps.length == steps.length &&
                              _selectedSteps.every((s) => s.isNotEmpty)
                          ? () {
                              competitionProvider.submitAnswer(_selectedSteps);
                              setState(() {
                                _selectedSteps = [];
                              });
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text(
                        'إرسال الإجابة',
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showLeaderboard(BuildContext context) {
    final competitionProvider = context.read<CompetitionProvider>();
    final room = competitionProvider.currentRoom;

    if (room == null) return;

    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'الترتيب',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...competitionProvider.roomParticipants.asMap().entries.map((entry) {
              final index = entry.key;
              final participant = entry.value;
              return ListTile(
                leading: CircleAvatar(
                  child: Text('${index + 1}'),
                ),
                title: Text(participant['username'] ?? 'مجهول'),
                trailing: Text('${participant['score'] ?? 0} نقطة'),
              );
            }),
          ],
        ),
      ),
    );
  }
}

