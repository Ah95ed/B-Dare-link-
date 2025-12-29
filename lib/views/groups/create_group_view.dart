import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../competitions/room_lobby_view.dart';

class CreateGroupView extends StatefulWidget {
  const CreateGroupView({super.key});

  @override
  State<CreateGroupView> createState() => _CreateGroupViewState();
}

class _CreateGroupViewState extends State<CreateGroupView> {
  final _nameCtrl = TextEditingController();
  int _maxParticipants = 6;
  int _puzzleCount = 5;
  int _timePerPuzzle = 60;
  String _puzzleSource = 'ai';
  int _difficulty = 1;
  String _language = 'ar';
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    setState(() => _loading = true);
    try {
      final provider = Provider.of<CompetitionProvider>(context, listen: false);
      await provider.createRoom(
        name: _nameCtrl.text.isEmpty ? null : _nameCtrl.text,
        maxParticipants: _maxParticipants,
        puzzleCount: _puzzleCount,
        timePerPuzzle: _timePerPuzzle,
        puzzleSource: _puzzleSource,
        difficulty: _difficulty,
        language: _language,
      );

      if (!mounted) return;
      // Room created, provider will show lobby automatically
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إنشاء مجموعة جديدة'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // اسم الغرفة
            TextField(
              controller: _nameCtrl,
              decoration: InputDecoration(
                labelText: 'اسم المجموعة (اختياري)',
                prefixIcon: const Icon(Icons.group),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // مصدر الألغاز
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'مصدر الألغاز',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildPuzzleSourceOption(
                      'database',
                      'المخزون',
                      'ألغاز مُراجعة ومضمونة الجودة',
                      Icons.storage,
                    ),
                    _buildPuzzleSourceOption(
                      'ai',
                      'الذكاء الاصطناعي',
                      'ألغاز جديدة ومتنوعة كل مرة',
                      Icons.psychology,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // اللغة والصعوبة
            Row(
              children: [
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'اللغة',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          DropdownButton<String>(
                            value: _language,
                            isExpanded: true,
                            items: const [
                              DropdownMenuItem(
                                value: 'ar',
                                child: Text('العربية'),
                              ),
                              DropdownMenuItem(
                                value: 'en',
                                child: Text('English'),
                              ),
                            ],
                            onChanged: (v) =>
                                setState(() => _language = v ?? 'ar'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'الصعوبة: $_difficulty',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Slider(
                            value: _difficulty.toDouble(),
                            min: 1,
                            max: 10,
                            divisions: 9,
                            label: '$_difficulty',
                            onChanged: (v) =>
                                setState(() => _difficulty = v.round()),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // إعدادات اللعبة
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'إعدادات اللعبة',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('عدد اللاعبين'),
                              DropdownButton<int>(
                                value: _maxParticipants,
                                isExpanded: true,
                                items: [2, 4, 6, 8, 10]
                                    .map(
                                      (v) => DropdownMenuItem(
                                        value: v,
                                        child: Text('$v'),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (v) =>
                                    setState(() => _maxParticipants = v ?? 6),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('عدد الألغاز'),
                              DropdownButton<int>(
                                value: _puzzleCount,
                                isExpanded: true,
                                items: [3, 5, 7, 10]
                                    .map(
                                      (v) => DropdownMenuItem(
                                        value: v,
                                        child: Text('$v'),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (v) =>
                                    setState(() => _puzzleCount = v ?? 5),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('الوقت لكل لغز: $_timePerPuzzle ثانية'),
                        Slider(
                          value: _timePerPuzzle.toDouble(),
                          min: 30,
                          max: 120,
                          divisions: 6,
                          label: '$_timePerPuzzle ث',
                          onChanged: (v) =>
                              setState(() => _timePerPuzzle = v.round()),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // زر الإنشاء
            ElevatedButton(
              onPressed: _loading ? null : _create,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _loading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text(
                      'إنشاء المجموعة',
                      style: TextStyle(fontSize: 18),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPuzzleSourceOption(
    String value,
    String title,
    String subtitle,
    IconData icon,
  ) {
    final isSelected = _puzzleSource == value;
    return InkWell(
      onTap: () => setState(() => _puzzleSource = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected
                ? Theme.of(context).primaryColor
                : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? Theme.of(context).primaryColor.withOpacity(0.1)
              : null,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Theme.of(context).primaryColor : null,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: Theme.of(context).primaryColor),
          ],
        ),
      ),
    );
  }
}
