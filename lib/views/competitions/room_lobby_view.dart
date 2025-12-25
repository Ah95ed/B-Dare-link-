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

  int _prevMessageCount = 0;

  @override
  void dispose() {
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

    // Auto-scroll on new messages
    if (messages.length > _prevMessageCount) {
      _prevMessageCount = messages.length;
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } else if (messages.length < _prevMessageCount) {
      // Handle reset/clear
      _prevMessageCount = messages.length;
    }

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
          if (competitionProvider.isHost)
            IconButton(
              icon: const Icon(Icons.delete_forever, color: Colors.red),
              onPressed: () => _confirmDeleteRoom(context),
              tooltip: 'حذف المجموعة',
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => competitionProvider.leaveRoom(),
            tooltip: 'مغادرة',
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

          // Game Settings Info
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.grey.shade50,
            child: Row(
              children: [
                const Icon(Icons.settings, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text(
                  '${room['puzzleCount'] ?? 5} ألغاز • ${(room['timePerPuzzle'] ?? 60)} ثانية/لغز • ${room['puzzleSource'] == 'ai' ? 'ذكاء اصطناعي' : (room['puzzleSource'] == 'manual' ? 'يدوي' : 'قاعدة بيانات')}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const Spacer(),
              ],
            ),
          ),
          const Divider(height: 1),

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
                          if (isPHost &&
                              pId != null &&
                              competitionProvider.hostId != null)
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
                            (p['username'] ?? '...'),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isPHost
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: isPHost && pId != null
                                  ? Colors.amber.shade900
                                  : Colors.black,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (isHost && pId != currentUserId && pId != null)
                            GestureDetector(
                              onTap: () => competitionProvider.kickUser(pId),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                margin: const EdgeInsets.only(left: 4),
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close,
                                  size: 10,
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

          // Current Puzzle Display (if game is active)
          if (competitionProvider.currentPuzzle != null) ...[
            _buildPuzzleCard(context, competitionProvider),
            const Divider(height: 1),
          ],

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
                          onSubmitted: (val) async {
                            if (val.trim().isNotEmpty) {
                              final sent = await competitionProvider
                                  .sendMessage(val.trim());
                              if (!sent && mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'فشل إرسال الرسالة، يرجى التأكد من الاتصال',
                                    ),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
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
                        onPressed: () async {
                          if (_messageController.text.trim().isNotEmpty) {
                            final sent = await competitionProvider.sendMessage(
                              _messageController.text.trim(),
                            );
                            if (!sent && mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'فشل إرسال الرسالة، يرجى التأكد من الاتصال',
                                  ),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
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
                  if (isHost && !competitionProvider.gameStarted) ...[
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => competitionProvider.startGame(),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber.shade700,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'ابدأ اللعب الآن 🎮',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds a card widget displaying the current puzzle.
  /// This is a simple placeholder implementation that shows the puzzle
  /// question and a list of possible options if they exist.
  Widget _buildPuzzleCard(BuildContext context, CompetitionProvider provider) {
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) {
      return const SizedBox.shrink();
    }
    // Expected puzzle fields (adjust as needed):
    // - 'question' : String
    // - 'options'  : List<dynamic>
    // - 'type'    : String (e.g., 'quiz' or 'steps')
    final String question = puzzle['question']?.toString() ?? 'سؤال غير متوفر';
    final List<dynamic> options = puzzle['options'] as List<dynamic>? ?? [];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              question,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (options.isNotEmpty)
              ...options.asMap().entries.map((e) {
                final idx = e.key;
                final opt = e.value?.toString() ?? '';
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).primaryColorLight,
                    child: Text((idx + 1).toString()),
                  ),
                  title: Text(opt),
                  onTap: () async {
                    // For quiz type, send selected answer index.
                    if (puzzle['type'] == 'quiz') {
                      await provider.submitQuizAnswer(idx);
                    } else {
                      // For step‑based puzzles, you may handle differently.
                      // Here we simply send the answer as a list with the chosen option.
                      await provider.submitAnswer([opt]);
                    }
                  },
                );
              }).toList(),
          ],
        ),
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

  void _confirmDeleteRoom(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف المجموعة'),
        content: const Text(
          'هل أنت متأكد من رغبتك في حذف المجموعة نهائياً؟ سيتم طرد جميع الأعضاء.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              context.read<CompetitionProvider>().deleteRoom();
              Navigator.pop(context);
            },
            child: const Text('حذف', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
