import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, MapPin, Globe, ShoppingCart, Heart, Bell } from 'lucide-react';

const ProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [origin, setOrigin] = useState('IL'); // Default to IL or use context if available
    
    // Alert state (reuse logic or component in real app)
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/api/products/${id}?origin=${origin}`);
                setProduct(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id, origin]);

    if (loading) return <div className="p-10 text-center">טוען פרטי מוצר...</div>;
    if (!product) return <div className="p-10 text-center">מוצר לא נמצא. <Link to="/" className="text-blue-500">חזור לחיפוש</Link></div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
             <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
                <ArrowRight size={20} /> חזרה לחיפוש
            </Link>
            
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-1/3 bg-gray-50 p-8 flex items-center justify-center relative">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-h-96 object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500" 
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold shadow-md">
                           {product.category}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="lg:w-2/3 p-8 md:p-12">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <MapPin size={16} /> מחיר מוצא ({origin}):
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                                    <Heart size={24} />
                                </button>
                                <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                                    <Bell size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-5xl font-extrabold text-blue-600">{product.originPrice}</span>
                            <span className="text-2xl text-gray-400">{product.currencySymbol}</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Comparison Table */}
                            <div>
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Globe className="text-blue-500" /> השוואת מחירים בעולם
                                </h3>
                                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                    {product.comparisons.map((comp, idx) => (
                                        <div key={idx} className={`p-4 flex justify-between items-center border-b border-gray-100 last:border-0 ${comp.savings > 0 ? 'bg-green-50/50' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {comp.country.code}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{comp.country.name}</p>
                                                    <p className="text-xs text-gray-500">{comp.price} {comp.country.symbol}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">~{comp.convertedPrice} {product.currencySymbol}</p>
                                                {comp.savings > 0 && (
                                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                        -{comp.savingsPercent}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price History Chart */}
                            <div>
                                <h3 className="font-bold text-xl mb-4">היסטוריית מחירים (חצי שנה אחרונה)</h3>
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={product.history}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} domain={['dataMin - 100', 'dataMax + 100']} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                                labelStyle={{color: '#6b7280', marginBottom: '0.5rem'}}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="price" 
                                                stroke="#2563eb" 
                                                strokeWidth={3} 
                                                dot={{fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff'}} 
                                                activeDot={{r: 6}}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <button className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    <ShoppingCart size={20} /> קנה עכשיו (Mock Link)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
