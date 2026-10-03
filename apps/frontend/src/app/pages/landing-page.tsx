import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Users,
  HeartHandshake,
  ArrowRight,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Lock,
  ArrowBigRightDash,
} from "lucide-react";
import HabitScene from "../components/common/HabitScene";
import Mockup from "../../assets/mockup.png";

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-slate-900 pb-8 lg:pb-12 gap-16 lg:gap-24">
      <section className="w-full relative h-[80vh] max-h-[800px] min-h-[550px] flex items-center justify-center overflow-hidden py-4">
        <div className="absolute inset-0 w-full h-full z-0 opacity-50 sm:opacity-70 lg:opacity-100 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300/20 rounded-full blur-3xl -z-10" />

          <div id="three-js-canvas-container" className="w-full h-full">
            <HabitScene />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center w-full">
            {/* LEWA KOLUMNA: Treść tekstu i przyciski */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-200 bg-white/80 backdrop-blur-md text-purple-700 text-[11px] font-mono tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Social Accountability & Real Stakes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-slate-900">
                Quit bad habits
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600">
                  Free if you succeed, charity if you fail
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Join a dedicated peer squad. Hold each other accountable, track
                daily compliance, and report lapses. Pledge a deposit — stick to
                your goals and pay $0
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-1 w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-purple-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join a Squad Now</span>
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3 border border-purple-200 bg-white/90 backdrop-blur-md hover:bg-purple-50 text-purple-900 rounded-md font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <span>Existing Member</span>
                  <ArrowRight className="w-4 h-4 text-purple-500" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-xs text-slate-500 font-mono mt-1">
                <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/50">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Card Required
                </span>
                <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/50">
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  Charity Stakes
                </span>
                <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  100% Free Guarantee
                </span>
              </div>
            </div>

            {/* PRAWA KOLUMNA: Obrazek PNG Mockupa */}
            <div className="lg:col-span-5 flex justify-center items-center w-full h-full">
              <div className="transform lg:-rotate-2 lg:rotate-y-6 hover:rotate-0 transition-transform duration-500 flex items-center justify-center">
                <img
                  src={Mockup}
                  alt="Mockup"
                  className="max-sm:hidden max-h-[60vh] lg:max-h-[65vh] w-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full rounded-2xl border border-purple-100 bg-white p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-purple-100 pb-4 mb-6 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 max-sm:w-full">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-mono text-purple-900 font-semibold uppercase tracking-wider ml-1">
              LIVE SQUAD MONITOR: "NO SUGAR SQUAD #04"
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
              Interactive Demo
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 font-medium">
              DAY 14 OF 30
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-800">
                Alex_M
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Streak: 14 Days • Pledge: $50
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked in with proof
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col gap-3 relative group">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-800">
                You (Sample Profile)
              </span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-medium">
                PENDING
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Streak: 14 Days • Pledge: $100
            </p>

            <Link
              to="/signup"
              className="w-full py-2 bg-purple-600 text-white rounded font-semibold text-xs hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
            >
              <span>Try It Yourself — Join Squad</span>
              <ArrowBigRightDash className="size-4" />
            </Link>
          </div>

          {/* Kartka 3: Dave_K */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-800">
                Dave_K
              </span>
              <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-medium">
                FLAGGED BY SQUAD
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Streak: Broken • Pledge: $50
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium mt-1">
              <HeartHandshake className="w-3.5 h-3.5" /> $50 Donated to UNICEF
            </div>
          </div>
        </div>
      </section>

      <section className="w-full flex flex-col gap-10">
        <div className="text-center flex flex-col gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 font-semibold">
            THE SYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How Social Commitment Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-mono text-sm font-semibold">
              01
            </div>
            <h3 className="font-semibold text-slate-800">Pledge Your Stake</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Add your credit card and select a deposit amount ($20–$500). No
              charge is made upfront.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-mono text-sm font-semibold">
              02
            </div>
            <h3 className="font-semibold text-slate-800">Join a Peer Squad</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Get matched with 3–5 peers targeting the exact same habit
              (quitting smoking, sugar, late nights).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono text-sm font-semibold">
              03
            </div>
            <h3 className="font-semibold text-slate-800">Report & Review</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Post daily proof. Squad members verify your compliance or flag
              unfulfilled promises.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-mono text-sm font-semibold">
              04
            </div>
            <h3 className="font-semibold text-slate-800">Succeed or Donate</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Complete the streak to pay $0. Slip up or quit? Your pledge goes
              straight to charity.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="p-6 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-500 font-semibold">
            PEER MONITORING
          </span>
          <h3 className="text-lg font-semibold text-slate-800">
            Active Squad Enforcement
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Teammates can vote to flag inactive members. Peer pressure becomes
            your strongest asset.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-500 font-semibold">
            CHARITY IMPACT
          </span>
          <h3 className="text-lg font-semibold text-slate-800">
            Loss Aversion with Purpose
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Loss aversion is 2x more motivating than rewards. If you fail, your
            penalty funds genuine social good.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-purple-100 bg-white shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-semibold">
            ZERO COST GUARANTEE
          </span>
          <h3 className="text-lg font-semibold text-slate-800">
            100% Free for Committed Users
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            We don't make money when you succeed. Our platform is completely
            free for those who stay true to their word.
          </p>
        </div>
      </section>

      <section className="w-full flex flex-col gap-6 max-w-3xl">
        <div className="text-center flex flex-col gap-1 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 font-semibold">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Everything You Need to Know
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            {
              q: "Why do I need to enter a credit card if the app is free?",
              a: "Without skin in the game, it's too easy to give up on day 3. We use your card to pre-authorize your chosen pledge amount. You are charged $0 as long as you stick to your goals.",
            },
            {
              q: "What happens if I break my habit or stop checking in?",
              a: "If you fail to submit daily proof or if your squad flags a rule breach, your pledged funds are automatically charged and sent to a charity of your choice (e.g., UNICEF, Red Cross).",
            },
            {
              q: "How does squad accountability work?",
              a: "You are placed in a 3-5 person squad. Members check each other's daily logs. If someone is inactive or cheating, squad members can initiate a group vote to flag the user.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-purple-100 rounded-xl bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-purple-50/50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-purple-500 transition-transform ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-500 leading-relaxed border-t border-purple-50 mt-2">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="w-full p-6 sm:p-8 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4 text-left max-sm:flex-col">
          <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-amber-300 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-200">
              Commitment Contract
            </span>
            <h2 className="text-lg sm:text-xl font-bold">
              Ready to take real responsibility?
            </h2>
            <p className="text-purple-100/80 text-xs leading-relaxed max-w-xl">
              Card validation takes less than a minute. Lock in your commitment,
              join a squad, and transform your habits today.
            </p>
          </div>
        </div>

        <Link
          to="/signup"
          className="px-6 py-3 bg-white hover:bg-purple-50 text-purple-950 rounded font-semibold text-xs tracking-tight transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-md"
        >
          <UserPlus className="w-3.5 h-3.5 text-purple-700" />
          <span>Commit & Join</span>
        </Link>
      </section>

      <footer className="w-full pt-8 pb-4 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-700 font-semibold leading-none">
            &copy; {new Date().getFullYear()} StaySober
          </span>
          <span className="text-purple-300 hidden sm:inline">•</span>
          <span className="text-slate-500 text-xs">
            Social Accountability Platform
          </span>
        </div>

        <div className="flex items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
          <Link to="/terms" className="hover:text-purple-700 transition-colors">
            Terms & Stakes Policy
          </Link>
          <Link
            to="/privacy"
            className="hover:text-purple-700 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
