import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../../core/auth_guard.dart';
import 'room_lobby_view.dart';
import 'create_room_view.dart';
import '../../l10n/app_localizations.dart';

class CompetitionsView extends StatefulWidget {
  const CompetitionsView({super.key});

  @override
  State<CompetitionsView> createState() => _CompetitionsViewState();
}

class _CompetitionsViewState extends State<CompetitionsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final cp = context.read<CompetitionProvider>();
      cp.loadActiveCompetitions();
      cp.loadMyRooms();
    });
  }

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();
    final l10n = AppLocalizations.of(context)!;

    // If in a room, show room lobby (game happens in lobby now)
    if (competitionProvider.currentRoom != null) {
      return const RoomLobbyView();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.competitionsTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              competitionProvider.loadActiveCompetitions();
              competitionProvider.loadMyRooms();
            },
            tooltip: l10n.refresh,
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showJoinRoomDialog(context),
            tooltip: l10n.searchRoom,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: TextField(
              decoration: InputDecoration(
                hintText: l10n.searchByCodeHint,
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.withOpacity(0.05),
              ),
              textCapitalization: TextCapitalization.characters,
              onSubmitted: (value) async {
                final authed = await AuthGuard.requireLogin(context);
                if (!authed) return;
                if (value.length == 6) {
                  try {
                    await competitionProvider.joinRoom(value.toUpperCase());
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(l10n.joinError( e.toString())),
                        ),
                      );
                    }
                  }
                }
              },
            ),
          ),
          // Create Room Card
          Card(
            elevation: 2,
            child: InkWell(
              onTap: () => _showCreateRoomDialog(context),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Icon(
                      Icons.add_circle_outline,
                      size: 40,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.createRoomCardTitle,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            l10n.createRoomCardSubtitle,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Join Room Card
          Card(
            elevation: 2,
            child: InkWell(
              onTap: () => _showJoinRoomDialog(context),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Icon(
                      Icons.meeting_room,
                      size: 40,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.joinRoomCardTitle,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            l10n.joinRoomCardSubtitle,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Joined Rooms (My Rooms) section
          if (competitionProvider.myRooms.isNotEmpty) ...[
            Text(
              l10n.myRoomsTitle,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...competitionProvider.myRooms.map((room) {
              return Card(
                elevation: 1,
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(
                      context,
                    ).primaryColor.withOpacity(0.1),
                    child: const Icon(Icons.group),
                  ),
                  title: Text(room['name'] ?? l10n.roomLabel),
                  subtitle: Text(
                    l10n.roomCodeParticipants(
                     room['code'],
                      room['participant_count'] ?? 0,
                    ),
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () async {
                    final authed = await AuthGuard.requireLogin(context);
                    if (!authed) return;
                    try {
                      await competitionProvider.joinRoom(room['code']);
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(l10n.joinError( e.toString())),
                          ),
                        );
                      }
                    }
                  },
                ),
              );
            }),
            const SizedBox(height: 24),
          ],

          // Active Competitions
          Text(
            l10n.activeCompetitionsTitle,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (competitionProvider.activeCompetitions.isEmpty)
            Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: Text(l10n.noActiveCompetitions)),
            )
          else
            ...competitionProvider.activeCompetitions.map((competition) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.emoji_events),
                  title: Text(competition['name'] ?? l10n.competitionLabel),
                  subtitle: Text(
                    l10n.competitionSubtitle(
                       competition['participant_count'] ?? 0,
                      competition['puzzle_count'] ?? 0,
                    ),
                  ),
                  trailing: competition['status'] == 'waiting'
                      ? ElevatedButton(
                          onPressed: () {
                            AuthGuard.requireLogin(context).then((authed) {
                              if (!authed) return;
                              competitionProvider.joinCompetition(
                                competition['id'],
                              );
                            });
                          },
                          child: Text(l10n.join),
                        )
                      : Text(
                          competition['status'] == 'active'
                              ? l10n.statusActive
                              : l10n.statusFinished,
                          style: TextStyle(
                            color: competition['status'] == 'active'
                                ? Colors.green
                                : Colors.grey,
                          ),
                        ),
                ),
              );
            }),
        ],
      ),
    );
  }

  void _showCreateRoomDialog(BuildContext context) {
    AuthGuard.requireLogin(context).then((authed) {
      if (!authed) return;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const CreateRoomView()),
      );
    });
  }

  void _showJoinRoomDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    AuthGuard.requireLogin(context).then((authed) {
      if (!authed) return;
      final codeController = TextEditingController();
      final competitionProvider = context.read<CompetitionProvider>();

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(l10n.joinRoomDialogTitle),
          content: TextField(
            controller: codeController,
            decoration: InputDecoration(
              labelText: l10n.roomCodeLabel,
              hintText: l10n.roomCodeHint,
            ),
            textCapitalization: TextCapitalization.characters,
            maxLength: 6,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(l10n.cancel),
            ),
            ElevatedButton(
              onPressed: () async {
                if (codeController.text.length != 6) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(l10n.roomCodeLengthError)),
                  );
                  return;
                }
                try {
                  await competitionProvider.joinRoom(
                    codeController.text.toUpperCase(),
                  );
                  if (context.mounted) {
                    Navigator.pop(context);
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(l10n.joinError( e.toString())),
                      ),
                    );
                  }
                }
              },
              child: Text(l10n.join),
            ),
          ],
        ),
      );
    });
  }
}
