'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck2,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  FileCode,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

export const ThreeDArtworkProofChecker: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    resolution: boolean;
    bleed: boolean;
    colorSpace: boolean;
    fonts: boolean;
  } | null>(null);

  const handleSimulateUpload = () => {
    setScanning(true);
    setFileName('Brand_Identity_Packaging_Final.pdf');
    setDiagnostics(null);

    setTimeout(() => {
      setDiagnostics({
        resolution: true,
        bleed: true,
        colorSpace: true,
        fonts: true,
      });
      setScanning(false);
    }, 1800);
  };

  const handleReset = () => {
    setFileName(null);
    setDiagnostics(null);
    setScanning(false);
  };

  return (
    <section className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Description (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Instant AI Pre-Flight Proofing</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Test Your Artwork File Before Printing
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never worry about pixelated prints or clipped borders. Our automated pre-flight engine scans your file in seconds, checking resolution, bleed safety margins, and CMYK color accuracy.
            </p>

            <div className="space-y-1.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Supports PDF, AI, PSD, EPS, TIFF, and PNG up to 100MB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Instant 3D digital proof generation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Zero hidden correction or setup fees</span>
              </div>
            </div>
          </div>

          {/* Right Upload & 3D Proof Card (7 cols) */}
          <div className="lg:col-span-7">
            <ThreeDCard
              maxTilt={12}
              scale={1.02}
              className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-md"
            >
              {!fileName ? (
                <div
                  onClick={handleSimulateUpload}
                  className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-colors bg-purple-50/40 group flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Drop your design file here or click to browse
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PDF, AI, PSD, PNG or JPG (Max 100MB)
                    </p>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30">
                    Click to Test Sample File
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File status bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-xs">
                          {fileName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          File Size: 18.4 MB • Print Vector PDF
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleReset}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scanning Animation or Results */}
                  {scanning ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Scanning 3D Bleed &amp; Color Profiles...
                      </div>
                      <div className="text-xs text-slate-400">
                        Analyzing 300 DPI rasterization and vector path integrity
                      </div>
                    </div>
                  ) : diagnostics ? (
                    <div className="space-y-4">
                      {/* Diagnostic items */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>300 DPI High Resolution (Pass)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>3mm Bleed Margin Cleared</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>CMYK Fogra39 Calibrated</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Fonts Converted to Curves</span>
                        </div>
                      </div>

                      {/* Ready Badge & Action */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                          <div>
                            <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                              100% Press Ready - Guaranteed Crisp Print
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              No distortion or bleed clipping detected.
                            </div>
                          </div>
                        </div>

                        <a
                          href="#trending-products"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/30 whitespace-nowrap"
                        >
                          <span>Proceed with File</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </ThreeDCard>
          </div>
        </div>
      </div>
    </section>
  );
};
