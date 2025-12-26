import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Inspection, Vehicle, ChecklistItem, Proof } from './types';

interface PDFGenerationOptions {
  inspection: Inspection;
  vehicle: Vehicle;
  checklistItems: ChecklistItem[];
  technicianNumber?: string;
}

/**
 * Génère un rapport PDF conforme au formulaire SAAQ d'entretien préventif
 */
export async function generateInspectionPDF(options: PDFGenerationOptions): Promise<string> {
  const { inspection, vehicle, checklistItems, technicianNumber = '' } = options;

  const html = generateHTMLReport(inspection, vehicle, checklistItems, technicianNumber);

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Impossible de générer le rapport PDF');
  }
}

/**
 * Génère et partage le rapport PDF
 */
export async function generateAndSharePDF(options: PDFGenerationOptions): Promise<void> {
  const uri = await generateInspectionPDF(options);

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Partager le rapport d\'inspection',
      UTI: 'com.adobe.pdf',
    });
  } else {
    throw new Error('Le partage n\'est pas disponible sur cet appareil');
  }
}

function generateHTMLReport(
  inspection: Inspection,
  vehicle: Vehicle,
  checklistItems: ChecklistItem[],
  technicianNumber: string
): string {
  const startDate = new Date(inspection.startedAt);
  const completedDate = inspection.completedAt ? new Date(inspection.completedAt) : null;
  
  // Group items by section
  const sections = groupItemsBySection(checklistItems);

  // Generate defects table
  const defectsRows = checklistItems
    .filter(item => item.status === 'minor_defect' || item.status === 'major_defect')
    .map(item => `
      <tr>
        <td style="border: 1px solid #333; padding: 8px;">${item.sectionName}</td>
        <td style="border: 1px solid #333; padding: 8px;">${item.title}</td>
        <td style="border: 1px solid #333; padding: 8px;">${item.status === 'major_defect' ? 'Majeur' : 'Mineur'}</td>
        <td style="border: 1px solid #333; padding: 8px;">${item.notes || '-'}</td>
        <td style="border: 1px solid #333; padding: 8px;">${item.saaqCode || item.vmrsCode || '-'}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'inspection - ${vehicle.plate}</title>
  <style>
    @page {
      size: letter;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 18pt;
      font-weight: bold;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 12pt;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .info-item {
      display: flex;
      border-bottom: 1px solid #ccc;
      padding: 5px 0;
    }
    .info-label {
      font-weight: bold;
      width: 150px;
    }
    .info-value {
      flex: 1;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .stat-card {
      border: 2px solid #333;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .stat-value {
      font-size: 24pt;
      font-weight: bold;
      margin: 5px 0;
    }
    .stat-label {
      font-size: 9pt;
      color: #666;
    }
    .stat-ok { border-color: #22C55E; color: #22C55E; }
    .stat-minor { border-color: #F59E0B; color: #F59E0B; }
    .stat-major { border-color: #EF4444; color: #EF4444; }
    .stat-total { border-color: #0066CC; color: #0066CC; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background-color: #0066CC;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    td {
      border: 1px solid #333;
      padding: 8px;
    }
    .section-title {
      background-color: #f0f0f0;
      font-weight: bold;
      padding: 8px;
      margin-top: 15px;
      border-left: 4px solid #0066CC;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
    }
    .status-ok { background-color: #22C55E; color: white; }
    .status-minor { background-color: #F59E0B; color: white; }
    .status-major { background-color: #EF4444; color: white; }
    .status-pending { background-color: #94A3B8; color: white; }
    .footer {
      margin-top: 30px;
      border-top: 2px solid #000;
      padding-top: 15px;
    }
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 20px;
    }
    .signature-box {
      border: 1px solid #333;
      padding: 15px;
      min-height: 80px;
    }
    .signature-label {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>RAPPORT D'INSPECTION PRÉVENTIF - CAMION</h1>
    <p>FleetCore - Système de gestion de flotte</p>
  </div>

  <!-- Vehicle Information -->
  <div class="info-section">
    <h2 style="margin-bottom: 10px; color: #0066CC;">Informations du véhicule</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Numéro de plaque:</span>
        <span class="info-value">${vehicle.plate}</span>
      </div>
      <div class="info-item">
        <span class="info-label">NIV:</span>
        <span class="info-value">${vehicle.vin}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Unité:</span>
        <span class="info-value">${vehicle.unit}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Classe:</span>
        <span class="info-value">${vehicle.vehicleClass}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Marque:</span>
        <span class="info-value">${vehicle.make}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Modèle:</span>
        <span class="info-value">${vehicle.model}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Année:</span>
        <span class="info-value">${vehicle.year}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Type d'inspection:</span>
        <span class="info-value">${getInspectionTypeLabel(inspection.type)}</span>
      </div>
    </div>
  </div>

  <!-- Inspection Information -->
  <div class="info-section">
    <h2 style="margin-bottom: 10px; color: #0066CC;">Informations de l'inspection</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Technicien:</span>
        <span class="info-value">${inspection.technicianName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Numéro du technicien:</span>
        <span class="info-value">${technicianNumber}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Date de début:</span>
        <span class="info-value">${startDate.toLocaleDateString('fr-CA')} ${startDate.toLocaleTimeString('fr-CA')}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Date de fin:</span>
        <span class="info-value">${completedDate ? `${completedDate.toLocaleDateString('fr-CA')} ${completedDate.toLocaleTimeString('fr-CA')}` : 'En cours'}</span>
      </div>
    </div>
  </div>

  <!-- Statistics -->
  <div class="stats-grid">
    <div class="stat-card stat-total">
      <div class="stat-label">Total items</div>
      <div class="stat-value">${inspection.totalItems}</div>
    </div>
    <div class="stat-card stat-ok">
      <div class="stat-label">OK</div>
      <div class="stat-value">${inspection.okCount}</div>
    </div>
    <div class="stat-card stat-minor">
      <div class="stat-label">Défauts mineurs</div>
      <div class="stat-value">${inspection.minorDefectCount}</div>
    </div>
    <div class="stat-card stat-major">
      <div class="stat-label">Défauts majeurs</div>
      <div class="stat-value">${inspection.majorDefectCount}</div>
    </div>
  </div>

  <!-- Defects Table -->
  ${inspection.minorDefectCount + inspection.majorDefectCount > 0 ? `
  <div class="page-break"></div>
  <h2 style="margin-top: 20px; color: #0066CC;">Défauts identifiés</h2>
  <table>
    <thead>
      <tr>
        <th>Section</th>
        <th>Composant</th>
        <th>Sévérité</th>
        <th>Description</th>
        <th>Code</th>
      </tr>
    </thead>
    <tbody>
      ${defectsRows}
    </tbody>
  </table>
  ` : '<p style="text-align: center; padding: 20px; background-color: #f0f9ff; border-radius: 8px; color: #0066CC; font-weight: bold;">✓ Aucun défaut identifié - Véhicule conforme</p>'}

  <!-- Checklist Summary -->
  <div class="page-break"></div>
  <h2 style="margin-top: 20px; color: #0066CC;">Résumé de la checklist</h2>
  ${generateChecklistSummary(sections)}

  <!-- Notes -->
  ${inspection.notes ? `
  <div style="margin-top: 20px;">
    <h2 style="color: #0066CC;">Notes additionnelles</h2>
    <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background-color: #f9f9f9;">
      ${inspection.notes}
    </div>
  </div>
  ` : ''}

  <!-- Footer / Signatures -->
  <div class="footer">
    <p style="font-size: 9pt; color: #666; margin-bottom: 15px;">
      <strong>Note:</strong> L'ensemble des composantes du véhicule routier a été vérifié à l'exception de ce qui a trait à la photométrie et le niveau sonore du système d'échappement.
    </p>
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-label">Signature du mécanicien ou de la mécanicienne</div>
        <div style="margin-top: 30px; border-bottom: 1px solid #000; width: 80%;"></div>
        <p style="margin-top: 5px; font-size: 9pt;">Date: ${completedDate ? completedDate.toLocaleDateString('fr-CA') : '_________________'}</p>
      </div>
      <div class="signature-box">
        <div class="signature-label">Prochain entretien préventif</div>
        <p style="margin-top: 10px; font-size: 9pt;">Date prévue: _________________</p>
        <p style="margin-top: 10px; font-size: 9pt;">Odomètre: _________________ km</p>
      </div>
    </div>
    <p style="margin-top: 20px; text-align: center; font-size: 9pt; color: #666;">
      Rapport généré par FleetCore le ${new Date().toLocaleString('fr-CA')}
    </p>
  </div>
</body>
</html>
  `;
}

function groupItemsBySection(items: ChecklistItem[]): Map<string, ChecklistItem[]> {
  const sections = new Map<string, ChecklistItem[]>();
  
  items.forEach(item => {
    if (!sections.has(item.sectionId)) {
      sections.set(item.sectionId, []);
    }
    sections.get(item.sectionId)!.push(item);
  });

  return sections;
}

function generateChecklistSummary(sections: Map<string, ChecklistItem[]>): string {
  let html = '';

  sections.forEach((items, sectionId) => {
    const sectionName = items[0]?.sectionName || 'Section';
    const okCount = items.filter(i => i.status === 'ok').length;
    const minorCount = items.filter(i => i.status === 'minor_defect').length;
    const majorCount = items.filter(i => i.status === 'major_defect').length;
    const pendingCount = items.filter(i => i.status === 'pending').length;

    html += `
      <div class="section-title">${sectionName} (${items.length} items)</div>
      <div style="padding: 10px; background-color: #f9f9f9;">
        <span class="status-badge status-ok">${okCount} OK</span>
        <span class="status-badge status-minor">${minorCount} Mineurs</span>
        <span class="status-badge status-major">${majorCount} Majeurs</span>
        ${pendingCount > 0 ? `<span class="status-badge status-pending">${pendingCount} En attente</span>` : ''}
      </div>
    `;
  });

  return html;
}

function getInspectionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    periodic: 'Périodique',
    pre_trip: 'Pré-trajet',
    post_trip: 'Post-trajet',
    incident: 'Incident',
  };
  return labels[type] || type;
}
