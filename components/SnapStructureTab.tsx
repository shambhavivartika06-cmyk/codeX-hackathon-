"use client";

import React, { useState, useRef } from "react";
import {
  ScanText,
  Upload,
  FileCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Pill,
  FileText,
  Eye,
  RotateCcw,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  ExtractedDocumentData,
  ExtractedMedicationItem,
  ExtractedLabTestItem,
  SavedExtractedRecord,
  Medication,
} from "@/lib/types";
import { SAMPLE_DOCUMENTS, SampleDoc } from "@/data/sampleDocuments";
import { getSavedExtractedDocs, saveExtractedDoc, deleteExtractedDoc } from "@/lib/storage";

interface SnapStructureTabProps {
  onAddExtractedMedication: (med: Medication) => void;
  onAttachToDoctorSummary: (note: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function SnapStructureTab({
  onAddExtractedMedication,
  onAttachToDoctorSummary,
  setActiveTab,
}: SnapStructureTabProps) {
  // Upload and review states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted data (editable by user)
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [isFallbackNotice, setIsFallbackNotice] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Saved scans history
  const [savedRecords, setSavedRecords] = useState<SavedExtractedRecord[]>(() => getSavedExtractedDocs());

  // Image zoom modal
  const [showImageZoom, setShowImageZoom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("File size exceeds 8 MB. Please choose a smaller photo.");
      return;
    }

    setErrorMsg(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      startExtraction(dataUrl, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Handle fictional sample document selection
  const handleSelectSample = (sample: SampleDoc) => {
    setErrorMsg(null);
    setSelectedImage(sample.dataUrl);
    setMimeType("image/svg+xml");
    startExtraction(sample.dataUrl, "image/svg+xml", sample.id);
  };

  // Run server-side extraction
  const startExtraction = async (imageDataUrl: string, type: string, sampleId?: string) => {
    setIsScanning(true);
    setExtractedData(null);
    setSavedSuccessMsg(null);
    setScanStep("Analyzing image clarity and clinical orientation...");

    // Lightweight dynamic progress messages
    const step1 = setTimeout(() => setScanStep("Running Gemini multimodal clinical entity extraction..."), 400);
    const step2 = setTimeout(() => setScanStep("Structuring medications, dosages, and reference ranges..."), 900);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: type,
          sampleId,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to extract medical document.");
      }

      setExtractedData(result.data);
      setIsFallbackNotice(Boolean(result.isFallback));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to parse document. Please try again or verify API key.");
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setIsScanning(false);
      setScanStep("");
    }
  };

  // Field editing handlers
  const handleUpdateField = (field: keyof ExtractedDocumentData, value: any) => {
    if (!extractedData) return;
    setExtractedData({ ...extractedData, [field]: value });
  };

  const handleUpdateMedication = (index: number, updatedItem: ExtractedMedicationItem) => {
    if (!extractedData?.medications) return;
    const meds = [...extractedData.medications];
    meds[index] = updatedItem;
    setExtractedData({ ...extractedData, medications: meds });
  };

  const handleAddMedicationRow = () => {
    if (!extractedData) return;
    const meds = extractedData.medications ? [...extractedData.medications] : [];
    meds.push({
      name: "",
      dosage: "",
      frequency: "",
      instructions: "",
      confidence: "clear",
    });
    setExtractedData({ ...extractedData, medications: meds });
  };

  const handleDeleteMedicationRow = (index: number) => {
    if (!extractedData?.medications) return;
    const meds = extractedData.medications.filter((_, i) => i !== index);
    setExtractedData({ ...extractedData, medications: meds });
  };

  const handleUpdateLabTest = (index: number, updatedTest: ExtractedLabTestItem) => {
    if (!extractedData?.labTests) return;
    const tests = [...extractedData.labTests];
    tests[index] = updatedTest;
    setExtractedData({ ...extractedData, labTests: tests });
  };

  // Integration Action 1: Add Extracted Meds to User's Active Medication Checklist
  const handleAddAllToMedications = () => {
    if (!extractedData?.medications || extractedData.medications.length === 0) return;

    let addedCount = 0;
    extractedData.medications.forEach((item) => {
      if (item.name.trim()) {
        const newMed: Medication = {
          id: "med-extracted-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          name: item.name.trim(),
          dosage: item.dosage.trim() || "As directed",
          schedule: item.frequency.trim() || "Daily",
          notes: item.instructions.trim()
            ? `${item.instructions} [Extracted from: ${extractedData.facilityOrDoctor || "Prescription"}]`
            : `[Extracted from: ${extractedData.facilityOrDoctor || "Prescription"}]`,
          takenToday: false,
        };
        onAddExtractedMedication(newMed);
        addedCount++;
      }
    });

    handleSaveRecord(true, false);
    setSavedSuccessMsg(`Added ${addedCount} medication(s) directly to your Daily Medication Checklist!`);
  };

  // Integration Action 2: Attach Lab Findings to Doctor Summary
  const handleAttachToSummary = () => {
    if (!extractedData) return;

    let summaryText = `[EXTRACTED LAB REPORT - ${extractedData.facilityOrDoctor} (${extractedData.documentDate})]:\n`;
    if (extractedData.labTests && extractedData.labTests.length > 0) {
      extractedData.labTests.forEach((t) => {
        summaryText += `• ${t.testName}: ${t.value} ${t.unit} (Ref: ${t.referenceRange}) [${t.flag.toUpperCase()}]\n`;
      });
    }
    if (extractedData.warningsOrNotes.length > 0) {
      summaryText += `Notes: ${extractedData.warningsOrNotes.join("; ")}`;
    }

    onAttachToDoctorSummary(summaryText);
    handleSaveRecord(false, true);
    setSavedSuccessMsg("Lab results attached to Doctor Visit Brief. Navigating to summary tab...");
    setTimeout(() => setActiveTab("summary"), 1200);
  };

  // Save Record into History
  const handleSaveRecord = (addedToMeds = false, attachedToSum = false) => {
    if (!extractedData) return;

    const newRecord: SavedExtractedRecord = {
      id: "scan-" + Date.now(),
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      title: `${extractedData.documentType === "prescription" ? "Prescription" : "Lab Report"} - ${extractedData.facilityOrDoctor || "Medical Record"}`,
      documentType: extractedData.documentType,
      thumbnailUrl: selectedImage || undefined,
      data: extractedData,
      addedToMedications: addedToMeds,
      attachedToSummary: attachedToSum,
    };

    const updated = saveExtractedDoc(newRecord);
    setSavedRecords(updated);
    if (!savedSuccessMsg) {
      setSavedSuccessMsg("Document record saved to your local extraction archive!");
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("Delete this saved document scan from history?")) {
      const updated = deleteExtractedDoc(id);
      setSavedRecords(updated);
    }
  };

  const handleResetScan = () => {
    setSelectedImage(null);
    setExtractedData(null);
    setErrorMsg(null);
    setSavedSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ScanText className="w-6 h-6 text-brand-600" />
            Snap & Structure — Medical Document OCR
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Extract prescriptions and lab reports into structured fields. Review side-by-side with your original document
            before confirming.
          </p>
        </div>

        {selectedImage && (
          <button
            onClick={handleResetScan}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan New Document
          </button>
        )}
      </div>

      {/* Prominent Ethical Prototype Disclaimer Banner */}
      <div className="bg-sky-50/70 border border-brand-200 text-brand-900 rounded-2xl p-4 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Clinical Prototype & Zero-Hallucination Guardrail:</p>
          <p className="text-slate-600 leading-relaxed">
            CareBuddy extracts visible text to accelerate health tracking. Our engine is strictly instructed to flag smudged
            or ambiguous words instead of guessing. <strong>Always cross-check extracted numbers against your physical paper</strong> before taking medications.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSavedSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-950 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* STEP 1: UPLOAD / PICK SAMPLE (Shown if no image selected yet) */}
      {!selectedImage && !isScanning && (
        <div className="space-y-6">
          {/* Main Upload Box */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-dashed border-slate-300 hover:border-brand-400 text-center transition flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">Upload a Prescription or Lab Report</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Take a clear photo or screenshot from your mobile device or computer. PNG, JPG, and WebP supported up to 8 MB.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Select Document from Device</span>
            </button>
          </div>

          {/* Fictional Sample Documents for Quick Testing / Demonstration */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Try with Fictional Test Documents (Zero Upload Needed)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any sample to test multimodal parsing, lab extraction, and the zero-hallucination ambiguity guardrail.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                Demo Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {SAMPLE_DOCUMENTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="space-y-1 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        sample.type === "prescription"
                          ? "bg-brand-100 text-brand-800"
                          : sample.type === "lab_report"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {sample.type === "prescription"
                        ? "Prescription"
                        : sample.type === "lab_report"
                        ? "Lab Report"
                        : "Ambiguity Test"}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 pt-1">
                      {sample.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{sample.description}</p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-brand-600 group-hover:underline">
                    <span>Test Extract &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCANNING PROGRESS ANIMATION */}
      {isScanning && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">CareBuddy Vision Engine Scanning</h3>
            <p className="text-xs text-brand-600 font-medium mt-1">{scanStep}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Cross-referencing drug databases, checking reference ranges, and flagging smudged text...
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: SIDE-BY-SIDE REVIEW (Original Document vs Extracted Fields) */}
      {extractedData && selectedImage && !isScanning && (
        <div className="space-y-6">
          {/* Ambiguity Alert Notice if detected */}
          {extractedData.hasAmbiguities && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Ambiguous or Smudged Text Detected in Document:</p>
                <p className="mt-0.5 text-amber-900 leading-relaxed">
                  CareBuddy flagged one or more fields where printed ink was damaged or unclear. In compliance with medical
                  safety standards, we marked these fields with warning badges rather than assuming a value. 
                  <strong>Please review the highlighted amber fields on the right.</strong>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDE: Original Document Image Preview (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 sticky top-20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Original Document</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase">
                    {extractedData.documentType}
                  </span>
                </div>
                <button
                  onClick={() => setShowImageZoom(true)}
                  className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Full Size
                </button>
              </div>

              {/* Scrollable image container */}
              <div className="max-h-[560px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-2">
                <img
                  src={selectedImage}
                  alt="Original Medical Document"
                  className="w-full h-auto object-contain rounded-lg shadow-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Click image or &quot;Full Size&quot; to inspect tiny print</span>
                <button
                  onClick={handleResetScan}
                  className="text-slate-500 hover:text-rose-600 underline font-medium"
                >
                  Change Image
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: Extracted & Editable Fields (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Extracted Clinical Information</h3>
                  <p className="text-xs text-slate-500">Every field is editable. Verify values before saving.</p>
                </div>
                {isFallbackNotice && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Local Structured Parser
                  </span>
                )}
              </div>

              {/* Document Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Facility / Prescriber
                  </label>
                  <input
                    type="text"
                    value={extractedData.facilityOrDoctor}
                    onChange={(e) => handleUpdateField("facilityOrDoctor", e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Document Date
                  </label>
                  <input
                    type="text"
                    value={extractedData.documentDate}
                    onChange={(e) => handleUpdateField("documentDate", e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* PRESCRIPTION MEDICATION REVIEW */}
              {extractedData.documentType === "prescription" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-brand-600" />
                      Prescribed Medications ({extractedData.medications?.length || 0})
                    </h4>
                    <button
                      onClick={handleAddMedicationRow}
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {extractedData.medications?.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border space-y-2.5 ${
                          item.confidence === "ambiguous" || item.confidence === "missing"
                            ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-400"
                            : "border-slate-200 bg-slate-50/50"
                        }`}
                      >
                        {/* Warning badge if ambiguous */}
                        {(item.confidence === "ambiguous" || item.confidence === "missing") && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Unclear / Smudged Value: {item.confidenceNote || "Verify with pharmacist"}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-600 mb-0.5">Medication Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleUpdateMedication(idx, { ...item, name: e.target.value })
                              }
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-600 mb-0.5">Dosage / Strength</label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) =>
                                handleUpdateMedication(idx, { ...item, dosage: e.target.value })
                              }
                              className={`w-full p-2 rounded-lg border bg-white font-semibold ${
                                item.confidence === "ambiguous"
                                  ? "border-amber-400 text-amber-900"
                                  : "border-slate-200 text-slate-900"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-600 mb-0.5">Frequency / Schedule</label>
                            <input
                              type="text"
                              value={item.frequency}
                              onChange={(e) =>
                                handleUpdateMedication(idx, { ...item, frequency: e.target.value })
                              }
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-600 mb-0.5">Special Instructions</label>
                            <input
                              type="text"
                              value={item.instructions}
                              onChange={(e) =>
                                handleUpdateMedication(idx, { ...item, instructions: e.target.value })
                              }
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleDeleteMedicationRow(idx)}
                            className="text-xs text-slate-400 hover:text-rose-600 p-1 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LAB REPORT REVIEW */}
              {extractedData.documentType === "lab_report" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Laboratory Diagnostic Tests ({extractedData.labTests?.length || 0})
                  </h4>

                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 p-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2">
                      <span className="col-span-4">Test Name</span>
                      <span className="col-span-2">Value</span>
                      <span className="col-span-2">Units</span>
                      <span className="col-span-2">Ref Range</span>
                      <span className="col-span-2 text-right">Status</span>
                    </div>

                    {extractedData.labTests?.map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 grid grid-cols-12 gap-2 items-center ${
                          t.flag === "abnormal" ? "bg-rose-50/50" : "bg-white"
                        }`}
                      >
                        <div className="col-span-4 font-semibold text-slate-900">
                          <input
                            type="text"
                            value={t.testName}
                            onChange={(e) => handleUpdateLabTest(idx, { ...t, testName: e.target.value })}
                            className="w-full p-1 border border-transparent hover:border-slate-300 rounded bg-transparent"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={t.value}
                            onChange={(e) => handleUpdateLabTest(idx, { ...t, value: e.target.value })}
                            className={`w-full p-1 border rounded font-bold ${
                              t.flag === "abnormal" ? "border-rose-300 text-rose-700" : "border-slate-200 text-slate-900"
                            }`}
                          />
                        </div>
                        <div className="col-span-2 text-slate-500">
                          <input
                            type="text"
                            value={t.unit}
                            onChange={(e) => handleUpdateLabTest(idx, { ...t, unit: e.target.value })}
                            className="w-full p-1 border border-transparent hover:border-slate-300 rounded bg-transparent"
                          />
                        </div>
                        <div className="col-span-2 text-slate-500">
                          <input
                            type="text"
                            value={t.referenceRange}
                            onChange={(e) => handleUpdateLabTest(idx, { ...t, referenceRange: e.target.value })}
                            className="w-full p-1 border border-transparent hover:border-slate-300 rounded bg-transparent"
                          />
                        </div>
                        <div className="col-span-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.flag === "abnormal"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {t.flag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings / Doctor Notes */}
              {extractedData.warningsOrNotes?.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 uppercase block">Extracted Notes / Warnings</span>
                  {extractedData.warningsOrNotes.map((note, idx) => (
                    <p key={idx} className="text-slate-600 flex items-start gap-1.5">
                      <span className="text-brand-600">•</span>
                      <span>{note}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* STEP 3: CONFIRM & INTEGRATE BUTTONS */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {extractedData.documentType === "prescription" ? (
                    <button
                      onClick={handleAddAllToMedications}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-sm text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Confirm & Add to Daily Medication Tracker</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleAttachToSummary}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-sm text-xs"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Attach Results to Doctor Visit Summary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleSaveRecord(false, false)}
                    className="w-full sm:w-auto px-4 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                  >
                    Save Record Only
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Saving records updates your local storage history. You can revisit and edit this scan at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVED EXTRACTIONS HISTORY SECTION */}
      {savedRecords.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Saved Document Scans ({savedRecords.length})</h3>
              <p className="text-xs text-slate-500">History of confirmed medical documents in your local session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-start justify-between gap-3 transition"
              >
                <div className="flex items-start gap-3">
                  {record.thumbnailUrl ? (
                    <img
                      src={record.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-14 h-16 object-cover rounded-lg border border-slate-200 bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        record.documentType === "prescription"
                          ? "bg-brand-100 text-brand-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {record.documentType}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{record.title}</h4>
                    <p className="text-[11px] text-slate-500">Scanned on: {record.createdAt}</p>
                    {record.addedToMedications && (
                      <span className="inline-block text-[10px] text-emerald-700 font-medium">
                        ✓ Added to Medications
                      </span>
                    )}
                    {record.attachedToSummary && (
                      <span className="inline-block text-[10px] text-indigo-700 font-medium ml-2">
                        ✓ Attached to Doctor Summary
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedImage(record.thumbnailUrl || null);
                      setExtractedData(record.data);
                    }}
                    className="text-xs text-brand-600 hover:underline font-semibold"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL SIZE IMAGE ZOOM MODAL */}
      {showImageZoom && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Inspecting Original Medical Document</span>
              <button
                onClick={() => setShowImageZoom(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center">
              <img src={selectedImage} alt="Zoomed document" className="max-w-full h-auto rounded shadow" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
