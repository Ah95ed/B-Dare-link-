import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/locale_provider.dart';
import '../l10n/app_localizations.dart';

import 'levels_view.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'profile/profile_screen.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';

    return Scaffold(
      body: Stack(
        children: [
          // Background Decoration
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -30,
            left: -30,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
            ),
          ),

          Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.auto_awesome,
                    size: 80,
                    color: Theme.of(context).primaryColor,
                  ),
                  SizedBox(height: 20),
                  Text(
                    l10n.appTitle,
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Discover the hidden connection!",
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  SizedBox(height: 60),

                  // Levels Button
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) {
                      return OutlinedButton(
                        onPressed: () {
                          // if (auth.isAuthenticated) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const LevelsView(),
                              ),
                            );
                          // } else {
                            // Show login prompt
                          //   ScaffoldMessenger.of(context).showSnackBar(
                          //     SnackBar(
                          //       content: Text(
                          //         isArabic
                          //             ? "يجب تسجيل الدخول أولاً للعب"
                          //             : "Please login to play",
                          //       ),
                          //       action: SnackBarAction(
                          //         label: isArabic ? "تسجيل الدخول" : "Login",
                          //         onPressed: () {
                          //           Navigator.push(
                          //             context,
                          //             MaterialPageRoute(
                          //               builder: (_) => const LoginScreen(),
                          //             ),
                          //           );
                          //         },
                          //       ),
                          //     ),
                          //   );
                          // }
                        },
                        style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.symmetric(
                            horizontal: 40,
                            vertical: 15,
                          ),
                          side: BorderSide(
                            color: Theme.of(context).primaryColor,
                            width: 2,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        child: Text(
                          isArabic ? "المراحل" : "Levels",
                          style: TextStyle(
                            fontSize: 18,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // Language Toggle
          Positioned(
            top: 50,
            left: 20,
            child: Consumer<LocaleProvider>(
              builder: (context, provider, _) {
                return TextButton.icon(
                  onPressed: () => provider.toggleLocale(),
                  icon: const Icon(Icons.language),
                  label: Text(l10n.changeLanguage),
                );
              },
            ),
          ),

          // Profile / Login Button
          Positioned(
            top: 50,
            right: 20,
            child: Consumer<AuthProvider>(
              builder: (context, auth, _) {
                return IconButton(
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
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    }
                  },
                  icon: Icon(
                    auth.isAuthenticated ? Icons.account_circle : Icons.login,
                    size: 30,
                    color: Theme.of(context).primaryColor,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
