import React, { useEffect, useId, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

export function DotGrid({ className = '', dotSize = 2, gap = 24, baseColor = '#29352a', activeColor = '#A3E635' }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const buildGrid = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cell = dotSize + gap;
      const columns = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;
      dotsRef.current = Array.from({ length: columns * rows }, (_, index) => ({
        x: (index % columns) * cell,
        y: Math.floor(index / columns) * cell
      }));
    };

    const draw = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      const pointer = pointerRef.current;
      context.clearRect(0, 0, width, height);
      dotsRef.current.forEach(({ x, y }) => {
        const distance = Math.hypot(x - pointer.x, y - pointer.y);
        const intensity = Math.max(0, 1 - distance / 140);
        context.fillStyle = intensity ? activeColor : baseColor;
        context.globalAlpha = 0.2 + intensity * 0.7;
        context.beginPath();
        context.arc(x, y, dotSize / 2 + intensity * 0.8, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      return requestAnimationFrame(draw);
    };

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onPointerLeave = () => { pointerRef.current = { x: -1000, y: -1000 }; };
    buildGrid();
    const animationFrame = draw();
    const observer = new ResizeObserver(buildGrid);
    observer.observe(wrapper);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [activeColor, baseColor, dotSize, gap]);

  return <div ref={wrapperRef} className={`rb-dot-grid ${className}`}><canvas ref={canvasRef} /></div>;
}

export function GlassSurface({ children, className = '', style = {} }) {
  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${uniqueId}`;
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const updateMap = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !imageRef.current) return;
      const radius = Math.min(rect.width, rect.height) * 0.06;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rect.width} ${rect.height}"><defs><linearGradient id="red" x1="1" x2="0"><stop stop-color="transparent"/><stop offset="1" stop-color="red"/></linearGradient><linearGradient id="blue" y2="1"><stop stop-color="transparent"/><stop offset="1" stop-color="blue"/></linearGradient></defs><rect width="100%" height="100%" fill="black"/><rect x="${radius}" y="${radius}" width="${Math.max(0, rect.width - radius * 2)}" height="${Math.max(0, rect.height - radius * 2)}" rx="${radius}" fill="white"/></svg>`;
      imageRef.current.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svg)}`);
    };
    updateMap();
    const observer = new ResizeObserver(updateMap);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`rb-glass-surface ${className}`} style={{ ...style, '--rb-filter': `url(#${filterId})` }}>
      <svg className="rb-glass-filter" aria-hidden="true"><defs><filter id={filterId}><feImage ref={imageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" /><feDisplacementMap in="SourceGraphic" in2="map" scale="-18" /></filter></defs></svg>
      <div className="rb-glass-content">{children}</div>
    </div>
  );
}

export function SpotlightCard({ children, className = '', spotlightColor = 'rgba(163, 230, 53, 0.16)' }) {
  const cardRef = useRef(null);
  const onMouseMove = (event) => {
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--rb-mouse-x', `${event.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--rb-mouse-y', `${event.clientY - rect.top}px`);
    cardRef.current.style.setProperty('--rb-spotlight', spotlightColor);
  };
  return <div ref={cardRef} onMouseMove={onMouseMove} className={`rb-spotlight-card ${className}`}>{children}</div>;
}

export function Counter({ value, suffix = '', className = '', duration = 700 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const target = Number.isFinite(Number(value)) ? Number(value) : null;
  useEffect(() => {
    if (target === null) return undefined;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);
      setDisplayValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);
  if (target === null) return <span className={className}>—</span>;
  return <span className={className}>{Math.round(displayValue).toLocaleString()}{suffix}</span>;
}

export function SimpleGraph({ data = [], dataKey, className = '' }) {
  const values = data.map((item) => Number(item[dataKey])).filter(Number.isFinite);
  if (!values.length) return <div className={`rb-simple-graph rb-simple-graph-empty ${className}`} />;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 88 - 6}`).join(' ');
  return <svg className={`rb-simple-graph ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}

export function GlideSelect({ value, onChange, options, label }) {
  return <label className="rb-glide-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

export function StatusMark({ status, className = '' }) {
  return <span className={`rb-status-mark rb-status-${String(status).toLowerCase()} ${className}`}><span aria-hidden="true" />{status}</span>;
}

export function BellToggle({ enabled, onChange }) {
  return <button type="button" aria-label={enabled ? 'Disable alerts' : 'Enable alerts'} aria-pressed={enabled} onClick={() => onChange(!enabled)} className={`rb-bell-toggle ${enabled ? 'is-on' : ''}`}><Bell className="rb-bell-icon" aria-hidden="true" /><span className="rb-bell-switch" /></button>;
}

export function LineSidebar({ children, className = '' }) {
  return <div className={`rb-line-sidebar ${className}`}><span className="rb-sidebar-rail" aria-hidden="true" /><span className="rb-sidebar-glow" aria-hidden="true" />{children}</div>;
}

export function AnimatedList({ items = [], renderItem, children, className = '' }) {
  const content = children ? React.Children.toArray(children) : items.map((item, index) => renderItem(item, index));
  const [visible, setVisible] = useState([]);
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setVisible((current) => current.includes(Number(entry.target.dataset.index)) ? current : [...current, Number(entry.target.dataset.index)]);
    }), { threshold: 0.1 });
    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [content.length]);
  return <div className={`rb-animated-list ${className}`}>{content.map((item, index) => <div key={item.key || index} ref={(node) => { refs.current[index] = node; }} data-index={index} className={visible.includes(index) ? 'is-visible' : ''}>{item}</div>)}</div>;
}

export function PillNav({ items, active, onChange }) {
  return <nav className="rb-pill-nav" aria-label="Forecast sections">{items.map((item) => <button type="button" key={item.id} className={active === item.id ? 'is-active' : ''} onClick={() => onChange(item.id)}>{item.label}</button>)}</nav>;
}

export function Preloader({ label = 'Loading' }) {
  return <div className="rb-preloader" role="status"><span className="rb-preloader-ring" /><span>{label}</span></div>;
}

export function ReflectiveCard({ children, className = '' }) {
  return <div className={`rb-reflective-card ${className}`}><svg className="rb-reflective-filter" aria-hidden="true"><defs><filter id="rb-metallic-displacement"><feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" /><feSpecularLighting in="noise" surfaceScale="12" specularConstant="1.2" specularExponent="20" lightingColor="#ffffff"><feDistantLight azimuth="225" elevation="55" /></feSpecularLighting></filter></defs></svg><div className="rb-reflective-noise" /><div className="rb-reflective-sheen" /><div className="rb-reflective-border" /><div className="rb-reflective-content">{children}</div></div>;
}