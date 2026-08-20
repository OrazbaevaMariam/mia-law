"use client";

import { useState } from "react";

export default function Hero() {
  const [isVisible] = useState(true);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-2xl text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">
          Добро пожаловать в MIA Law
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Профессиональное обучение правовым основам
        </p>
        <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Начать обучение
        </button>
      </div>
    </section>
  );
}
