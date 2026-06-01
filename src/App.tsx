/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { 
  Activity, BarChart3, Settings as SettingsIcon, Signal, Hash, Server, 
  CheckCircle2, XCircle, AlertTriangle, AlertCircle, Clock
} from 'lucide-react';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // States
  const [health, setHealth] = useState({ backend: 'LOADING' });
  const [connections, setConnections] = useState<any>({
    firebase: 'LOADING', twelvedata: 'LOADING', gemini: 'LOADING', telegram: 'LOADING'
  });
  const [latestSignal, setLatestSignal] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 1. Fetch Backend System Health
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => setHealth({ backend: data.data.status }))
      .catch(() => setHealth({ backend: 'OFFLINE' }));

    // 2. Fetch Connection Test
    fetch('/api/test_connection')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setConnections(data.data);
        }
      })
      .catch(() => {});

    // 3. Fetch Latest Signal
    fetch('/api/latest-signal')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setLatestSignal(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour12: false });
  const formattedDate = currentTime.toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar' });

  const getStatusIcon = (status: string) => {
    if (status === 'ONLINE' || status === 'CONFIGURED') return <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />;
    if (status === 'LOADING') return <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FFB300] border-t-transparent animate-spin" />;
    return <XCircle className="w-3.5 h-3.5 text-[#FF3D57]" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'ONLINE' || status === 'CONFIGURED') return "text-[#00C853]";
    if (status === 'LOADING') return "text-[#FFB300]";
    return "text-[#FF3D57]";
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col font-sans pb-20">
      <header className="sticky top-0 z-50 bg-[#070B14] border-b border-[#1E293B] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#111827] flex items-center justify-center border border-[#1E293B]">
            <Activity className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white leading-none">XAUUSD SYSTEM</h1>
            <p className="text-[11px] text-[#94A3B8] font-medium mt-1">SMC ENGINE V2.0</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[14px] font-semibold font-mono tracking-tight">{formattedTime}</div>
          <div className="text-[11px] text-[#94A3B8] font-medium">{formattedDate} WITA</div>
        </div>
      </header>

      {health.backend === 'OFFLINE' && (
        <div className="mx-4 mt-4 bg-[#FF3D57]/10 border border-[#FF3D57]/20 rounded-xl p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#FF3D57] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[12px] font-bold text-[#FF3D57] uppercase tracking-wider">Backend Offline</h4>
            <p className="text-[12px] text-[#FF3D57]/80 mt-1">API Services unavailable. Please wait while reconnecting.</p>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <main className="flex-1 px-4 py-4 space-y-4">
          
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-widest mb-2">System Health</div>
              <div className="flex items-center gap-2">
                {health.backend === 'ONLINE' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                ) : health.backend === 'LOADING' ? (
                  <Clock className="w-4 h-4 text-[#FFB300]" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#FF3D57]" />
                )}
                <span className={`text-[16px] font-bold tracking-tight ${getStatusColor(health.backend)}`}>
                  {health.backend}
                </span>
              </div>
            </div>
            
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-widest mb-2">Trading Mode</div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#29B6F6]" />
                <span className="text-[16px] font-bold tracking-tight">SCALPING</span>
              </div>
            </div>

            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-widest mb-2">Killzone</div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FFB300]" />
                <span className="text-[16px] font-bold tracking-tight">WAITING</span>
              </div>
            </div>

            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-3">
              <div className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-widest mb-2">Market Session</div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[16px] font-bold tracking-tight">AUTO</span>
              </div>
            </div>
          </section>

          <section className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
            <div className="px-3 py-2.5 border-b border-[#1E293B] bg-[#0F172A] flex justify-between items-center">
              <h2 className="text-[13px] font-semibold">LATEST SIGNAL</h2>
              {latestSignal && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  latestSignal.type === 'BUY' ? 'bg-[#00C853]/20 text-[#00C853]' : 'bg-[#FF3D57]/20 text-[#FF3D57]'
                }`}>
                  {latestSignal.type} | {latestSignal.mode}
                </span>
              )}
            </div>

            {latestSignal ? (
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-end border-b border-[#1E293B] pb-3">
                  <div>
                    <div className="text-[11px] text-[#94A3B8] font-medium mb-1">ENTRY PRICE</div>
                    <div className="text-[24px] font-bold font-mono tracking-tight">{latestSignal.entry}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#94A3B8] font-medium mb-1">CONFIDENCE</div>
                    <div className="text-[16px] font-bold text-[#D4AF37]">{latestSignal.confidence}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0F172A] rounded p-2 text-center border border-[#1E293B]">
                    <div className="text-[10px] text-[#94A3B8] mb-1">STOP LOSS</div>
                    <div className="text-[13px] font-mono font-bold text-[#FF3D57]">{latestSignal.sl}</div>
                  </div>
                  <div className="bg-[#0F172A] rounded p-2 text-center border border-[#1E293B]">
                    <div className="text-[10px] text-[#94A3B8] mb-1">TP 1</div>
                    <div className="text-[13px] font-mono font-bold text-[#00C853]">{latestSignal.tp1}</div>
                  </div>
                  <div className="bg-[#0F172A] rounded p-2 text-center border border-[#1E293B]">
                    <div className="text-[10px] text-[#94A3B8] mb-1">TP 2</div>
                    <div className="text-[13px] font-mono font-bold text-[#00C853]">{latestSignal.tp2}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[140px] flex flex-col items-center justify-center text-center p-4">
                <Signal className="w-8 h-8 text-[#1E293B] mb-3" />
                <div className="text-[13px] font-medium text-[#94A3B8]">No Recent Signals</div>
                <div className="text-[12px] text-[#1E293B] mt-1">Waiting for market condition alignment</div>
                <Button className="mt-3 h-8 text-[12px] px-3">Force Scan</Button>
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-[13px] font-semibold text-[#94A3B8] px-1 uppercase tracking-wider">Connections</h2>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden divide-y divide-[#1E293B]">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-[13px] font-medium">Firestore Database</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(connections.firebase)}
                  <span className={`text-[11px] font-semibold ${getStatusColor(connections.firebase)}`}>{connections.firebase}</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-[13px] font-medium">TwelveData (Market)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(connections.twelvedata)}
                  <span className={`text-[11px] font-semibold ${getStatusColor(connections.twelvedata)}`}>{connections.twelvedata}</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-[13px] font-medium">Gemini AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                   {getStatusIcon(connections.gemini)}
                  <span className={`text-[11px] font-semibold ${getStatusColor(connections.gemini)}`}>{connections.gemini}</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-[13px] font-medium">Telegram Bot</span>
                </div>
                <div className="flex items-center gap-1.5">
                   {getStatusIcon(connections.telegram)}
                  <span className={`text-[11px] font-semibold ${getStatusColor(connections.telegram)}`}>{connections.telegram}</span>
                </div>
              </div>
            </div>
          </section>

        </main>
      )}

      {activeTab !== 'dashboard' && (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Activity className="w-12 h-12 text-[#1E293B] mb-4" />
          <h2 className="text-[16px] font-bold text-white mb-2">{activeTab.toUpperCase()}</h2>
          <p className="text-[13px] text-[#94A3B8]">This module is currently in standby mode matching data feed sync protocols.</p>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#070B14] border-t border-[#1E293B] flex justify-around items-center px-2 py-2 pb-safe">
        {[
          { id: 'dashboard', icon: Activity, label: 'Dashboard' },
          { id: 'scanner', icon: Hash, label: 'Scanner' },
          { id: 'signals', icon: Signal, label: 'Signals' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'settings', icon: SettingsIcon, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-16 p-1 relative ${
              activeTab === tab.id ? 'text-[#D4AF37]' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
            )}
            <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'mt-1' : 'mt-1'}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
