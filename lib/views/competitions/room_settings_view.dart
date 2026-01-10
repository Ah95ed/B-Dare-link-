import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/competition_provider.dart';

class RoomSettingsView extends StatefulWidget {
  final int roomId;
  final bool isCreator;

  const RoomSettingsView({
    super.key,
    required this.roomId,
    required this.isCreator,
  });

  @override
  State<RoomSettingsView> createState() => _RoomSettingsViewState();
}

class _RoomSettingsViewState extends State<RoomSettingsView> {
  late CompetitionProvider _provider;
  bool _isLoading = true;
  late Map<String, dynamic> _settings;
  bool _settingsChanged = false;

  @override
  void initState() {
    super.initState();
    _provider = context.read<CompetitionProvider>();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final response = await _provider.getRoomSettings(widget.roomId);
      setState(() {
        _settings = response;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('خطأ في تحميل الإعدادات: $e')));
      }
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveSettings() async {
    try {
      await _provider.updateRoomSettings(widget.roomId, _settings);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('تم حفظ الإعدادات بنجاح')));
        setState(() => _settingsChanged = false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('خطأ في حفظ الإعدادات: $e')));
      }
    }
  }

  void _updateSetting(String key, dynamic value) {
    setState(() {
      _settings[key] = value;
      _settingsChanged = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                const Icon(Icons.settings, size: 28, color: Colors.blue),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'إعدادات الغرفة',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ),
                if (widget.isCreator)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'مدير',
                      style: TextStyle(fontSize: 12, color: Colors.orange),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),

            if (widget.isCreator) ...[
              // Settings Section Header
              Text(
                'نظام المساعدات',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Hints Enabled
              SwitchListTile(
                title: const Text('تفعيل المساعدات'),
                subtitle: const Text('اسمح للاعبين باستخدام المساعدات'),
                value: _settings['hints_enabled'] ?? true,
                onChanged: (value) => _updateSetting('hints_enabled', value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 16),

              // Hints Per Player
              Text(
                'عدد المساعدات لكل لاعب: ${_settings['hints_per_player'] ?? 3}',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              Slider(
                value: (_settings['hints_per_player'] ?? 3).toDouble(),
                min: 0,
                max: 5,
                divisions: 5,
                label: '${_settings['hints_per_player'] ?? 3}',
                onChanged: (value) =>
                    _updateSetting('hints_per_player', value.toInt()),
              ),
              const SizedBox(height: 24),

              // Hint Penalty
              Text(
                'خصم النقاط عند استخدام المساعدة: ${_settings['hint_penalty_percent'] ?? 10}%',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              Slider(
                value: (_settings['hint_penalty_percent'] ?? 10).toDouble(),
                min: 0,
                max: 50,
                divisions: 5,
                label: '${_settings['hint_penalty_percent']?.toInt() ?? 10}%',
                onChanged: (value) =>
                    _updateSetting('hint_penalty_percent', value.toInt()),
              ),
              const SizedBox(height: 24),

              // Gameplay Settings
              Text(
                'إعدادات اللعبة',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Auto Advance
              Text(
                'الانتقال التلقائي بعد الإجابة الخاطئة: ${_settings['auto_advance_seconds'] ?? 2} ثانية',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              Slider(
                value: (_settings['auto_advance_seconds'] ?? 2).toDouble(),
                min: 0,
                max: 10,
                divisions: 10,
                label: '${_settings['auto_advance_seconds'] ?? 2}s',
                onChanged: (value) =>
                    _updateSetting('auto_advance_seconds', value.toInt()),
              ),
              const SizedBox(height: 16),

              // Min Time Per Puzzle
              Text(
                'الحد الأدنى للوقت قبل الانتقال: ${_settings['min_time_per_puzzle'] ?? 5} ثانية',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              Slider(
                value: (_settings['min_time_per_puzzle'] ?? 5).toDouble(),
                min: 1,
                max: 60,
                divisions: 6,
                label: '${_settings['min_time_per_puzzle'] ?? 5}s',
                onChanged: (value) =>
                    _updateSetting('min_time_per_puzzle', value.toInt()),
              ),
              const SizedBox(height: 24),

              // Other Settings
              Text(
                'خيارات أخرى',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              SwitchListTile(
                title: const Text('خلط خيارات الإجابة'),
                subtitle: const Text('تغيير ترتيب الخيارات عشوائياً'),
                value: _settings['shuffle_options'] ?? true,
                onChanged: (value) => _updateSetting('shuffle_options', value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 12),

              SwitchListTile(
                title: const Text('عرض الترتيب الحي'),
                subtitle: const Text('إظهار الترتيب أثناء اللعبة'),
                value: _settings['show_rankings_live'] ?? true,
                onChanged: (value) =>
                    _updateSetting('show_rankings_live', value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 12),

              SwitchListTile(
                title: const Text('السماح بالإبلاغ عن الأسئلة السيئة'),
                subtitle: const Text('اسمح للاعبين بالإبلاغ عن مشاكل الأسئلة'),
                value: _settings['allow_report_bad_puzzle'] ?? true,
                onChanged: (value) =>
                    _updateSetting('allow_report_bad_puzzle', value),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 24),

              // Save Button
              if (_settingsChanged)
                ElevatedButton.icon(
                  onPressed: _saveSettings,
                  icon: const Icon(Icons.save),
                  label: const Text('حفظ التغييرات'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    minimumSize: const Size(double.infinity, 48),
                  ),
                ),
            ] else ...[
              // Read-only view for non-creators
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSettingRow(
                        'المساعدات مفعلة',
                        _settings['hints_enabled'] ? 'نعم' : 'لا',
                      ),
                      const SizedBox(height: 12),
                      _buildSettingRow(
                        'عدد المساعدات لكل لاعب',
                        '${_settings['hints_per_player']} مساعدات',
                      ),
                      const SizedBox(height: 12),
                      _buildSettingRow(
                        'خصم النقاط للمساعدة',
                        '${_settings['hint_penalty_percent']}%',
                      ),
                      const SizedBox(height: 12),
                      _buildSettingRow(
                        'الانتقال التلقائي',
                        '${_settings['auto_advance_seconds']} ثانية',
                      ),
                      const SizedBox(height: 12),
                      _buildSettingRow(
                        'خلط الخيارات',
                        _settings['shuffle_options'] ? 'نعم' : 'لا',
                      ),
                      const SizedBox(height: 12),
                      _buildSettingRow(
                        'الإبلاغ عن الأسئلة السيئة',
                        _settings['allow_report_bad_puzzle'] ? 'مفعل' : 'معطل',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSettingRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        Text(value, style: TextStyle(color: Colors.grey.shade600)),
      ],
    );
  }
}
