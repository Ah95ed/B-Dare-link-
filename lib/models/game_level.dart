import 'game_puzzle.dart';

class GameLevel {
  final int id;
  final List<GamePuzzle> puzzles;

  const GameLevel({required this.id, required this.puzzles});
}
