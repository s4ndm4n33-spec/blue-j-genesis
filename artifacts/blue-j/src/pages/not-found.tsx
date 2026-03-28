import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="scanlines pointer-events-none" />
      <div className="hud-panel p-8 max-w-md w-full text-center relative z-10 flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 animate-pulse" />
        <h1 className="text-4xl font-display font-bold text-destructive glow-text mb-2 tracking-widest">404</h1>
        <h2 className="text-xl font-hud text-primary mb-6">SIGNAL LOST</h2>
        <p className="text-primary/70 font-mono text-sm mb-8">
          The sector you are trying to reach does not exist within the current matrix parameters.
        </p>
        <Link href="/" className="px-6 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary font-hud tracking-widest uppercase transition-all glow-border inline-block">
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
