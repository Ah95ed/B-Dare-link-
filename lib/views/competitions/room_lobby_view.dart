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
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Error Banner
            if (competitionProvider.errorMessage != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 6,
                  horizontal: 12,
                ),
                color: Colors.red.withOpacity(0.1),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.red,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        competitionProvider.errorMessage!,
                        style: TextStyle(
                          color: Colors.red.shade800,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 2,
                      ),
                    ),
                  ],
                ),
              ),
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

            // Top area: show puzzle instead of participants list
            if (competitionProvider.currentPuzzle != null) ...[
              _buildPuzzleCard(context, competitionProvider),
              const Divider(height: 1),
            ] else if (competitionProvider.gameStarted) ...[
              Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                color: Colors.blue.shade50,
                width: double.infinity,
                child: Row(
                  children: [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Colors.blue.shade700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'جاري تحميل السؤال...',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.blue.shade900,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    TextButton.icon(
                      onPressed: () async {
                        await competitionProvider.refreshRoomStatus();
                      },
                      icon: const Icon(Icons.refresh, size: 14),
                      label: const Text(
                        'تحديث',
                        style: TextStyle(fontSize: 12),
                      ),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
            ] else ...[
              // Participants Row (only before game starts)
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
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
                                  onTap: () =>
                                      competitionProvider.kickUser(pId),
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
            ],
            // Below area removed (now puzzle appears at top area)

            // Chat Area (scrolls with the page)
            Container(
              color: Colors.grey.shade50,
              width: double.infinity,
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
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
                              final sent = await competitionProvider
                                  .sendMessage(_messageController.text.trim());
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
                          onPressed: () async {
                            await competitionProvider.nextPuzzle();
                          },
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
                    if (isHost &&
                        competitionProvider.gameStarted &&
                        competitionProvider.currentPuzzle == null) ...[
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await competitionProvider.refreshRoomStatus();
                          },
                          icon: const Icon(Icons.refresh, color: Colors.white),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange.shade600,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          label: const Text(
                            'جلب السؤال الحالي',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                    if (isHost &&
                        competitionProvider.gameStarted &&
                        competitionProvider.currentPuzzle != null) ...[
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await competitionProvider.nextPuzzle();
                          },
                          icon: const Icon(
                            Icons.skip_next,
                            color: Colors.white,
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.purple.shade600,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          label: const Text(
                            'السؤال التالي ▶️',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                    if (isHost && competitionProvider.gameFinished) ...[
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await competitionProvider.reopenRoom();
                          },
                          icon: const Icon(Icons.refresh, color: Colors.white),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal.shade700,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          label: const Text(
                            'إعادة فتح الغرفة',
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
    final String? startWord = puzzle['startWord']?.toString();
    final String? endWord = puzzle['endWord']?.toString();
    final String? hint = puzzle['hint']?.toString();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                question,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (startWord != null || endWord != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      if (startWord != null)
                        Chip(
                          label: Text('بداية: $startWord'),
                          backgroundColor: Colors.orange.shade50,
                        ),
                      if (endWord != null)
                        Chip(
                          label: Text('نهاية: $endWord'),
                          backgroundColor: Colors.green.shade50,
                        ),
                    ],
                  ),
                ),
              if (hint != null && hint.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    'تلميح: $hint',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                  ),
                ),
              const SizedBox(height: 8),
              if (provider.puzzleEndsAt != null)
                StreamBuilder<int>(
                  stream: Stream.periodic(const Duration(seconds: 1), (_) {
                    final now = DateTime.now();
                    final remaining = provider.puzzleEndsAt!
                        .difference(now)
                        .inSeconds;
                    return remaining > 0 ? remaining : 0;
                  }),
                  builder: (context, snapshot) {
                    final remaining =
                        snapshot.data ??
                        provider.puzzleEndsAt!
                            .difference(DateTime.now())
                            .inSeconds;
                    final secs = remaining > 0 ? remaining : 0;
                    return Align(
                      alignment: Alignment.centerLeft,
                      child: Chip(
                        backgroundColor: secs <= 5
                            ? Colors.red.shade100
                            : Colors.blue.shade100,
                        label: Text(
                          'الوقت المتبقي: $secs ثانية',
                          style: TextStyle(
                            color: secs <= 5
                                ? Colors.red.shade800
                                : Colors.blue.shade800,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    );
                  },
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
                      if ((puzzle['type'] ?? 'quiz') == 'quiz') {
                        await provider.submitQuizAnswer(idx);
                      } else {
                        await provider.submitAnswer([opt]);
                      }
                    },
                  );
                })
              else
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'لم تصل خيارات لهذا السؤال بعد.',
                        style: TextStyle(
                          color: Colors.red,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: () async {
                              await provider.refreshRoomStatus();
                            },
                            icon: const Icon(Icons.refresh, size: 16),
                            label: const Text('تحديث السؤال'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Flexible(
                            child: Text(
                              'إذا استمر غياب الخيارات، اطلب من القائد إعادة بدء الجولة.',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
            ],
          ),
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
