import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/locale_provider.dart';
import '../l10n/app_localizations.dart';

import 'levels_view.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'profile/profile_screen.dart';
import 'admin/admin_page.dart';
import 'competitions/competitions_view.dart';
import 'groups/create_group_view.dart';
import 'groups/join_group_view.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Gradient Aurora Background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Theme.of(context).scaffoldBackgroundColor,
                  Color(0xFF1A1F3A).withOpacity(0.5),
                  Theme.of(context).scaffoldBackgroundColor,
                ],
              ),
            ),
          ),

          // Animated Background Elements
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF00D9FF).withOpacity(0.15),
                    Color(0xFF00D9FF).withOpacity(0),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -150,
            left: -100,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    Color(0xFFFF006E).withOpacity(0.1),
                    Color(0xFFFF006E).withOpacity(0),
                  ],
                ),
              ),
            ),
          ),

          Center(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Hero Icon with Glow Effect
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [
                          Color(0xFF00D9FF).withOpacity(0.2),
                          Color(0xFFFF006E).withOpacity(0.2),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Color(0xFF00D9FF).withOpacity(0.3),
                          blurRadius: 30,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        Icons.auto_awesome,
                        size: 80,
                        color: Color(0xFF00D9FF),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // App Title with Modern Typography
                  ShaderMask(
                    shaderCallback: (bounds) => LinearGradient(
                      colors: [Color(0xFF00D9FF), Color(0xFFFF006E)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ).createShader(bounds),
                    child: Text(
                      l10n.appTitle,
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        fontSize: 48,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle
                  Text(
                    "Discover the hidden connection!",
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontSize: 16,
                      letterSpacing: 0.5,
                      color: Color(0xFFA0A8C8),
                    ),
                  ),

                  const SizedBox(height: 60),

                  // Main Action Buttons
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) {
                      return Column(
                        children: [
                          // Levels Button - Premium Style
                          Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Color(0xFF00D9FF).withOpacity(0.2),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  PageRouteBuilder(
                                    pageBuilder: (_, __, ___) =>
                                        const LevelsView(),
                                    transitionsBuilder:
                                        (_, animation, __, child) {
                                          return FadeTransition(
                                            opacity: animation,
                                            child: child,
                                          );
                                        },
                                  ),
                                );
                              },
                              icon: Icon(Icons.play_circle_fill),
                              label: Text(
                                isArabic ? "المراحل" : "Levels",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Color(
                                  0xFF00D9FF,
                                ).withOpacity(0.15),
                                foregroundColor: Color(0xFF00D9FF),
                                elevation: 0,
                                padding: EdgeInsets.symmetric(
                                  horizontal: 40,
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(
                                    color: Color(0xFF00D9FF).withOpacity(0.4),
                                    width: 2,
                                  ),
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 12),

                          // Competitions Button
                          ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                PageRouteBuilder(
                                  pageBuilder: (_, __, ___) =>
                                      const CompetitionsView(),
                                  transitionsBuilder:
                                      (_, animation, __, child) {
                                        return FadeTransition(
                                          opacity: animation,
                                          child: child,
                                        );
                                      },
                                ),
                              );
                            },
                            icon: Icon(Icons.emoji_events),
                            label: Text(
                              isArabic ? "المسابقات" : "Competitions",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF00D9FF),
                              foregroundColor: Color(0xFF0F1729),
                              elevation: 12,
                              shadowColor: Color(0xFF00D9FF).withOpacity(0.4),
                              padding: EdgeInsets.symmetric(
                                horizontal: 40,
                                vertical: 16,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                          ),

                          const SizedBox(height: 12),

                          // Create/Join Group Buttons - Smaller
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => const CreateGroupView(),
                                      ),
                                    );
                                  },
                                  icon: Icon(Icons.group_add, size: 18),
                                  label: Text(
                                    isArabic ? 'إنشاء' : 'Create',
                                    style: TextStyle(fontSize: 14),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(
                                      0xFFFF006E,
                                    ).withOpacity(0.15),
                                    foregroundColor: Color(0xFFFF006E),
                                    elevation: 0,
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                      side: BorderSide(
                                        color: Color(
                                          0xFFFF006E,
                                        ).withOpacity(0.4),
                                        width: 1.5,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => const JoinGroupView(),
                                      ),
                                    );
                                  },
                                  icon: Icon(Icons.group, size: 18),
                                  label: Text(
                                    isArabic ? 'انضم' : 'Join',
                                    style: TextStyle(fontSize: 14),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(
                                      0xFFFF006E,
                                    ).withOpacity(0.15),
                                    foregroundColor: Color(0xFFFF006E),
                                    elevation: 0,
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                      side: BorderSide(
                                        color: Color(
                                          0xFFFF006E,
                                        ).withOpacity(0.4),
                                        width: 1.5,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // Top Navigation Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).scaffoldBackgroundColor.withOpacity(0.8),
                border: Border(
                  bottom: BorderSide(
                    color: Color(0xFF00D9FF).withOpacity(0.1),
                    width: 1,
                  ),
                ),
              ),
              padding: EdgeInsets.fromLTRB(16, 16, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Language Toggle
                  Consumer<LocaleProvider>(
                    builder: (context, provider, _) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Color(0xFF00D9FF).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Color(0xFF00D9FF).withOpacity(0.2),
                            width: 1.5,
                          ),
                        ),
                        child: TextButton.icon(
                          onPressed: () => provider.toggleLocale(),
                          icon: Icon(
                            Icons.language,
                            color: Color(0xFF00D9FF),
                            size: 20,
                          ),
                          label: Text(
                            provider.locale.languageCode.toUpperCase(),
                            style: TextStyle(
                              color: Color(0xFF00D9FF),
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                              letterSpacing: 0.5,
                            ),
                          ),
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 12),

                  // Admin Button (if applicable)
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) {
                      final isAdmin =
                          auth.user != null && (auth.user!['id'] == 1);
                      if (!isAdmin) {
                        return const SizedBox.shrink();
                      }
                      return Container(
                        decoration: BoxDecoration(
                          color: Color(0xFFFF006E).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Color(0xFFFF006E).withOpacity(0.2),
                            width: 1.5,
                          ),
                        ),
                        child: IconButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const AdminPage(),
                              ),
                            );
                          },
                          icon: Icon(
                            Icons.admin_panel_settings,
                            color: Color(0xFFFF006E),
                            size: 20,
                          ),
                          tooltip: 'Admin Panel',
                          iconSize: 20,
                          padding: EdgeInsets.all(8),
                          constraints: BoxConstraints(
                            minWidth: 40,
                            minHeight: 40,
                          ),
                        ),
                      );
                    },
                  ),

                  const Spacer(),

                  // Profile / Login Button
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Color(0xFF00D9FF).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Color(0xFF00D9FF).withOpacity(0.2),
                            width: 1.5,
                          ),
                        ),
                        child: IconButton(
                          onPressed: () {
                            if (auth.isAuthenticated) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const ProfileScreen(),
                                ),
                              );
                            } else {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const LoginScreen(),
                                ),
                              );
                            }
                          },
                          icon: Icon(
                            auth.isAuthenticated
                                ? Icons.account_circle
                                : Icons.login,
                            color: Color(0xFF00D9FF),
                            size: 22,
                          ),
                          tooltip: auth.isAuthenticated ? 'Profile' : 'Login',
                          padding: EdgeInsets.all(8),
                          constraints: BoxConstraints(
                            minWidth: 40,
                            minHeight: 40,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
