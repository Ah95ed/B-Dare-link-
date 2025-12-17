import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../../providers/auth_provider.dart';

class RoomLobbyView extends StatelessWidget {
  const RoomLobbyView({super.key});

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();
    final authProvider = context.watch<AuthProvider>();
    final room = competitionProvider.currentRoom;
    final participants = competitionProvider.roomParticipants;

    if (room == null) {
      return const Scaffold(
        body: Center(child: Text('لا توجد غرفة نشطة')),
      );
    }

    final currentUser = authProvider.user;
    final currentUserId = currentUser?['id'];

    return Scaffold(
      appBar: AppBar(
        title: Text(room['name'] ?? 'غرفة'),
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            onPressed: () {
              competitionProvider.leaveRoom();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Room Code Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            color: Theme.of(context).primaryColor.withOpacity(0.1),
            child: Column(
              children: [
                const Text(
                  'كود الغرفة',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  room['code'] ?? '',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                const SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    // Copy to clipboard
                  },
                  icon: const Icon(Icons.copy),
                  label: const Text('نسخ الكود'),
                ),
              ],
            ),
          ),

          // Participants List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  'المشاركون (${participants.length}/${room['max_participants']})',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 12),
                ...participants.map((participant) {
                  final isCurrentUser = participant['user_id'] == currentUserId;
                  final isReady = participant['is_ready'] == true;

                  return Card(
                    color: isCurrentUser ? Theme.of(context).primaryColor.withOpacity(0.1) : null,
                    child: ListTile(
                      leading: CircleAvatar(
                        child: Text(participant['username']?[0]?.toUpperCase() ?? '?'),
                      ),
                      title: Text(
                        participant['username'] ?? 'مجهول',
                        style: TextStyle(
                          fontWeight: isCurrentUser ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      subtitle: Text('النقاط: ${participant['total_score'] ?? 0}'),
                      trailing: isReady
                          ? const Icon(Icons.check_circle, color: Colors.green)
                          : const Icon(Icons.radio_button_unchecked, color: Colors.grey),
                    ),
                  );
                }),
              ],
            ),
          ),

          // Ready Button
          Container(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  competitionProvider.setReady(!competitionProvider.isReady);
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: competitionProvider.isReady
                      ? Colors.green
                      : Theme.of(context).primaryColor,
                ),
                child: Text(
                  competitionProvider.isReady ? 'غير جاهز' : 'جاهز',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

