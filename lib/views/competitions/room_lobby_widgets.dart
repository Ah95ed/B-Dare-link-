import 'package:flutter/material.dart';
import '../../providers/competition_provider.dart';
import '../../core/app_colors.dart';

/// Widgets used in RoomLobbyView
class RoomLobbyWidgets {
  /// Build the app bar for the lobby
  static AppBar buildAppBar(
    BuildContext context,
    Map<String, dynamic> room,
    List<dynamic> participants,
  ) {
    return AppBar(
      backgroundColor: AppColors.darkSurface,
      elevation: 0,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            room['name'] ?? 'غرفة',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            'عدد اللاعبين : ${participants.length}',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.info_outline),
          onPressed: () => _showRoomInfo(context, room),
        ),
      ],
    );
  }

  /// Build the lobby drawer with settings and info
  static Drawer buildLobbyDrawer(
    BuildContext context,
    Map<String, dynamic> room,
    CompetitionProvider competitionProvider,
    bool isHost,
  ) {
    return Drawer(
      backgroundColor: AppColors.darkSurface,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: AppColors.cyan,
              gradient: LinearGradient(
                colors: [AppColors.cyan, AppColors.cyan.withOpacity(0.7)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  room['name'] ?? 'غرفة',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'الرمز: ${room['code'] ?? 'N/A'}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          if (isHost)
            ListTile(
              leading: const Icon(Icons.settings, color: Colors.white),
              title: const Text(
                'إعدادات الغرفة',
                style: TextStyle(color: Colors.white),
              ),
              onTap: () {
                Navigator.pop(context);
                _navigateToSettings(context);
              },
            ),
          ListTile(
            leading: const Icon(Icons.info, color: Colors.white),
            title: const Text(
              'معلومات الغرفة',
              style: TextStyle(color: Colors.white),
            ),
            onTap: () {
              Navigator.pop(context);
              _showRoomInfo(context, room);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.exit_to_app, color: Colors.red),
            title: const Text(
              'مغادرة الغرفة',
              style: TextStyle(color: Colors.red),
            ),
            onTap: () {
              Navigator.pop(context);
              _leaveRoom(context, competitionProvider);
            },
          ),
        ],
      ),
    );
  }

  static void _showRoomInfo(BuildContext context, Map<String, dynamic> room) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('معلومات الغرفة'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('الاسم: ${room['name']}'),
            const SizedBox(height: 8),
            Text('الرمز: ${room['code']}'),
            const SizedBox(height: 8),
            Text('الحد الأقصى: ${room['maxPlayers']}'),
          ],
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

  static void _navigateToSettings(BuildContext context) {
    // Navigate to settings
  }

  static void _leaveRoom(
    BuildContext context,
    CompetitionProvider competitionProvider,
  ) {
    // Leave room logic
  }
}
