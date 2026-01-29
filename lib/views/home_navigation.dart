import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/locale_provider.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../providers/auth_provider.dart';
import 'admin/admin_page.dart';
import 'auth/login_screen.dart';
import 'profile/profile_screen.dart';

/// Handles home view navigation bar and buttons
class HomeNavigation {
  /// Build top navigation bar
  static Widget buildTopNavigation(BuildContext context, bool isArabic) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor.withOpacity(0.8),
          border: Border(
            bottom: BorderSide(
              color: AppColors.cyan.withOpacity(0.1),
              width: 1,
            ),
          ),
        ),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildLanguageToggle(),
            const SizedBox(width: 12),
            _buildAdminButton(context),
            const Spacer(),
            _buildProfileButton(context),
          ],
        ),
      ),
    );
  }

  /// Build language toggle button
  static Widget _buildLanguageToggle() {
    return Consumer<LocaleProvider>(
      builder: (context, provider, _) {
        return Container(
          decoration: BoxDecoration(
            color: AppColors.cyan.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.cyan.withOpacity(0.2),
              width: 1.5,
            ),
          ),
          child: TextButton.icon(
            onPressed: () => provider.toggleLocale(),
            icon: const Icon(Icons.language, color: AppColors.cyan, size: 20),
            label: Text(
              provider.locale.languageCode.toUpperCase(),
              style: const TextStyle(
                color: AppColors.cyan,
                fontWeight: FontWeight.w700,
                fontSize: 12,
                letterSpacing: 0.5,
              ),
            ),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
          ),
        );
      },
    );
  }

  /// Build admin button
  static Widget _buildAdminButton(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final isAdmin =
            auth.user != null && (auth.user!['id'] == AppConstants.adminUserId);
        if (!isAdmin) return const SizedBox.shrink();

        return Container(
          decoration: BoxDecoration(
            color: AppColors.magenta.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.magenta.withOpacity(0.2),
              width: 1.5,
            ),
          ),
          child: IconButton(
            onPressed: () => _navigateTo(context, const AdminPage()),
            icon: const Icon(
              Icons.admin_panel_settings,
              color: AppColors.magenta,
              size: 20,
            ),
            tooltip: 'Admin Panel',
            constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
          ),
        );
      },
    );
  }

  /// Build profile/login button
  static Widget _buildProfileButton(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return Container(
          decoration: BoxDecoration(
            color: AppColors.cyan.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.cyan.withOpacity(0.2),
              width: 1.5,
            ),
          ),
          child: IconButton(
            onPressed: () {
              if (auth.isAuthenticated) {
                _navigateTo(context, const ProfileScreen());
              } else {
                _navigateTo(context, const LoginScreen());
              }
            },
            icon: Icon(
              auth.isAuthenticated ? Icons.account_circle : Icons.login,
              color: AppColors.cyan,
              size: 22,
            ),
            tooltip: auth.isAuthenticated ? 'Profile' : 'Login',
            constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
          ),
        );
      },
    );
  }

  /// Navigate to a widget with fade transition
  static void _navigateTo(BuildContext context, Widget widget) {
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => widget,
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }
}
