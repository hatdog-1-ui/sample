pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // OpenCV Android artifacts are published on JitPack (used for document edge-detection features)
        maven { url = uri("https://jitpack.io") }
    }
}

rootProject.name = "DocScan Pro"
include(":app")
