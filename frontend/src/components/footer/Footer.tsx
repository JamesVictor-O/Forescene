import React from 'react';
import { Play } from 'lucide-react';

function Footer() {
  return (
    <footer className="py-12 px-4 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center">
                <Play className="w-5 h-5 text-zinc-950" fill="currentColor" />
              </div>
              <span className="text-xl font-bold">Forescene</span>
            </div>
            <p className="text-zinc-500 text-sm">
              Predict the Future.<br />Prove You Were Right.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <div className="space-y-2 text-sm text-zinc-500">
              <div>Features</div>
              <div>How It Works</div>
              <div>Roadmap</div>
              <div>Pricing</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <div className="space-y-2 text-sm text-zinc-500">
              <div>About</div>
              <div>Blog</div>
              <div>Careers</div>
              <div>Contact</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <div className="space-y-2 text-sm text-zinc-500">
              <div>Privacy</div>
              <div>Terms</div>
              <div>Security</div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 text-center text-zinc-500 text-sm">
          © 2025 Forescene. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
