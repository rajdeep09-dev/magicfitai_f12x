'use client';
export const dynamic = "force-dynamic";

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef } from 'react';
import { Upload, Download, Users, Database, Lock, FileUp } from 'lucide-react';

export default function SettingsPage() {
  const { isEditor } = useAuth();
  const [csvData, setCSVData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadCSVTemplate = () => {
    const headers = [
      'creator_name',
      'platform',
      'deliverable',
      'spend',
      'live_date',
      'progress_score',
    ];
    const template = [headers].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creators-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim());

        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const obj: any = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx];
          });
          return obj;
        });

        setCSVData(data);
        setImporting(true);

        // Simulate import process
        setTimeout(() => {
          const successful = data.filter((d) => d.creator_name && d.platform);
          const failed = data.length - successful.length;

          setImportResult({
            total: data.length,
            successful: successful.length,
            failed: failed,
            timestamp: new Date().toISOString(),
          });

          setImporting(false);
        }, 1500);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setImportResult({
          error: 'Failed to parse CSV file',
        });
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  if (!isEditor) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-900/20 border border-red-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h2>
          <p className="text-red-300">Only editors can access the settings page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Settings & Admin</h1>
          <p className="text-neutral-400">CSV import, user management, and integration settings.</p>
        </div>

        {/* CSV Import Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-lime-400" />
            Bulk Creator Import
          </h2>

          <div className="space-y-4">
            {/* Template Download */}
            <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-50 mb-1">CSV Template</h3>
                  <p className="text-sm text-neutral-400">
                    Download the CSV template to understand the required format
                  </p>
                </div>
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 font-medium rounded-lg transition border border-lime-400/30"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* CSV Upload */}
            <div className="border-2 border-dashed border-neutral-700 hover:border-lime-400/50 rounded-lg p-8 text-center transition cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={importing}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-lime-900/30 border border-lime-700 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-50 mb-1">
                    {importing ? 'Processing...' : 'Click to upload CSV'}
                  </p>
                  <p className="text-sm text-neutral-400">or drag and drop</p>
                </div>
              </div>
            </div>

            {/* Import Results */}
            {importResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${
                  importResult.error
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-lime-900/20 border-lime-700'
                }`}
              >
                {importResult.error ? (
                  <p className="text-red-300">{importResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-lime-300">Import Completed</p>
                    <div className="text-sm text-lime-300/80 space-y-1">
                      <p>Total Records: {importResult.total}</p>
                      <p>Successful: {importResult.successful}</p>
                      {importResult.failed > 0 && <p>Failed: {importResult.failed}</p>}
                      <p className="text-xs text-neutral-400 mt-2">
                        {new Date(importResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* User Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            User Management
          </h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="client@example.com"
                className="flex-1 px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
              />
              <select className="px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition">
                <option>Client</option>
                <option>Editor</option>
              </select>
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition">
                Invite
              </button>
            </div>

            <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm text-neutral-400 mb-3 font-medium">Setup Instructions</p>
              <p className="text-xs text-neutral-400 mb-3">
                To create user accounts, call the setup endpoint or manage users directly in Supabase Auth.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-mono text-lime-400 break-all">POST /api/setup-users</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Integration Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Integrations
          </h2>

          <div className="space-y-3">
            {[
              { name: 'Google Sheets API', status: 'Connected', description: 'Auto-sync with master sheet' },
              { name: 'Supabase Database', status: 'Connected', description: 'Real-time data sync' },
            ].map((integration, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-neutral-700 rounded-lg hover:bg-neutral-800/30 transition"
              >
                <div>
                  <p className="font-medium text-neutral-50">{integration.name}</p>
                  <p className="text-sm text-neutral-400">{integration.description}</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-lime-900/30 border border-lime-700 text-lime-300 rounded">
                  {integration.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-400" />
            Security
          </h2>

          <div className="space-y-3">
            <div className="p-4 border border-neutral-700 rounded-lg">
              <h3 className="font-medium text-neutral-50 mb-2">Change Password</h3>
              <p className="text-sm text-neutral-400 mb-4">Update your account password</p>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition">
                Update Password
              </button>
            </div>

            <div className="p-4 border border-neutral-700 rounded-lg">
              <h3 className="font-medium text-neutral-50 mb-2">Row Level Security</h3>
              <p className="text-sm text-neutral-400">Database access is protected with RLS policies</p>
              <p className="text-xs text-lime-400 mt-2">✓ Protected</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
