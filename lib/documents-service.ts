import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

const DOCUMENTS_KEY = '@fleetcore/documents';

// ============================================================================
// Types
// ============================================================================

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  name: string;
  type: 'manual' | 'invoice' | 'registration' | 'insurance' | 'inspection' | 'other';
  mimeType: string;
  size: number; // bytes
  uri: string;
  uploadedAt: string;
  notes?: string;
  tags?: string[];
}

export interface DocumentCategory {
  key: VehicleDocument['type'];
  label: string;
  icon: string;
  color: string;
}

export const documentCategories: DocumentCategory[] = [
  { key: 'manual', label: 'Manuel', icon: 'doc.text.fill', color: '#3B82F6' },
  { key: 'invoice', label: 'Facture', icon: 'doc.text.fill', color: '#10B981' },
  { key: 'registration', label: 'Immatriculation', icon: 'doc.text.fill', color: '#F59E0B' },
  { key: 'insurance', label: 'Assurance', icon: 'doc.text.fill', color: '#8B5CF6' },
  { key: 'inspection', label: 'Inspection', icon: 'clipboard.fill', color: '#EC4899' },
  { key: 'other', label: 'Autre', icon: 'doc.text.fill', color: '#64748B' },
];

// ============================================================================
// Document Operations
// ============================================================================

export async function getDocuments(vehicleId?: string): Promise<VehicleDocument[]> {
  try {
    const data = await AsyncStorage.getItem(DOCUMENTS_KEY);
    const documents: VehicleDocument[] = data ? JSON.parse(data) : [];
    return vehicleId ? documents.filter(d => d.vehicleId === vehicleId) : documents;
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

export async function addDocument(
  vehicleId: string,
  type: VehicleDocument['type'],
  notes?: string,
  tags?: string[]
): Promise<VehicleDocument | null> {
  try {
    // Pick document
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset) {
      return null;
    }

    // Copy to app's document directory
    const fileName = `doc_${Date.now()}_${asset.name}`;
    const destPath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({
      from: asset.uri,
      to: destPath,
    });

    const document: VehicleDocument = {
      id: `doc-${Date.now()}`,
      vehicleId,
      name: asset.name,
      type,
      mimeType: asset.mimeType || 'application/octet-stream',
      size: asset.size || 0,
      uri: destPath,
      uploadedAt: new Date().toISOString(),
      notes,
      tags,
    };

    const documents = await getDocuments();
    documents.push(document);
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));

    return document;
  } catch (error) {
    console.error('Error adding document:', error);
    return null;
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const documents = await getDocuments();
    const document = documents.find(d => d.id === documentId);
    
    if (document) {
      // Delete file
      try {
        const fileInfo = await FileSystem.getInfoAsync(document.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(document.uri);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      // Remove from storage
      const filtered = documents.filter(d => d.id !== documentId);
      await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}

export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<VehicleDocument, 'name' | 'type' | 'notes' | 'tags'>>
): Promise<VehicleDocument | null> {
  try {
    const documents = await getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    
    if (index === -1) {
      return null;
    }

    documents[index] = {
      ...documents[index],
      ...updates,
    };

    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    return documents[index];
  } catch (error) {
    console.error('Error updating document:', error);
    return null;
  }
}

export async function searchDocuments(query: string, vehicleId?: string): Promise<VehicleDocument[]> {
  const documents = await getDocuments(vehicleId);
  const lowerQuery = query.toLowerCase();
  
  return documents.filter(d =>
    d.name.toLowerCase().includes(lowerQuery) ||
    d.notes?.toLowerCase().includes(lowerQuery) ||
    d.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDocumentIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'photo.fill';
  if (mimeType === 'application/pdf') return 'doc.text.fill';
  return 'doc.text.fill';
}

// ============================================================================
// Document Statistics
// ============================================================================

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  byType: Record<VehicleDocument['type'], number>;
  byVehicle: Array<{ vehicleId: string; count: number }>;
}

export async function getDocumentStats(): Promise<DocumentStats> {
  const documents = await getDocuments();
  
  const byType: Record<VehicleDocument['type'], number> = {
    manual: 0,
    invoice: 0,
    registration: 0,
    insurance: 0,
    inspection: 0,
    other: 0,
  };

  const byVehicleMap: Record<string, number> = {};

  let totalSize = 0;

  documents.forEach(doc => {
    byType[doc.type]++;
    totalSize += doc.size;
    
    if (!byVehicleMap[doc.vehicleId]) {
      byVehicleMap[doc.vehicleId] = 0;
    }
    byVehicleMap[doc.vehicleId]++;
  });

  const byVehicle = Object.entries(byVehicleMap)
    .map(([vehicleId, count]) => ({ vehicleId, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalDocuments: documents.length,
    totalSize,
    byType,
    byVehicle,
  };
}
