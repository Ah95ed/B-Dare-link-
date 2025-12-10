import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_provider.dart';
import '../l10n/app_localizations.dart';

class GameView extends StatefulWidget {
  const GameView({super.key});

  @override
  State<GameView> createState() => _GameViewState();
}

class _GameViewState extends State<GameView> {
  final TextEditingController _startController = TextEditingController();
  final TextEditingController _endController = TextEditingController();
  final List<TextEditingController> _stepControllers = [
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final gameProvider = Provider.of<GameProvider>(context);

    // Initial fill from provider if controllers are empty and provider has data
    if (_startController.text.isEmpty &&
        (gameProvider.currentRound?.startWord.isNotEmpty ?? false)) {
      _startController.text = gameProvider.currentRound!.startWord;
    }
    if (_endController.text.isEmpty &&
        (gameProvider.currentRound?.endWord.isNotEmpty ?? false)) {
      _endController.text = gameProvider.currentRound!.endWord;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appTitle),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(8),
        child: Column(
          children: [
            // Start & End inputs
            _buildWordInput(
              l10n.linkStart,
              _startController,
              Icons.trip_origin,
            ),
            SizedBox(height: 20),

            // The Chain steps
            ...List.generate(_stepControllers.length, (index) {
              return Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 2,
                          height: 20,
                          color: Colors.grey.shade300,
                        ),
                        Icon(
                          Icons.link,
                          color: Theme.of(context).primaryColor,
                          size: 24,
                        ),
                        Container(
                          width: 2,
                          height: 20,
                          color: Colors.grey.shade300,
                        ),
                      ],
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _stepControllers[index],
                        decoration: InputDecoration(
                          hintText: "${l10n.steps} ${index + 1}",
                          prefixIcon: const Icon(Icons.lightbulb_outline),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),

            SizedBox(height: 20),
            Icon(
              Icons.arrow_downward,
              color: Theme.of(context).colorScheme.secondary,
            ),
            SizedBox(height: 20),

            _buildWordInput(l10n.linkEnd, _endController, Icons.location_on),

            SizedBox(height: 40),

            if (gameProvider.errorMessage != null)
              Container(
                padding: EdgeInsets.all(10),
                margin: EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  gameProvider.errorMessage!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),

            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: gameProvider.isLoading
                    ? null
                    : () {
                        final steps = _stepControllers
                            .map((c) => c.text)
                            .toList();
                        gameProvider.startNewGame(
                          _startController.text,
                          _endController.text,
                        );
                        gameProvider.validateChain(steps).then((_) {
                          if (gameProvider.currentRound?.isCompleted ?? false) {
                            _showWinDialog(context, l10n);
                          }
                        });
                      },
                child: gameProvider.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        l10n.submit,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWordInput(
    String label,
    TextEditingController controller,
    IconData icon,
  ) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Theme.of(context).primaryColor),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }

  void _showWinDialog(BuildContext context, AppLocalizations l10n) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("🎉"),
        content: Text(l10n.winMessage),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // potentially clear fields
            },
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }
}
