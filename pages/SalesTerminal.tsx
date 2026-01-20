
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, ShoppingCart, User, Plus, Minus, Trash2, 
  CreditCard, ChevronRight, QrCode, Ticket, CheckCircle2, 
  X, Banknote, Smartphone, Receipt
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available: number;
}

const SalesTerminal: React.FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rxCode, setRxCode] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile'>('Cash');
  const [showSuccess, setShowSuccess] = useState(false);

  const mockMedicines = [
    { id: '1', name: 'Amoxicillin', price: 18, stock: 42, brand: 'GSK' },
    { id: '2', name: 'Paracetamol', price: 5, stock: 120, brand: 'Dolo' },
    { id: '3', name: 'Ibuprofen', price: 9, stock: 65, brand: 'Advil' },
    { id: '4', name: 'Metformin', price: 25, stock: 24, brand: 'Glucophage' },
    { id: '5', name: 'Lisinopril', price: 15, stock: 18, brand: 'Zestril' },
    { id: '6', name: 'Atorvastatin', price: 30, stock: 50, brand: 'Lipitor' },
  ];

  const addToCart = (med: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing) {
        if (existing.quantity >= med.stock) return prev;
        return prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: med.id, name: med.name, price: med.price, quantity: 1, available: med.stock }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        if (newQty > i.available) return i;
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discount = subtotal > 100 ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  const filteredMedicines = mockMedicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompleteSale = () => {
    setShowPaymentModal(false);
    setShowSuccess(true);
    setCart([]);
  };

  if (showSuccess) {
    return (
      <div className="h-full flex items-center justify-center animate-in zoom-in duration-300">
        <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl text-center space-y-8 max-w-lg w-full">
           <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
              <CheckCircle2 size={48} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900">Sale Completed!</h2>
              <p className="text-slate-500 mt-2 font-medium">Receipt #: REC-{Date.now()}</p>
           </div>
           <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
              <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <span>Total Received</span>
                <span className="text-slate-900 text-sm">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <span>Method</span>
                <span className="text-slate-900 text-sm">{paymentMethod}</span>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={() => setShowSuccess(false)} className="py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                 <Receipt size={18} /> Receipt
              </button>
              <button onClick={() => setShowSuccess(false)} className="py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                 New Sale
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full relative">
      {/* Products Side */}
      <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search catalog or SKU..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Scan Rx Code (e.g. RX-1234567)" 
              className="w-full pl-12 pr-4 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-indigo-700 placeholder:text-indigo-300"
              value={rxCode}
              onChange={(e) => setRxCode(e.target.value)}
            />
            {rxCode && <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"><ChevronRight size={18} /></button>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-8 pr-2 custom-scrollbar">
          {filteredMedicines.map(med => (
            <button 
              key={med.id}
              onClick={() => addToCart(med)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-left flex flex-col justify-between group active:scale-95 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -mr-8 -mt-8 transition-all group-hover:bg-blue-50"></div>
              <div className="relative z-10">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest">{med.brand}</span>
                <h4 className="font-black text-slate-900 mt-2 text-lg leading-tight group-hover:text-blue-600 transition-colors">{med.name}</h4>
                <p className={`text-xs mt-2 font-bold ${med.stock < 10 ? 'text-rose-500' : 'text-slate-400'}`}>Stock: {med.stock}</p>
              </div>
              <div className="flex items-center justify-between mt-6 relative z-10">
                <p className="text-2xl font-black text-slate-900">${med.price}</p>
                <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-blue-600 transition-all shadow-lg">
                  <Plus size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Side Section 9.3 */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden sticky top-0">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Order Queue</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cart.length} active items</p>
            </div>
          </div>
          <button onClick={() => setCart([])} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <ShoppingCart size={80} className="mb-6 stroke-1" />
              <p className="font-black text-xl">Cart is Empty</p>
              <p className="text-sm font-medium mt-2">Add items from the catalog or scan a prescription.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group">
                <div className="flex-1">
                  <p className="font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{item.name}</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">${item.price} / unit</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-blue-600"><Minus size={16} /></button>
                  <span className="font-black w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-blue-600"><Plus size={16} /></button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-10 border-t border-slate-100 bg-white space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500">
                <span>Loyalty Discount (5%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-3xl font-black text-slate-900 pt-4 border-t border-slate-50">
              <span className="tracking-tighter">Total Due</span>
              <span className="text-blue-600 tracking-tighter">${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <CreditCard size={24} />
            Initialize Payment
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Payment Modal Section 9.3 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-50 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black">Process Checkout</h3>
                  <p className="text-slate-400 font-medium text-sm mt-1">Finalize transaction and issue receipt.</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-all">
                  <X size={24} />
                </button>
             </div>
             <div className="p-12 space-y-10">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'Cash', icon: Banknote, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { id: 'Card', icon: CreditCard, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { id: 'Mobile', icon: Smartphone, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                  ].map(method => (
                    <button 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                        paymentMethod === method.id ? `${method.color} shadow-lg shadow-blue-50` : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                      }`}
                    >
                      <method.icon size={28} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{method.id}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center text-lg font-bold text-slate-500">
                      <span>Subtotal</span>
                      <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-4xl font-black text-slate-900 pt-6 border-t border-slate-100">
                      <span className="tracking-tighter">Amount Due</span>
                      <span className="text-blue-600 tracking-tighter">${total.toFixed(2)}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowPaymentModal(false)} className="py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
                  <button onClick={handleCompleteSale} className="py-5 bg-blue-600 text-white font-black rounded-[2rem] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Complete Sale</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
