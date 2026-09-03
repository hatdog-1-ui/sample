package com.docscanpro.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

object Routes {
    const val SPLASH = "splash"
    const val HOME = "home"
    const val CAMERA = "camera"
    const val CROP = "crop/{imageUri}"
    const val EDIT = "edit/{documentId}"
    const val VIEWER = "viewer/{documentId}"
    const val PDF_PREVIEW = "pdf_preview/{documentId}"
    const val SAVE = "save/{documentId}"
    const val SHARE = "share/{documentId}"
    const val FOLDER = "folder/{folderName}"
    const val OCR = "ocr/{pageId}"
    const val SETTINGS = "settings"
    const val PERMISSIONS = "permissions"

    fun crop(imageUri: String) = "crop/$imageUri"
    fun edit(documentId: String) = "edit/$documentId"
    fun viewer(documentId: String) = "viewer/$documentId"
    fun pdfPreview(documentId: String) = "pdf_preview/$documentId"
    fun save(documentId: String) = "save/$documentId"
    fun share(documentId: String) = "share/$documentId"
    fun folder(folderName: String) = "folder/$folderName"
    fun ocr(pageId: String) = "ocr/$pageId"
}

@Composable
fun DocScanNavGraph() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.SPLASH) {
        composable(Routes.SPLASH) {
            com.docscanpro.ui.splash.SplashScreen(
                onNavigateToHome = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                },
                onNavigateToPermissions = {
                    navController.navigate(Routes.PERMISSIONS) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.HOME) {
            com.docscanpro.ui.home.HomeScreen(
                onScanClick = { navController.navigate(Routes.CAMERA) },
                onDocumentClick = { docId -> navController.navigate(Routes.viewer(docId)) },
                onFolderClick = { folderName -> navController.navigate(Routes.folder(folderName)) },
                onSettingsClick = { navController.navigate(Routes.SETTINGS) }
            )
        }

        composable(Routes.CAMERA) {
            com.docscanpro.ui.camera.CameraScanScreen(
                onImageCaptured = { uri -> navController.navigate(Routes.crop(uri)) },
                onBatchComplete = { docId -> navController.navigate(Routes.edit(docId)) },
                onClose = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.CROP,
            arguments = listOf(navArgument("imageUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val imageUri = backStackEntry.arguments?.getString("imageUri") ?: return@composable
            com.docscanpro.ui.crop.CropScreen(
                imageUri = imageUri,
                onConfirm = { docId -> navController.navigate(Routes.edit(docId)) {
                    popUpTo(Routes.CAMERA) { inclusive = true }
                }},
                onRetake = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.EDIT,
            arguments = listOf(navArgument("documentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val documentId = backStackEntry.arguments?.getString("documentId") ?: return@composable
            com.docscanpro.ui.edit.FilterEditScreen(
                documentId = documentId,
                onSave = { navController.navigate(Routes.save(documentId)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.VIEWER,
            arguments = listOf(navArgument("documentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val documentId = backStackEntry.arguments?.getString("documentId") ?: return@composable
            com.docscanpro.ui.viewer.DocumentViewerScreen(
                documentId = documentId,
                onAddPage = { navController.navigate(Routes.CAMERA) },
                onShare = { navController.navigate(Routes.share(documentId)) },
                onPdf = { navController.navigate(Routes.pdfPreview(documentId)) },
                onOcr = { pageId -> navController.navigate(Routes.ocr(pageId)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.PDF_PREVIEW,
            arguments = listOf(navArgument("documentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val documentId = backStackEntry.arguments?.getString("documentId") ?: return@composable
            com.docscanpro.ui.pdf.PdfPreviewScreen(
                documentId = documentId,
                onSave = { navController.navigate(Routes.save(documentId)) },
                onShare = { navController.navigate(Routes.share(documentId)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.SAVE,
            arguments = listOf(navArgument("documentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val documentId = backStackEntry.arguments?.getString("documentId") ?: return@composable
            com.docscanpro.ui.save.SaveExportScreen(
                documentId = documentId,
                onSaved = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.HOME) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.SHARE,
            arguments = listOf(navArgument("documentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val documentId = backStackEntry.arguments?.getString("documentId") ?: return@composable
            com.docscanpro.ui.share.ShareScreen(
                documentId = documentId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.FOLDER,
            arguments = listOf(navArgument("folderName") { type = NavType.StringType })
        ) { backStackEntry ->
            val folderName = backStackEntry.arguments?.getString("folderName") ?: return@composable
            com.docscanpro.ui.folder.FolderViewScreen(
                folderName = folderName,
                onDocumentClick = { docId -> navController.navigate(Routes.viewer(docId)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.OCR,
            arguments = listOf(navArgument("pageId") { type = NavType.StringType })
        ) { backStackEntry ->
            val pageId = backStackEntry.arguments?.getString("pageId") ?: return@composable
            com.docscanpro.ui.ocr.OcrScreen(
                pageId = pageId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.SETTINGS) {
            com.docscanpro.ui.settings.SettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.PERMISSIONS) {
            com.docscanpro.ui.permissions.PermissionsScreen(
                onPermissionsGranted = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.PERMISSIONS) { inclusive = true }
                    }
                }
            )
        }
    }
}
