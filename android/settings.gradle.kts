pluginManagement {
    val properties = java.util.Properties()
    val localPropertiesFile = file("local.properties")
    if (localPropertiesFile.exists()) {
        localPropertiesFile.inputStream().use { properties.load(it) }
    }

    val flutterSdkPath = properties.getProperty("flutter.sdk")
    check(!flutterSdkPath.isNullOrBlank()) { "flutter.sdk not set in local.properties" }

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }

    plugins {
        id("dev.flutter.flutter-gradle-plugin") version "1.0.0" apply false
    }
}

plugins {
    // id("com.google.gms.google-services") version "4.4.0" apply false
    // id("com.google.firebase.crashlytics") version "2.9.9" apply false
    id("dev.flutter.flutter-plugin-loader") version "1.0.0"
    id("com.android.application") version "8.11.1" apply false
    id("org.jetbrains.kotlin.android") version "2.1.0" apply false
}

include(":app")
