import React, { useRef, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { Incident } from "../../types";
import Modal from "../common/Modal";
import { ArrowUpRight, Camera, CheckCircle2 } from "lucide-react";

interface IncidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export function IncidentFormModal({
  isOpen,
  onClose,
  onSaved,
}: IncidentFormModalProps) {
  const { activeGroup, incidents, updateIncidents } = useDashboard();

  const [person, setPerson] = useState("Anonimowy Orzeł");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const uploadRequest = useRef(0);

  if (!isOpen) return null;

  async function handleUploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const request = ++uploadRequest.current;
    setError("");
    setPhoto("");

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError("Wybierz zdjęcie JPG, PNG lub WebP do 8 MB.");
      return;
    }

    setUploading(true);
    try {
      const bitmap = await createImageBitmap(file);
      const ratio = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) {
        bitmap.close();
        throw new Error("canvas");
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      if (compressed.length > 650000) throw new Error("size");
      if (request === uploadRequest.current) setPhoto(compressed);
    } catch {
      if (request === uploadRequest.current) {
        setError(
          "Nie udało się wczytać zdjęcia. Spróbuj mniejszego pliku JPG lub PNG.",
        );
      }
    } finally {
      if (request === uploadRequest.current) setUploading(false);
    }
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!photo || uploading) {
      setError("Dodaj zdjęcie potwierdzające zgłoszenie.");
      return;
    }

    try {
      const newIncident: Incident = {
        id: crypto.randomUUID(),
        groupId: activeGroup.id,
        person,
        date: new Date().toISOString(),
        note: note.trim(),
        photo,
      };

      updateIncidents([...incidents, newIncident]);
      setNote("");
      setPhoto("");
      onSaved(
        "Zdarzenie ze zdjęciem zapisane. Nie zmieniono dziennej kwoty grupy.",
      );
      onClose();
    } catch {
      setError(
        "Brak miejsca na zapis zdjęcia w przeglądarce. Usuń starszy zapis lub wybierz mniejsze zdjęcie.",
      );
    }
  }

  const peopleOptions = [
    "Anonimowy Orzeł",
    ...(activeGroup.demo
      ? ["Spokojna Fala", "Dzielny Lis", "Jasny Horyzont"]
      : []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="BEZ OCENIANIA"
      title="Zapisz zdarzenie"
      className="group-modal max-h-[90vh] overflow-y-auto"
      ariaLabel="Zapisz zdarzenie"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
          Kogo dotyczy zdarzenie?
          <select
            autoFocus
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            className="w-full p-3 border border-[#ebebeb] rounded text-sm bg-white outline-none focus:ring-1 focus:ring-[#7472d5]"
          >
            {peopleOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="photo-evidence flex flex-col gap-2 my-1">
          <div className="evidence-label flex items-center justify-between text-xs">
            <span className="text-[#17171c] font-medium">
              Potwierdzenie zdjęciem
            </span>
            <span className="font-mono text-[8px] tracking-wider text-[#77709e] bg-[#efedf9] px-1.5 py-0.5 rounded">
              WYMAGANE
            </span>
          </div>

          {photo ? (
            <div className="evidence-preview relative border border-[#ebebeb] rounded overflow-hidden bg-[#f5f4fa]">
              <img
                src={photo}
                alt="Podgląd zdjęcia przed zapisaniem"
                className="w-full h-44 object-contain block bg-white"
              />
              <button
                type="button"
                onClick={() => setPhoto("")}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-[#ebebeb] text-[#010120] text-lg grid place-items-center hover:bg-[#f5f5f6] cursor-pointer shadow-sm"
                aria-label="Usuń wybrane zdjęcie"
              >
                ×
              </button>
              <span className="block p-2.5 text-[10px] bg-[#eaf7f1] text-[#366353]">
                ✓ Zdjęcie gotowe do zapisania
              </span>
            </div>
          ) : (
            <label className="photo-upload relative flex flex-col items-center justify-center text-center gap-2 min-h-[150px] bg-[#f8f7fc] border border-dashed border-[#bcb6d2] rounded p-5 cursor-pointer hover:bg-[#efedf9] transition-colors">
              <span className="upload-symbol text-3xl text-[#8b81b6] leading-none">
                ▧
              </span>
              <strong className="text-xs font-semibold text-[#010120]">
                {uploading ? "Przygotowuję zdjęcie…" : "Dodaj zdjęcie"}
              </strong>
              <span className="text-[10px] text-[#727279]">
                Zrób zdjęcie telefonem lub wybierz z galerii
              </span>
              <span className="text-[9px] text-[#727279]">
                JPG, PNG, WebP · do 8 MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadPhoto}
                disabled={uploading}
                aria-label="Wybierz zdjęcie potwierdzające zgłoszenie"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          )}

          <p className="text-[10px] leading-relaxed text-[#727279] m-0">
            Zdjęcie jest załącznikiem zgłaszającego — aplikacja nie weryfikuje
            jego autentyczności.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-xs text-[#17171c]">
          Co się wydarzyło? (opcjonalnie)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kontekst, trudny moment, potrzebne wsparcie…"
            maxLength={500}
            rows={3}
            className="w-full p-3 border border-[#ebebeb] rounded text-xs bg-[#fdfdfd] outline-none focus:ring-1 focus:ring-[#7472d5] resize-y"
          />
        </label>

        <p className="small-text text-[10px] text-[#727279] m-0">
          Zapisz tylko znane Ci zdarzenie. Nie dodawaj wrażliwych danych innych
          osób bez ich zgody.
        </p>

        {error && (
          <p
            className="form-error text-xs text-[#a12d3d] bg-[#fdf2f2] p-2.5 rounded"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!photo || uploading}
          className="w-full bg-[#010120] hover:bg-[#201f40] active:bg-[#000010] text-white rounded-xl py-3.5 px-5 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-md disabled:bg-[#010120]/30 disabled:text-white/30 disabled:cursor-not-allowed mt-2 border border-black/10"
        >
          <Camera className="size-4 shrink-0 text-white" />
          <span className="text-white font-bold">ZAPISZ ZE ZDJĘCIEM</span>
        </button>
      </form>
    </Modal>
  );
}

export default IncidentFormModal;
