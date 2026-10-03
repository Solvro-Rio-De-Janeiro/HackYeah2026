import React, { useState } from "react";
import {
  useDashboard,
  money,
  dailyAmount,
} from "../../context/DashboardContext";
import Modal from "../common/Modal";
import { ArrowUpRightFromCircle, Repeat } from "lucide-react";

export function DailyAmountPanel() {
  const { activeGroup, groups, updateGroups } = useDashboard();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const amount = dailyAmount(activeGroup);
  const today = new Date().toLocaleDateString("en-CA");
  const recordedToday = activeGroup.deposits.some(
    (deposit) =>
      deposit.kind &&
      new Date(deposit.date).toLocaleDateString("en-CA") === today,
  );

  return (
    <>
      <section className="subscription-strip flex items-center justify-between flex-wrap gap-5 p-5 my-5 rounded border border-[#ebebeb] bg-[#fcfcff] transition-colors">
        <div className="subscription-price flex items-center gap-3.5">
          <span className="subscription-mark w-10 h-10 rounded-full grid place-items-center bg-[#eeedff] text-[#6b62aa] text-xl font-mono">
            <Repeat className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279]">
              DZIENNA KWOTA GRUPY
            </span>
            <strong className="text-2xl font-semibold tracking-tight text-[#010120]">
              {money(amount)}{" "}
              <span className="text-xs font-normal text-[#727279] tracking-normal">
                / osoba
              </span>
            </strong>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="eyebrow muted text-[9px] font-mono tracking-wider uppercase text-[#727279]">
            Miesięcznie{" "}
          </span>
          <strong className="text-2xl font-semibold tracking-tight text-[#010120]">
            {money(amount * 30)}
            <span className="text-xs font-normal text-[#727279] tracking-normal">
              / osoba
            </span>
          </strong>
        </div>

        <button
          type="button"
          className="outline border border-[#ebebeb] bg-white text-[#010120] hover:bg-[#f6f6fa] rounded px-4 py-2.5 text-xs font-mono tracking-wider uppercase flex items-center justify-between gap-4 cursor-pointer transition-all"
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
        >
          SZCZEGÓŁY KWOTY <ArrowUpRightFromCircle className="size-4" />
        </button>
      </section>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        ariaLabel="Dzienna kwota grupy"
        eyebrow="WASZE ZASADY"
        title={`${money(amount)} dziennie`}
        className="group-modal max-h-[90vh] overflow-y-auto"
      >
        <p className="text-xs leading-relaxed text-[#727279] mb-5">
          To dzienna kwota ustalona dla tej grupy przez jej twórcę, nie
          abonament za aplikację. Każdy członek ma tę samą stawkę.
        </p>

        <div className="plan-summary grid grid-cols-2 gap-3.5 p-5 bg-[#f6f5fc] rounded mb-5 text-xs">
          <span className="text-[#727279]">Grupa</span>
          <strong className="text-right font-semibold text-[#010120]">
            {activeGroup.name}
          </strong>

          <span className="text-[#727279]">Za osobę / dzień</span>
          <strong className="text-right font-semibold text-[#010120]">
            {money(amount)}
          </strong>

          <span className="text-[#727279]">Za osobę / 30 dni</span>
          <strong className="text-right font-semibold text-[#010120]">
            {money(amount * 30)}
          </strong>
        </div>
      </Modal>
    </>
  );
}

export default DailyAmountPanel;
