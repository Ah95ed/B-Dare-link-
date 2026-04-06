import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../core/exceptions/app_exceptions.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _mapLoginError(
    Object error,
    AuthProvider auth,
    AppLocalizations l10n,
  ) {
    // Check for network-specific errors first
    if (error is NetworkException) {
      if (error.message.toLowerCase().contains('timeout')) {
        return l10n.networkTimeout;
      }
      if (error.message.toLowerCase().contains('connection') ||
          error.message.toLowerCase().contains('socket')) {
        return l10n.noConnection;
      }
      return error.message;
    }

    // Check for auth-specific errors
    if (error is AuthException) {
      if (error.message.toLowerCase().contains('400') ||
          error.message.toLowerCase().contains('401')) {
        return l10n.invalidCredentials;
      }
      if (error.message.toLowerCase().contains('500')) {
        return l10n.serverError;
      }
      return error.message;
    }

    // Check provider's last error (set by service layer)
    final lastError = auth.lastError;
    if (lastError != null && lastError.isNotEmpty) {
      if (lastError.toLowerCase().contains('timeout')) {
        return l10n.networkTimeout;
      }
      if (lastError.toLowerCase().contains('connection') ||
          lastError.toLowerCase().contains('socket')) {
        return l10n.noConnection;
      }
      if (lastError.toLowerCase().contains('invalid') &&
          lastError.toLowerCase().contains('credential')) {
        return l10n.invalidCredentials;
      }
      return lastError.replaceAll('Exception: ', '');
    }

    final text = error.toString().replaceAll('Exception: ', '');
    return text.isEmpty ? l10n.loginFailed : text;
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      try {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        await auth.login(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );
        if (mounted) {
          Navigator.pop(context); // Go back to Home or previous screen
        }
      } catch (e) {
        if (mounted) {
          final l10n = AppLocalizations.of(context)!;
          final auth = Provider.of<AuthProvider>(context, listen: false);
          final message = _mapLoginError(e, auth, l10n);
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(message)));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.loginTitle)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                l10n.welcomeBack,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: l10n.email,
                  border: const OutlineInputBorder(),
                ),
                validator: (v) =>
                    v!.contains('@') ? null : l10n.enterValidEmail,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: l10n.password,
                  border: const OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (v) => v!.length < 6 ? l10n.passwordTooShort : null,
              ),
              const SizedBox(height: 20),
              Consumer<AuthProvider>(
                builder: (context, auth, _) => auth.isLoading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: _submit,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        child: Text(l10n.login),
                      ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RegisterScreen()),
                  );
                },
                child: Text(l10n.dontHaveAccount),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ForgotPasswordScreen(),
                    ),
                  );
                },
                child: Text(l10n.forgotPassword),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
