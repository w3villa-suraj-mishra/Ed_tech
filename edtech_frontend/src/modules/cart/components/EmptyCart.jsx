import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VscBook } from 'react-icons/vsc';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-5 max-w-lg mx-auto shadow-xl">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-4xl text-purple-400">
        🛒
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-white">Your cart is empty</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
          Explore our wide range of top-rated courses and add something to your cart to kickstart your learning journey.
        </p>
      </div>

      <button
        onClick={() => navigate('/courses')}
        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer"
      >
        <VscBook className="text-base" />
        <span>Explore Courses</span>
      </button>
    </div>
  );
};

export default EmptyCart;
