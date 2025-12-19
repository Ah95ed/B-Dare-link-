import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../../providers/competition_provider.dart';

class GroupRoomView extends StatefulWidget {
  const GroupRoomView({super.key});

  @override
  State<GroupRoomView> createState() => _GroupRoomViewState();
}

class _GroupRoomViewState extends State<GroupRoomView> {
  final _msgCtrl = TextEditingController();

  @override
  void dispose() {
    _msgCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CompetitionProvider>(
      builder: (context, cp, _) {
        final room = cp.currentRoom;
        if (room == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Group')),
            body: const Center(child: Text('No room.')),
          );
        }

        final code = room['code'] ?? '';
        final inviteLink = 'https://wonder-link.app/join?code=$code';

        return Scaffold(
          appBar: AppBar(
            title: Text(room['name'] ?? 'Group'),
            actions: [
              IconButton(
                icon: const Icon(Icons.copy),
                onPressed: () {
                  Share.share(inviteLink);
                },
                tooltip: 'Share invite',
              ),
            ],
          ),
          body: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Code: $code',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      width: 80,
                      height: 80,
                      child: QrImageView(
                        data: inviteLink,
                        version: QrVersions.auto,
                        size: 80.0,
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(),

              // Messages
              Expanded(
                child: ListView.builder(
                  reverse: true,
                  itemCount: cp.messages.length,
                  itemBuilder: (context, index) {
                    final msg = cp.messages.reversed.toList()[index];
                    return ListTile(
                      title: Text(msg['username'] ?? '...'),
                      subtitle: Text(msg['text'] ?? ''),
                      trailing: msg['type'] == 'chat'
                          ? null
                          : const Icon(Icons.info),
                    );
                  },
                ),
              ),

              // Chat input
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8.0,
                    vertical: 6,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _msgCtrl,
                          decoration: const InputDecoration(
                            hintText: 'Message...',
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: () {
                          final text = _msgCtrl.text.trim();
                          if (text.isEmpty) return;
                          cp.sendMessage(text);
                          _msgCtrl.clear();
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () {
              // Toggle ready
              cp.setReady(!cp.isReady);
            },
            label: Text(cp.isReady ? 'Ready ✓' : 'Set Ready'),
          ),
        );
      },
    );
  }
}
