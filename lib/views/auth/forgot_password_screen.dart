import 'package:flutter/material.dart';
import 'package:email_otp/email_otp.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../l10n/app_localizations.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  bool _sent = false;
  bool _loading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final l10n = AppLocalizations.of(context)!;
    EmailOTP.config(
      appName: l10n.appTitle,
      otpType: OTPType.numeric,
      emailTheme: EmailTheme.v1,
    );
  }

  Future<void> _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;

    setState(() => _loading = true);
    try {
      final ok = await EmailOTP.sendOTP(email: email);
      // log(l10n.otpSentLog(ok.toString()));
      final l10n = AppLocalizations.of(context)!;
      if (ok) {
        setState(() => _sent = true);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.otpSent(email))));
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.errorSendingOTP(''))));
      }
    } catch (e) {
      final l10n = AppLocalizations.of(context)!;
      debugPrint(l10n.otpSendErrorLog(e.toString()));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.errorSendingOTP(e.toString()))),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _verifyAndReset() async {
    final otp = _otpController.text.trim();
    final newPass = _newPasswordController.text;
    if (otp.isEmpty || newPass.isEmpty) return;
    setState(() => _loading = true);
    try {
      final ok = EmailOTP.verifyOTP(otp: otp);
      final l10n = AppLocalizations.of(context)!;
      debugPrint(l10n.otpVerifyLog(ok.toString()));
      if (ok) {
        // Call backend to update password
        await Provider.of<AuthProvider>(
          context,
          listen: false,
        ).resetPassword(_emailController.text.trim(), newPass);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.passwordResetSuccessful)));
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.invalidOTP)));
      }
    } catch (e) {
      final l10n = AppLocalizations.of(context)!;
      debugPrint(l10n.otpVerifyErrorLog(e.toString()));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.errorVerifyingOTP(e.toString()))),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.resetPassword)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(l10n.resetPasswordInstructions, textAlign: TextAlign.center),
              const SizedBox(height: 20),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: l10n.email,
                  border: const OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _sendOtp,
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(l10n.sendOTP),
                ),
              ),

              if (_sent) ...[
                const SizedBox(height: 20),
                TextField(
                  controller: _otpController,
                  decoration: InputDecoration(
                    labelText: l10n.otpLabel,
                    border: const OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _newPasswordController,
                  decoration: InputDecoration(
                    labelText: l10n.newPassword,
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _verifyAndReset,
                    child: _loading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(l10n.verifyAndReset),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
