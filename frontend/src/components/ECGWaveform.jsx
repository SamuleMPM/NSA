import React, { useRef, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ECGWaveform({ heartRate = 75, isAlert = false, soundEnabled = false }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Generador de tono sintetizado para pulso cardíaco (Web Audio API)
  const playHeartbeatBeep = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAlert ? 880 : 560, ctx.currentTime);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // AudioContext no autorizado o no interactuado
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 110);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 110;
    };
    window.addEventListener('resize', handleResize);

    let x = 0;
    let lastY = height / 2;
    let cyclePhase = 0;
    let lastBeepTime = 0;

    // Cuadrícula de calibración médica ECG (25mm/s - 10mm/mV)
    const drawGrid = () => {
      ctx.fillStyle = '#060A14';
      ctx.fillRect(0, 0, width, height);

      // Cuadrícula fina (cada 10px)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < width; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Cuadrícula mayor (cada 50px)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 50) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 50) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    };

    drawGrid();

    // Modelo de forma de onda P-Q-R-S-T
    const getECGValue = (phase) => {
      if (phase < 0.12) return 0; // Línea base
      if (phase < 0.20) return Math.sin((phase - 0.12) / 0.08 * Math.PI) * 0.14; // Onda P
      if (phase < 0.28) return 0; // Segmento PR
      if (phase < 0.32) return -((phase - 0.28) / 0.04) * 0.22; // Onda Q
      if (phase < 0.38) return ((phase - 0.32) / 0.06) * 1.35 - 0.22; // Onda R
      if (phase < 0.44) return 1.13 - ((phase - 0.38) / 0.06) * 1.45; // Onda S
      if (phase < 0.50) return -0.32 + ((phase - 0.44) / 0.06) * 0.32; // Retorno a baseline
      if (phase < 0.65) return 0; // Segmento ST
      if (phase < 0.85) return Math.sin((phase - 0.65) / 0.2 * Math.PI) * 0.28; // Onda T
      return 0; // Línea base
    };

    const render = (time) => {
      const beatsPerSecond = Math.max(40, Math.min(180, heartRate)) / 60;
      const speed = 2.2;

      const step = 0.015 * (beatsPerSecond / 1.25);
      cyclePhase = (cyclePhase + step) % 1;

      // Disparo de beep en el complejo QRS
      if (cyclePhase > 0.33 && cyclePhase < 0.38 && time - lastBeepTime > 400) {
        playHeartbeatBeep();
        lastBeepTime = time;
      }

      // Franja de barrido de fósforo
      const scanBarWidth = 14;
      ctx.fillStyle = '#060A14';
      ctx.fillRect(x, 0, scanBarWidth, height);

      // Re-dibujar cuadrícula en la zona de borrado
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 0.5;
      for (let gx = Math.floor(x / 10) * 10; gx <= x + scanBarWidth; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + scanBarWidth, gy);
        ctx.stroke();
      }

      const ecgVal = getECGValue(cyclePhase);
      const midY = height / 2;
      const newY = midY - ecgVal * (height * 0.40);

      // Trazo de la onda
      ctx.beginPath();
      ctx.moveTo(x, lastY);
      ctx.lineTo(x + speed, newY);
      ctx.strokeStyle = isAlert ? '#EF4444' : '#00E5FF';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = isAlert ? 'rgba(239, 68, 68, 0.7)' : 'rgba(0, 229, 255, 0.7)';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      lastY = newY;
      x += speed;

      if (x >= width) {
        x = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [heartRate, isAlert, soundEnabled]);

  return (
    <div className="hud-panel p-3 rounded-lg border border-space-700/80">
      
      {/* Header del Osciloscopio */}
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-space-700/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${isAlert ? "text-telemetry-crimson animate-pulse" : "text-telemetry-cyan"}`} />
          <span className="font-heading font-semibold text-xs tracking-wider text-slate-200 uppercase">
            OSCILOSCOPIO // ECG CONTINUO (LEAD II)
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-space-850 text-slate-400 border border-space-700">
            25 mm/s • 10 mm/mV • 0.05-150Hz
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:inline">RITMO SINUSAL:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
            isAlert 
              ? "bg-red-950/80 text-telemetry-crimson border border-red-500/60 animate-pulse shadow-hud-danger" 
              : "bg-emerald-950/40 text-telemetry-green border border-emerald-500/40"
          }`}>
            <Zap className="w-3 h-3" /> {heartRate} BPM
          </span>
        </div>
      </div>

      {/* Pantalla del Osciloscopio */}
      <div className="relative w-full h-[110px] rounded overflow-hidden border border-space-700 bg-[#060A14]">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#060A14] to-transparent pointer-events-none" />
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
        <span>SISTEMA DE FILTRADO DIGITAL: ACTIVO</span>
        <span>DERIVACIÓN: L-II // IMPEDANCIA ELECTRODO: 2.1 kΩ (NOMINAL)</span>
      </div>

    </div>
  );
}
