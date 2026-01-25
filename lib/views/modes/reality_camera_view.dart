import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:wonder_link_game/views/game_play_view.dart';
import '../../controllers/game_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../core/app_colors.dart';

/// Camera/Gallery view for Reality Mode
/// Note: ImagePicker disabled temporarily for Windows build stability
class RealityCameraView extends StatefulWidget {
  const RealityCameraView({super.key});

  @override
  State<RealityCameraView> createState() => _RealityCameraViewState();
}

class _RealityCameraViewState extends State<RealityCameraView> {
  final ImagePicker _picker = ImagePicker();
  bool _isAnalyzing = false;
  String? _error;

  bool get _isDesktop =>
      !kIsWeb && (Platform.isWindows || Platform.isLinux || Platform.isMacOS);

  Future<void> _pickImage(ImageSource source) async {
    if (_isDesktop || kIsWeb) {
      setState(() {
        _error = kIsWeb
            ? "Vision scanning is not supported on Web yet."
            : "Scanner not supported on Desktop yet.\nUse Android/iOS.";
      });
      return;
    }

    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        await _analyzeImage(File(image.path));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error picking image: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  // ignore: unused_element
  Future<void> _analyzeImage(File imageFile) async {
    setState(() {
      _isAnalyzing = true;
      _error = null;
    });

    try {
      final provider = Provider.of<GameProvider>(context, listen: false);
      final isArabic =
          Provider.of<LocaleProvider>(
            context,
            listen: false,
          ).locale.languageCode ==
          'ar';

      final success = await provider.generatePuzzleFromImage(
        imageFile,
        isArabic,
      );

      if (success && mounted) {
        provider.setGameMode(GameMode.multipleChoice);
        // Navigate to game play
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const GamePlayView()),
        );
      } else {
        setState(() {
          _error = isArabic
              ? 'فشل في تحليل الصورة. حاول مرة أخرى.'
              : 'Failed to analyze image. Try again.';
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isArabic =
        context.watch<LocaleProvider>().locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        alignment: Alignment.center,
        children: [
          // Background visualization
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [AppColors.cyan.withOpacity(0.2), Colors.black],
                center: Alignment.center,
                radius: 1.5,
              ),
            ),
          ),

          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.camera_alt_outlined,
                size: 80,
                color: AppColors.cyan.withOpacity(0.8),
              ),
              const SizedBox(height: 24),
              Text(
                isArabic ? 'الواقع المعزز بالمعنى' : 'Contextual Reality Start',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  isArabic
                      ? 'التقط صورة وسنقوم بتحويلها إلى لغز فريد يبدأ من عالمك!'
                      : 'Capture a photo and we will transform it into a unique puzzle starting from your world!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70, fontSize: 16),
                ),
              ),
              const SizedBox(height: 48),

              if (_isAnalyzing)
                Column(
                  children: [
                    const CircularProgressIndicator(color: AppColors.cyan),
                    const SizedBox(height: 16),
                    Text(
                      isArabic ? 'جاري تحليل الصورة...' : 'Analyzing Image...',
                      style: const TextStyle(color: AppColors.cyan),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    if (_isDesktop || kIsWeb)
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          _isDesktop
                              ? "⚠️ Feature currently disabled on Desktop.\nPlease try on Mobile."
                              : "⚠️ Vision scanning is not supported on Web yet.",
                          style: const TextStyle(color: Colors.amberAccent),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildOptionButton(
                          icon: Icons.camera_alt,
                          label: isArabic ? 'كاميرا' : 'Camera',
                          onTap: () => _pickImage(ImageSource.camera),
                        ),
                        const SizedBox(width: 24),
                        _buildOptionButton(
                          icon: Icons.photo_library,
                          label: isArabic ? 'استوديو' : 'Gallery',
                          onTap: () => _pickImage(ImageSource.gallery),
                        ),
                      ],
                    ),
                  ],
                ),

              if (_error != null)
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    _error!,
                    style: const TextStyle(color: AppColors.error),
                    textAlign: TextAlign.center,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOptionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(
          color: AppColors.darkSurfaceLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.cyan.withOpacity(0.3), width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.white),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
