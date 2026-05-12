'use client';

import { motion } from 'framer-motion';
import MessagingInterface from '@/components/MessagingInterface';

export default function MessagesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Messages</h1>
          <p className="text-neutral-400">Direct messaging with your campaign creators.</p>
        </div>

        {/* Messaging Interface */}
        <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6">
          <MessagingInterface />
        </div>
      </motion.div>
    </div>
  );
}
