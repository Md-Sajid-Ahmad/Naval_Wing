# BNCC Guard Hub (Android)

BNCC Naval Wing Cadet Management, Attendance Muster, Rank Breakdown, and Operational Console built with modern Android, Kotlin, Jetpack Compose, and Room local persistence.

## Features Ported
- **Operational Dashboard (`DashboardScreen`)**:
  - Live system status & time in Bangla digits
  - 4 Key metric cards: Total Active Cadets, Batches count, Ranks count, and Dismissed Cadets count
  - Today's Muster summary with direct action to record attendance
  - Recent active cadet preview list
- **Cadet Register (`CadetsScreen`)**:
  - Real-time search by cadet name, ID, or rank
  - Horizontal rank filter chips (সব, Cadet, LCPL, CPL, SGT, CUO)
  - Quick-registration form for adding new cadets with rank, batch, ward, gender, and phone number
  - Cadet status badge (সক্রিয় / নিষ্ক্রিয়)
- **Cadet Detail Profile (`CadetDetailScreen`)**:
  - Full cadet dossier with avatar photo, name, rank, ID, and gender badge
  - 2x2 grid with batch, status, phone number, and join date in Bangla
  - Status management: one-click active / dismissed toggle
  - Recent attendance history (last 10 sessions with attendance rate percentage)
- **Attendance Muster (`AttendanceScreen`)**:
  - Date navigation: Previous Day, Today, Next Day
  - Daily summary counters: Present (উপস্থিত), Absent (অনুপস্থিত), Late (দেরি), Excused (ছুটি)
  - "সবাই উপস্থিত" (Mark all present) quick action
  - Interactive toggle buttons (P, A, L, E) with tap-to-clear logic
- **Cadet Breakdown (`CadetBreakdownScreen`)**:
  - Gender-segmented views: Total (মোট), Male (পুরুষ), Female (নারী)
  - Hierarchical grouping by rank (CUO, SGT, CPL, LCPL, Cadet) with cadet lists
- **Dismissed List (`DismissedCadetsScreen`)**:
  - Filter by gender
  - List of inactive cadets with one-click re-activation
- **Official Correspondence (`LettersScreen`)**:
  - Naval correspondence drafting placeholder and upcoming module roadmap
- **Operational Reports (`ReportsScreen`)**:
  - Total cadets, active cadets, total sessions recorded, attendance rate
  - Visual linear progress distribution by rank
  - Gender ratio breakdown

## Architecture & Technology
- **Language**: Kotlin 2.1.0
- **UI Toolkit**: Jetpack Compose with Material 3
- **Design System**: Kinetic Glass Console (Navy background `#0F1523`, Navy surface `#182033`, Maritime Signal Red `#E53935`, Naval Cyan `#38BDF8`)
- **Persistence**: Android Jetpack Room Database with pre-populated cadet and attendance seeds
- **Navigation**: Jetpack Navigation Compose with type-safe route parameters
- **Architecture**: MVVM with Repository Pattern, Kotlin Coroutines, and reactive `StateFlow`
- **Asset Integration**: Coil for image loading and adaptive launcher icons
