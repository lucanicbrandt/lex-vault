/**
 * Mock Data for Swiss Legal Document Search
 * 
 * Comprehensive test corpus representing real Swiss legal documents.
 * Used for development/demo when Weaviate is not available.
 */

import type { Document, DocumentType } from '@/types';

/**
 * Document chunk with text content and metadata.
 * Each chunk represents a searchable passage from a document.
 */
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumbers: number[];
  articleRef?: string;
  chunkIndex: number;
}

// ============================================================================
// Mock Documents
// ============================================================================

export const mockDocuments: Document[] = [
  // --- Contracts ---
  {
    id: 'doc-mietvertrag-zh',
    tenantId: 'demo',
    title: 'Mietvertrag Geschäftsräume Zürich',
    filename: 'mietvertrag_zuerich_2024.pdf',
    type: 'contract',
    status: 'ready',
    pageCount: 24,
    fileSize: 2456000,
    mimeType: 'application/pdf',
    matter: '2024-001',
    tags: ['Mietrecht', 'Wichtig', 'Zürich'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:35:00Z',
    metadata: {
      language: 'de',
      parties: ['ABC GmbH', 'Immobilien AG'],
    },
  },
  {
    id: 'doc-arbeitsvertrag-kader',
    tenantId: 'demo',
    title: 'Arbeitsvertrag Kader - Vorlage 2024',
    filename: 'arbeitsvertrag_kader_vorlage.pdf',
    type: 'contract',
    status: 'ready',
    pageCount: 12,
    fileSize: 890000,
    mimeType: 'application/pdf',
    matter: '2024-003',
    tags: ['Arbeitsrecht', 'Vorlage'],
    uploadedBy: 'user-2',
    uploadedAt: '2024-01-20T11:00:00Z',
    processedAt: '2024-01-20T11:05:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-kaufvertrag-immobilie',
    tenantId: 'demo',
    title: 'Kaufvertrag Liegenschaft Bern',
    filename: 'kaufvertrag_bern_2024.pdf',
    type: 'contract',
    status: 'ready',
    pageCount: 32,
    fileSize: 3100000,
    mimeType: 'application/pdf',
    matter: '2024-002',
    tags: ['Immobilienrecht', 'Kaufvertrag', 'Bern'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-02-05T09:15:00Z',
    processedAt: '2024-02-05T09:25:00Z',
    metadata: {
      language: 'de',
      parties: ['Familie Meier', 'Weber Immobilien AG'],
    },
  },
  {
    id: 'doc-gesellschaftsvertrag',
    tenantId: 'demo',
    title: 'Gesellschaftsvertrag GmbH - Gründung TechStart',
    filename: 'gesellschaftsvertrag_techstart.pdf',
    type: 'contract',
    status: 'ready',
    pageCount: 18,
    fileSize: 1450000,
    mimeType: 'application/pdf',
    matter: '2024-005',
    tags: ['Gesellschaftsrecht', 'GmbH', 'Gründung'],
    uploadedBy: 'user-3',
    uploadedAt: '2024-02-10T14:00:00Z',
    processedAt: '2024-02-10T14:08:00Z',
    metadata: {
      language: 'de',
      parties: ['Max Mustermann', 'Anna Beispiel'],
    },
  },

  // --- Court Decisions ---
  {
    id: 'doc-bge-142-iii-91',
    tenantId: 'demo',
    title: 'BGE 142 III 91 - Kündigungsschutz Mietrecht',
    filename: 'bge_142_iii_91.pdf',
    type: 'court_decision',
    status: 'ready',
    pageCount: 18,
    fileSize: 1234000,
    mimeType: 'application/pdf',
    tags: ['Mietrecht', 'Bundesgericht', 'Kündigung'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-10T14:20:00Z',
    processedAt: '2024-01-10T14:22:00Z',
    metadata: {
      language: 'de',
      caseNumber: 'BGE 142 III 91',
      jurisdiction: 'Bundesgericht',
    },
  },
  {
    id: 'doc-bge-138-iii-59',
    tenantId: 'demo',
    title: 'BGE 138 III 59 - Missbräuchliche Kündigung Arbeitsrecht',
    filename: 'bge_138_iii_59.pdf',
    type: 'court_decision',
    status: 'ready',
    pageCount: 14,
    fileSize: 980000,
    mimeType: 'application/pdf',
    tags: ['Arbeitsrecht', 'Bundesgericht', 'Kündigung'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-08T10:00:00Z',
    processedAt: '2024-01-08T10:05:00Z',
    metadata: {
      language: 'de',
      caseNumber: 'BGE 138 III 59',
      jurisdiction: 'Bundesgericht',
    },
  },
  {
    id: 'doc-bge-147-iii-440',
    tenantId: 'demo',
    title: 'BGE 147 III 440 - Datenschutz und Persönlichkeitsrecht',
    filename: 'bge_147_iii_440.pdf',
    type: 'court_decision',
    status: 'ready',
    pageCount: 22,
    fileSize: 1560000,
    mimeType: 'application/pdf',
    tags: ['Datenschutz', 'Bundesgericht', 'Persönlichkeitsrecht'],
    uploadedBy: 'user-2',
    uploadedAt: '2024-02-01T11:30:00Z',
    processedAt: '2024-02-01T11:35:00Z',
    metadata: {
      language: 'de',
      caseNumber: 'BGE 147 III 440',
      jurisdiction: 'Bundesgericht',
    },
  },
  {
    id: 'doc-obergericht-zh',
    tenantId: 'demo',
    title: 'Obergericht ZH - Urteil Werkvertrag',
    filename: 'obergericht_zh_werkvertrag.pdf',
    type: 'court_decision',
    status: 'ready',
    pageCount: 28,
    fileSize: 2100000,
    mimeType: 'application/pdf',
    matter: '2023-045',
    tags: ['Werkvertrag', 'Obergericht', 'Zürich'],
    uploadedBy: 'user-1',
    uploadedAt: '2023-11-20T09:00:00Z',
    processedAt: '2023-11-20T09:15:00Z',
    metadata: {
      language: 'de',
      caseNumber: 'LA200042',
      jurisdiction: 'Obergericht Zürich',
    },
  },

  // --- Legislation ---
  {
    id: 'doc-or-mietrecht',
    tenantId: 'demo',
    title: 'Obligationenrecht (OR) - Auszug Art. 253-304 Mietrecht',
    filename: 'or_mietrecht_auszug.pdf',
    type: 'legislation',
    status: 'ready',
    pageCount: 45,
    fileSize: 3200000,
    mimeType: 'application/pdf',
    tags: ['Gesetzgebung', 'Mietrecht', 'OR'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-05T09:00:00Z',
    processedAt: '2024-01-05T09:10:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-or-arbeitsrecht',
    tenantId: 'demo',
    title: 'Obligationenrecht (OR) - Art. 319-362 Arbeitsvertrag',
    filename: 'or_arbeitsvertrag_auszug.pdf',
    type: 'legislation',
    status: 'ready',
    pageCount: 38,
    fileSize: 2800000,
    mimeType: 'application/pdf',
    tags: ['Gesetzgebung', 'Arbeitsrecht', 'OR'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-05T09:15:00Z',
    processedAt: '2024-01-05T09:20:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-dsg',
    tenantId: 'demo',
    title: 'Bundesgesetz über den Datenschutz (DSG)',
    filename: 'dsg_2023.pdf',
    type: 'legislation',
    status: 'ready',
    pageCount: 52,
    fileSize: 3800000,
    mimeType: 'application/pdf',
    tags: ['Gesetzgebung', 'Datenschutz', 'DSG'],
    uploadedBy: 'user-2',
    uploadedAt: '2024-01-02T08:00:00Z',
    processedAt: '2024-01-02T08:15:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-zgb-erbrecht',
    tenantId: 'demo',
    title: 'Zivilgesetzbuch (ZGB) - Erbrecht Art. 457-640',
    filename: 'zgb_erbrecht.pdf',
    type: 'legislation',
    status: 'ready',
    pageCount: 65,
    fileSize: 4200000,
    mimeType: 'application/pdf',
    tags: ['Gesetzgebung', 'Erbrecht', 'ZGB'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-03T10:00:00Z',
    processedAt: '2024-01-03T10:20:00Z',
    metadata: {
      language: 'de',
    },
  },

  // --- Memos ---
  {
    id: 'doc-gutachten-datenschutz',
    tenantId: 'demo',
    title: 'Rechtsgutachten Datenschutz DSGVO/DSG',
    filename: 'gutachten_datenschutz_2024.pdf',
    type: 'memo',
    status: 'ready',
    pageCount: 35,
    fileSize: 1890000,
    mimeType: 'application/pdf',
    matter: '2024-002',
    tags: ['Datenschutz', 'DSGVO', 'Wichtig'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-02-01T15:30:00Z',
    processedAt: '2024-02-01T15:40:00Z',
    metadata: {
      language: 'de',
      author: 'Dr. Anna Weber',
    },
  },
  {
    id: 'doc-memo-arbeitszeit',
    tenantId: 'demo',
    title: 'Memo: Arbeitszeiterfassung nach Bundesgerichtsentscheid',
    filename: 'memo_arbeitszeit_2024.pdf',
    type: 'memo',
    status: 'ready',
    pageCount: 8,
    fileSize: 650000,
    mimeType: 'application/pdf',
    matter: '2024-003',
    tags: ['Arbeitsrecht', 'Arbeitszeit', 'Memo'],
    uploadedBy: 'user-3',
    uploadedAt: '2024-02-08T13:00:00Z',
    processedAt: '2024-02-08T13:05:00Z',
    metadata: {
      language: 'de',
      author: 'MLaw Peter Schmid',
    },
  },
  {
    id: 'doc-gutachten-erbrecht',
    tenantId: 'demo',
    title: 'Gutachten zur Erbschaftssteuer Kanton Zürich',
    filename: 'gutachten_erbschaftssteuer_zh.pdf',
    type: 'memo',
    status: 'ready',
    pageCount: 22,
    fileSize: 1340000,
    mimeType: 'application/pdf',
    matter: '2023-045',
    tags: ['Erbrecht', 'Steuerrecht', 'Zürich'],
    uploadedBy: 'user-2',
    uploadedAt: '2023-12-15T16:00:00Z',
    processedAt: '2023-12-15T16:10:00Z',
    metadata: {
      language: 'de',
      author: 'Dr. Hans Müller',
    },
  },

  // --- Correspondence ---
  {
    id: 'doc-brief-gegenpartei',
    tenantId: 'demo',
    title: 'Schreiben an Gegenpartei - Fristsetzung',
    filename: 'brief_fristsetzung_2024.pdf',
    type: 'correspondence',
    status: 'ready',
    pageCount: 3,
    fileSize: 280000,
    mimeType: 'application/pdf',
    matter: '2024-001',
    tags: ['Korrespondenz', 'Fristsetzung'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-02-12T10:00:00Z',
    processedAt: '2024-02-12T10:02:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-schlichtungsgesuch',
    tenantId: 'demo',
    title: 'Schlichtungsgesuch Mietstreitigkeit',
    filename: 'schlichtungsgesuch_miet.pdf',
    type: 'correspondence',
    status: 'ready',
    pageCount: 6,
    fileSize: 420000,
    mimeType: 'application/pdf',
    matter: '2024-001',
    tags: ['Mietrecht', 'Schlichtung', 'Korrespondenz'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-02-15T14:30:00Z',
    processedAt: '2024-02-15T14:32:00Z',
    metadata: {
      language: 'de',
    },
  },
];

// ============================================================================
// Mock Chunks (Document Content)
// ============================================================================

export const mockChunks: DocumentChunk[] = [
  // --- Mietvertrag Chunks ---
  {
    id: 'chunk-miet-1',
    documentId: 'doc-mietvertrag-zh',
    content: 'Der Vermieter kann das Mietverhältnis kündigen, wenn der Mieter mit der Zahlung des Mietzinses oder der Nebenkosten im Rückstand ist. Die Kündigung ist nur gültig, wenn sie schriftlich erfolgt und die gesetzlichen Fristen einhält. Bei Zahlungsverzug des Mieters muss der Vermieter zunächst eine Mahnung mit 30-tägiger Nachfrist aussprechen.',
    articleRef: 'Art. 8 Abs. 2',
    pageNumbers: [8],
    chunkIndex: 0,
  },
  {
    id: 'chunk-miet-2',
    documentId: 'doc-mietvertrag-zh',
    content: 'Die Kündigungsfrist beträgt für Geschäftsräume sechs Monate auf einen ortsüblichen Termin. Die Kündigung muss dem Mieter spätestens am letzten Tag vor Beginn der Kündigungsfrist zugegangen sein. Als ortsübliche Termine gelten der 31. März und der 30. September.',
    articleRef: 'Art. 10 Abs. 1',
    pageNumbers: [10, 11],
    chunkIndex: 1,
  },
  {
    id: 'chunk-miet-3',
    documentId: 'doc-mietvertrag-zh',
    content: 'Die Nebenkosten umfassen die Kosten für Heizung, Warmwasser, Hauswartung, Gebäudeversicherung und allgemeine Stromkosten. Die Abrechnung erfolgt jährlich nach Abschluss der Heizperiode. Der Mieter hat das Recht, die Originalbelege einzusehen.',
    articleRef: 'Art. 5',
    pageNumbers: [5],
    chunkIndex: 2,
  },
  {
    id: 'chunk-miet-4',
    documentId: 'doc-mietvertrag-zh',
    content: 'Bei Beendigung des Mietverhältnisses ist das Mietobjekt in ordnungsgemässem Zustand zurückzugeben. Normale Abnutzung durch vertragsgemässen Gebrauch geht zu Lasten des Vermieters. Die Rückgabe erfolgt mit gemeinsamer Protokollierung.',
    articleRef: 'Art. 15',
    pageNumbers: [18, 19],
    chunkIndex: 3,
  },

  // --- BGE 142 III 91 Chunks ---
  {
    id: 'chunk-bge142-1',
    documentId: 'doc-bge-142-iii-91',
    content: 'Das Bundesgericht bestätigt, dass eine Kündigung nur dann missbräuchlich ist, wenn sie gegen Treu und Glauben verstösst. Der blosse Umstand, dass der Vermieter Eigenbedarf geltend macht, genügt nicht für die Annahme einer Missbräuchlichkeit. Der Eigenbedarf muss jedoch ernsthaft und konkret sein.',
    pageNumbers: [4, 5],
    chunkIndex: 0,
  },
  {
    id: 'chunk-bge142-2',
    documentId: 'doc-bge-142-iii-91',
    content: 'Erwägung 3.2: Bei der Prüfung der Kündigungsanfechtung ist zu berücksichtigen, ob der Vermieter seinen Eigenbedarf substantiiert dargelegt hat und ob dieser plausibel erscheint. Die Beweislast für den Eigenbedarf trägt der Vermieter.',
    pageNumbers: [7],
    chunkIndex: 1,
  },
  {
    id: 'chunk-bge142-3',
    documentId: 'doc-bge-142-iii-91',
    content: 'Art. 271a OR sieht vor, dass die Kündigung anfechtbar ist, wenn sie ausgesprochen wird, weil der Mieter nach Treu und Glauben Ansprüche aus dem Mietverhältnis geltend macht. Dies dient dem Schutz des Mieters vor Retorsionskündigungen.',
    pageNumbers: [9, 10],
    chunkIndex: 2,
  },

  // --- OR Mietrecht Chunks ---
  {
    id: 'chunk-or-miet-1',
    documentId: 'doc-or-mietrecht',
    content: 'Art. 261 OR: Veräussert der Vermieter die Sache oder wird sie ihm in einem Schuldbetreibungs- oder Konkursverfahren entzogen, so geht das Mietverhältnis mit dem Eigentum auf den Erwerber über. Der neue Eigentümer kann jedoch das Mietverhältnis mit der gesetzlichen Frist auf den nächsten gesetzlichen Termin kündigen.',
    articleRef: 'Art. 261 OR',
    pageNumbers: [15],
    chunkIndex: 0,
  },
  {
    id: 'chunk-or-miet-2',
    documentId: 'doc-or-mietrecht',
    content: 'Art. 271 OR: Die Kündigung ist anfechtbar, wenn sie gegen den Grundsatz von Treu und Glauben verstösst. Die Anfechtung muss innert 30 Tagen nach Empfang der Kündigung bei der Schlichtungsbehörde eingereicht werden.',
    articleRef: 'Art. 271 OR',
    pageNumbers: [22],
    chunkIndex: 1,
  },
  {
    id: 'chunk-or-miet-3',
    documentId: 'doc-or-mietrecht',
    content: 'Art. 257d OR: Ist der Mieter nach der Übernahme der Sache mit der Zahlung fälliger Mietzinse oder Nebenkosten im Rückstand, so kann ihm der Vermieter schriftlich eine Zahlungsfrist setzen und androhen, dass bei unbenütztem Ablauf der Frist das Mietverhältnis gekündigt werde.',
    articleRef: 'Art. 257d OR',
    pageNumbers: [8],
    chunkIndex: 2,
  },
  {
    id: 'chunk-or-miet-4',
    documentId: 'doc-or-mietrecht',
    content: 'Art. 266a OR: Bei unbefristeten Mietverhältnissen kann jede Partei unter Einhaltung der gesetzlichen Fristen und Termine kündigen, sofern die Parteien nichts anderes vereinbart haben. Die Kündigung hat schriftlich zu erfolgen.',
    articleRef: 'Art. 266a OR',
    pageNumbers: [18],
    chunkIndex: 3,
  },

  // --- Arbeitsvertrag Chunks ---
  {
    id: 'chunk-arb-1',
    documentId: 'doc-arbeitsvertrag-kader',
    content: 'Die Kündigungsfrist beträgt für Kadermitarbeiter drei Monate auf das Ende eines Kalendermonats. Während der Probezeit kann das Arbeitsverhältnis jederzeit mit einer Frist von sieben Tagen gekündigt werden.',
    articleRef: 'Ziffer 8',
    pageNumbers: [5],
    chunkIndex: 0,
  },
  {
    id: 'chunk-arb-2',
    documentId: 'doc-arbeitsvertrag-kader',
    content: 'Der Arbeitnehmer hat Anspruch auf einen 13. Monatslohn, welcher im Dezember zusammen mit dem regulären Monatslohn ausbezahlt wird. Bei unterjährigem Ein- oder Austritt erfolgt eine anteilige Auszahlung.',
    articleRef: 'Ziffer 4.2',
    pageNumbers: [3],
    chunkIndex: 1,
  },
  {
    id: 'chunk-arb-3',
    documentId: 'doc-arbeitsvertrag-kader',
    content: 'Der Arbeitnehmer verpflichtet sich, während der Dauer des Arbeitsverhältnisses und für zwei Jahre nach dessen Beendigung keine Geschäftsgeheimnisse zu verwerten oder Dritten mitzuteilen. Das Konkurrenzverbot gilt für die ganze Schweiz.',
    articleRef: 'Ziffer 12',
    pageNumbers: [8, 9],
    chunkIndex: 2,
  },

  // --- BGE 138 III 59 Chunks ---
  {
    id: 'chunk-bge138-1',
    documentId: 'doc-bge-138-iii-59',
    content: 'Eine Kündigung ist missbräuchlich gemäss Art. 336 OR, wenn sie wegen einer persönlichen Eigenschaft ausgesprochen wird, die der Erfüllung der Arbeit nicht entgegensteht. Dazu gehören auch Kündigungen aufgrund von Krankheit, sofern diese nicht die Arbeitsfähigkeit dauerhaft beeinträchtigt.',
    pageNumbers: [3, 4],
    chunkIndex: 0,
  },
  {
    id: 'chunk-bge138-2',
    documentId: 'doc-bge-138-iii-59',
    content: 'Der Arbeitnehmer hat bei missbräuchlicher Kündigung Anspruch auf eine Entschädigung von maximal sechs Monatslöhnen. Die Höhe der Entschädigung richtet sich nach den Umständen des Einzelfalls, insbesondere nach der Schwere der Persönlichkeitsverletzung.',
    pageNumbers: [8],
    chunkIndex: 1,
  },

  // --- OR Arbeitsrecht Chunks ---
  {
    id: 'chunk-or-arb-1',
    documentId: 'doc-or-arbeitsrecht',
    content: 'Art. 335c OR: Das Arbeitsverhältnis kann im ersten Dienstjahr mit einer Kündigungsfrist von einem Monat, im zweiten bis und mit dem neunten Dienstjahr mit einer Frist von zwei Monaten und nachher mit einer Frist von drei Monaten je auf das Ende eines Monats gekündigt werden.',
    articleRef: 'Art. 335c OR',
    pageNumbers: [12],
    chunkIndex: 0,
  },
  {
    id: 'chunk-or-arb-2',
    documentId: 'doc-or-arbeitsrecht',
    content: 'Art. 336 OR: Die Kündigung eines Arbeitsverhältnisses ist missbräuchlich, wenn eine Partei sie ausspricht: a. wegen einer Eigenschaft, die der anderen Partei kraft ihrer Persönlichkeit zusteht; b. weil die andere Partei ein verfassungsmässiges Recht ausübt.',
    articleRef: 'Art. 336 OR',
    pageNumbers: [15, 16],
    chunkIndex: 1,
  },
  {
    id: 'chunk-or-arb-3',
    documentId: 'doc-or-arbeitsrecht',
    content: 'Art. 337 OR: Aus wichtigen Gründen kann der Arbeitgeber wie der Arbeitnehmer jederzeit das Arbeitsverhältnis fristlos auflösen. Als wichtiger Grund gilt namentlich jeder Umstand, bei dessen Vorhandensein dem Kündigenden nach Treu und Glauben die Fortsetzung des Arbeitsverhältnisses nicht mehr zugemutet werden darf.',
    articleRef: 'Art. 337 OR',
    pageNumbers: [18],
    chunkIndex: 2,
  },

  // --- Datenschutz Gutachten Chunks ---
  {
    id: 'chunk-dsg-gutachten-1',
    documentId: 'doc-gutachten-datenschutz',
    content: 'Nach Art. 6 DSG dürfen Personendaten nur rechtmässig bearbeitet werden. Die Bearbeitung muss verhältnismässig sein und für die betroffenen Personen erkennbar erfolgen. Personendaten dürfen nur zu dem Zweck bearbeitet werden, der bei der Beschaffung angegeben wurde.',
    articleRef: 'Kapitel 3.1',
    pageNumbers: [12],
    chunkIndex: 0,
  },
  {
    id: 'chunk-dsg-gutachten-2',
    documentId: 'doc-gutachten-datenschutz',
    content: 'Die Übermittlung von Personendaten ins Ausland ist nach Art. 16 DSG nur zulässig, wenn der Bundesrat festgestellt hat, dass der betreffende Staat einen angemessenen Schutz gewährleistet. Andernfalls sind zusätzliche Garantien erforderlich.',
    articleRef: 'Kapitel 4.2',
    pageNumbers: [18, 19],
    chunkIndex: 1,
  },
  {
    id: 'chunk-dsg-gutachten-3',
    documentId: 'doc-gutachten-datenschutz',
    content: 'Die Einwilligung zur Datenbearbeitung muss nach dem revidierten DSG freiwillig, informiert und eindeutig sein. Bei besonders schützenswerten Personendaten muss die Einwilligung zudem ausdrücklich erfolgen.',
    articleRef: 'Kapitel 3.3',
    pageNumbers: [15],
    chunkIndex: 2,
  },

  // --- DSG Chunks ---
  {
    id: 'chunk-dsg-1',
    documentId: 'doc-dsg',
    content: 'Art. 25 DSG: Jede Person kann vom Verantwortlichen Auskunft darüber verlangen, ob Personendaten über sie bearbeitet werden. Die Auskunft ist in der Regel kostenlos zu erteilen.',
    articleRef: 'Art. 25 DSG',
    pageNumbers: [28],
    chunkIndex: 0,
  },
  {
    id: 'chunk-dsg-2',
    documentId: 'doc-dsg',
    content: 'Art. 32 DSG: Private Personen können ihre Persönlichkeit gegen widerrechtliche Bearbeitung schützen, indem sie die Berichtigung, Löschung oder Vernichtung der Daten verlangen. Bei automatisierter Entscheidung hat die betroffene Person das Recht auf eine Überprüfung durch eine natürliche Person.',
    articleRef: 'Art. 32 DSG',
    pageNumbers: [35],
    chunkIndex: 1,
  },

  // --- BGE 147 III 440 Chunks ---
  {
    id: 'chunk-bge147-1',
    documentId: 'doc-bge-147-iii-440',
    content: 'Das Bundesgericht hält fest, dass das Recht auf Vergessen einen Teilgehalt des Persönlichkeitsrechts nach Art. 28 ZGB darstellt. Unter bestimmten Umständen kann eine Person verlangen, dass Informationen über sie nicht mehr öffentlich zugänglich sind.',
    pageNumbers: [6, 7],
    chunkIndex: 0,
  },
  {
    id: 'chunk-bge147-2',
    documentId: 'doc-bge-147-iii-440',
    content: 'Bei der Abwägung zwischen dem öffentlichen Interesse an der Information und dem Persönlichkeitsschutz sind insbesondere der Zeitablauf seit dem Ereignis, die Schwere des ursprünglichen Vorwurfs und das Verhalten der betroffenen Person zu berücksichtigen.',
    pageNumbers: [12],
    chunkIndex: 1,
  },

  // --- Kaufvertrag Chunks ---
  {
    id: 'chunk-kauf-1',
    documentId: 'doc-kaufvertrag-immobilie',
    content: 'Der Verkäufer garantiert, dass das Grundstück frei von Dienstbarkeiten und Grundlasten ist, soweit diese nicht im Grundbuch eingetragen sind. Allfällige vor dem Eigentumsübergang entstandene öffentlich-rechtliche Verpflichtungen gehen nicht auf den Käufer über.',
    articleRef: 'Ziffer 5',
    pageNumbers: [8, 9],
    chunkIndex: 0,
  },
  {
    id: 'chunk-kauf-2',
    documentId: 'doc-kaufvertrag-immobilie',
    content: 'Der Eigentumsübergang erfolgt mit der Eintragung im Grundbuch. Nutzen und Gefahr gehen jedoch bereits mit der Schlüsselübergabe auf den Käufer über. Die Schlüsselübergabe erfolgt am Tag der Zahlung des Kaufpreises.',
    articleRef: 'Ziffer 7',
    pageNumbers: [12],
    chunkIndex: 1,
  },

  // --- ZGB Erbrecht Chunks ---
  {
    id: 'chunk-zgb-erb-1',
    documentId: 'doc-zgb-erbrecht',
    content: 'Art. 471 ZGB: Der Pflichtteil beträgt für Nachkommen drei Viertel des gesetzlichen Erbanspruchs; für den überlebenden Ehegatten oder eingetragenen Partner die Hälfte; für jeden Elternteil die Hälfte.',
    articleRef: 'Art. 471 ZGB',
    pageNumbers: [12],
    chunkIndex: 0,
  },
  {
    id: 'chunk-zgb-erb-2',
    documentId: 'doc-zgb-erbrecht',
    content: 'Art. 522 ZGB: Der Erbe, dessen Pflichtteil durch Verfügungen des Erblassers verletzt wird, kann die Herabsetzung dieser Verfügungen auf das zulässige Mass verlangen. Die Herabsetzungsklage verjährt mit Ablauf eines Jahres seit Kenntnis der Verletzung.',
    articleRef: 'Art. 522 ZGB',
    pageNumbers: [28],
    chunkIndex: 1,
  },
  {
    id: 'chunk-zgb-erb-3',
    documentId: 'doc-zgb-erbrecht',
    content: 'Art. 473 ZGB: Der Erblasser kann dem überlebenden Ehegatten durch Verfügung von Todes wegen gegenüber den gemeinsamen Nachkommen die Nutzniessung am ganzen ihnen zufallenden Teil der Erbschaft zuwenden.',
    articleRef: 'Art. 473 ZGB',
    pageNumbers: [15],
    chunkIndex: 2,
  },

  // --- Memo Arbeitszeit Chunks ---
  {
    id: 'chunk-memo-az-1',
    documentId: 'doc-memo-arbeitszeit',
    content: 'Nach dem aktuellen Bundesgerichtsentscheid müssen Arbeitgeber die Arbeitszeit ihrer Mitarbeiter systematisch erfassen. Dies gilt auch für leitende Angestellte, sofern diese nicht unter die Ausnahmeregelung von Art. 3 ArG fallen.',
    pageNumbers: [2, 3],
    chunkIndex: 0,
  },
  {
    id: 'chunk-memo-az-2',
    documentId: 'doc-memo-arbeitszeit',
    content: 'Die Arbeitszeiterfassung muss mindestens Beginn und Ende der täglichen Arbeitszeit sowie die Pausen umfassen. Elektronische Systeme sind zulässig, müssen aber für Kontrollen durch die Behörden zugänglich sein.',
    pageNumbers: [4],
    chunkIndex: 1,
  },

  // --- Gutachten Erbrecht Chunks ---
  {
    id: 'chunk-gutachten-erb-1',
    documentId: 'doc-gutachten-erbrecht',
    content: 'Im Kanton Zürich wird keine Erbschaftssteuer zwischen Ehegatten und direkten Nachkommen erhoben. Geschwister und deren Nachkommen werden jedoch mit einem Steuersatz von 6-18% besteuert, abhängig von der Höhe des Nachlasses.',
    articleRef: 'Abschnitt 2.1',
    pageNumbers: [5, 6],
    chunkIndex: 0,
  },
  {
    id: 'chunk-gutachten-erb-2',
    documentId: 'doc-gutachten-erbrecht',
    content: 'Lebensversicherungen mit unwiderruflicher Begünstigung fallen nicht in den Nachlass und unterliegen somit nicht der Erbschaftssteuer. Sie sind jedoch als Schenkung zu versteuern, wenn die Prämien aus dem Vermögen des Erblassers bezahlt wurden.',
    articleRef: 'Abschnitt 3.2',
    pageNumbers: [12, 13],
    chunkIndex: 1,
  },

  // --- Gesellschaftsvertrag Chunks ---
  {
    id: 'chunk-gmbh-1',
    documentId: 'doc-gesellschaftsvertrag',
    content: 'Die Gesellschaft mit beschränkter Haftung (GmbH) hat ein Stammkapital von CHF 50,000.-, eingeteilt in 500 Stammanteile zu CHF 100.-. Die Stammanteile sind vollständig liberiert.',
    articleRef: 'Art. 3',
    pageNumbers: [3],
    chunkIndex: 0,
  },
  {
    id: 'chunk-gmbh-2',
    documentId: 'doc-gesellschaftsvertrag',
    content: 'Die Übertragung von Stammanteilen bedarf der Zustimmung der Gesellschafterversammlung. Ein Gesellschafter, der seine Anteile veräussern will, muss diese zunächst den übrigen Gesellschaftern zum Kauf anbieten (Vorkaufsrecht).',
    articleRef: 'Art. 8',
    pageNumbers: [7, 8],
    chunkIndex: 1,
  },
  {
    id: 'chunk-gmbh-3',
    documentId: 'doc-gesellschaftsvertrag',
    content: 'Die Geschäftsführung obliegt einem oder mehreren Geschäftsführern. Die Gesellschafterversammlung kann die Geschäftsführung jederzeit abberufen. Jeder Gesellschafter hat ein Einsichts- und Auskunftsrecht.',
    articleRef: 'Art. 12',
    pageNumbers: [10],
    chunkIndex: 2,
  },

  // --- Obergericht Werkvertrag Chunks ---
  {
    id: 'chunk-og-werk-1',
    documentId: 'doc-obergericht-zh',
    content: 'Das Obergericht bestätigt, dass bei Mängeln am Werk der Besteller nach Art. 368 OR primär Nachbesserung verlangen kann. Erst wenn die Nachbesserung verweigert wird oder nicht innert angemessener Frist erfolgt, kann der Besteller Minderung oder Wandelung geltend machen.',
    pageNumbers: [8, 9],
    chunkIndex: 0,
  },
  {
    id: 'chunk-og-werk-2',
    documentId: 'doc-obergericht-zh',
    content: 'Die Mängelrüge muss unverzüglich nach Entdeckung des Mangels erfolgen. Bei versteckten Mängeln beginnt die Frist erst mit der Entdeckung zu laufen. Die Verjährungsfrist für Mängelrechte beträgt bei beweglichen Sachen zwei Jahre, bei Bauwerken fünf Jahre.',
    pageNumbers: [14],
    chunkIndex: 1,
  },

  // --- Korrespondenz Chunks ---
  {
    id: 'chunk-brief-1',
    documentId: 'doc-brief-gegenpartei',
    content: 'Wir setzen Ihnen hiermit eine letzte Frist von 10 Tagen, um die ausstehende Mietzinszahlung von CHF 4,500.- zu begleichen. Sollte die Zahlung nicht fristgerecht erfolgen, sehen wir uns gezwungen, rechtliche Schritte einzuleiten.',
    pageNumbers: [1],
    chunkIndex: 0,
  },
  {
    id: 'chunk-schlichtung-1',
    documentId: 'doc-schlichtungsgesuch',
    content: 'Die Gesuchstellerin beantragt die Aufhebung der Kündigung vom 15. Januar 2024 sowie eine Erstreckung des Mietverhältnisses um mindestens zwei Jahre. Die Kündigung ist missbräuchlich, da sie als Reaktion auf die Mängelrüge vom Dezember 2023 erfolgte.',
    pageNumbers: [2, 3],
    chunkIndex: 0,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all unique tags from the document corpus.
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  mockDocuments.forEach((doc) => doc.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

/**
 * Get all unique matters from the document corpus.
 */
export function getAllMatters(): { id: string; label: string }[] {
  const matters = new Map<string, string>();
  mockDocuments.forEach((doc) => {
    if (doc.matter && !matters.has(doc.matter)) {
      // Generate a label from the matter ID
      matters.set(doc.matter, doc.matter);
    }
  });
  return Array.from(matters.entries()).map(([id]) => ({
    id,
    label: id, // In production, fetch actual matter names from API
  }));
}

/**
 * Get chunks for a specific document.
 */
export function getChunksForDocument(documentId: string): DocumentChunk[] {
  return mockChunks.filter((chunk) => chunk.documentId === documentId);
}
