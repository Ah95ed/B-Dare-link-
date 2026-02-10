import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import '../../core/auth_guard.dart';

class CreateRoomView extends StatefulWidget {
  const CreateRoomView({super.key});

  @override
  State<CreateRoomView> createState() => _CreateRoomViewState();
}

class _CreateRoomViewState extends State<CreateRoomView> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();

  // Default values
  int _puzzleCount = 5;
  int _timePerPuzzle = 30;
  String _puzzleSource = 'ai';
  int _difficulty = 1;
  final String _language = 'ar';
  final int _maxParticipants = 10;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _createRoom() async {
    final authed = await AuthGuard.requireLogin(context);
    if (!authed) return;

    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final cp = context.read<CompetitionProvider>();
      await cp.createRoom(
        name: _nameController.text.isEmpty ? null : _nameController.text.trim(),
        maxParticipants: _maxParticipants,
        puzzleCount: _puzzleCount,
        timePerPuzzle: _timePerPuzzle,
        puzzleSource: _puzzleSource,
        difficulty: _difficulty,
        language: _language,
      );

      if (mounted) {
        Navigator.pop(context); // Close create view
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('خطأ في إنشاء الغرفة: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إعدادات الغرفة الجديدة')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Room Name
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'اسم الغرفة (اختياري)',
                hintText: 'مثال: تحدي الأذكياء',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.meeting_room),
              ),
              maxLength: 30,
            ),
            const SizedBox(height: 20),

            // Puzzle Count
            _buildSectionTitle('عدد الألغاز'),
            Slider(
              value: _puzzleCount.toDouble(),
              min: 1,
              max: 20,
              divisions: 19,
              label: '$_puzzleCount',
              onChanged: (val) => setState(() => _puzzleCount = val.round()),
            ),
            Center(
              child: Text(
                '$_puzzleCount لغز',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 20),

            // Time Per Puzzle
            _buildSectionTitle('وقت اللغز (ثواني)'),
            Slider(
              value: _timePerPuzzle.toDouble(),
              min: 10,
              max: 120,
              divisions: 11,
              label: '$_timePerPuzzle',
              onChanged: (val) => setState(() => _timePerPuzzle = val.round()),
            ),
            Center(
              child: Text(
                '$_timePerPuzzle ثانية',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 20),

            // Puzzle Source
            _buildSectionTitle('مصدر الألغاز'),
            DropdownButtonFormField<String>(
              initialValue: _puzzleSource,
              decoration: const InputDecoration(border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(
                  value: 'database',
                  child: Text('قاعدة البيانات (ألغاز جاهزة)'),
                ),
                DropdownMenuItem(
                  value: 'ai',
                  child: Text('الذكاء الاصطناعي (توليد تلقائي)'),
                ),
                DropdownMenuItem(
                  value: 'manual',
                  child: Text('يدوي (يقوم القائد باختيارها)'),
                ),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _puzzleSource = val);
              },
            ),
            const SizedBox(height: 20),

            // Difficulty
            _buildSectionTitle('مستوى الصعوبة'),
            Row(
              children: [
                Expanded(
                  child: RadioListTile<int>(
                    title: const Text('سهل'),
                    value: 0,
                    groupValue: _difficulty,
                    onChanged: (val) => setState(() => _difficulty = val!),
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
                Expanded(
                  child: RadioListTile<int>(
                    title: const Text('متوسط'),
                    value: 1,
                    groupValue: _difficulty,
                    onChanged: (val) => setState(() => _difficulty = val!),
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
                Expanded(
                  child: RadioListTile<int>(
                    title: const Text('صعب'),
                    value: 2,
                    groupValue: _difficulty,
                    onChanged: (val) => setState(() => _difficulty = val!),
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 30),

            // Create Button
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _createRoom,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'إنشاء الغرفة',
                        style: TextStyle(fontSize: 18),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.blueGrey,
        ),
      ),
    );
  }
}
