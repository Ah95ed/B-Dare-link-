import '../models/game_level.dart';

class LevelData {
  // We now assume infinite or fixed number of levels,
  // but content is loaded dynamically.
  static const int totalLevels = 50;

  static GameLevel getLevelShell(int id) {
    return GameLevel(
      id: id,
      puzzles: [], // Empty puzzles = needs fetching
    );
  }
}
