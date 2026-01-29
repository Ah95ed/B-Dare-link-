import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/tournament_provider.dart';
import '../providers/auth_provider.dart';
import '../controllers/locale_provider.dart';
import '../core/app_colors.dart';
import '../l10n/app_localizations.dart';

/// Tournament view with daily challenge and leaderboards
class TournamentView extends StatefulWidget {
  const TournamentView({super.key});

  @override
  State<TournamentView> createState() => _TournamentViewState();
}

class _TournamentViewState extends State<TournamentView>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    // Fetch data on init
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final tournament = context.read<TournamentProvider>();
      final auth = context.read<AuthProvider>();

      final token = await auth.getToken();
      if (token != null) {
        tournament.setAuthToken(token);
      }

      tournament.fetchDailyChallenge();
      tournament.fetchDailyLeaderboard();
      tournament.fetchWeeklyStandings();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tournament = context.watch<TournamentProvider>();
    final isArabic =
        context.watch<LocaleProvider>().locale.languageCode == 'ar';
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: Text(
          l10n.tournaments,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.cyan,
          labelColor: AppColors.cyan,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: [
            Tab(text: l10n.daily),
            Tab(text: l10n.weekly),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDailyTab(tournament, isArabic),
          _buildWeeklyTab(tournament, isArabic),
        ],
      ),
    );
  }

  Widget _buildDailyTab(TournamentProvider tournament, bool isArabic) {
    final l10n = AppLocalizations.of(context)!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Daily Challenge Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.cyan.withOpacity(0.2),
                  AppColors.magenta.withOpacity(0.1),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.today, color: AppColors.cyan, size: 28),
                    const SizedBox(width: 8),
                    Text(
                      l10n.dailyChallenge,
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                if (tournament.hasPlayedToday) ...[
                  // Show results
                  _buildResultCard(
                    icon: Icons.emoji_events,
                    label: l10n.yourScore,
                    value: '${tournament.todayScore ?? 0}',
                    color: Colors.amber,
                  ),
                  const SizedBox(height: 12),
                  _buildResultCard(
                    icon: Icons.leaderboard,
                    label: l10n.yourRank,
                    value: '#${tournament.todayRank ?? '-'}',
                    color: AppColors.cyan,
                  ),
                  const SizedBox(height: 16),
                  _buildCountdown(tournament, isArabic),
                ] else ...[
                  // Play button
                  ElevatedButton(
                    onPressed: tournament.isLoading
                        ? null
                        : () => _playDailyChallenge(tournament),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.cyan,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.play_arrow),
                        const SizedBox(width: 8),
                        Text(
                          l10n.playNow,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Leaderboard
          Text(
            l10n.todaysLeaders,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          _buildLeaderboard(tournament.dailyLeaderboard, isArabic),
        ],
      ),
    );
  }

  Widget _buildWeeklyTab(TournamentProvider tournament, bool isArabic) {
    final l10n = AppLocalizations.of(context)!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Weekly info card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.magenta.withOpacity(0.3)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.calendar_month,
                      color: AppColors.magenta,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      l10n.weeklyChampionship,
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  isArabic
                      ? 'اجمع النقاط طوال الأسبوع!'
                      : 'Accumulate points throughout the week!',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          Text(
            l10n.weeklyStandings,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          _buildLeaderboard(
            tournament.weeklyStandings,
            isArabic,
            isWeekly: true,
          ),
        ],
      ),
    );
  }

  Widget _buildResultCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(label, style: TextStyle(color: AppColors.textSecondary)),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountdown(TournamentProvider tournament, bool isArabic) {
    final remaining = tournament.getTimeUntilNextChallenge();
    final hours = remaining.inHours;
    final minutes = remaining.inMinutes % 60;

    return Text(
      isArabic
          ? 'التحدي القادم خلال: $hours ساعة و $minutes دقيقة'
          : 'Next challenge in: ${hours}h ${minutes}m',
      style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
    );
  }

  Widget _buildLeaderboard(
    List<Map<String, dynamic>> data,
    bool isArabic, {
    bool isWeekly = false,
  }) {
    if (data.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            isArabic ? 'لا توجد بيانات بعد' : 'No data yet',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: data.length > 10 ? 10 : data.length,
        separatorBuilder: (_, __) =>
            Divider(color: AppColors.divider, height: 1),
        itemBuilder: (context, index) {
          final entry = data[index];
          final rank = entry['rank'] ?? (index + 1);

          return ListTile(
            leading: _buildRankBadge(rank),
            title: Text(
              entry['username'] ?? 'Unknown',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: rank <= 3 ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${isWeekly ? entry['totalScore'] : entry['score']}',
                  style: TextStyle(
                    color: AppColors.cyan,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                if (!isWeekly) ...[
                  const SizedBox(width: 8),
                  Text(
                    '${entry['timeTaken'] ?? 0}s',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildRankBadge(int rank) {
    Color color;
    IconData? icon;

    switch (rank) {
      case 1:
        color = Colors.amber;
        icon = Icons.workspace_premium;
        break;
      case 2:
        color = Colors.grey.shade400;
        icon = Icons.workspace_premium;
        break;
      case 3:
        color = Colors.brown.shade400;
        icon = Icons.workspace_premium;
        break;
      default:
        color = AppColors.textSecondary;
        icon = null;
    }

    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: icon != null
            ? Icon(icon, color: color, size: 20)
            : Text(
                '$rank',
                style: TextStyle(color: color, fontWeight: FontWeight.bold),
              ),
      ),
    );
  }

  void _playDailyChallenge(TournamentProvider tournament) {
    // TODO: Navigate to daily challenge gameplay
    // For now just show a message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Daily challenge will open here!'),
        backgroundColor: AppColors.cyan,
      ),
    );
  }
}
