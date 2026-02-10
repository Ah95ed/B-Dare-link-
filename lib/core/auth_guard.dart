import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../views/auth/login_screen.dart';

class AuthGuard {
  static Future<bool> requireLogin(
    BuildContext context, {
    String? message,
  }) async {
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) return true;

    final l10n = AppLocalizations.of(context)!;
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('🔒'),
        content: Text(message ?? l10n.authRequired),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
            child: Text(l10n.login),
          ),
        ],
      ),
    );

    return false;
  }
}
