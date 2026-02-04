class SpotDiffPuzzle {
  final String language;
  final int width;
  final int height;
  final String imageA;
  final String imageB;
  final String? conflict;
  final String? stage;
  final String? promptA;
  final String? promptB;
  final List<SpotDiffDifference> differences;
  final SpotDiffDecision? decision;

  SpotDiffPuzzle({
    required this.language,
    required this.width,
    required this.height,
    required this.imageA,
    required this.imageB,
    required this.differences,
    this.conflict,
    this.stage,
    this.promptA,
    this.promptB,
    this.decision,
  });

  factory SpotDiffPuzzle.fromJson(Map<String, dynamic> json) {
    return SpotDiffPuzzle(
      language: json['language']?.toString() ?? 'ar',
      width: (json['width'] as num?)?.toInt() ?? 512,
      height: (json['height'] as num?)?.toInt() ?? 512,
      imageA: json['imageA']?.toString() ?? '',
      imageB: json['imageB']?.toString() ?? '',
      conflict: json['conflict']?.toString(),
      stage: json['stage']?.toString(),
      promptA: json['promptA']?.toString(),
      promptB: json['promptB']?.toString(),
      decision: json['decision'] is Map<String, dynamic>
          ? SpotDiffDecision.fromJson(json['decision'] as Map<String, dynamic>)
          : null,
      differences: (json['differences'] as List<dynamic>? ?? [])
          .map((d) => SpotDiffDifference.fromJson(d))
          .toList(),
    );
  }
}

class SpotDiffDifference {
  final int id;
  final String label;
  final String reason;
  final double x;
  final double y;
  final double radius;

  SpotDiffDifference({
    required this.id,
    required this.label,
    required this.reason,
    required this.x,
    required this.y,
    required this.radius,
  });

  factory SpotDiffDifference.fromJson(dynamic json) {
    final map = json as Map<String, dynamic>;
    return SpotDiffDifference(
      id: (map['id'] as num?)?.toInt() ?? 0,
      label: map['label']?.toString() ?? '',
      reason: map['reason']?.toString() ?? '',
      x: (map['x'] as num?)?.toDouble() ?? 0.0,
      y: (map['y'] as num?)?.toDouble() ?? 0.0,
      radius: (map['radius'] as num?)?.toDouble() ?? 0.05,
    );
  }
}

class SpotDiffDecision {
  final String question;
  final List<SpotDiffDecisionOption> options;

  SpotDiffDecision({required this.question, required this.options});

  factory SpotDiffDecision.fromJson(Map<String, dynamic> json) {
    return SpotDiffDecision(
      question: json['question']?.toString() ?? '',
      options: (json['options'] as List<dynamic>? ?? [])
          .map((o) => SpotDiffDecisionOption.fromJson(o))
          .toList(),
    );
  }
}

class SpotDiffDecisionOption {
  final String id;
  final String text;
  final String trait;

  SpotDiffDecisionOption({
    required this.id,
    required this.text,
    required this.trait,
  });

  factory SpotDiffDecisionOption.fromJson(dynamic json) {
    final map = json as Map<String, dynamic>;
    return SpotDiffDecisionOption(
      id: map['id']?.toString() ?? '',
      text: map['text']?.toString() ?? '',
      trait: map['trait']?.toString() ?? '',
    );
  }
}
