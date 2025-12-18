import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';
import 'group_room_view.dart';

class CreateGroupView extends StatefulWidget {
  const CreateGroupView({super.key});

  @override
  State<CreateGroupView> createState() => _CreateGroupViewState();
}

class _CreateGroupViewState extends State<CreateGroupView> {
  final _nameCtrl = TextEditingController();
  int _maxParticipants = 6;
  int _puzzleCount = 5;
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
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const GroupRoomView()),
      );
    } catch (e) {
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
      appBar: AppBar(title: const Text('Create Group')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Room name (optional)',
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Max participants:'),
                const SizedBox(width: 8),
                DropdownButton<int>(
                  value: _maxParticipants,
                  items: [4, 6, 8, 10]
                      .map((v) => DropdownMenuItem(value: v, child: Text('$v')))
                      .toList(),
                  onChanged: (v) => setState(() => _maxParticipants = v ?? 6),
                ),
                const Spacer(),
                const Text('Puzzles:'),
                const SizedBox(width: 8),
                DropdownButton<int>(
                  value: _puzzleCount,
                  items: [3, 5, 7, 10]
                      .map((v) => DropdownMenuItem(value: v, child: Text('$v')))
                      .toList(),
                  onChanged: (v) => setState(() => _puzzleCount = v ?? 5),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _create,
              child: _loading
                  ? const CircularProgressIndicator()
                  : const Text('Create Group'),
            ),
          ],
        ),
      ),
    );
  }
}
