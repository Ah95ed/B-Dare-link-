import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';

// Optional: pass --dart-define=DEV_ADMIN_TOKEN=your_admin_jwt when running/debugging
const String _devAdminToken =
    String.fromEnvironment('DEV_ADMIN_TOKEN', defaultValue: '');

class AdminPage extends StatefulWidget {
  const AdminPage({super.key});

  @override
  State<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends State<AdminPage> {
  bool _loading = false;
  bool _regenerating = false;
  bool _generatingBulk = false;
  bool _devMockMode = false;
  String? _status;
  List<dynamic> _puzzles = [];
  final _levelController = TextEditingController();
  String _langFilter = 'all';
  final _apiBase = 'https://wonder-link-backend.amhmeed31.workers.dev';
  final AuthService _auth = AuthService();

  @override
  void initState() {
    super.initState();
    _fetchPuzzles();
  }

  @override
  void dispose() {
    _levelController.dispose();
    super.dispose();
  }

  Future<void> _fetchPuzzles() async {
    // In debug with no token we allow mock mode to avoid 401 spam.
    final token = await _getEffectiveToken();
    if (token == null && kDebugMode) {
      setState(() {
        _devMockMode = true;
        _loading = false;
        _puzzles = _mockPuzzles();
        _status = 'وضع المطور (بدون خادم): عرض بيانات افتراضية';
      });
      return;
    }

    // Don't make requests if we're in mock mode
    if (_devMockMode) {
      return;
    }

    setState(() => _loading = true);
    try {
      final level = int.tryParse(_levelController.text.trim());
      final query = <String, String>{};
      if (level != null && level > 0) query['level'] = '$level';
      if (_langFilter != 'all') query['lang'] = _langFilter;

      final uri = Uri.parse('$_apiBase/admin/puzzles').replace(queryParameters: query);
      final resp = await http.get(
        uri,
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );
      if (resp.statusCode == 200) {
        setState(() {
          _puzzles = jsonDecode(resp.body);
          _devMockMode = false;
        });
      } else {
        // If we get 401 in debug mode, switch to mock mode
        if (resp.statusCode == 401 && kDebugMode) {
          setState(() {
            _devMockMode = true;
            _puzzles = _mockPuzzles();
            _status = 'وضع المطور (بدون خادم): عرض بيانات افتراضية';
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to fetch puzzles')),
          );
        }
      }
    } catch (e) {
      debugPrint('Admin fetch error: $e');
      // If error in debug mode, switch to mock mode
      if (kDebugMode) {
        setState(() {
          _devMockMode = true;
          _puzzles = _mockPuzzles();
          _status = 'وضع المطور (بدون خادم): عرض بيانات افتراضية';
        });
      }
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _regeneratePuzzle() async {
    if (_devMockMode) {
      // Locally add a fake puzzle to visualise the flow
      setState(() {
        _puzzles.insert(0, {
          'id': DateTime.now().millisecondsSinceEpoch,
          'level': int.tryParse(_levelController.text.trim()) ?? 1,
          'lang': _langFilter == 'all' ? 'ar' : _langFilter,
          'created_at': DateTime.now().toIso8601String(),
          'puzzle': {
            'startWord': 'DEV_START',
            'endWord': 'DEV_END',
            'puzzleId': 'DEV-${DateTime.now().millisecondsSinceEpoch}',
            'hint': 'بيانات تجريبية بدون خادم',
            'steps': [
              {'word': 'DEV1', 'options': ['DEV1', 'X', 'Y']},
              {'word': 'DEV2', 'options': ['DEV2', 'A', 'B']},
            ]
          }
        });
        _status = 'تم إنشاء لغز افتراضي (وضع المطور)';
      });
      return;
    }

    final level = int.tryParse(_levelController.text.trim()) ?? 1;
    setState(() {
      _regenerating = true;
      _status = 'جارٍ إنشاء لغز للمستوى $level (${_langFilter == 'all' ? 'ar' : _langFilter})';
    });
    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles/regenerate');
      final token = await _getEffectiveToken();
      final resp = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'level': level,
          'language': _langFilter == 'all' ? 'ar' : _langFilter,
        }),
      );

      if (resp.statusCode == 200) {
        setState(() => _status = 'تم إنشاء لغز جديد بنجاح');
        await _fetchPuzzles();
      } else {
        setState(() => _status = 'فشل إنشاء لغز: ${resp.body}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_status!)),
        );
      }
    } catch (e) {
      setState(() => _status = 'خطأ أثناء الإنشاء: $e');
      debugPrint('Regenerate error: $e');
    } finally {
      setState(() => _regenerating = false);
    }
  }

  Future<void> _generateBulkPuzzles() async {
    if (_devMockMode) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('وضع المطور: لا يمكن توليد 100 لغز بدون خادم')),
      );
      return;
    }

    // Confirm before generating 100 puzzles
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('توليد 100 لغز'),
        content: const Text(
          'سيتم توليد 100 لغز (20 لكل لغة) باستخدام Gemini 3 API:\n'
          '- العربية\n'
          '- الإنجليزية\n'
          '- الفرنسية\n'
          '- الإسبانية\n'
          '- الألمانية\n\n'
          'هذه العملية قد تستغرق عدة دقائق. هل تريد المتابعة؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('توليد'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _generatingBulk = true;
      _status = 'جارٍ توليد 100 لغز... قد يستغرق هذا بضع دقائق';
    });

    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles/generate-bulk');
      final token = await _getEffectiveToken();
      final resp = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body);
        final generated = data['totalGenerated'] ?? 0;
        final saved = data['totalSaved'] ?? 0;
        final errors = data['errors'] as List?;

        setState(() {
          _status = 'تم توليد $generated لغز وحفظ $saved في قاعدة البيانات';
        });

        if (errors != null && errors.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('تم التوليد مع بعض الأخطاء: ${errors.length}'),
              duration: const Duration(seconds: 5),
            ),
          );
        }

        await _fetchPuzzles();
      } else {
        setState(() => _status = 'فشل التوليد: ${resp.body}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_status!)),
        );
      }
    } catch (e) {
      setState(() => _status = 'خطأ أثناء التوليد: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_status!)),
      );
      debugPrint('Bulk generate error: $e');
    } finally {
      setState(() => _generatingBulk = false);
    }
  }

  Future<void> _deletePuzzle(dynamic item) async {
    if (_devMockMode) {
      setState(() {
        _puzzles.removeWhere((p) => p['id'] == item['id']);
        _status = 'تم حذف اللغز (وضع المطور المحلي)';
      });
      return;
    }

    final id = item['id'];
    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles');
      final token = await _getEffectiveToken();
      final resp = await http.delete(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'id': id}),
      );
      if (resp.statusCode == 200) {
        _fetchPuzzles();
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Delete failed')));
      }
    } catch (e) {
      debugPrint('Delete error: $e');
    }
  }

  void _clearFilters() {
    _levelController.clear();
    setState(() {
      _langFilter = 'all';
      _status = null;
    });
    _fetchPuzzles();
  }

  String _formatDate(String? iso) {
    if (iso == null) return '-';
    final dt = DateTime.tryParse(iso);
    if (dt == null) return iso;
    return '${dt.toLocal()}'.split('.').first;
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isAdmin = auth.user != null && auth.user!['id'] == 1;
    final devBypass = kDebugMode; // يسمح للمطور بالدخول أثناء التطوير
    final canAccess = isAdmin || devBypass;

    if (!canAccess) {
      return Scaffold(
        appBar: AppBar(title: const Text('Admin')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.lock_outline, size: 48),
                SizedBox(height: 16),
                Text('هذه الصفحة مخصصة للمسؤول فقط'),
                SizedBox(height: 8),
                Text('الرجاء تسجيل الدخول بحساب المسؤول لمتابعة التخصيص'),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة تحكم الأدمن'),
        actions: [
          IconButton(
            tooltip: 'تحديث القائمة',
            onPressed: _loading ? null : _fetchPuzzles,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchPuzzles,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            if (devBypass)
              Card(
                color: Theme.of(context).colorScheme.secondaryContainer.withOpacity(0.5),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Icon(Icons.developer_mode),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _devMockMode
                              ? 'وضع المطور (بدون خادم): يتم عرض بيانات افتراضية'
                              : 'وضع المطور مفعل: يمكنك تزويد توكن أدمن عبر DEV_ADMIN_TOKEN أو تسجيل الدخول.',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            Card(
              elevation: 1,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'التخصيص و الفلترة',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        SizedBox(
                          width: 220,
                          child: TextField(
                            controller: _levelController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'المستوى',
                              hintText: 'مثال: 1 أو 5',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 220,
                          child: InputDecorator(
                            decoration: const InputDecoration(
                              labelText: 'اللغة',
                              border: OutlineInputBorder(),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                isExpanded: true,
                                value: _langFilter,
                                items: const [
                                  DropdownMenuItem(value: 'all', child: Text('الكل')),
                                  DropdownMenuItem(value: 'ar', child: Text('العربية')),
                                  DropdownMenuItem(value: 'en', child: Text('English')),
                                ],
                                onChanged: (val) {
                                  if (val == null) return;
                                  setState(() => _langFilter = val);
                                },
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        ElevatedButton.icon(
                          onPressed: _loading ? null : _fetchPuzzles,
                          icon: const Icon(Icons.filter_alt),
                          label: const Text('تطبيق الفلاتر'),
                        ),
                        OutlinedButton.icon(
                          onPressed: _loading ? null : _clearFilters,
                          icon: const Icon(Icons.clear),
                          label: const Text('إعادة الضبط'),
                        ),
                        ElevatedButton.icon(
                          onPressed: _regenerating ? null : _regeneratePuzzle,
                          icon: _regenerating
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.auto_fix_high),
                          label: Text(_regenerating ? 'جارٍ الإنشاء...' : 'توليد لغز'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: (_generatingBulk || _regenerating || _loading) ? null : _generateBulkPuzzles,
                        icon: _generatingBulk
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.batch_prediction, size: 20),
                        label: Text(
                          _generatingBulk
                              ? 'جارٍ توليد 100 لغز...'
                              : 'توليد 100 لغز (5 لغات × 20 لغز)',
                          style: const TextStyle(fontSize: 16),
                        ),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                          foregroundColor: Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ),
                    if (_status != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        _status!,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ]
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
            else if (_puzzles.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: Text('لا توجد ألغاز بعد لهذه الإعدادات')),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, i) {
                  final it = _puzzles[i];
                  final puzzle = it['puzzle'] ?? {};
                  final start = puzzle['startWord'] ?? puzzle['startWordAr'] ?? '';
                  final end = puzzle['endWord'] ?? puzzle['endWordAr'] ?? '';
                  final steps = (puzzle['steps'] as List?) ?? [];

                  return Card(
                    child: ExpansionTile(
                      tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      childrenPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      title: Text('$start → $end'),
                      subtitle: Text('المستوى: ${it['level']} • اللغة: ${it['lang']} • id: ${puzzle['puzzleId'] ?? it['id']}'),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_forever, color: Colors.red),
                        onPressed: () async {
                          final ok = await showDialog<bool>(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: const Text('حذف اللغز؟'),
                              content: const Text('سيتم إزالة هذا اللغز نهائياً.'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context, false),
                                  child: const Text('إلغاء'),
                                ),
                                TextButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  child: const Text('حذف'),
                                ),
                              ],
                            ),
                          );
                          if (ok == true) _deletePuzzle(it);
                        },
                      ),
                      children: [
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            Chip(label: Text('إنشاء: ${_formatDate(it['created_at']?.toString())}')),
                            Chip(label: Text('Puzzle ID: ${puzzle['puzzleId'] ?? '-'}')),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if ((puzzle['hint'] ?? puzzle['hintAr']) != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Text('تلميح: ${puzzle['hint'] ?? puzzle['hintAr'] ?? ''}'),
                          ),
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: steps.length,
                          itemBuilder: (context, idx) {
                            final s = steps[idx];
                            final word = s['word'] ?? '';
                            final options = (s['options'] as List?)?.join(' • ') ?? '';
                            return ListTile(
                              dense: true,
                              leading: Text('${idx + 1}'),
                              title: Text(word),
                              subtitle: Text(options),
                            );
                          },
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemCount: _puzzles.length,
              ),
          ],
        ),
      ),
    );
  }

  // Returns JWT if user is logged in, otherwise uses DEV_ADMIN_TOKEN when in debug.
  Future<String?> _getEffectiveToken() async {
    final token = await _auth.getToken();
    if (token != null) return token;
    if (kDebugMode && _devAdminToken.isNotEmpty) return _devAdminToken;
    return null;
  }

  List<Map<String, dynamic>> _mockPuzzles() {
    return [
      {
        'id': 1,
        'level': 1,
        'lang': 'ar',
        'created_at': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String(),
        'puzzle': {
          'startWord': 'تفاحة',
          'endWord': 'لون',
          'puzzleId': 'MOCK-1',
          'hint': 'مثال للتجربة',
          'steps': [
            {'word': 'تفاحة', 'options': ['تفاحة', 'موز', 'برتقال']},
            {'word': 'أحمر', 'options': ['أحمر', 'أخضر', 'أزرق']},
          ]
        }
      },
      {
        'id': 2,
        'level': 2,
        'lang': 'en',
        'created_at': DateTime.now().subtract(const Duration(minutes: 2)).toIso8601String(),
        'puzzle': {
          'startWord': 'Sun',
          'endWord': 'Energy',
          'puzzleId': 'MOCK-2',
          'hint': 'Sample EN data',
          'steps': [
            {'word': 'Sun', 'options': ['Sun', 'Moon', 'Star']},
            {'word': 'Light', 'options': ['Light', 'Heat', 'Cold']},
          ]
        }
      },
    ];
  }
}

// AdminPage uses `AuthService` and `http` directly.
