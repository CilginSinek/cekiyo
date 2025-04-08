"use client";

import { useState } from "react";
import Draw from "@/types/Draw";
import { useRouter } from "next/navigation";
import { useDraws } from "@/context/drawContext";

export default function Page() {
  const router = useRouter();
  const {setNewDrawinObj} = useDraws();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Draw>>({
    drawName: "",
    drawDescription: "",
    drawPrize: "",
    drawDate: undefined,
    closeTime: undefined,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "drawDate" || name === "closeTime" ? new Date(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();

    if (formData.drawDate && new Date(formData.drawDate) < now) {
      alert("Çekiliş tarihi şu anki tarihten önce olamaz.");
      return;
    }

    if (formData.closeTime && new Date(formData.closeTime) < now) {
      alert("Kayıt kapanış tarihi şu anki tarihten önce olamaz.");
      return;
    }

    if (
      formData.closeTime &&
      formData.drawDate &&
      formData.closeTime > formData.drawDate
    ) {
      alert("Kayıt kapanış tarihi, çekiliş tarihinden önce olmalıdır.");
      return;
    }
    fetch("/api/regsDraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((data) => {
            setNewDrawinObj(data.draw);
            router.push(`/cekiyo/${data.draw.id}`);
          });
        } else {
          console.error("Çekiliş oluşturulamadı:", res.statusText);
        }
      })
      .catch((err) => {
        console.error("Hata:", err);
      })
      .finally(() => setShowForm(false));
  };
  const today = new Date().toISOString().slice(0, 16);
  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {showForm ? "Formu Kapat" : "Yeni Çekiliş Oluştur"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 border border-gray-700 rounded shadow-md space-y-4 bg-gray-800 max-w-lg mx-auto"
        >
          <div>
            <label
              htmlFor="drawName"
              className="block text-sm font-medium text-gray-300"
            >
              Çekiliş Adı
            </label>
            <input
              type="text"
              id="drawName"
              name="drawName"
              value={formData.drawName || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="drawDescription"
              className="block text-sm font-medium text-gray-300"
            >
              Çekiliş Açıklaması
            </label>
            <textarea
              id="drawDescription"
              name="drawDescription"
              value={formData.drawDescription || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="drawPrize"
              className="block text-sm font-medium text-gray-300"
            >
              Ödül
            </label>
            <input
              type="text"
              id="drawPrize"
              name="drawPrize"
              value={formData.drawPrize || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="drawDate"
              className="block text-sm font-medium text-gray-300"
            >
              Çekiliş Tarihi
            </label>
            <input
              type="datetime-local"
              id="drawDate"
              name="drawDate"
              onChange={handleInputChange}
              min={today}
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="closeTime"
              className="block text-sm font-medium text-gray-300"
            >
              Kayıt Kapanış Tarihi (Opsiyonel)
            </label>
            <input
              type="datetime-local"
              id="closeTime"
              name="closeTime"
              min={today}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition w-full"
          >
            Oluştur
          </button>
        </form>
      )}
    </div>
  );
}
