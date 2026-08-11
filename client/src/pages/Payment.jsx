import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, ClipboardCheck, ArrowLeft, RefreshCw, CheckCircle2, IndianRupee, Landmark, History, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Payment = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'bank'
  const [upiId, setUpiId] = useState('vaseegrahveda@okaxis');
  const [upiName, setUpiName] = useState('Vaseegrah Veda Catering');
  const [amount, setAmount] = useState('120');
  const [bankName, setBankName] = useState('State Bank of India');
  const [bankAcc, setBankAcc] = useState('34567890123');
  const [bankIfsc, setBankIfsc] = useState('SBIN0001234');
  
  const [customAmount, setCustomAmount] = useState('120');
  const [isCopied, setIsCopied] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    // Load config from localStorage
    const savedUpiId = localStorage.getItem('payment_upiId') || 'vaseegrahveda@okaxis';
    const savedUpiName = localStorage.getItem('payment_upiName') || 'Vaseegrah Veda Catering';
    const savedAmount = localStorage.getItem('payment_upiAmount') || '120';
    const savedBankName = localStorage.getItem('payment_bankName') || 'State Bank of India';
    const savedBankAcc = localStorage.getItem('payment_bankAcc') || '34567890123';
    const savedBankIfsc = localStorage.getItem('payment_bankIfsc') || 'SBIN0001234';

    setUpiId(savedUpiId);
    setUpiName(savedUpiName);
    setAmount(savedAmount);
    setCustomAmount(savedAmount);
    setBankName(savedBankName);
    setBankAcc(savedBankAcc);
    setBankIfsc(savedBankIfsc);

    // Load mock transactions from localStorage or initialize
    const savedTx = localStorage.getItem('payment_transactions');
    if (savedTx) {
      setTransactions(JSON.parse(savedTx));
    } else {
      const initialTx = [
        { id: 'TXN10029', date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toLocaleDateString(), desc: 'Daily Lunch Subscription', amount: savedAmount, type: 'UPI', status: 'Success' },
        { id: 'TXN10018', date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toLocaleDateString(), desc: 'Weekly Meal Plan Settle', amount: String(Number(savedAmount) * 5), type: 'Bank', status: 'Success' }
      ];
      setTransactions(initialTx);
      localStorage.setItem('payment_transactions', JSON.stringify(initialTx));
    }

    // Listen for changes from Settings page
    const handleConfigChange = () => {
      setUpiId(localStorage.getItem('payment_upiId') || 'vaseegrahveda@okaxis');
      setUpiName(localStorage.getItem('payment_upiName') || 'Vaseegrah Veda Catering');
      const amt = localStorage.getItem('payment_upiAmount') || '120';
      setAmount(amt);
      setCustomAmount(amt);
      setBankName(localStorage.getItem('payment_bankName') || 'State Bank of India');
      setBankAcc(localStorage.getItem('payment_bankAcc') || '34567890123');
      setBankIfsc(localStorage.getItem('payment_bankIfsc') || 'SBIN0001234');
    };
    window.addEventListener('payment-config-change', handleConfigChange);
    return () => window.removeEventListener('payment-config-change', handleConfigChange);
  }, []);

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${customAmount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setIsCopied(field);
    addNotification(`${field} copied to clipboard!`, 'success');
    setTimeout(() => setIsCopied(''), 2000);
  };

  const handleMockPay = () => {
    if (submitting) return;
    setSubmitting(true);

    setTimeout(() => {
      const newTx = {
        id: referenceNo.trim() || `TXN${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString(),
        desc: customAmount === amount ? 'Daily Lunch Subscription' : 'Custom Meal Payment',
        amount: customAmount,
        type: activeTab === 'upi' ? 'UPI' : 'Bank',
        status: 'Success'
      };

      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('payment_transactions', JSON.stringify(updated));
      setReferenceNo('');
      setSubmitting(false);
      addNotification('Payment successfully settled and recorded! 🎉', 'success');
    }, 1500);
  };

  const handleQuickAmount = (val) => {
    setCustomAmount(String(val));
  };

  return (
    <div className="min-h-screen pb-12 w-full overflow-x-hidden">
      {/* Header Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === 'ta' ? 'பின்செல்' : 'Back'}
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-5xl mx-auto">
        
        {/* Left Side: Payments & QR details */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-[24px] p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentPurple/10 rounded-full blur-[80px] pointer-events-none" />
            
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-accentPurple" />
              {language === 'ta' ? 'பணம் செலுத்துதல்' : 'Payments & Billing'}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              {language === 'ta' 
                ? 'உங்கள் மதிய உணவுத் தொகையைச் செலுத்த UPI QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது வங்கி விவரங்களைப் பயன்படுத்தவும்.' 
                : 'Scan the UPI QR code or utilize the bank transfer details below to settle your meal invoices.'}
            </p>

            {/* Tab Selectors */}
            <div className="flex border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab('upi')}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'upi' ? 'border-accentPurple text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <QrCode className="h-4 w-4" />
                {language === 'ta' ? 'UPI QR குறியீடு' : 'UPI QR Code'}
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'bank' ? 'border-accentPurple text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Landmark className="h-4 w-4" />
                {language === 'ta' ? 'வங்கி பரிமாற்றம்' : 'Bank Transfer'}
              </button>
            </div>

            {/* UPI QR Payment Tab */}
            {activeTab === 'upi' && (
              <div className="space-y-6 flex flex-col items-center">
                {/* QR Code Frame */}
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-white/15 relative group flex flex-col items-center">
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain"
                  />
                  <div className="mt-2 text-[10px] text-gray-800 font-bold tracking-wider font-mono">
                    ₹{customAmount}
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
                    {language === 'ta' ? 'விரைவு தொகைத் தேர்வுகள்' : 'Quick Amount Selectors'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[Number(amount), Number(amount) * 5, Number(amount) * 10, 3000].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleQuickAmount(val)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          Number(customAmount) === val
                            ? 'bg-accentPurple/25 border-accentPurple text-white scale-103 shadow-lg shadow-purple-500/10'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    {language === 'ta' ? 'பணம் செலுத்த வேண்டிய தொகை' : 'Payment Amount (₹)'}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full glass-panel pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                {/* UPI Account name / ID */}
                <div className="w-full p-4 rounded-2xl bg-white/3 border border-white/5 text-center text-xs space-y-2 relative flex flex-col items-center">
                  <div>
                    <p className="text-gray-400">{language === 'ta' ? 'UPI கணக்கு பெயர்' : 'UPI Payee Name'}: <span className="text-white font-bold">{upiName}</span></p>
                    <p className="text-gray-500 font-mono text-[11px] mt-0.5">{upiId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(upiId, 'UPI ID')}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
                    >
                      {isCopied === 'UPI ID' ? 'Copied ID' : 'Copy UPI ID'}
                    </button>
                    <button
                      onClick={() => handleCopy(upiUrl, 'Payment Link')}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
                    >
                      {isCopied === 'Payment Link' ? 'Copied Link' : 'Copy Pay Link'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Tab */}
            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-4">
                  {/* Bank Name */}
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Bank Name</p>
                      <p className="text-sm font-bold text-white mt-0.5">{bankName}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(bankName, 'Bank Name')}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {isCopied === 'Bank Name' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Account Holder Name */}
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Account Holder Name</p>
                      <p className="text-sm font-bold text-white mt-0.5">{upiName}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(upiName, 'Account Holder Name')}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {isCopied === 'Account Holder Name' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Account Number</p>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{bankAcc}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(bankAcc, 'Account Number')}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {isCopied === 'Account Number' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* IFSC Code */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">IFSC Code</p>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{bankIfsc}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(bankIfsc, 'IFSC Code')}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {isCopied === 'IFSC Code' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="w-full pt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    {language === 'ta' ? 'பரிமாற்றத் தொகை' : 'Transfer Amount (₹)'}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full glass-panel pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reference Number Input */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {activeTab === 'upi' 
                  ? (language === 'ta' ? 'பரிவர்த்தனை குறிப்பு எண் (Transaction ID)' : 'Transaction ID / Reference Number')
                  : (language === 'ta' ? 'வங்கி பரிமாற்ற குறிப்பு எண் (UTR / Ref)' : 'Bank Transfer Reference / UTR Number')
                }
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder={activeTab === 'upi' ? "e.g. UPI1234567890" : "e.g. UTR9876543210"}
                className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all font-mono"
              />
            </div>

            {/* Settle Action Button */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <button
                onClick={handleMockPay}
                disabled={submitting || !customAmount}
                className="w-full py-3 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{language === 'ta' ? 'பணம் செலுத்தியதாகப் பதிவு செய்' : 'Mark as Paid / Settle'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Billing Status & Log History */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          {/* Subscription Card */}
          <div className="rounded-[24px] p-6 border border-[#D4AF37]/35 bg-[#001F16] relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-accentGreen/8 rounded-full blur-[80px] pointer-events-none" />

            <div>
              <span className="text-[10px] uppercase font-bold text-accentGreen bg-accentGreen/15 border border-accentGreen/30 px-2.5 py-0.5 rounded-full inline-block mb-3 tracking-wider">
                {language === 'ta' ? 'செயலில் உள்ள திட்டம்' : 'Active Plan'}
              </span>
              <h3 className="text-lg font-bold text-white">{language === 'ta' ? 'தினசரி மெனு சந்தா' : 'Daily Meal Subscription'}</h3>
              <p className="text-xs text-gray-300 mt-1">
                {language === 'ta' ? 'அனைத்து வேலை நாட்களிலும் மதிய உணவு வழங்கப்படுகிறது.' : 'Fresh lunch served every weekday at your desk.'}
              </p>

              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{language === 'ta' ? 'வழக்கமான விலை' : 'Standard Rate'}</span>
                  <span className="text-white font-bold font-mono">₹{amount} / {language === 'ta' ? 'நாள்' : 'day'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{language === 'ta' ? 'பயன்முறை' : 'Payment Schedule'}</span>
                  <span className="text-white font-semibold">Weekly / Monthly</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Current Balance</p>
                <p className="text-lg font-extrabold text-accentGreen font-mono">₹0.00</p>
              </div>
              <span className="text-[10px] bg-accentGreen/15 border border-accentGreen/30 text-accentGreen px-2.5 py-0.5 rounded-full font-bold uppercase">
                {language === 'ta' ? 'முழுமையாகச் செலுத்தப்பட்டது' : 'Fully Settled'}
              </span>
            </div>
          </div>

          {/* History log */}
          <div className="glass-panel rounded-[24px] p-6 border border-white/5 relative overflow-hidden flex-1">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-accentPurple" />
              {language === 'ta' ? 'பணப் பரிவர்த்தனை வரலாறு' : 'Payment History Logs'}
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="p-3 bg-white/3 border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                    title={language === 'ta' ? 'ரசீதை பார்க்க கிளிக் செய்யவும்' : 'Click to view receipt'}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white">{tx.desc}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>{tx.id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-accentGreen font-mono">₹{tx.amount}</p>
                        <span className="inline-block mt-1 text-[8px] uppercase tracking-wide font-extrabold text-accentGreen bg-accentGreen/10 border border-accentGreen/20 px-2 py-0.5 rounded">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  {language === 'ta' ? 'வரலாற்று பதிவுகள் இல்லை.' : 'No payment logs found.'}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel w-full max-w-sm rounded-[28px] p-6 border border-white/10 relative shadow-2xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-accentGreen/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Success Badge */}
              <div className="h-12 w-12 rounded-full bg-accentGreen/20 flex items-center justify-center text-accentGreen border border-accentGreen/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{language === 'ta' ? 'பரிவர்த்தனை ரசீது' : 'Transaction Receipt'}</h4>
                <p className="text-lg font-extrabold text-white mt-1">₹{selectedTx.amount}.00</p>
                <span className="inline-block mt-1 text-[9px] uppercase tracking-wide font-extrabold text-accentGreen bg-accentGreen/15 border border-accentGreen/30 px-2.5 py-0.5 rounded-full">
                  {selectedTx.status}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'ta' ? 'விளக்கம்' : 'Description'}</span>
                <span className="text-white font-bold">{selectedTx.desc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'ta' ? 'தேதி' : 'Date'}</span>
                <span className="text-white font-semibold font-mono">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'ta' ? 'முறைமை' : 'Payment Type'}</span>
                <span className="text-white font-semibold">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'ta' ? 'பரிவர்த்தனை எண்' : 'Transaction / UTR ID'}</span>
                <span className="text-white font-mono font-bold tracking-tight">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Merchant</span>
                <span className="text-white font-semibold">{upiName}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button
                onClick={() => {
                  addNotification('Receipt downloaded successfully! 📄', 'success');
                }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center min-h-[38px]"
              >
                {language === 'ta' ? 'பதிவிறக்கு' : 'Download'}
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center min-h-[38px]"
              >
                {language === 'ta' ? 'மூடு' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payment;
