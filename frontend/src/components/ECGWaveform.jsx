import React, { useRef, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, ShieldAlert, Waves, Radio } from 'lucide-react';
import StatusPill from './ui/StatusPill';

export default function ECGWaveform({ heartRate = 75, isAlert = false, soundEnabled = false }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const safeHeartRate = Math.max(40, Math.min(180, Number(heartRate) || 75));

  // Refs para que el bucle de dibujo no se reinicie con cada lectura de telemetría.
  const heartRateRef = useRef(safeHeartRate);
  const alertRef = useRef(isAlert);
  const soundRef = useRef(soundEnabled);

  useEffect(() => {
    heartRateRef.current = safeHeartRate;
  }, [safeHeartRate]);

  useEffect(() => {
    alertRef.current = isAlert;
  }, [isAlert]);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  // Sintetizador de pulso cardíaco (Web Audio API)
  const playHeartbeatBeep = (activeAlert, soundOn) => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(activeAlert ? 880 : 560, ctx.currentTime);
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
    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight || 168;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let x = 0;
    let lastY = height / 2;
    let cyclePhase = 0;
    let lastBeepTime = 0;

    const drawGrid = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Cuadrícula fina (0.04 s / 0.1 mV) — Clean Orbit
      ctx.strokeStyle = 'rgba(201, 217, 245, 0.5)';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < width; gx += 8) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 8) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Cuadrícula mayor (0.20 s / 0.5 mV) — Clean Orbit
      ctx.strokeStyle = '#C9D9F5';
      ctx.lineWidth = 0.75;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Baseline
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    drawGrid();

    // Modelo P-Q-R-S-T
    const getECGValue = (phase) => {
      if (phase < 0.12) return 0;
      if (phase < 0.20) return Math.sin(((phase - 0.12) / 0.08) * Math.PI) * 0.14;
      if (phase < 0.28) return 0;
      if (phase < 0.32) return -((phase - 0.28) / 0.04) * 0.22;
      if (phase < 0.38) return ((phase - 0.32) / 0.06) * 1.35 - 0.22;
      if (phase < 0.44) return 1.13 - ((phase - 0.38) / 0.06) * 1.45;
      if (phase < 0.50) return -0.32 + ((phase - 0.44) / 0.06) * 0.32;
      if (phase < 0.65) return 0;
      if (phase < 0.85) return Math.sin(((phase - 0.65) / 0.2) * Math.PI) * 0.28;
      return 0;
    };

    const render = (time) => {
      const activeAlert = alertRef.current;
      const beatsPerSecond = heartRateRef.current / 60;
      const speed = 2.2;
      const step = 0.015 * (beatsPerSecond / 1.25);
      cyclePhase = (cyclePhase + step) % 1;

      if (cyclePhase > 0.33 && cyclePhase < 0.38 && time - lastBeepTime > 400) {
        playHeartbeatBeep(activeAlert, soundRef.current);
        lastBeepTime = time;
      }

      // Haz de barrido: limpia y redibuja la cuadrícula local
      const scanBarWidth = 26;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, 0, scanBarWidth, height);

      ctx.strokeStyle = 'rgba(201, 217, 245, 0.5)';
      ctx.lineWidth = 0.5;
      for (let gx = Math.floor(x / 8) * 8; gx <= x + scanBarWidth; gx += 8) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 8) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + scanBarWidth, gy);
        ctx.stroke();
      }

      // Barrido limpio Clean Orbit
      const sweep = ctx.createLinearGradient(x, 0, x + scanBarWidth, 0);
      sweep.addColorStop(0, 'rgba(29, 78, 216, 0)');
      sweep.addColorStop(0.75, 'rgba(29, 78, 216, 0.04)');
      sweep.addColorStop(1, 'rgba(29, 78, 216, 0.12)');
      ctx.fillStyle = sweep;
      ctx.fillRect(x, 0, scanBarWidth, height);

      const ecgVal = getECGValue(cyclePhase);
      const newY = height / 2 - ecgVal * (height * 0.46);
      const stroke = activeAlert ? '#E11D48' : '#1D4ED8';

      ctx.beginPath();
      ctx.moveTo(x, lastY);
      ctx.lineTo(x + speed, newY);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 0;
      ctx.stroke();

      lastY = newY;
      x += speed;

      if (x >= width) {
        x = 0;
        lastY = height / 2;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-[#C9D9F5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-7 w-7 items-center justify-center rounded-md border ${isAlert ? 'border-[#FECDD3] bg-[#FFF5F6] text-[#E11D48]' : 'border-[#C9D9F5] bg-[#DBEAFE] text-[#1D4ED8]'}`}>
            <Activity className={`h-3.5 w-3.5 ${isAlert ? 'animate-pulse' : ''}`} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow block">CONTINUOUS TELEMETRY / LEAD II</span>
            <h3 className="font-heading text-[13px] font-bold text-[#1D4ED8]">
              Osciloscopio electrocardiográfico
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="pill">25 mm/s</span>
          <span className="pill">10 mm/mV</span>
          <span className="pill">0.05–150 Hz</span>
          <StatusPill status={isAlert ? 'emergency' : 'nominal'}>
            {isAlert ? 'ARRITMIA / ALERTA' : 'RITMO SINUSAL'}
          </StatusPill>
        </div>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="relative overflow-hidden rounded-md border border-[#C9D9F5] bg-white shadow-co-sm">
          <div className="relative h-[172px] w-full sm:h-[188px]">
            <canvas ref={canvasRef} className="block h-full w-full" aria-label="Onda ECG continua Lead II" role="img" />

            <div className="pointer-events-none absolute left-2.5 top-2 flex items-center gap-2">
              <span className="mono rounded border border-[#C9D9F5] bg-[#DBEAFE] px-1.5 py-0.5 text-[8px] font-bold tracking-widest text-[#1D4ED8]">
                LEAD II
              </span>
              <span className="mono text-[8px] tracking-widest text-[#47598A]">P-Q-R-S-T</span>
            </div>

            <div className="pointer-events-none absolute bottom-2 left-2.5 flex items-center gap-2 font-mono text-[8px] text-[#47598A]">
              <span>25 mm/s</span>
              <span className="h-2 w-px bg-[#C9D9F5]" />
              <span>10 mm/mV</span>
            </div>

            <div className="pointer-events-none absolute right-2.5 top-2 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isAlert ? 'bg-[#E11D48]' : 'bg-[#1D4ED8]'} animate-pulse`} />
              <span className={`mono text-[8px] font-bold tracking-widest ${isAlert ? 'text-[#E11D48]' : 'text-[#1D4ED8]'}`}>
                LIVE
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          <div className="panel-inset flex items-center justify-between gap-2 px-2.5 py-2">
            <div>
              <span className="eyebrow block">HEART RATE</span>
              <span className="value-md text-[#0B1B3A]">{safeHeartRate}</span>
            </div>
            <span className="mono text-[9px] text-[#47598A]">BPM</span>
          </div>

          <div className="panel-inset flex items-center justify-between gap-2 px-2.5 py-2">
            <div>
              <span className="eyebrow block">RHYTHM</span>
              <span className={`mono text-[10px] font-bold ${isAlert ? 'text-[#E11D48]' : 'text-[#047857]'}`}>
                {isAlert ? 'IRREGULAR' : 'SINUS'}
              </span>
            </div>
            {isAlert ? (
              <ShieldAlert className="h-3.5 w-3.5 text-[#E11D48]" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#047857]" aria-hidden="true" />
            )}
          </div>

          <div className="panel-inset flex items-center justify-between gap-2 px-2.5 py-2">
            <div>
              <span className="eyebrow block">SIGNAL</span>
              <span className="mono text-[10px] font-bold text-[#1D4ED8]">2.1 kΩ</span>
            </div>
            <Waves className="h-3.5 w-3.5 text-[#0EA5E9]" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C9D9F5] px-4 py-2 font-mono text-[9px] text-[#47598A]">
        <span className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-[#1D4ED8]" aria-hidden="true" />
          FILTRO DIGITAL ACTIVO · 250 Hz
        </span>
        <span className="flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-[#047857]" aria-hidden="true" />
          ELECTRODO L-II · IMPEDANCIA NOMINAL
        </span>
      </div>
    </section>
  );
}
