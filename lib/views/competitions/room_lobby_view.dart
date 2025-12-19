import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../../providers/auth_provider.dart';

class RoomLobbyView extends StatefulWidget {
  const RoomLobbyView({super.key});

  @override
  State<RoomLobbyView> createState() => _RoomLobbyViewState();
}

class _RoomLobbyViewState extends State<RoomLobbyView> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Listen for message changes to scroll
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CompetitionProvider>().addListener(_scrollToBottom);
    });
  }

  @override
  void dispose() {
    // Remove listener before disposing
    if (mounted) {
      context.read<CompetitionProvider>().removeListener(_scrollToBottom);
    }
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (!mounted) return;
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final competitionProvider = context.watch<CompetitionProvider>();
    final authProvider = context.watch<AuthProvider>();
    final room = competitionProvider.currentRoom;
    final participants = competitionProvider.roomParticipants;
    final messages = competitionProvider.messages;

    if (room == null) {
      return const Scaffold(body: Center(child: Text('لا توجد غرفة نشطة')));
    }

    final currentUserId = authProvider.user?['id']?.toString();
    final isHost = competitionProvider.isHost;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(room['name'] ?? 'غرفة'),
            Text(
              'كود الغرفة: ${room['code']}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          if (isHost)
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () => _showSettingsDialog(context),
              tooltip: 'إعدادات الغرفة',
            ),
          IconButton(
            icon: const Icon(Icons.copy),
            onPressed: () {
              final code = room['code'] ?? '';
              Clipboard.setData(ClipboardData(text: code)).then((_) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('تم نسخ الكود: $code')),
                  );
                }
              });
            },
            tooltip: 'نسخ كود الغرفة',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => competitionProvider.refreshRoomStatus(),
            tooltip: 'تحديث الغرفة',
          ),
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            onPressed: () => competitionProvider.leaveRoom(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Connection Status Indicator
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 4),
            color: competitionProvider.isConnected
                ? Colors.green.withOpacity(0.1)
                : (competitionProvider.isConnecting
                      ? Colors.orange.withOpacity(0.1)
                      : Colors.red.withOpacity(0.1)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  competitionProvider.isConnected
                      ? Icons.cloud_done
                      : (competitionProvider.isConnecting
                            ? Icons.cloud_queue
                            : Icons.cloud_off),
                  size: 14,
                  color: competitionProvider.isConnected
                      ? Colors.green
                      : (competitionProvider.isConnecting
                            ? Colors.orange
                            : Colors.red),
                ),
                const SizedBox(width: 6),
                Text(
                  competitionProvider.isConnected
                      ? 'متصل بالخادم'
                      : (competitionProvider.isConnecting
                            ? 'جارٍ الاتصال...'
                            : 'غير متصل - اضغط تحديث'),
                  style: TextStyle(
                    fontSize: 12,
                    color: competitionProvider.isConnected
                        ? Colors.green.shade800
                        : (competitionProvider.isConnecting
                              ? Colors.orange.shade800
                              : Colors.red.shade800),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          // Participants Row
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: participants.length,
              itemBuilder: (context, index) {
                final p = participants[index];
                final pId = p['userId']?.toString();
                final isPHost = pId == competitionProvider.hostId;
                final isPReady = p['isReady'] == true;

                return Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: isPReady
                                ? Colors.green
                                : Colors.grey.shade300,
                            child: CircleAvatar(
                              radius: 22,
                              child: Text(
                                p['username']?[0]?.toUpperCase() ?? '?',
                              ),
                            ),
                          ),
                          if (isPHost)
                            Positioned(
                              right: 0,
                              bottom: 0,
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(
                                  color: Colors.amber,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.star,
                                  size: 12,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            (p['username'] ?? '...') +
                                (isPHost ? ' (القائد)' : ''),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isPHost
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: isPHost
                                  ? Colors.amber.shade900
                                  : Colors.black,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (isHost && pId != currentUserId)
                            GestureDetector(
                              onTap: () => competitionProvider.kickUser(pId!),
                              child: const Padding(
                                padding: EdgeInsets.only(right: 2),
                                child: Icon(
                                  Icons.cancel,
                                  size: 14,
                                  color: Colors.red,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 4),
            color: Colors.grey.shade200,
            child: Center(
              child: Text(
                'عدد اللاعبين: ${participants.length} / ${room['max_participants']}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const Divider(height: 1),

          // Chat Area
          Expanded(
            child: Container(
              color: Colors.grey.shade50,
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final msg = messages[index];
                  final isMe = msg['userId']?.toString() == currentUserId;

                  return Align(
                    alignment: isMe
                        ? Alignment.centerLeft
                        : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: isMe
                            ? Theme.of(context).primaryColor
                            : Colors.white,
                        borderRadius: BorderRadius.circular(12).copyWith(
                          bottomRight: isMe ? const Radius.circular(0) : null,
                          bottomLeft: !isMe ? const Radius.circular(0) : null,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 2,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: isMe
                            ? CrossAxisAlignment.start
                            : CrossAxisAlignment.end,
                        children: [
                          if (!isMe)
                            Text(
                              msg['username'] ?? '',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                              ),
                            ),
                          Text(
                            msg['text'] ?? '',
                            style: TextStyle(
                              color: isMe ? Colors.white : Colors.black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Input & Ready Button
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          decoration: InputDecoration(
                            hintText: 'اكتب رسالة...',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: BorderSide.none,
                            ),
                            filled: true,
                            fillColor: Colors.grey.shade100,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                            ),
                          ),
                          onSubmitted: (val) {
                            if (val.trim().isNotEmpty) {
                              competitionProvider.sendMessage(val.trim());
                              _messageController.clear();
                              _scrollToBottom();
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Icon(
                          Icons.send,
                          color: Theme.of(context).primaryColor,
                        ),
                        onPressed: () {
                          if (_messageController.text.trim().isNotEmpty) {
                            competitionProvider.sendMessage(
                              _messageController.text.trim(),
                            );
                            _messageController.clear();
                            _scrollToBottom();
                          }
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        competitionProvider.toggleReady(
                          !competitionProvider.isReady,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: competitionProvider.isReady
                            ? Colors.green
                            : Theme.of(context).primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        competitionProvider.isReady
                            ? 'أنت جاهز ✅'
                            : 'إعلان الجاهزية',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
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

  void _showSettingsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إعدادات الغرفة'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [Text('قريباً: إمكانية تغيير عدد الألغاز والوقت')],
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
}
