import { MapPin, Info, Navigation, Heart } from "lucide-react";
import { motion } from "motion/react";

const MOCK_FOOD_BANKS = [
    { id: 1, name: "City Relief Center", address: "123 Hope St", distance: "0.8m", lat: 40.7128, lng: -74.0060 },
    { id: 2, name: "Green Earth Pantry", address: "55 Market Ave", distance: "1.2m", lat: 40.7150, lng: -74.0080 },
    { id: 3, name: "Community Kitchen", address: "90 Union Sq", distance: "2.5m", lat: 40.7180, lng: -74.0010 },
];

export default function DonationMap() {
  return (
    <div className="p-6 pb-24 space-y-8 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Charity Map</h1>
          <p className="text-text-dim text-sm font-medium">Don't waste, donate.</p>
        </div>
        <div className="w-12 h-12 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center backdrop-blur-md">
            <Heart className="text-danger w-6 h-6 fill-danger/20" />
        </div>
      </header>

      {/* Map Container */}
      <div className="relative flex-1 bg-black/40 rounded-[40px] overflow-hidden border border-glass-border shadow-2xl group">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/800/800')] opacity-10 contrast-150 grayscale invert" />
          
          <div className="absolute inset-0 p-8 pt-12">
            {MOCK_FOOD_BANKS.map((bank, i) => (
                <motion.div 
                    key={bank.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="absolute"
                    style={{ 
                        top: `${20 + (i * 20)}%`, 
                        left: `${15 + (i * 25)}%` 
                    }}
                >
                    <div className="relative group/pin">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-xl text-[10px] font-black text-primary whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity uppercase tracking-widest">
                            {bank.name}
                        </div>
                        <MapPin className="w-8 h-8 text-primary fill-black/20 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] cursor-pointer hover:scale-125 transition-transform" />
                    </div>
                </motion.div>
            ))}
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button className="bg-white/10 p-3 rounded-2xl border border-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all">
                <Navigation className="w-5 h-5" />
            </button>
            <button className="bg-primary p-3 rounded-2xl shadow-lg text-black hover:brightness-110 transition-all">
                <Info className="w-5 h-5" />
            </button>
          </div>
      </div>

      {/* Info Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x pr-12 scrollbar-none">
        {MOCK_FOOD_BANKS.map((bank) => (
            <div key={bank.id} className="min-w-[280px] glass p-5 rounded-[32px] snap-center shadow-xl">
                <h3 className="font-bold text-white text-lg">{bank.name}</h3>
                <p className="text-sm text-text-dim mb-4 font-medium">{bank.address}</p>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {bank.distance} away
                    </span>
                    <button className="text-white bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Directions
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
