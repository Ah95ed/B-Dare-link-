import 'package:flutter/material.dart';
import 'package:email_otp/email_otp.dart';
import 'package:provider/provider.dart';
import 'package:wonder_link_game/l10n/app_localizations.dart';
import 'package:wonder_link_game/providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _sent = false;
  bool _loading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final l10n = AppLocalizations.of(context)!;
    EmailOTP.setSMTP(
      host: 'smtp.gmail.com',
      emailPort: EmailPort.port587,
      secureType: SecureType.tls,
      username: 'amhmeed31@gmail.com',

      /// your google account mail
      password: 'arhs xupn ktkc ypir',

      /// this password will get while creating app password
    );

    EmailOTP.config(
      appName: l10n.appTitle,
      otpType: OTPType.numeric,
      expiry: 40000,
      emailTheme: EmailTheme.v6,
      appEmail: 'amhmeed31@gmail.com',
      otpLength: 6,
    );
  }

  Future<void> _sendOtp() async {
    if (!_formKey.currentState!.validate()) return;
    final email = _emailController.text.trim();
    setState(() => _loading = true);
    try {
      final ok = await EmailOTP.sendOTP(email: email);
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.errorSendingOTP(e.toString()))),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _verifyAndRegister() async {
    if (!_formKey.currentState!.validate()) return;
    final otp = _otpController.text.trim();
    if (otp.isEmpty) return;
    setState(() => _loading = true);
    try {
      final ok = EmailOTP.verifyOTP(otp: otp);
      final l10n = AppLocalizations.of(context)!;
      if (!ok) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.invalidOTP)));
        return;
      }

      await Provider.of<AuthProvider>(context, listen: false).register(
        _usernameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text.trim(),
      );
      if (mounted) {
        Navigator.pop(context); // Pop register
        Navigator.pop(context); // Pop login (if stacked)
      }
    } catch (e) {
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${l10n.registrationFailed}: ${e.toString().replaceAll("Exception: ", "")} ',
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.registerTitle)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                l10n.createAccount,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _usernameController,
                decoration: InputDecoration(
                  labelText: l10n.username,
                  border: const OutlineInputBorder(),
                ),
                validator: (v) => v!.isEmpty ? l10n.enterUsername : null,
              ),
              const SizedBox(height: 10),
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
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _sendOtp,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                  ),
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(l10n.sendOTP),
                ),
              ),
              if (_sent) ...[
                const SizedBox(height: 12),
                TextFormField(
                  controller: _otpController,
                  decoration: InputDecoration(
                    labelText: l10n.otpLabel,
                    border: const OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                Consumer<AuthProvider>(
                  builder: (context, auth, _) => ElevatedButton(
                    onPressed: (_loading || auth.isLoading)
                        ? null
                        : _verifyAndRegister,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50),
                    ),
                    child: (auth.isLoading || _loading)
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(l10n.register),
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
