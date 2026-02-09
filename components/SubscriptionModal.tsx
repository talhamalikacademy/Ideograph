import React from 'react';
import { X, Check, Zap, Crown, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { UserPlan } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: UserPlan;
  onUpgrade: () => void;
  isDarkMode: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpgrade,
  isDarkMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={clsx(
        "w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto",
        isDarkMode ? "bg-[#0f172a] text-white border border-white/10" : "bg-white text-slate-900"
      )}>
        
        {/* Free Tier */}
        <div className="flex-1 p-8 flex flex-col relative">
           <div className="absolute top-4 right-4">
                <button onClick={onClose} className="md:hidden p-2 bg-black/10 rounded-full">
                    <X size={20} />
                </button>
           </div>
           <h3 className="text-xl font-bold opacity-60 uppercase tracking-widest mb-2">Starter</h3>
           <div className="text-4xl font-bold mb-6">Free</div>
           <p className="text-sm opacity-70 mb-8 h-10">Perfect for trying out the power of viral scripting.</p>

           <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm">
                    <Check size={18} className="text-green-500" /> 3 Scripts per day
                </li>
                <li className="flex items-center gap-3 text-sm">
                    <Check size={18} className="text-green-500" /> Basic Creator Styles
                </li>
                 <li className="flex items-center gap-3 text-sm opacity-50">
                    <X size={18} /> Advanced Boost Analytics
                </li>
                <li className="flex items-center gap-3 text-sm opacity-50">
                    <X size={18} /> Unlimited Transformations
                </li>
           </ul>

           <button 
             onClick={onClose}
             className={clsx(
                "w-full py-3 rounded-xl font-bold text-sm border-2 transition-colors",
                currentPlan === 'free' 
                    ? (isDarkMode ? "border-white/20 bg-white/5 cursor-default" : "border-slate-200 bg-slate-50")
                    : "border-transparent text-opacity-50"
             )}
             disabled={currentPlan === 'free'}
           >
                {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
           </button>
        </div>

        {/* Pro Tier */}
        <div className="flex-1 p-8 flex flex-col relative overflow-hidden text-white">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 z-0"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                            <Crown size={12} className="fill-current" /> Most Popular
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Pro Creator</h3>
                    </div>
                    <button onClick={onClose} className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-white" />
                    </button>
                </div>
                
                <div className="text-4xl font-bold mb-6 flex items-baseline gap-2">
                    $19 <span className="text-lg font-medium opacity-70">/mo</span>
                </div>
                <p className="text-sm opacity-90 mb-8 h-10">Unleash full viral potential with unlimited access.</p>

                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm font-medium">
                        <div className="p-1 bg-white/20 rounded-full"><Zap size={12} className="fill-white" /></div>
                        Unlimited Scripts
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                        <div className="p-1 bg-white/20 rounded-full"><Check size={12} /></div>
                        All Premium Personas
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                        <div className="p-1 bg-white/20 rounded-full"><Sparkles size={12} /></div>
                        Deep Psychological Audit
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                        <div className="p-1 bg-white/20 rounded-full"><Check size={12} /></div>
                        Priority Gemini 1.5 Pro Processing
                    </li>
                </ul>

                <button 
                    onClick={onUpgrade}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    {currentPlan === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro'} <Zap size={16} className="fill-current" />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionModal;