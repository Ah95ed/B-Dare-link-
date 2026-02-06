import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/locale_provider.dart';
import '../../core/app_colors.dart';
import '../../models/spot_diff_puzzle.dart';
import '../../services/api_service.dart';

class SpotDiffView extends StatefulWidget {
  const SpotDiffView({super.key});

  @override
  State<SpotDiffView> createState() => _SpotDiffViewState();
}

class _SpotDiffViewState extends State<SpotDiffView> {
  final CloudflareApiService _api = CloudflareApiService();
  final TextEditingController _themeCtrl = TextEditingController();

  SpotDiffPuzzle? _puzzle;
  final Set<int> _found = {};
  bool _loading = false;
  String? _error;
  int _differencesCount = 5;
  int _hintRemaining = 2;
  int? _hintedId;
  String? _selectedDecisionId;

  @override
  void dispose() {
    _themeCtrl.dispose();
    super.dispose();
  }

  Future<void> _generate(bool isArabic) async {
    setState(() {
      _loading = true;
      _error = null;
      _puzzle = null;
      _found.clear();
      _hintRemaining = 2;
      _hintedId = null;
      _selectedDecisionId = null;
    });

    try {
      final puzzle = await _api.generateSpotDiffPuzzle(
        isArabic: isArabic,
        differencesCount: _differencesCount,
        theme: _themeCtrl.text.trim(),
        width: 512,
        height: 512,
      );
      if (puzzle == null) {
        throw Exception('Empty response');
      }
      setState(() => _puzzle = puzzle);
    } catch (e, stack) {
      debugPrint('[SpotDiff] Generate error: $e');
      debugPrint('$stack');
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _onTapDiff(SpotDiffDifference diff) {
    if (_found.contains(diff.id)) return;
    setState(() => _found.add(diff.id));
    if (_puzzle != null && _found.length == _puzzle!.differences.length) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isArabic(context)
                ? 'أحسنت! تم العثور على كل الفروق.'
                : 'Great! You found all differences.',
          ),
        ),
      );
    }
  }

  void _useHint() {
    if (_puzzle == null || _hintRemaining <= 0) return;
    final remaining = _puzzle!.differences
        .where((d) => !_found.contains(d.id))
        .toList();
    if (remaining.isEmpty) return;
    remaining.shuffle();
    final hint = remaining.first;
    setState(() {
      _hintRemaining -= 1;
      _hintedId = hint.id;
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _hintedId = null);
      }
    });
  }

  bool _isArabic(BuildContext context) {
    return Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = _isArabic(context);

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkSurface,
        title: Text(isArabic ? 'اكتشف الفروق' : 'Spot the Difference'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildControls(isArabic),
            const SizedBox(height: 12),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(24.0),
                child: CircularProgressIndicator(color: AppColors.cyan),
              )
            else if (_error != null)
              Text(
                _error!,
                style: const TextStyle(color: AppColors.error),
                textAlign: TextAlign.center,
              )
            else if (_puzzle == null)
              Expanded(
                child: Center(
                  child: Text(
                    isArabic
                        ? 'اضغط توليد لبدء اللعبة.'
                        : 'Tap Generate to start.',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ),
              )
            else
              Expanded(child: _buildPuzzle(isArabic)),
          ],
        ),
      ),
    );
  }

  Widget _buildControls(bool isArabic) {
    final total = _puzzle?.differences.length ?? 0;
    final progress = total == 0 ? 0.0 : _found.length / total;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_puzzle != null)
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                isArabic
                    ? 'التقدم الذهني: ${_found.length}/$total'
                    : 'Mental progress: ${_found.length}/$total',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 6,
                  backgroundColor: AppColors.darkSurfaceLight,
                  valueColor: AlwaysStoppedAnimation(AppColors.cyan),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        TextField(
          controller: _themeCtrl,
          style: const TextStyle(color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: isArabic ? 'سمة الصورة (اختياري)' : 'Theme (optional)',
            hintStyle: const TextStyle(color: AppColors.textSecondary),
            filled: true,
            fillColor: AppColors.darkSurfaceLight,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Text(
                isArabic
                    ? 'عدد الفروق: $_differencesCount'
                    : 'Differences: $_differencesCount',
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 180,
              child: Slider(
                value: _differencesCount.toDouble(),
                min: 3,
                max: 10,
                divisions: 7,
                label: _differencesCount.toString(),
                onChanged: (value) =>
                    setState(() => _differencesCount = value.toInt()),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _loading ? null : () => _generate(isArabic),
                icon: const Icon(Icons.auto_awesome),
                label: Text(isArabic ? 'توليد' : 'Generate'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.cyan,
                  foregroundColor: AppColors.darkBackground,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: _loading || _puzzle == null || _hintRemaining <= 0
                  ? null
                  : _useHint,
              icon: const Icon(Icons.lightbulb_outline),
              label: Text(isArabic ? 'تلميح' : 'Hint'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.magenta,
                foregroundColor: AppColors.darkBackground,
                padding: const EdgeInsets.symmetric(
                  vertical: 14,
                  horizontal: 16,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
        if (_puzzle != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              isArabic
                  ? 'التلميحات المتبقية: $_hintRemaining'
                  : 'Hints left: $_hintRemaining',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
        if (_puzzle != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              isArabic
                  ? 'تم العثور: ${_found.length}/${_puzzle!.differences.length}'
                  : 'Found: ${_found.length}/${_puzzle!.differences.length}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
      ],
    );
  }

  Widget _buildPuzzle(bool isArabic) {
    final puzzle = _puzzle!;
    final bytesA = _decodeBase64Image(puzzle.imageA);
    final bytesB = _decodeBase64Image(puzzle.imageB);
    final decision = puzzle.decision;
    final hasMeta =
        (puzzle.stage?.isNotEmpty ?? false) ||
        (puzzle.conflict?.isNotEmpty ?? false);

    return Column(
      children: [
        if (hasMeta)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                if (puzzle.stage?.isNotEmpty ?? false) _buildTag(puzzle.stage!),
                if ((puzzle.stage?.isNotEmpty ?? false) &&
                    (puzzle.conflict?.isNotEmpty ?? false))
                  const SizedBox(width: 8),
                if (puzzle.conflict?.isNotEmpty ?? false)
                  _buildTag(puzzle.conflict!),
              ],
            ),
          ),
        Expanded(
          child: Row(
            children: [
              Expanded(
                child: SpotDiffImagePanel(
                  imageBytes: bytesA,
                  differences: puzzle.differences,
                  foundIds: _found,
                  highlightedId: _hintedId,
                  onHit: _onTapDiff,
                  label: isArabic ? 'الصورة A' : 'Image A',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SpotDiffImagePanel(
                  imageBytes: bytesB,
                  differences: puzzle.differences,
                  foundIds: _found,
                  highlightedId: _hintedId,
                  onHit: _onTapDiff,
                  label: isArabic ? 'الصورة B' : 'Image B',
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _buildExplanations(isArabic, puzzle),
        if (decision != null && _found.length == puzzle.differences.length)
          _buildDecision(isArabic, decision),
      ],
    );
  }

  Widget _buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.darkSurfaceLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildExplanations(bool isArabic, SpotDiffPuzzle puzzle) {
    final found = puzzle.differences
        .where((d) => _found.contains(d.id))
        .toList();
    if (found.isEmpty) {
      return Text(
        isArabic ? 'ابحث عن الاختلافات أولاً.' : 'Find differences first.',
        style: const TextStyle(color: AppColors.textSecondary),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.darkSurfaceLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            isArabic ? 'التفسيرات' : 'Explanations',
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          ...found.map(
            (d) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.circle, size: 8, color: AppColors.cyan),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      d.reason.isNotEmpty
                          ? '${d.label} — ${d.reason}'
                          : d.label,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        height: 1.4,
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

  Widget _buildDecision(bool isArabic, SpotDiffDecision decision) {
    if (decision.options.isEmpty) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            decision.question.isEmpty
                ? (isArabic ? 'اختر قرارك' : 'Choose your decision')
                : decision.question,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          ...decision.options.map((option) {
            final selected = _selectedDecisionId == option.id;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: ElevatedButton(
                onPressed: () {
                  setState(() => _selectedDecisionId = option.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        option.trait.isNotEmpty
                            ? '${option.text} — ${option.trait}'
                            : option.text,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: selected
                      ? AppColors.success
                      : AppColors.darkSurfaceLight,
                  foregroundColor: selected
                      ? Colors.white
                      : AppColors.textPrimary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  option.trait.isNotEmpty
                      ? '${option.text} — ${option.trait}'
                      : option.text,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Uint8List _decodeBase64Image(String dataUrl) {
    final uri = UriData.parse(dataUrl);
    return uri.contentAsBytes();
  }
}

class SpotDiffImagePanel extends StatelessWidget {
  final Uint8List imageBytes;
  final List<SpotDiffDifference> differences;
  final Set<int> foundIds;
  final int? highlightedId;
  final void Function(SpotDiffDifference diff) onHit;
  final String label;

  const SpotDiffImagePanel({
    super.key,
    required this.imageBytes,
    required this.differences,
    required this.foundIds,
    required this.highlightedId,
    required this.onHit,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final size = Size(constraints.maxWidth, constraints.maxHeight);
              return ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: GestureDetector(
                  onTapUp: (details) {
                    final local = details.localPosition;
                    final hit = _findHit(local, size);
                    if (hit != null) onHit(hit);
                  },
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.memory(imageBytes, fit: BoxFit.cover),
                      ..._buildMarkers(size),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  SpotDiffDifference? _findHit(Offset local, Size size) {
    final nx = (local.dx / max(size.width, 1)).clamp(0.0, 1.0);
    final ny = (local.dy / max(size.height, 1)).clamp(0.0, 1.0);

    for (final diff in differences) {
      if (foundIds.contains(diff.id)) continue;
      final dx = nx - diff.x;
      final dy = ny - diff.y;
      if ((dx * dx + dy * dy) <= diff.radius * diff.radius) {
        return diff;
      }
    }
    return null;
  }

  List<Widget> _buildMarkers(Size size) {
    final minSide = min(size.width, size.height);
    return differences
        .where((d) => foundIds.contains(d.id) || d.id == highlightedId)
        .map((diff) {
          final radius = diff.radius * minSide;
          final left = diff.x * size.width - radius;
          final top = diff.y * size.height - radius;
          final isHint =
              diff.id == highlightedId && !foundIds.contains(diff.id);
          return Positioned(
            left: left,
            top: top,
            child: Container(
              width: radius * 2,
              height: radius * 2,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isHint ? AppColors.magenta : AppColors.success,
                  width: 3,
                ),
                color: (isHint ? AppColors.magenta : AppColors.success)
                    .withOpacity(0.2),
              ),
            ),
          );
        })
        .toList();
  }
}
