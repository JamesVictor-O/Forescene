
import { Zap, TrendingUp } from 'lucide-react';

export default function RightSidebar() {
  return (
    <aside className="fixed right-0 w-80 h-screen bg-zinc-950 border-l border-zinc-800 hidden xl:block overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-cyan-500" />
            Trending Predictors
          </h3>
          <div className="space-y-3">
            <TrendingUser name="CryptoKing" score={1250} accuracy={92} />
            <TrendingUser name="SportsGuru" score={1180} accuracy={89} />
            <TrendingUser name="MarketMaven" score={1045} accuracy={85} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-cyan-500" />
            Hot Right Now
          </h3>
          <div className="space-y-3">
            <HotPrediction text="ETH breaks $5K in Q1 2025" backers={456} odds="1.9x" />
            <HotPrediction text="Tesla hits $500 by June" backers={389} odds="2.4x" />
            <HotPrediction text="Messi joins MLS team" backers={312} odds="3.2x" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-xs">
            <Activity user="SportsOracle" action="won" amount="150 FORE" time="2h ago" />
            <Activity user="CryptoSage" action="backed" amount="50 FORE" time="4h ago" />
            <Activity user="TechVision" action="created" amount="new prediction" time="6h ago" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function TrendingUser({ name, score, accuracy }: { name: string; score: number; accuracy: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-cyan-500 text-zinc-950 font-bold text-sm flex items-center justify-center">
          {name.slice(0, 2)}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-zinc-500">{accuracy}% accuracy</div>
        </div>
      </div>
      <div className="text-sm font-bold text-cyan-500">{score}</div>
    </div>
  );
}

function HotPrediction({ text, backers, odds }: { text: string; backers: number; odds: string }) {
  return (
    <div className="p-3 bg-zinc-900 border border-zinc-800">
      <p className="text-sm mb-2">{text}</p>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{backers} backers</span>
        <span className="text-cyan-500 font-semibold">{odds}</span>
      </div>
    </div>
  );
}

function Activity({ user, action, amount, time }: { user: string; action: string; amount: string; time: string }) {
  return (
    <div className="flex items-center justify-between text-zinc-500">
      <div>
        <span className="text-white font-semibold">{user}</span> {action} <span className="text-cyan-500">{amount}</span>
      </div>
      <span>{time}</span>
    </div>
  );
}


