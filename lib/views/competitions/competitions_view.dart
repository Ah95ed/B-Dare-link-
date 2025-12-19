import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import 'room_lobby_view.dart';
import 'room_game_view.dart';

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
      context.read<CompetitionProvider>().loadActiveCompetitions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();

    // If in a room, show room view
    if (competitionProvider.currentRoom != null) {
      if (competitionProvider.gameStarted) {
        return const RoomGameView();
      } else {
        return const RoomLobbyView();
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('المسابقات والغرف'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showJoinRoomDialog(context),
            tooltip: 'بحث عن غرفة',
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
                hintText: 'ابحث بالكود (مثال: ABCD12)',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.withOpacity(0.05),
              ),
              textCapitalization: TextCapitalization.characters,
              onSubmitted: (value) {
                if (value.length == 6) {
                  competitionProvider.joinRoom(value.toUpperCase());
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
                            'إنشاء غرفة جديدة',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'أنشئ غرفة وادعُ أصدقاءك للعب',
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
                            'الانضمام إلى غرفة',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'ادخل كود الغرفة للانضمام',
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
          const SizedBox(height: 24),

          // Active Competitions
          Text(
            'المسابقات النشطة',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (competitionProvider.activeCompetitions.isEmpty)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: Text('لا توجد مسابقات نشطة حالياً')),
            )
          else
            ...competitionProvider.activeCompetitions.map((competition) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.emoji_events),
                  title: Text(competition['name'] ?? 'مسابقة'),
                  subtitle: Text(
                    '${competition['participant_count'] ?? 0} مشارك • ${competition['puzzle_count'] ?? 0} لغز',
                  ),
                  trailing: competition['status'] == 'waiting'
                      ? ElevatedButton(
                          onPressed: () {
                            competitionProvider.joinCompetition(
                              competition['id'],
                            );
                          },
                          child: const Text('انضم'),
                        )
                      : Text(
                          competition['status'] == 'active'
                              ? 'جارية'
                              : 'منتهية',
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
    final nameController = TextEditingController();
    final competitionProvider = context.read<CompetitionProvider>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إنشاء غرفة جديدة'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'اسم الغرفة (اختياري)',
                hintText: 'مثال: غرفة الأصدقاء',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await competitionProvider.createRoom(
                  name: nameController.text.isEmpty
                      ? null
                      : nameController.text,
                );
                if (context.mounted) {
                  Navigator.pop(context);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                }
              }
            },
            child: const Text('إنشاء'),
          ),
        ],
      ),
    );
  }

  void _showJoinRoomDialog(BuildContext context) {
    final codeController = TextEditingController();
    final competitionProvider = context.read<CompetitionProvider>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('الانضمام إلى غرفة'),
        content: TextField(
          controller: codeController,
          decoration: const InputDecoration(
            labelText: 'كود الغرفة',
            hintText: 'أدخل الكود المكون من 6 أحرف',
          ),
          textCapitalization: TextCapitalization.characters,
          maxLength: 6,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (codeController.text.length != 6) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('الكود يجب أن يكون 6 أحرف')),
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
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                }
              }
            },
            child: const Text('انضم'),
          ),
        ],
      ),
    );
  }
}
