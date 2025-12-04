import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Globe, ShoppingBag, ArrowRightLeft, Heart, Trash2, Bell, X } from 'lucide-react';

import ProductPage from './pages/ProductPage'; // Import new page

// Components
const Navbar = () => (
  <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-xl sticky top-0 z-50">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold flex items-center gap-2 tracking-tight group">
        <div className="bg-white p-1.5 rounded-full shadow-lg transform group-hover:rotate-12 transition duration-300">
            <Globe size={24} className="text-blue-600" />
        </div>
        <div className="flex flex-col leading-none">
            <span className="text-lg">Global</span>
            <span className="text-yellow-300 text-sm tracking-widest">PRICE</span>
        </div>
      </Link>
      <div className="flex gap-6 text-sm md:text-base font-medium items-center">
        <Link to="/" className="hover:text-yellow-200 transition">חיפוש</Link>
        <Link to="/destination" className="hover:text-yellow-200 transition">תכנון נסיעה</Link>
        <Link to="/deals" className="hover:text-yellow-200 transition">המלצות</Link>
        <Link to="/favorites" className="hover:text-red-300 transition flex items-center gap-1">
            <Heart size={18} fill="currentColor" />
            <span className="hidden md:inline">מועדפים</span>
        </Link>
      </div>
    </div>
  </nav>
);

const AdBanner = () => (
  <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 my-8 text-center rounded-xl mx-auto max-w-4xl">
    <p className="text-gray-400 font-semibold text-sm">SPONSORED ADVERTISEMENT</p>
    <div className="h-24 bg-gray-200 mt-2 rounded flex items-center justify-center text-gray-400">
      <span>Google Ads Placeholder</span>
    </div>
  </div>
);

const AlertModal = ({ isOpen, onClose, product }) => {
    const [email, setEmail] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    useEffect(() => {
        if (product) {
            setTargetPrice(Math.round(product.originPrice * 0.9)); // Default 10% off
        }
    }, [product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post('/api/alerts', {
                email,
                product_id: product.id,
                target_price: targetPrice
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setEmail('');
            }, 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                
                <h3 className="text-2xl font-bold mb-2 text-gray-800">התראת מחיר 🔔</h3>
                <p className="text-gray-600 mb-6">קבל מייל כשהמחיר של <span className="font-bold">{product.name}</span> יורד.</p>
                
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} fill="currentColor" />
                        </div>
                        <h4 className="text-xl font-bold text-green-700">ההתראה הוגדרה!</h4>
                        <p className="text-gray-500">נשלח לך מייל כשהמחיר יגיע ליעד.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">המייל שלך</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">מחיר יעד (מטבע מקומי)</label>
                            <input 
                                type="number" 
                                required
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center"
                        >
                            {status === 'loading' ? 'שומר...' : 'צור התראה'}
                        </button>
                        {status === 'error' && <p className="text-red-500 text-center text-sm">אירעה שגיאה. נסה שנית.</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

// Feature 1: Global Search
const GlobalSearch = ({ countries }) => {
  const [origin, setOrigin] = useState('IL');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  
  // Alert Modal State
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?q=${query}&origin=${origin}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleFavorite = async (id) => {
      try {
          if (favorites.has(id)) {
              await axios.delete(`/api/favorites/${id}`);
              const newFavs = new Set(favorites);
              newFavs.delete(id);
              setFavorites(newFavs);
          } else {
              await axios.post('/api/favorites', { id });
              setFavorites(new Set(favorites).add(id));
          }
      } catch (err) {
          console.error(err);
      }
  };

  const openAlert = (product) => {
      setSelectedProduct(product);
      setIsAlertOpen(true);
  };
  
  useEffect(() => {
      axios.get('/api/favorites').then(res => {
          setFavorites(new Set(res.data.map(p => p.id)));
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <AlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} product={selectedProduct} />

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">השוואת מחירים גלובלית</h2>
        <p className="text-gray-500">גלה כמה המוצר שאתה רוצה עולה ברחבי העולם (שערים בזמן אמת)</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-10 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">מדינת מוצא (המטבע שלך)</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
              <select 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-[3]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">מה תרצה לקנות?</label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חפש מוצר (לדוגמה: iPhone, Labubu)..."
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition transform hover:scale-105">
                חפש
              </button>
            </form>
          </div>
        </div>
      </div>

      <AdBanner />

      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="space-y-8">
        {results.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition hover:shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button 
                    onClick={() => toggleFavorite(item.id)}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
                    title="הוסף למועדפים"
                >
                    <Heart className={favorites.has(item.id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
                </button>
                <button 
                    onClick={() => openAlert(item)}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
                    title="התראת מחיר"
                >
                    <Bell className="text-gray-600" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 h-64 md:h-auto relative group">
                <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow">פרטים מלאים</span>
                    </div>
                </Link>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow">
                  {item.category}
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Link to={`/product/${item.id}`} className="hover:text-blue-600 transition">
                        <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                    </Link>
                    <p className="text-gray-500 text-sm mt-1">מחיר מקומי ({countries.find(c=>c.code===origin)?.name}):</p>
                    <p className="text-3xl font-extrabold text-blue-600">{item.originPrice} <span className="text-lg text-gray-400 font-normal">{countries.find(c=>c.code===origin)?.symbol}</span></p>
                  </div>
                </div>

                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Globe size={18} /> השוואת מחירים בעולם (כולל המרה)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.comparisons.map((comp, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex justify-between items-center transition hover:scale-105 ${comp.savings > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{comp.country.name}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{comp.price} {comp.country.symbol}</p>
                        <p className="text-xs text-gray-500">~ {comp.convertedPrice} {countries.find(c=>c.code===origin)?.symbol}</p>
                      </div>
                      
                      <div className="text-left">
                        {comp.savings > 0 ? (
                          <div className="text-green-600 flex flex-col items-end">
                            <span className="text-xs font-bold uppercase tracking-wider bg-green-200 px-2 py-1 rounded-full mb-1">זול יותר</span>
                            <span className="font-bold">-{comp.savingsPercent}%</span>
                            <span className="text-xs">חיסכון: {comp.savings}</span>
                          </div>
                        ) : (
                          <div className="text-red-500 flex flex-col items-end">
                             <span className="text-xs font-bold uppercase tracking-wider bg-red-100 px-2 py-1 rounded-full mb-1">יקר יותר</span>
                             <span className="text-xs">+{Math.abs(comp.savings)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature 2: Destination Search (Simplified for brevity, assumes logic similar to global)
const DestinationSearch = ({ countries }) => {
  const [destination, setDestination] = useState('US');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    const res = await axios.get(`/api/search?q=${query}&origin=IL`);
    setResults(res.data);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-4 text-center">תכנון קניות לפני טיסה</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">לאן טסים?</label>
                <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3 border rounded-lg bg-blue-50 border-blue-200"
                >
                {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                ))}
                </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">מוצר לבדיקה</label>
                <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="לדוגמה: Sony Headphones..."
                    className="flex-1 p-3 border rounded-lg"
                />
                <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700">
                    <Search size={20} />
                </button>
                </form>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {results.map(item => {
          const destPrice = item.comparisons.find(c => c.country.code === destination);
          if (!destPrice) return null;

          return (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-48 relative group">
                  <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100"></div>
                  </Link>
              </div>
              <div className="p-6 flex-1">
                  <Link to={`/product/${item.id}`} className="hover:text-blue-600">
                      <h3 className="text-xl font-bold mb-6">{item.name}</h3>
                  </Link>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-right w-full bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-500 text-sm">מחיר בישראל</p>
                      <p className="text-2xl font-bold text-gray-800">{item.originPrice} ₪</p>
                    </div>
                    
                    <div className="text-blue-500">
                      <ArrowRightLeft size={32} />
                    </div>
                    
                    <div className={`text-center md:text-left w-full p-4 rounded-lg ${destPrice.savings > 0 ? 'bg-green-50 ring-1 ring-green-200' : 'bg-red-50 ring-1 ring-red-200'}`}>
                      <p className="text-gray-500 text-sm">מחיר ב{destPrice.country.name}</p>
                      <p className={`text-2xl font-bold ${destPrice.savings > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {destPrice.price} {destPrice.country.symbol}
                      </p>
                       <p className="text-xs text-gray-500">~ {destPrice.convertedPrice} ₪</p>
                      <div className="mt-1">
                        {destPrice.savings > 0 ? (
                            <span className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-bold">
                                משתלם! חיסכון של {destPrice.savingsPercent}%
                            </span>
                        ) : (
                            <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded font-bold">
                                יקר ב-{Math.abs(destPrice.savings)}
                            </span>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Feature 3: Deals / Recommendations
const Deals = ({ countries }) => {
  const [destination, setDestination] = useState('JP');
  const [deals, setDeals] = useState({ categories: [], products: [] });

  useEffect(() => {
    const fetchDeals = async () => {
      const res = await axios.get(`/api/deals/${destination}`);
      setDeals(res.data);
    };
    fetchDeals();
  }, [destination]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">המלצות קניה חכמה 💡</h2>
        <p className="text-gray-500">מה הכי שווה לקנות ביעד שלך?</p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="flex gap-2 overflow-x-auto pb-4 max-w-full no-scrollbar">
          {countries.map(c => (
            <button
              key={c.code}
              onClick={() => setDestination(c.code)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all shadow-sm ${destination === c.code ? 'bg-blue-600 text-white shadow-blue-300 ring-2 ring-blue-300 shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {c.name} {destination === c.code && '✈️'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {deals.products.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300">
             <div className="h-48 overflow-hidden relative group">
                <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                </Link>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded font-medium uppercase">{item.category}</span>
              </div>
              <Link to={`/product/${item.id}`} className="hover:text-blue-600">
                 <h4 className="font-bold text-xl mb-3 text-gray-800 line-clamp-1">{item.name}</h4>
              </Link>
              
              <div className="flex items-end justify-between mt-4">
                  <div>
                      <p className="text-gray-400 text-xs">מחיר יעד</p>
                      <p className="text-2xl font-extrabold text-gray-900">{item.priceInDestination}</p>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature 4: Favorites Page
const Favorites = ({ countries }) => {
    const [favorites, setFavorites] = useState([]);
    
    useEffect(() => {
        axios.get('/api/favorites').then(res => setFavorites(res.data));
    }, []);

    const removeFavorite = async (id) => {
        await axios.delete(`/api/favorites/${id}`);
        setFavorites(favorites.filter(p => p.id !== id));
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-red-500 flex items-center justify-center gap-2">
                <Heart fill="currentColor" /> המוצרים שאהבתי
            </h2>
            
            {favorites.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">עדיין לא הוספת מוצרים למועדפים.</p>
                    <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">התחל לחפש</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow border border-gray-100 p-4">
                             <div className="h-40 overflow-hidden rounded-lg mb-4 relative group">
                                <Link to={`/product/${item.id}`}>
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </Link>
                                <button 
                                    onClick={() => removeFavorite(item.id)}
                                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>
                             <Link to={`/product/${item.id}`} className="hover:text-blue-600">
                                 <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                             </Link>
                             <p className="text-gray-500 text-sm mb-4">{item.category}</p>
                             <div className="bg-blue-50 p-3 rounded text-center">
                                 <p className="text-xs text-gray-500">מחיר בסיס</p>
                                 <p className="font-bold text-blue-700">{item.basePriceILS} ₪</p>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function App() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios.get('/api/countries')
      .then(res => setCountries(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-gray-900" dir="rtl">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<GlobalSearch countries={countries} />} />
            <Route path="/destination" element={<DestinationSearch countries={countries} />} />
            <Route path="/deals" element={<Deals countries={countries} />} />
            <Route path="/favorites" element={<Favorites countries={countries} />} />
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-gray-300 py-8 text-center mt-auto border-t border-gray-800">
          <div className="container mx-auto px-4">
             <div className="flex justify-center gap-4 mb-4">
                 <Globe size={24} className="text-blue-500" />
             </div>
             <p className="text-lg font-semibold text-white mb-2">Global Price</p>
             <p className="text-sm opacity-70">© 2024 כל הזכויות שמורות. השוואת מחירים חכמה לטיילים.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
