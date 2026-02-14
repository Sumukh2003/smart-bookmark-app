"use client";

import LoginButton from "@/components/LoginButton";
import { Bookmark, Shield, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Smart Bookmark</h1>
          </div>

          <LoginButton className="px-4 py-2 text-sm whitespace-nowrap" />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Save, organize and access your bookmarks instantly across devices
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            A modern, secure bookmark manager that keeps everything in sync.
          </p>

          <div className="mt-10">
            <LoginButton className="w-full sm:w-auto px-8 py-3 text-base" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-emerald-600" />}
            title="Instant Sync"
            description="Changes appear instantly across all your tabs and devices."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-emerald-600" />}
            title="Secure & Private"
            description="Your bookmarks are private. Only you can see them."
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-emerald-600" />}
            title="Access Anywhere"
            description="Cloud-based and accessible from anywhere in the world."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white/70 backdrop-blur-sm py-8 text-center text-md text-gray-900">
        © 2026 Smart Bookmark
        <br />
        Sumukh P Marathe
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow text-center">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5 mx-auto">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-base leading-relaxed">{description}</p>
    </div>
  );
}
