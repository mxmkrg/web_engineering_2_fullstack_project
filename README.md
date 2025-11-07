# Workout Tracker 🏋️

Ein Full-Stack Workout Tracking System, entwickelt als Projekt im Rahmen des Web Engineering 2 Kurses an der DHBW Mosbach.

## 📋 Projektbeschreibung

Dieses Projekt ist eine umfassende Fitness- und Workout-Tracking-Anwendung, die es Benutzern ermöglicht, ihre Trainingseinheiten zu planen, durchzuführen und zu analysieren. Die Anwendung bietet eine intuitive Benutzeroberfläche zum Verwalten von Workouts, Übungen, Routines und Trainingsfortschritt.

Die Anwendung umfasst:
- **Workout-Tracking**: Erstellen, durchführen und analysieren von Trainingseinheiten
- **Übungsdatenbank**: Umfangreiche Bibliothek mit kategorisierten Übungen
- **Routines**: Vordefinierte Trainingspläne für schnelles Workout-Setup
- **Fortschrittsverfolgung**: Detaillierte Statistiken und Charts zur Trainingsanalyse
- **Benutzerverwaltung**: Authentifizierung und personalisierte Profile
- **Admin-Dashboard**: Verwaltung von Benutzern und System-Überwachung (nur für Admins)

## 🛠️ Tech Stack

### Framework & Core
- **Next.js 15** - React Framework mit App Router
- **React 19** - UI-Bibliothek
- **TypeScript** - Typsichere Entwicklung

### Styling & UI
- **Tailwind CSS v4** - Utility-First CSS Framework
- **shadcn/ui** - Komponentenbibliothek (basierend auf Radix UI)
- **Lucide React** - Icon-Bibliothek
- **Framer Motion** - Animations-Bibliothek
- **class-variance-authority** & **clsx** - Utility für bedingte CSS-Klassen

### Datenverwaltung
- **Drizzle ORM** - Type-safe ORM für TypeScript
- **SQLite** (libsql) - Lokale Datenbank
- **Zod** - Schema-Validierung

### Authentication
- **better-auth** - Moderne Authentifizierungslösung

### Tabellen & Datenvisualisierung
- **TanStack Table** - Leistungsstarke Tabellen-Bibliothek
- **Recharts** - Chart-Bibliothek für Statistiken
- **date-fns** - Datum-Utilities

### UI-Features
- **@dnd-kit** - Drag & Drop Funktionalität
- **react-day-picker** - Kalender-Komponente
- **sonner** - Toast-Benachrichtigungen
- **vaul** - Drawer-Komponente

### Development Tools
- **Biome** - Linter und Formatter
- **pnpm** - Package Manager
- **Turbopack** - Next.js Build-Tool

## ✨ Aktuelle Funktionalitäten

### Authentifizierung & Benutzerverwaltung

- Benutzerregistrierung und Login
- Session-Management
- Geschützte Routen mit Middleware
- Admin-Rollenverwaltung

### Workout-Verwaltung

- **Workout-Erstellung**: Erstellen neuer Trainingseinheiten mit individuellem Namen und Datum
- **Übungsdatenbank**: Umfangreiche Bibliothek vordefinierter Übungen mit Kategorien (Chest, Back, Legs, Shoulders, Arms, Cardio, etc.)
- **Workout-Tracking**: Aufzeichnung von Sätzen, Wiederholungen und Gewichten für jede Übung
- **Status-Management**: Workouts können als "active", "completed" oder "archived" markiert werden
- **Workout-Details**: Detaillierte Ansicht einzelner Workouts mit allen Übungen und Sätzen
- **Routines**: Vorgefertigte Trainingspläne für schnelles Workout-Setup

### Organisation & Navigation

- **Dashboard**: Übersichtsseite mit Schnellzugriff und aktuellen Aktivitäten
- **Workout-Übersicht**: Liste aller Workouts mit Filtermöglichkeiten
- **Archivierte Workouts**: Separate Ansicht für archivierte Trainingseinheiten
- **Fortschritts-Tracking**: Separate Seite für Trainingsfortschritt und Statistiken
- **Profilverwaltung**: Persönliche Daten, Ziele und Präferenzen

### Datenstruktur

- **Übungen** (`exercise`): Name, Kategorie, Muskelgruppen, Equipment, Beschreibung, Anweisungen
- **Workouts** (`workout`): Verknüpfung mit User, Name, Status, Datum, Dauer, Notizen
- **Workout-Übungen** (`workoutExercise`): Zuordnung von Übungen zu Workouts mit Reihenfolge
- **Workout-Sätze** (`workoutSet`): Einzelne Sätze mit Wiederholungen, Gewicht und Completion-Status
- **Routines** (`routine`): Vorgefertigte Trainingspläne mit zugeordneten Übungen
- **User Profile** (`userProfile`): Persönliche Informationen, Trainingsziele und Präferenzen

### UI/UX Features

- Responsive Design für alle Geräte
- Dark/Light Mode Unterstützung (next-themes)
- Interaktive Kalenderansicht für Workouts
- Breadcrumb-Navigation
- Sidebar mit Hauptnavigation
- Drag & Drop für Workout-Organisation
- Toast-Benachrichtigungen für Benutzer-Feedback
- Interactive Charts und Statistiken


## 🚀 Installation und Einrichtung

### Voraussetzungen

- **Node.js** (Version 20 oder höher)
- **pnpm** (Package Manager)
  ```bash
  npm install -g pnpm
  ```

### Schritt-für-Schritt Anleitung

#### 1. Repository klonen

```bash
git clone <repository-url>
cd web_engineering_2_fullstack_project
```

#### 2. Dependencies installieren

```bash
pnpm i
```

Dies installiert alle benötigten Abhängigkeiten aus der `package.json`.

#### 3. Datenbank einrichten

```bash
pnpm db:push
```

Dieser Befehl:
- Erstellt die SQLite-Datenbank (`src/db/localdb.sqlite`)
- Führt alle Migrations-Schemas aus
- Richtet die Tabellen für User, Sessions, Workouts, Exercises, Routines etc. ein

#### 4. Entwicklungsserver starten

```bash
pnpm run dev
```

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) erreichbar.

#### 5. Ersten Benutzer-Account erstellen

1. Navigiere zu [http://localhost:3000](http://localhost:3000)
2. Du wirst automatisch auf `/login` weitergeleitet
3. Klicke auf **"Sign Up"** oder navigiere direkt zu `/signup`
4. Fülle das Registrierungsformular aus:
   - **Name**: Dein vollständiger Name
   - **Email**: Deine E-Mail-Adresse
   - **Passwort**: Min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl und Sonderzeichen
5. Klicke auf **"Create Account"**

#### 6. Einloggen

1. Nach erfolgreicher Registrierung wirst du auf `/login` weitergeleitet
2. Logge dich mit deinen Zugangsdaten ein
3. Nach erfolgreichem Login gelangst du zum Dashboard (`/dashboard`)

#### 7. Development Tools nutzen (nur im Entwicklungsmodus)

Die Development Tools sind **nur verfügbar, wenn der Server im Development-Modus läuft** (`pnpm run dev`).

1. Navigiere zu `/dashboard/debug`
2. Hier findest du verschiedene Tools zum Seeden und Verwalten von Daten:

##### 7.1 Exercises seeden (WICHTIG - zuerst ausführen!)

In der "Exercise Management" Sektion:
- Klicke auf **"Seed Exercise Database"**
- Dies lädt ~100 vordefinierte Übungen in die Datenbank
- Kategorien: Chest, Back, Legs, Shoulders, Arms, Cardio, Core, Full Body
- **Dies ist erforderlich, bevor du Workouts erstellen kannst!**

##### 7.2 Routines seeden (Optional)

In der "Routine Management" Sektion:
- Klicke auf **"Seed Sample Routines"**
- Lädt vorgefertigte Trainingsroutines (z.B. "Push Day", "Pull Day", "Leg Day")
- Diese können als Vorlage für Workouts verwendet werden

##### 7.3 Sample Workouts seeden (Optional)

In der "Workout Management" Sektion:
- Klicke auf **"Seed Sample Workouts"**
- Erstellt Beispiel-Workouts für die letzten 30 Tage
- Nützlich zum Testen der Progress/Statistics Features

##### 7.4 Admin-Rolle zuweisen (Optional)

Nur im Development Mode in den Debug Tools unter "User Role Management":
- Klicke auf **"Make Admin"**, um deinen Account zum Admin zu machen
- Nach dem Einloggen hast du Zugriff auf `/dashboard/admin`
- Dort kannst du alle Benutzer verwalten, Statistiken einsehen etc.

**Alternative Methode für Admin-Setup (veraltet):**
- Navigiere zu `/setup-admin`
- Klicke auf "Make First User Admin"
- Diese Methode macht den ersten User in der Datenbank zum Admin

#### 8. Weitere Einstellungen vornehmen

##### Profil konfigurieren

Navigiere zu `/dashboard/profile`, um persönliche Informationen zu hinterlegen:

**Basic Info:**
- Alter
- Geschlecht

**Physical Info:**
- Größe (cm)
- Gewicht (kg)

**Training Preferences:**
- Trainingsziel (Build Muscle, Lose Weight, General Fitness, Strength, etc.)
- Trainingstage pro Woche
- Durchschnittliche Session-Dauer (Minuten)

**Limitations:**
- Übungsbeschränkungen oder Verletzungen
- Informationen für personalisierte Workout-Empfehlungen

##### Account-Einstellungen

Navigiere zu `/dashboard/settings` für:
- Name ändern
- E-Mail ändern
- Passwort ändern
- OpenAI API Key hinterlegen (für KI-Features)
- Account löschen

### Weitere verfügbare Befehle

```bash
# Produktions-Build erstellen
pnpm build

# Produktionsserver starten (nach Build)
pnpm start

# Code-Linting ausführen
pnpm lint

# Code formatieren
pnpm format

# Drizzle Studio öffnen (Datenbank GUI)
pnpm db:studio
```

### Wichtige Hinweise

- **Exercises müssen vor der ersten Workout-Erstellung geseeded werden**, sonst sind keine Übungen verfügbar
- Der `/dashboard/debug` Bereich ist nur im Development-Modus zugänglich
- Admin-Rechte sind nur erforderlich für `/dashboard/admin`
- Die SQLite-Datenbank wird lokal unter `src/db/localdb.sqlite` gespeichert


## 📁 Projektstruktur

```text
src/
├── actions/          # Server Actions für Datenmutationen
│   ├── admin/       # Admin-spezifische Actions
│   ├── user/        # User-bezogene Actions
│   └── *.ts         # Workout, Exercise, Routine Actions
├── app/             # Next.js App Router
│   ├── dashboard/   # Hauptbereich der Anwendung
│   │   ├── admin/   # Admin Dashboard (nur für Admins)
│   │   ├── debug/   # Development Tools (nur im Dev-Modus)
│   │   ├── profile/ # Benutzerprofil
│   │   ├── settings/# Account-Einstellungen
│   │   ├── workouts/# Workout-Verwaltung
│   │   ├── routines/# Routine-Verwaltung
│   │   └── progress/# Fortschritts-Tracking
│   ├── login/       # Login-Seite
│   ├── signup/      # Registrierungs-Seite
│   └── api/         # API-Routen (better-auth)
├── components/      # Wiederverwendbare React-Komponenten
│   └── ui/          # shadcn/ui Primitives
├── db/              # Datenbank-Schema und Konfiguration
│   ├── schema.ts    # Drizzle Schema-Definitionen
│   └── index.ts     # Datenbankverbindung
├── hooks/           # Custom React Hooks
├── lib/             # Utility-Funktionen und Helper
│   ├── auth.ts      # better-auth Konfiguration
│   ├── auth-client.ts # Client-side Auth
│   ├── auth-server.ts # Server-side Auth
│   └── utils.ts     # Allgemeine Utilities
└── middleware.ts    # Route-Schutz und Autorisierung
```


## 🔒 Authentifizierung

Das Projekt nutzt **better-auth** für die Authentifizierung. Nicht authentifizierte Benutzer werden automatisch zur Login-Seite weitergeleitet. Die Middleware schützt sensible Routen und stellt sicher, dass nur angemeldete Benutzer auf das Dashboard und andere geschützte Bereiche zugreifen können.

## 🗄️ Datenbank

Die Anwendung verwendet **SQLite** als lokale Datenbank mit **Drizzle ORM**. Das Schema befindet sich in `src/db/schema.ts` und umfasst:

- Benutzer- und Authentifizierungstabellen
- Übungsdatenbank mit Kategorisierung
- Workout-Tabellen mit hierarchischer Struktur (Workout → Übung → Sätze)

## 📝 Entwicklungsrichtlinien

- **TypeScript-First**: Strikte Typisierung ohne `any`
- **Server Components**: Bevorzugt Server Components, Client Components nur bei Bedarf
- **Server Actions**: Alle Datenmutationen über Server Actions
- **Tailwind CSS**: Verwendung von Custom Colors aus `globals.css`
- **Conventional Commits**: Standardisiertes Commit-Format

## 🔮 Geplante Features

- **KI-Integration**:
  - Wöchentliche Workout-Analyse und -Kritik
  - Personalisierte Trainingsvorschläge
  - Intelligenter Fitness-Assistent
- **Erweiterte Statistiken**: Detaillierte Fortschrittsgraphen und Analysen
- **Benutzerprofil**: Erweiterte persönliche Daten und Präferenzen
- **Equipment-Verwaltung**: Filterung nach verfügbarem Equipment
- **Ernährungstracking**: Integration von Ernährungsplänen
- **Social Features**: Teilen von Workouts und Fortschritt mit anderen Nutzern


## 📄 Lizenz

Dieses Projekt wurde im Rahmen des Web Engineering 2 Kurses an der DHBW Mosbach entwickelt.
