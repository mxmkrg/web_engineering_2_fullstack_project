# Workout Tracker

Ein Full-Stack Workout Tracking System, entwickelt als Projekt im Rahmen des Web Engineering 2 Kurses an der DHBW Mosbach.

## 📋 Projektbeschreibung

Dieses Projekt ist eine umfassende Fitness- und Workout-Tracking-Anwendung, die es Benutzern ermöglicht, ihre Trainingseinheiten zu planen, durchzuführen und zu analysieren. Die Anwendung bietet eine intuitive Benutzeroberfläche zum Verwalten von Workouts, Übungen und Trainingsfortschritt.

Zukünftige Erweiterungen sollen KI-gestützte Funktionen wie automatische Workout-Kritik, personalisierte Trainingsvorschläge und ein intelligenter Assistent zur Beantwortung fitness-bezogener Fragen beinhalten.

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

### Workout-Verwaltung
- **Workout-Erstellung**: Erstellen neuer Trainingseinheiten mit individuellem Namen und Datum
- **Übungsdatenbank**: Umfangreiche Bibliothek vordefinierter Übungen mit Kategorien (Chest, Back, Legs, Shoulders, Arms, Cardio, etc.)
- **Workout-Tracking**: Aufzeichnung von Sätzen, Wiederholungen und Gewichten für jede Übung
- **Status-Management**: Workouts können als "active", "completed" oder "archived" markiert werden
- **Workout-Details**: Detaillierte Ansicht einzelner Workouts mit allen Übungen und Sätzen

### Organisation & Navigation
- **Dashboard**: Übersichtsseite mit Schnellzugriff und aktuellen Aktivitäten
- **Workout-Übersicht**: Liste aller Workouts mit Filtermöglichkeiten
- **Archivierte Workouts**: Separate Ansicht für archivierte Trainingseinheiten
- **Fortschritts-Tracking**: Separate Seite für Trainingsfortschritt und Statistiken

### Datenstruktur
- **Übungen** (`exercise`): Name, Kategorie, Muskelgruppen, Equipment, Beschreibung, Anweisungen
- **Workouts** (`workout`): Verknüpfung mit User, Name, Status, Datum, Dauer, Notizen
- **Workout-Übungen** (`workoutExercise`): Zuordnung von Übungen zu Workouts mit Reihenfolge
- **Workout-Sätze** (`workoutSet`): Einzelne Sätze mit Wiederholungen, Gewicht und Completion-Status

### UI/UX Features
- Responsive Design für alle Geräte
- Dark/Light Mode Unterstützung (next-themes)
- Interaktive Kalenderansicht für Workouts
- Breadcrumb-Navigation
- Sidebar mit Hauptnavigation
- Drag & Drop für Workout-Organisation

## 🚀 Projekt ausführen

### Voraussetzungen
- **Node.js** (Version 20 oder höher)
- **pnpm** (Package Manager)

### Installation

1. **Repository klonen**
```bash
git clone <repository-url>
cd web_engineering_2_fullstack_project
```

2. **Dependencies installieren**
```bash
pnpm install
```

3. **Datenbank einrichten**
```bash
pnpm db:push
```

4. **Entwicklungsserver starten**
```bash
pnpm dev
```

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) erreichbar.

### Weitere verfügbare Befehle

```bash
# Produktions-Build erstellen
pnpm build

# Produktionsserver starten
pnpm start

# Code-Linting
pnpm lint

# Code-Formatierung
pnpm format

# Drizzle Studio (Datenbank GUI) öffnen
pnpm db:studio

# Datenbank seeden
pnpm seed
```

## 📁 Projektstruktur

```
src/
├── actions/          # Server Actions für Datenmutationen
├── app/             # Next.js App Router
│   ├── dashboard/   # Dashboard mit Workout-Verwaltung
│   ├── login/       # Login-Seite
│   ├── signup/      # Registrierungs-Seite
│   └── api/         # API-Routen
├── components/      # Wiederverwendbare React-Komponenten
│   └── ui/         # shadcn/ui Primitives
├── db/             # Datenbank-Schema und Konfiguration
├── hooks/          # Custom React Hooks
└── lib/            # Utility-Funktionen und Helper
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
- **Benutzerprofil**: Persönliche Daten (Gewicht, Größe, Ziele, Präferenzen)
- **Equipment-Verwaltung**: Filterung nach verfügbarem Equipment

## 📄 Lizenz

Dieses Projekt wurde im Rahmen des Web Engineering 2 Kurses an der DHBW Mosbach entwickelt.
