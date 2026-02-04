/// 🎮 Room Design Components - مكونات تصميم الغرف الحديثة
/// هذا الملف يحتوي على مكونات متخصصة لتصميم غرف اللعب والانتظار
library;

import 'package:flutter/material.dart';
import 'app_colors.dart';

// ============================================================================
// 1️⃣ PARTICIPANT CARD - بطاقة اللاعب
// ============================================================================

class ParticipantCard extends StatelessWidget {
  final String name;
  final String? avatar;
  final int score;
  final bool isHost;
  final bool isManager;
  final bool isActive;
  final VoidCallback? onTap;
  final Color? statusColor;

  const ParticipantCard({
    required this.name,
    this.avatar,
    required this.score,
    this.isHost = false,
    this.isManager = false,
    this.isActive = true,
    this.onTap,
    this.statusColor,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveStatusColor =
        statusColor ?? (isActive ? AppColors.cyan : AppColors.textSecondary);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive
                ? AppColors.cyan.withOpacity(0.3)
                : Colors.transparent,
            width: 2,
          ),
          gradient: LinearGradient(
            colors: [
              AppColors.darkSurface.withOpacity(0.8),
              AppColors.darkSurface.withOpacity(0.4),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppColors.cyan.withOpacity(0.2),
                    blurRadius: 15,
                    spreadRadius: 1,
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 8,
                    spreadRadius: 0,
                  ),
                ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Avatar & Status
            Stack(
              children: [
                Container(
                  width: 55,
                  height: 55,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        AppColors.cyan.withOpacity(0.3),
                        AppColors.magenta.withOpacity(0.3),
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: effectiveStatusColor.withOpacity(0.3),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Center(
                    child: avatar != null
                        ? CircleAvatar(
                            backgroundImage: NetworkImage(avatar!),
                            radius: 26,
                          )
                        : Icon(Icons.person, size: 30, color: AppColors.cyan),
                  ),
                ),
                // Status Indicator
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: effectiveStatusColor,
                      border: Border.all(
                        color: AppColors.darkBackground,
                        width: 2,
                      ),
                    ),
                  ),
                ),
                // Manager/Host Badge with Star
                if (isManager || isHost)
                  Positioned(
                    left: -2,
                    top: -3,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Color(0xFFFFD700), // Gold
                            Color(0xFFFFA500), // Orange
                          ],
                        ),
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Color(0xFFFFD700).withOpacity(0.4),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('⭐', style: TextStyle(fontSize: 10)),
                          SizedBox(width: 2),
                          Text(
                            isManager ? 'مدير' : 'مضيف',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withOpacity(0.3),
                                  offset: Offset(0, 1),
                                  blurRadius: 2,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            SizedBox(height: 6),
            // Name
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 3),
            // Score
            Container(
              padding: EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.cyan.withOpacity(0.1),
                    AppColors.magenta.withOpacity(0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$score نقطة',
                style: TextStyle(
                  color: AppColors.cyan,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// 2️⃣ QUESTION CARD - بطاقة السؤال
// ============================================================================

class QuestionCard extends StatelessWidget {
  final String question;
  final int questionNumber;
  final int totalQuestions;
  final String? category;

  const QuestionCard({
    required this.question,
    required this.questionNumber,
    required this.totalQuestions,
    this.category,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [
            AppColors.cyan.withOpacity(0.08),
            AppColors.magenta.withOpacity(0.06),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: AppColors.cyan.withOpacity(0.2), width: 2),
        boxShadow: [
          BoxShadow(
            color: AppColors.cyan.withOpacity(0.15),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Progress & Category
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (category != null)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.magenta.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.magenta.withOpacity(0.4),
                    ),
                  ),
                  child: Text(
                    category!,
                    style: TextStyle(
                      color: AppColors.magenta,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              Text(
                'السؤال $questionNumber / $totalQuestions',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          // Question Text with Neon Glow
          _buildNeonText(
            text: question,
            color1: AppColors.cyan,
            color2: AppColors.magenta,
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 3️⃣ ANSWER BUTTON - زر الإجابة
// ============================================================================

class AnswerButton extends StatefulWidget {
  final String answer;
  final int index;
  final bool isSelected;
  final bool isCorrect;
  final bool isRevealed;
  final VoidCallback onTap;

  const AnswerButton({
    required this.answer,
    required this.index,
    required this.isSelected,
    required this.isCorrect,
    required this.isRevealed,
    required this.onTap,
    super.key,
  });

  @override
  State<AnswerButton> createState() => _AnswerButtonState();
}

class _AnswerButtonState extends State<AnswerButton>
    with SingleTickerProviderStateMixin {
  late AnimationController glowController;

  @override
  void initState() {
    super.initState();
    glowController = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: this,
    );
    if (widget.isSelected) {
      glowController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(AnswerButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected && !oldWidget.isSelected) {
      glowController.repeat(reverse: true);
    } else if (!widget.isSelected && oldWidget.isSelected) {
      glowController.stop();
    }
  }

  @override
  void dispose() {
    glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color buttonColor = AppColors.darkSurface;
    Color borderColor = AppColors.darkSurface.withOpacity(0.5);
    Color textColor = AppColors.textPrimary;

    if (widget.isRevealed) {
      if (widget.isCorrect) {
        buttonColor = AppColors.success.withOpacity(0.15);
        borderColor = AppColors.success;
        textColor = AppColors.success;
      } else if (widget.isSelected && !widget.isCorrect) {
        buttonColor = AppColors.error.withOpacity(0.15);
        borderColor = AppColors.error;
        textColor = AppColors.error;
      }
    } else if (widget.isSelected) {
      buttonColor = AppColors.cyan.withOpacity(0.15);
      borderColor = AppColors.cyan;
      textColor = AppColors.cyan;
    }

    return GestureDetector(
      onTap: widget.isRevealed ? null : widget.onTap,
      child: AnimatedBuilder(
        animation: glowController,
        builder: (context, child) {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderColor, width: 2),
              gradient: LinearGradient(
                colors: [buttonColor, buttonColor.withOpacity(0.5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: widget.isSelected
                  ? [
                      BoxShadow(
                        color: borderColor.withOpacity(
                          0.2 + (glowController.value * 0.2),
                        ),
                        blurRadius: 20,
                        spreadRadius: 2 + (glowController.value * 3),
                      ),
                    ]
                  : [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        spreadRadius: 0,
                      ),
                    ],
            ),
            child: Row(
              children: [
                // Letter Badge
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        borderColor.withOpacity(0.2),
                        borderColor.withOpacity(0.1),
                      ],
                    ),
                    border: Border.all(color: borderColor, width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      String.fromCharCode(65 + widget.index),
                      style: TextStyle(
                        color: borderColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                // Answer Text
                Expanded(
                  child: Text(
                    widget.answer,
                    style: TextStyle(
                      color: textColor,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
                // Status Icon
                if (widget.isRevealed)
                  Icon(
                    widget.isCorrect ? Icons.check_circle : Icons.cancel,
                    color: borderColor,
                    size: 20,
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ============================================================================
// 4️⃣ PROGRESS INDICATOR - مؤشر التقدم
// ============================================================================

class ModernProgressIndicator extends StatelessWidget {
  final int currentQuestion;
  final int totalQuestions;
  final Duration timeRemaining;
  final Color? accentColor;

  const ModernProgressIndicator({
    required this.currentQuestion,
    required this.totalQuestions,
    required this.timeRemaining,
    this.accentColor,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final progress = currentQuestion / totalQuestions;
    final effectiveColor = accentColor ?? AppColors.cyan;
    final minutes = timeRemaining.inMinutes;
    final seconds = timeRemaining.inSeconds % 60;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.darkSurface.withOpacity(0.5),
        border: Border(
          bottom: BorderSide(color: AppColors.cyan.withOpacity(0.2), width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Questions & Time
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'السؤال $currentQuestion من $totalQuestions',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.magenta.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.magenta.withOpacity(0.3)),
                ),
                child: Text(
                  '$minutes:${seconds.toString().padLeft(2, '0')}',
                  style: TextStyle(
                    color: AppColors.magenta,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: AppColors.darkBackground.withOpacity(0.5),
              valueColor: AlwaysStoppedAnimation<Color>(effectiveColor),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 5️⃣ LEADERBOARD TILE - صف لوحة المتصدرين
// ============================================================================

class LeaderboardTile extends StatelessWidget {
  final int rank;
  final String name;
  final int score;
  final bool isCurrentUser;
  final String? avatar;

  const LeaderboardTile({
    required this.rank,
    required this.name,
    required this.score,
    required this.isCurrentUser,
    this.avatar,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final isTopThree = rank <= 3;
    Color medalColor = Colors.grey;
    String medal = '🏅';

    if (rank == 1) {
      medalColor = Color(0xFFFFD700);
      medal = '🥇';
    } else if (rank == 2) {
      medalColor = Color(0xFFC0C0C0);
      medal = '🥈';
    } else if (rank == 3) {
      medalColor = Color(0xFFCD7F32);
      medal = '🥉';
    }

    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCurrentUser
              ? AppColors.cyan.withOpacity(0.3)
              : Colors.transparent,
          width: 2,
        ),
        gradient: LinearGradient(
          colors: [
            AppColors.darkSurface.withOpacity(0.8),
            AppColors.darkSurface.withOpacity(0.3),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: isCurrentUser
            ? [
                BoxShadow(
                  color: AppColors.cyan.withOpacity(0.2),
                  blurRadius: 12,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Row(
        children: [
          // Rank Badge
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: isTopThree
                  ? LinearGradient(
                      colors: [
                        medalColor.withOpacity(0.3),
                        medalColor.withOpacity(0.1),
                      ],
                    )
                  : LinearGradient(
                      colors: [
                        AppColors.cyan.withOpacity(0.1),
                        AppColors.magenta.withOpacity(0.1),
                      ],
                    ),
              border: Border.all(
                color: isTopThree
                    ? medalColor
                    : AppColors.textSecondary.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: Center(
              child: isTopThree
                  ? Text(medal, style: TextStyle(fontSize: 16))
                  : Text(
                      '$rank',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
            ),
          ),
          SizedBox(width: 12),
          SizedBox(width: 0),
          // Name
          Expanded(
            child: Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isCurrentUser ? AppColors.cyan : AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          // Score
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.magenta.withOpacity(0.1),
                  AppColors.cyan.withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cyan.withOpacity(0.2)),
            ),
            child: Text(
              '$score',
              style: TextStyle(
                color: AppColors.cyan,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 6️⃣ ROOM INFO HEADER - رأس معلومات الغرفة
// ============================================================================

class RoomInfoHeader extends StatelessWidget {
  final String roomName;
  final String roomCode;
  final int participantCount;
  final int maxParticipants;
  final Duration? gameStartsIn;
  final VoidCallback? onSettingsTap;

  const RoomInfoHeader({
    required this.roomName,
    required this.roomCode,
    required this.participantCount,
    required this.maxParticipants,
    this.gameStartsIn,
    this.onSettingsTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final fillPercentage = participantCount / maxParticipants;

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface.withOpacity(0.6),
        border: Border(
          bottom: BorderSide(color: AppColors.cyan.withOpacity(0.1), width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Room Name & Settings
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      roomName,
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 4),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.cyan.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppColors.cyan.withOpacity(0.2),
                        ),
                      ),
                      child: Text(
                        'الكود: $roomCode',
                        style: TextStyle(
                          color: AppColors.cyan,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          // Participants Count
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'اللاعبون: $participantCount/$maxParticipants',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          // Participant Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: fillPercentage,
              minHeight: 6,
              backgroundColor: AppColors.darkBackground.withOpacity(0.5),
              valueColor: AlwaysStoppedAnimation<Color>(
                fillPercentage > 0.7 ? AppColors.success : AppColors.cyan,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// 7️⃣ GAME RESULT DIALOG - نتائج اللعبة
// ============================================================================

class GameResultDialog extends StatelessWidget {
  final int rank;
  final int score;
  final int totalPoints;
  final int correctAnswers;
  final int totalQuestions;
  final String? nextActionLabel;
  final VoidCallback? onNextAction;

  const GameResultDialog({
    required this.rank,
    required this.score,
    required this.totalPoints,
    required this.correctAnswers,
    required this.totalQuestions,
    this.nextActionLabel,
    this.onNextAction,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final accuracy = ((correctAnswers / totalQuestions) * 100).toStringAsFixed(
      0,
    );
    final isWinner = rank == 1;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            colors: [
              AppColors.darkSurface.withOpacity(0.95),
              AppColors.darkBackground.withOpacity(0.95),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(
            color: isWinner
                ? AppColors.magenta.withOpacity(0.3)
                : AppColors.cyan.withOpacity(0.2),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: (isWinner ? AppColors.magenta : AppColors.cyan)
                  .withOpacity(0.2),
              blurRadius: 30,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Result Title
            ShaderMask(
              shaderCallback: (bounds) => LinearGradient(
                colors: isWinner
                    ? [AppColors.magenta, AppColors.cyan]
                    : [AppColors.cyan, AppColors.magenta],
              ).createShader(bounds),
              child: Text(
                isWinner ? '🏆 مبروك! 🏆' : 'انتهت اللعبة',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            SizedBox(height: 20),
            // Rank Badge
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    AppColors.magenta.withOpacity(0.2),
                    AppColors.cyan.withOpacity(0.2),
                  ],
                ),
                border: Border.all(
                  color: isWinner ? AppColors.magenta : AppColors.cyan,
                  width: 3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: (isWinner ? AppColors.magenta : AppColors.cyan)
                        .withOpacity(0.3),
                    blurRadius: 20,
                    spreadRadius: 3,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  'المركز\n$rank',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isWinner ? AppColors.magenta : AppColors.cyan,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            SizedBox(height: 20),
            // Stats Grid
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: AppColors.darkBackground.withOpacity(0.5),
              ),
              child: Column(
                children: [
                  buildStatRow('النقاط', '$score/$totalPoints'),
                  SizedBox(height: 10),
                  buildStatRow(
                    'الإجابات الصحيحة',
                    '$correctAnswers/$totalQuestions',
                  ),
                  SizedBox(height: 10),
                  buildStatRow('دقة الإجابة', '$accuracy%'),
                ],
              ),
            ),
            SizedBox(height: 24),
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.darkSurface,
                      foregroundColor: AppColors.cyan,
                      padding: EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: AppColors.cyan.withOpacity(0.3),
                        ),
                      ),
                    ),
                    child: Text('إغلاق'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget buildStatRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: AppColors.cyan,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

// ============================================================================
// ✨ Helper Functions for Design Components
// ============================================================================

/// Builds neon glowing text with gradient colors
Widget _buildNeonText({
  required String text,
  required Color color1,
  required Color color2,
}) {
  return ShaderMask(
    shaderCallback: (bounds) => LinearGradient(
      colors: [color1, color2],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ).createShader(bounds),
    child: Text(
      text,
      style: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.5,
        height: 1.5,
        shadows: [
          Shadow(color: color1.withOpacity(0.5), blurRadius: 8),
          Shadow(color: color2.withOpacity(0.3), blurRadius: 16),
        ],
      ),
    ),
  );
}
