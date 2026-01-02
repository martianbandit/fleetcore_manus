# Documentation Technique FleetCore

Ce document décrit l'architecture technique, les APIs et les conventions de développement de FleetCore.

## Architecture

### Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React Native + Expo | SDK 54 |
| Routing | Expo Router | 6.x |
| Styling | NativeWind (Tailwind) | 4.x |
| State | React Context + AsyncStorage | - |
| Backend | tRPC + Express | - |
| Database | PostgreSQL + Drizzle ORM | - |
| Auth | Manus OAuth | - |

### Structure des dossiers

```
fleetcore/
├── app/                      # Écrans (file-based routing)
│   ├── _layout.tsx          # Layout racine avec providers
│   ├── (tabs)/              # Navigation par onglets
│   │   ├── _layout.tsx      # Configuration des tabs
│   │   ├── index.tsx        # Dashboard
│   │   ├── vehicles.tsx     # Liste véhicules
│   │   ├── inspections.tsx  # Liste inspections
│   │   └── settings.tsx     # Paramètres
│   ├── dashboard/           # Dashboards par rôle
│   ├── vehicle/             # Détail véhicule
│   ├── inspection/          # Détail inspection
│   └── settings/            # Sous-écrans paramètres
├── components/
│   ├── screen-container.tsx # Wrapper SafeArea
│   ├── themed-view.tsx      # View avec thème
│   └── ui/                  # Composants UI réutilisables
├── lib/                     # Services et logique métier
├── hooks/                   # Hooks React personnalisés
├── constants/               # Constantes et thème
├── server/                  # Backend API
│   ├── _core/              # Configuration serveur
│   ├── routers.ts          # Routes tRPC
│   └── webhooks/           # Webhooks (Stripe)
├── drizzle/                 # Schémas de base de données
└── assets/                  # Images et ressources
```

## Services

### data-service.ts

Service principal pour la gestion des données locales avec AsyncStorage.

```typescript
// Véhicules
getVehicles(): Promise<Vehicle[]>
getVehicle(id: string): Promise<Vehicle | null>
createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>
updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle>
deleteVehicle(id: string): Promise<void>

// Inspections
getInspections(): Promise<Inspection[]>
getInspection(id: string): Promise<Inspection | null>
createInspection(inspection: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inspection>
updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection>
deleteInspection(id: string): Promise<void>

// Paramètres
getSettings(): Promise<AppSettings>
saveSettings(settings: Partial<AppSettings>): Promise<void>
```

### role-service.ts

Gestion des rôles et permissions utilisateur.

```typescript
type UserRole = 'admin' | 'manager' | 'dispatcher' | 'technician' | 'driver';

// Permissions
hasPermission(role: UserRole, permission: string): boolean
getRolePermissions(role: UserRole): string[]
getCurrentUserRole(): Promise<UserRole>
setCurrentUserRole(role: UserRole): Promise<void>

// Configuration des rôles
ROLE_CONFIGS: Record<UserRole, RoleConfig>
```

### sync-service.ts

Synchronisation offline-first avec file d'attente.

```typescript
// File d'attente
addToSyncQueue(action: SyncAction): Promise<void>
getSyncQueue(): Promise<SyncAction[]>
processSyncQueue(): Promise<SyncResult>

// État de synchronisation
getSyncStatus(): Promise<SyncStatus>
checkConnectivity(): Promise<boolean>

// Événements
onSyncComplete(callback: (result: SyncResult) => void): void
```

### audit-service.ts

Journal d'audit pour la traçabilité légale.

```typescript
// Enregistrement
logAuditEntry(entry: AuditEntry): Promise<void>

// Consultation
getAuditLog(filters?: AuditFilters): Promise<AuditEntry[]>
getAuditLogForEntity(entityType: string, entityId: string): Promise<AuditEntry[]>

// Export
exportAuditLog(format: 'csv' | 'json'): Promise<string>
```

### notification-service.ts

Notifications push avec expo-notifications.

```typescript
// Configuration
registerForPushNotifications(): Promise<string | null>
requestPermissions(): Promise<boolean>

// Envoi
sendLocalNotification(notification: LocalNotification): Promise<void>
scheduleNotification(notification: ScheduledNotification): Promise<string>
cancelNotification(id: string): Promise<void>

// Rappels métier
scheduleInspectionReminder(vehicleId: string, date: Date): Promise<void>
notifyDefectDetected(defect: Defect): Promise<void>
```

### i18n-service.ts

Internationalisation français/anglais.

```typescript
type Language = 'fr' | 'en';

// Traduction
t(key: string, params?: Record<string, string>): string
setLanguage(lang: Language): Promise<void>
getCurrentLanguage(): Promise<Language>

// Formatage
formatDate(date: Date, format?: string): string
formatNumber(num: number, options?: Intl.NumberFormatOptions): string
formatCurrency(amount: number, currency?: string): string
```

### reports-service.ts

Génération de rapports et métriques.

```typescript
// Rapports
generateComplianceReport(period: 'month' | 'quarter' | 'year'): Promise<ComplianceReport>
generateVehicleReport(vehicleId: string): Promise<VehicleReport>
generateFleetReport(): Promise<FleetReport>

// Export
exportToCsv(data: any[], filename: string): Promise<string>
exportToPdf(report: Report): Promise<string>
```

## Types principaux

### Vehicle

```typescript
interface Vehicle {
  id: string;
  vin: string;
  plate: string;
  unit: string;
  vehicleClass: 'A' | 'B' | 'C' | 'D' | 'E';
  make: string;
  model: string;
  year: number;
  companyId: string;
  status: 'active' | 'maintenance' | 'legally_immobilized' | 'circulation_banned' | 'retired';
  mileage?: number;
  fuelType?: 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'propane' | 'natural_gas';
  lastInspectionDate: string | null;
  lastInspectionStatus: InspectionStatus | null;
  nextInspectionDue?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Inspection

```typescript
interface Inspection {
  id: string;
  vehicleId: string;
  technicianId: string;
  technicianName: string;
  type: 'periodic' | 'pre_trip' | 'post_trip';
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'INTERRUPTED';
  startedAt: string;
  completedAt: string | null;
  totalItems: number;
  completedItems: number;
  okCount: number;
  minorDefectCount: number;
  majorDefectCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### ChecklistItem

```typescript
interface ChecklistItem {
  id: string;
  inspectionId: string;
  sectionId: string;
  sectionName: string;
  itemNumber: number;
  title: string;
  description: string;
  vmrsCode?: string;
  saaqCode?: string;
  status: 'pending' | 'ok' | 'minor_defect' | 'major_defect' | 'blocking_defect';
  notes: string | null;
  mediaUrls: string[];
  completedAt?: string;
  completedBy?: string;
}
```

## API Backend (tRPC)

### Routes disponibles

```typescript
// Véhicules
vehicles.list()
vehicles.get({ id: string })
vehicles.create({ ... })
vehicles.update({ id: string, ... })
vehicles.delete({ id: string })

// Inspections
inspections.list()
inspections.get({ id: string })
inspections.create({ ... })
inspections.update({ id: string, ... })
inspections.complete({ id: string })

// Utilisateurs
users.me()
users.updateProfile({ ... })

// Abonnements
subscriptions.getCurrent()
subscriptions.create({ priceId: string })
subscriptions.cancel()
```

### Webhooks Stripe

Endpoint : `POST /api/webhooks/stripe`

Événements gérés :
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Base de données

### Schéma Drizzle

```typescript
// drizzle/schema.ts
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  vin: varchar('vin', { length: 17 }).notNull(),
  plate: varchar('plate', { length: 20 }).notNull(),
  // ...
});

export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id),
  // ...
});
```

### Migrations

```bash
# Générer une migration
pnpm db:push

# Appliquer les migrations
pnpm db:migrate
```

## Composants UI

### ScreenContainer

Wrapper pour tous les écrans avec SafeArea.

```tsx
<ScreenContainer className="p-4">
  <Text>Contenu de l'écran</Text>
</ScreenContainer>
```

### StatCard

Carte de statistique avec icône et tendance.

```tsx
<StatCard
  title="Véhicules"
  value={42}
  icon="truck"
  trend={{ value: 5, isPositive: true }}
/>
```

### TrendChart

Graphique de tendances (lignes, barres, camembert).

```tsx
<TrendChart
  type="line"
  data={[
    { label: 'Jan', value: 10 },
    { label: 'Fév', value: 15 },
  ]}
  color="#0066CC"
/>
```

### ImageGallery

Galerie d'images avec prévisualisation.

```tsx
<ImageGallery
  images={vehicleImages}
  onAddImage={handleAddImage}
  onDeleteImage={handleDeleteImage}
/>
```

### VideoCapture

Capture vidéo pour preuves (max 30 secondes).

```tsx
<VideoCapture
  visible={showCamera}
  onClose={() => setShowCamera(false)}
  onVideoCapture={(uri, duration) => handleVideo(uri, duration)}
/>
```

## Conventions de code

### Nommage

- **Fichiers** : kebab-case (`data-service.ts`)
- **Composants** : PascalCase (`StatCard.tsx`)
- **Fonctions** : camelCase (`getVehicles`)
- **Types** : PascalCase (`Vehicle`, `Inspection`)
- **Constantes** : SCREAMING_SNAKE_CASE (`MAX_VIDEO_DURATION`)

### Styling

Utiliser NativeWind (Tailwind CSS) pour le styling :

```tsx
<View className="flex-1 p-4 bg-background">
  <Text className="text-lg font-bold text-foreground">
    Titre
  </Text>
</View>
```

### Gestion d'erreurs

```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Description de l\'erreur:', error);
  // Afficher une alerte utilisateur si nécessaire
  Alert.alert('Erreur', 'Message utilisateur');
  throw error; // ou retourner une valeur par défaut
}
```

## Tests

### Structure des tests

```
tests/
├── data-service.test.ts
├── role-service.test.ts
├── sync-service.test.ts
└── ...
```

### Exécution

```bash
# Tous les tests
pnpm test

# Un fichier spécifique
pnpm test data-service

# Mode watch
pnpm test --watch
```

### Exemple de test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getVehicles, createVehicle } from '../lib/data-service';

describe('data-service', () => {
  beforeEach(async () => {
    // Reset des données
  });

  it('should create a vehicle', async () => {
    const vehicle = await createVehicle({
      unit: 'TEST-001',
      plate: 'ABC 123',
      // ...
    });

    expect(vehicle.id).toBeDefined();
    expect(vehicle.unit).toBe('TEST-001');
  });
});
```

## Performance

### Optimisations

1. **Lazy loading** des écrans avec Expo Router
2. **Memoization** des composants lourds avec `React.memo`
3. **FlatList** pour les listes longues (jamais `ScrollView` + `.map()`)
4. **AsyncStorage** pour le cache local
5. **Compression** des images avant upload

### Métriques cibles

| Métrique | Cible |
|----------|-------|
| Time to Interactive | < 3s |
| First Contentful Paint | < 1.5s |
| Bundle size (JS) | < 5MB |
| Memory usage | < 150MB |

## Sécurité

### Authentification

- OAuth 2.0 via Manus
- Tokens JWT avec expiration
- Refresh tokens automatiques

### Données sensibles

- Chiffrement des données au repos (AsyncStorage)
- HTTPS obligatoire pour les API
- Validation des entrées côté serveur

### Permissions

- Vérification des rôles côté serveur
- Audit log de toutes les actions sensibles
- Rate limiting sur les API
