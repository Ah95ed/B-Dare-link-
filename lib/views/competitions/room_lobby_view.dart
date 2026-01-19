import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../../providers/auth_provider.dart';
import 'room_settings_view.dart';

class RoomLobbyView extends StatefulWidget {
  const RoomLobbyView({super.key});

  @override
  State<RoomLobbyView> createState() => _RoomLobbyViewState();
}

class _RoomLobbyViewState extends State<RoomLobbyView> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  int _prevMessageCount = 0;
  bool _hasShownResults = false;

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

    // عرض نتائج اللعبة عند الانتهاء (الآن للجميع، مع زر إعادة الفتح للمسؤول فقط)
    if (competitionProvider.gameFinished && !_hasShownResults) {
      _hasShownResults = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showGameResults(context, competitionProvider);
      });
    }

    // إعادة تعيين عند بدء لعبة جديدة
    if (!competitionProvider.gameFinished && _hasShownResults) {
      _hasShownResults = false;
    }

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
            // فقط اعرض السؤال إذا كانت اللعبة قد بدأت (status = 'active') وهناك سؤال حالي
            if (competitionProvider.gameStarted &&
                competitionProvider.currentPuzzle != null) ...[
              // عرض السؤال فقط بعد بدء اللعبة (للجميع)
              _buildPuzzleCard(context, competitionProvider, isHost),
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
                          onPressed: competitionProvider.isStartingGame
                              ? null
                              : () async {
                                  await competitionProvider.startGame();
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber.shade700,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: competitionProvider.isStartingGame
                              ? Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: const [
                                    SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                              Colors.white,
                                            ),
                                      ),
                                    ),
                                    SizedBox(width: 10),
                                    Text(
                                      'جاري بدء اللعبة...',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                )
                              : const Text(
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
  Widget _buildPuzzleCard(
    BuildContext context,
    CompetitionProvider provider,
    bool isHost,
  ) {
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

    String normalizeArrowSpacing(String input) {
      var s = input.replaceAll('->', '→');
      s = s.replaceAll(RegExp(r'\s*→\s*'), ' → ');
      return s.trim();
    }

    String optionValueToDisplayText(dynamic value) {
      if (value == null) return '';
      if (value is List) {
        final parts = value
            .map((e) => e?.toString().trim() ?? '')
            .where((s) => s.isNotEmpty)
            .toList();
        return normalizeArrowSpacing(parts.join(' → '));
      }
      return normalizeArrowSpacing(value.toString());
    }

    String indexToLetter(int index) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      return index < letters.length ? letters[index] : '#';
    }

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
              // 🧩 اللغز
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🧩 ', style: TextStyle(fontSize: 22)),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'اللغز:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.deepPurple,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          question,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (startWord != null || endWord != null) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('🔗 ', style: TextStyle(fontSize: 22)),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'السلسلة:',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.orange,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              // Show completed steps in green
                              ...provider.completedSteps.map((word) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade100,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.green.shade400,
                                      width: 2,
                                    ),
                                  ),
                                  child: Text(
                                    word,
                                    style: TextStyle(
                                      color: Colors.green.shade900,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                );
                              }),
                              if (provider.completedSteps.isNotEmpty)
                                const Icon(
                                  Icons.arrow_forward,
                                  size: 20,
                                  color: Colors.orange,
                                ),
                              const Text(
                                '?',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.orange,
                                ),
                              ),
                              const Text(
                                '...',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey,
                                ),
                              ),
                              const Icon(
                                Icons.arrow_forward,
                                size: 20,
                                color: Colors.grey,
                              ),
                              if (endWord != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.blue.shade300,
                                    ),
                                  ),
                                  child: Text(
                                    endWord,
                                    style: TextStyle(
                                      color: Colors.blue.shade900,
                                      fontWeight: FontWeight.w600,
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
              ],
              if (hint != null && hint.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('💡 ', style: TextStyle(fontSize: 18)),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'تلميح:',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber.shade900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              hint,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.amber.shade800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 8),
              // عداد الوقت يعرض فقط للمسؤول
              if (provider.puzzleEndsAt != null)
                Builder(
                  builder: (context) {
                    final isHost = context.watch<CompetitionProvider>().isHost;
                    if (!isHost) return const SizedBox.shrink();

                    return StreamBuilder<int>(
                      stream: Stream.periodic(const Duration(seconds: 1), (_) {
                        final puzzleEnd = context
                            .read<CompetitionProvider>()
                            .puzzleEndsAt;
                        if (puzzleEnd == null) return 0;
                        final now = DateTime.now();
                        final remaining = puzzleEnd.difference(now).inSeconds;
                        return remaining > 0 ? remaining : 0;
                      }),
                      builder: (context, snapshot) {
                        final puzzleEnd = context
                            .read<CompetitionProvider>()
                            .puzzleEndsAt;
                        if (puzzleEnd == null) return const SizedBox.shrink();
                        final remaining =
                            snapshot.data ??
                            puzzleEnd.difference(DateTime.now()).inSeconds;
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
                    );
                  },
                ),
              const SizedBox(height: 12),
              // الخيارات - عرضها أولاً قبل النتيجة
              if (options.isNotEmpty)
                ...options.asMap().entries.map((e) {
                  final idx = e.key;
                  final optText = optionValueToDisplayText(e.value);
                  final selectedIdx = provider.selectedAnswerIndex;
                  final lastAnswerCorrect = provider.lastAnswerCorrect;
                  // Only show selection/result if we have an actual answer (selectedIdx != null)
                  final hasSelection = selectedIdx != null;
                  final hasResult = hasSelection && lastAnswerCorrect != null;
                  final isSelected = selectedIdx == idx;
                  final showResult = hasSelection;
                  final badge = indexToLetter(idx);

                  Color? borderColor;
                  Color? backgroundColor;
                  if (hasResult && isSelected) {
                    if (lastAnswerCorrect == true) {
                      borderColor = Colors.green;
                      backgroundColor = Colors.green.shade50;
                    } else {
                      borderColor = Colors.red;
                      backgroundColor = Colors.red.shade50;
                    }
                  }

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: InkWell(
                      onTap: showResult
                          ? null
                          : () async {
                              if ((puzzle['type'] ?? 'quiz') == 'quiz') {
                                await provider.submitQuizAnswer(idx);
                              } else {
                                await provider.submitAnswer([optText]);
                              }
                            },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: backgroundColor ?? Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: borderColor ?? Colors.grey.shade300,
                            width: borderColor != null ? 2 : 1,
                          ),
                        ),
                        child: Directionality(
                          textDirection: TextDirection.ltr,
                          child: Text(
                            '$badge) $optText',
                            style: TextStyle(
                              fontSize: 15,
                              height: 1.5,
                              fontWeight: hasResult && isSelected
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: showResult
                                  ? Colors.grey.shade800
                                  : Colors.black87,
                            ),
                          ),
                        ),
                      ),
                    ),
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
              // عرض النتيجة والتفسير بعد الخيارات
              const SizedBox(height: 16),
              if (provider.selectedAnswerIndex != null)
                Builder(
                  builder: (context) {
                    final provider = context.watch<CompetitionProvider>();

                    // إذا كانت النتيجة لم تصل بعد، عرض حالة الانتظار
                    if (provider.lastAnswerCorrect == null) {
                      return Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue, width: 2),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.blue.shade700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'جاري التحقق من الإجابة...',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.blue.shade800,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    // عرض النتيجة عندما تصل
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: provider.lastAnswerCorrect!
                                ? Colors.green.shade50
                                : Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: provider.lastAnswerCorrect!
                                  ? Colors.green
                                  : Colors.red,
                              width: 2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                provider.lastAnswerCorrect!
                                    ? Icons.check_circle
                                    : Icons.cancel,
                                color: provider.lastAnswerCorrect!
                                    ? Colors.green
                                    : Colors.red,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                provider.lastAnswerCorrect!
                                    ? 'إجابة صحيحة! أحسنت 🎉'
                                    : 'إجابة خاطئة ❌',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: provider.lastAnswerCorrect!
                                      ? Colors.green.shade800
                                      : Colors.red.shade800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // عرض الإجابة الصحيحة
                        if (provider.lastAnswerCorrect == false &&
                            provider.correctAnswerIndex != null &&
                            options.isNotEmpty) ...[
                          Builder(
                            builder: (context) {
                              final correctIdx = provider.correctAnswerIndex!;
                              final correctLetter = indexToLetter(correctIdx);
                              final correctText = optionValueToDisplayText(
                                options[correctIdx],
                              );
                              return Container(
                                padding: const EdgeInsets.all(12),
                                margin: const EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.green.shade300,
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      '✅ ',
                                      style: TextStyle(fontSize: 18),
                                    ),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'الإجابة الصحيحة:',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.green.shade900,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '$correctLetter) $correctText',
                                            textDirection: TextDirection.ltr,
                                            style: TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.green.shade800,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                        // 🧠 التفسير
                        if (puzzle['explanation'] != null &&
                            puzzle['explanation'].toString().isNotEmpty)
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 8),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  '🧠 ',
                                  style: TextStyle(fontSize: 20),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'التفسير:',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.blue.shade900,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        puzzle['explanation'].toString(),
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.blue.shade800,
                                          height: 1.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSettingsDialog(BuildContext context) {
    final provider = context.read<CompetitionProvider>();
    final room = provider.currentRoom;

    if (room == null) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RoomSettingsView(
          roomId: room['id'] as int,
          isCreator: provider.isHost,
        ),
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
            onPressed: () async {
              Navigator.pop(context); // Close dialog
              await context.read<CompetitionProvider>().deleteRoom();
              if (context.mounted) {
                Navigator.pop(context); // Exit room view
              }
            },
            child: const Text('حذف', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showGameResults(BuildContext context, CompetitionProvider provider) {
    final participants = provider.roomParticipants;

    // ترتيب المشاركين حسب النقاط
    final sortedParticipants = List<Map<String, dynamic>>.from(participants);
    sortedParticipants.sort((a, b) {
      final scoreA = (a['score'] as num?)?.toInt() ?? 0;
      final scoreB = (b['score'] as num?)?.toInt() ?? 0;
      if (scoreA != scoreB) return scoreB.compareTo(scoreA);

      final solvedA = (a['puzzles_solved'] as num?)?.toInt() ?? 0;
      final solvedB = (b['puzzles_solved'] as num?)?.toInt() ?? 0;
      if (solvedA != solvedB) return solvedB.compareTo(solvedA);

      final nameA = a['username']?.toString() ?? '';
      final nameB = b['username']?.toString() ?? '';
      return nameA.compareTo(nameB);
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.emoji_events, color: Colors.amber.shade700, size: 28),
            const SizedBox(width: 8),
            const Text('نتائج اللعبة 🎉'),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'تهانينا للجميع! إليكم النتائج النهائية:',
                style: TextStyle(fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ListView.builder(
                shrinkWrap: true,
                itemCount: sortedParticipants.length,
                itemBuilder: (context, index) {
                  final participant = sortedParticipants[index];
                  final username =
                      participant['username']?.toString() ?? 'لاعب';
                  final score = (participant['score'] as num?)?.toInt() ?? 0;
                  final puzzlesSolved =
                      (participant['puzzles_solved'] as num?)?.toInt() ?? 0;

                  Color? rankColor;
                  IconData? rankIcon;
                  if (index == 0) {
                    rankColor = Colors.amber.shade700;
                    rankIcon = Icons.emoji_events;
                  } else if (index == 1) {
                    rankColor = Colors.grey.shade600;
                    rankIcon = Icons.emoji_events;
                  } else if (index == 2) {
                    rankColor = Colors.brown.shade600;
                    rankIcon = Icons.emoji_events;
                  }

                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: index == 0 ? Colors.amber.shade50 : null,
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: rankColor ?? Colors.blue,
                        child: rankIcon != null
                            ? Icon(rankIcon, color: Colors.white, size: 20)
                            : Text(
                                '${index + 1}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                      title: Text(
                        username,
                        style: TextStyle(
                          fontWeight: index == 0
                              ? FontWeight.bold
                              : FontWeight.normal,
                          fontSize: index == 0 ? 16 : 14,
                        ),
                      ),
                      subtitle: Text('$puzzlesSolved ألغاز محلولة'),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color:
                              rankColor?.withOpacity(0.2) ??
                              Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '$score نقطة',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: rankColor ?? Colors.blue.shade800,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
          if (provider.isHost)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                provider.reopenRoom();
              },
              child: const Text('لعب مرة أخرى'),
            ),
        ],
      ),
    );
  }
}
