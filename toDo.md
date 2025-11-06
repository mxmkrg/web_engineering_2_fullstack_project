# KI Agent - 3 Use Cases für Fitness App

## 1. Motivation Messages

### Benötigte Tabellen:
- **WORKOUT** - aktuelles/letztes Training abrufen
- **WORKOUT_SET** - um zu sehen ob Sets abgeschlossen wurden
- **USER** - Benutzernamen und Vorlieben

### Daten für KI-Prompt:
```
- Trainingstatus: Gerade aktiv? Gerade beendet?
- Letzte 3 Workouts (Konsistenz)
- Vollständigkeit des aktuellen Trainings (% der Sets abgeschlossen)
- Benutzername und Geschlecht (für personalisierte Ansprache)
- Trainingsfrequenz diese Woche
```
---
## 2. Weekly Workout Review

### Benötigte Tabellen:
- **WORKOUT** - alle Trainings der Woche (7 Tage)
- **WORKOUT_EXERCISE** - Übungen pro Training
- **WORKOUT_SET** - Reps, Gewicht, ob abgeschlossen
- **EXERCISE** - Übungsdetails (muscleGroups)
- **USER** - Benutzerziele und Vorlieben (falls vorhanden)

### Daten für KI-Prompt:
```
- Alle 7 Trainings dieser Woche mit Datum und Status
- Trainierte Muskelgruppen (Verteilung)
- Trainingstage vs. Ruhetage (Konsistenz)
- Gewicht/Reps Trend (sind Sets schwerer/mehr Reps geworden?)
- Abschlussquote (% der geplanten Sets gemacht)
- Benutzer-Ziele (Kraft? Ausdauer? Hypertrophie?)
- Top 3 favorisierte Übungen
```

## 3. Exercise Suggestions by Muscle Group

### Benötigte Tabellen:
- **EXERCISE** - komplette Übungsbibliothek mit muscleGroups
- **WORKOUT_EXERCISE** - Historie: welche Übungen nutzt der User?
- **WORKOUT_SET** - wie oft und mit welchem Gewicht gemacht?
- **USER** - Vorlieben, Equipment verfügbar?

### Daten für KI-Prompt:
```
- Ziel-Muskelgruppe (z.B. "Chest")
- Top 5 Favoriten-Übungen des Users (basierend auf Häufigkeit)
- Available Equipment (Dumbbells? Barbell? Maschinen?)
- Trainings-Level (Anfänger/Intermediate/Advanced)
- Aktuelle Trainings-Split (z.B. Push/Pull/Legs)
- Alle verfügbaren Übungen in dieser Muskelgruppe (aus EXERCISE Tabelle)
```
---

## Tabellen-Übersicht (Was brauchst du wirklich?)

| Tabelle | Use Case 1 | Use Case 2 | Use Case 3 |
|---------|-----------|-----------|-----------|
| USER | ✅ | ✅ | ✅ |
| WORKOUT | ✅ | ✅ | - |
| WORKOUT_EXERCISE | - | ✅ | ✅ |
| WORKOUT_SET | ✅ | ✅ | ✅ |
| EXERCISE | - | ✅ | ✅ |

