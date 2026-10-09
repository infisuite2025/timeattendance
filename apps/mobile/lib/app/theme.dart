import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const primary = Color(0xFF2563EB);
  static const primaryDark = Color(0xFF1D4ED8);
  static const emerald = Color(0xFF059669);
  static const emeraldSoft = Color(0xFFECFDF5);
  static const amber = Color(0xFFD97706);
  static const amberSoft = Color(0xFFFFFBEB);
  static const rose = Color(0xFFE11D48);
  static const roseSoft = Color(0xFFFFF1F2);
  static const indigo = Color(0xFF4F46E5);
  static const purple = Color(0xFF7C3AED);
  static const purpleSoft = Color(0xFFF5F3FF);
  static const sky = Color(0xFF0284C7);
  static const slate900 = Color(0xFF0F172A);
  static const slate700 = Color(0xFF334155);
  static const slate500 = Color(0xFF64748B);
  static const slate400 = Color(0xFF94A3B8);
  static const slate200 = Color(0xFFD3DBE6);
  static const slate100 = Color(0xFFF1F5F9);
  static const slate50 = Color(0xFFF8FAFC);
  static const canvas = Color(0xFFE8ECF1);
  static const surface = Color(0xFFF3F4F6);
  static const line = Color(0xFFD5DCE4);
  static const white = Colors.white;

  static const present = Color(0xFF059669);
  static const late = Color(0xFFD97706);
  static const leave = Color(0xFFDB2777);
  static const wfh = Color(0xFF2563EB);
  static const holiday = Color(0xFF7C3AED);
  static const weeklyOff = Color(0xFF94A3B8);
  static const halfDay = Color(0xFFCA8A04);
  static const absent = Color(0xFFE11D48);
  static const missing = Color(0xFFEA580C);
}

ThemeData buildAppTheme() {
  final textTheme = GoogleFonts.sourceSans3TextTheme().apply(
    bodyColor: AppColors.slate900,
    displayColor: AppColors.slate900,
  );
  final scheme = ColorScheme.fromSeed(
    seedColor: AppColors.primary,
    primary: AppColors.primary,
    secondary: AppColors.emerald,
    surface: AppColors.surface,
  );

  return ThemeData(
    useMaterial3: true,
    fontFamily: GoogleFonts.sourceSans3().fontFamily,
    textTheme: textTheme,
    primaryTextTheme: textTheme,
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.canvas,
    dividerColor: AppColors.line,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.slate900,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      toolbarHeight: 64,
      titleSpacing: 16,
      iconTheme: const IconThemeData(color: AppColors.slate700, size: 22),
      actionsIconTheme: const IconThemeData(color: AppColors.slate700, size: 22),
      shape: const Border(bottom: BorderSide(color: AppColors.line)),
      titleTextStyle: GoogleFonts.sourceSans3(
        color: AppColors.slate900,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
        height: 1.2,
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.surface,
      elevation: 8,
      shadowColor: const Color(0x140F172A),
      surfaceTintColor: Colors.transparent,
      indicatorColor: const Color(0xFFDBEAFE),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return TextStyle(
          fontSize: 11,
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          color: selected ? AppColors.primary : AppColors.slate500,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          color: selected ? AppColors.primary : AppColors.slate500,
          size: 22,
        );
      }),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.canvas,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      hintStyle: GoogleFonts.sourceSans3(color: AppColors.slate400, fontSize: 14, fontWeight: FontWeight.w400),
      labelStyle: GoogleFonts.sourceSans3(color: AppColors.slate700, fontWeight: FontWeight.w600, fontSize: 13),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.4),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.rose),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: GoogleFonts.sourceSans3(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.slate900,
        minimumSize: const Size.fromHeight(48),
        side: const BorderSide(color: AppColors.line),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: GoogleFonts.sourceSans3(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: GoogleFonts.sourceSans3(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      elevation: 8,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
      titleTextStyle: GoogleFonts.sourceSans3(color: AppColors.slate900, fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: -0.2),
      contentTextStyle: GoogleFonts.sourceSans3(color: AppColors.slate500, fontSize: 14, height: 1.45, fontWeight: FontWeight.w400),
    ),
    datePickerTheme: DatePickerThemeData(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      headerBackgroundColor: AppColors.surface,
      headerForegroundColor: AppColors.slate900,
      weekdayStyle: GoogleFonts.sourceSans3(color: AppColors.slate500, fontWeight: FontWeight.w600, fontSize: 12),
      dayStyle: GoogleFonts.sourceSans3(color: AppColors.slate900, fontWeight: FontWeight.w500),
      todayForegroundColor: const WidgetStatePropertyAll(AppColors.primary),
      todayBackgroundColor: const WidgetStatePropertyAll(Color(0xFFEFF6FF)),
      dayForegroundColor: const WidgetStatePropertyAll(AppColors.slate900),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
    ),
    timePickerTheme: const TimePickerThemeData(
      backgroundColor: AppColors.surface,
      hourMinuteColor: AppColors.slate50,
      hourMinuteTextColor: AppColors.slate900,
      dayPeriodColor: AppColors.slate100,
      dayPeriodTextColor: AppColors.slate900,
      dialHandColor: AppColors.primary,
      dialBackgroundColor: AppColors.slate50,
      entryModeIconColor: AppColors.slate700,
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
    ),
  );
}
