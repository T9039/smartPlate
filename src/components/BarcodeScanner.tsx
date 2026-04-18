import { useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { motion } from "motion/react";

export default function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const mockScan = async () => {
    setLoading(true);
    // Simulated behavior for web prototype
    // This mocks fetching from Open Food Facts API
    setTimeout(async () => {
      // Example barcode: 3017620422003 (Nutella)
      const res = await fetch("https://world.openfoodfacts.org/api/v0/product/3017620422003.json");
      const data = await res.json();
      setScanResult(data.product);
      setLoading(false);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="p-6 pb-24 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Scan Barcode</h1>
      </header>

      {/* Simulator Frame */}
      <div className="relative aspect-[3/4] bg-black/40 border border-glass-border rounded-[40px] overflow-hidden flex items-center justify-center group backdrop-blur-3xl shadow-2xl">
        {!isScanning ? (
          <div className="text-center p-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <p className="text-text-dim mb-8 max-w-[200px] mx-auto text-sm font-medium">
                Point your camera at a barcode to automatically add items.
            </p>
            <button 
                onClick={() => { setIsScanning(true); mockScan(); }}
                className="bg-primary text-black px-10 py-5 rounded-full font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
              Start Simulator
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-64 h-32 border-2 border-primary/40 rounded-3xl relative overflow-hidden backdrop-blur-sm">
                <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_20px_rgba(74,222,128,1)]"
                />
            </div>
            <p className="text-primary font-black mt-8 text-[10px] tracking-[0.3em] uppercase animate-pulse">
                {loading ? "Analyzing Data..." : "Aligning Barcode..."}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {scanResult && (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass p-6 rounded-[40px] relative shadow-2xl"
        >
            <button 
                onClick={() => setScanResult(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full border border-white/10"
            >
                <X className="w-4 h-4 text-text-dim" />
            </button>
            <div className="flex gap-4 mb-6">
                <img 
                    src={scanResult.image_url || "https://picsum.photos/seed/food/200/200"} 
                    alt={scanResult.product_name}
                    className="w-20 h-20 object-contain rounded-2xl bg-white/5 p-2"
                />
                <div>
                    <h3 className="font-bold text-white text-lg">{scanResult.product_name}</h3>
                    <p className="text-text-dim text-xs font-medium uppercase tracking-wider">{scanResult.brands}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest">
                            Grade {scanResult.nutrition_grades?.toUpperCase() || "A"}
                        </span>
                    </div>
                </div>
            </div>
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest text-xs">
                <RefreshCw className="w-4 h-4" /> Add to Inventory
            </button>
        </motion.div>
      )}

      {/* Instruction Note */}
      <div className="bg-white/5 p-6 rounded-3xl border border-dashed border-white/10 shadow-inner">
          <p className="text-[10px] text-text-dim leading-relaxed uppercase font-bold tracking-widest">
              <span className="text-primary opacity-100">Sim Disclaimer:</span> In the physical mobile app, this uses React Native's Expo Camera. In this prototype, we mock data from Open Food Facts API.
          </p>
      </div>
    </div>
  );
}
