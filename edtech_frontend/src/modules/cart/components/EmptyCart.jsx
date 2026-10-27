import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VscBook } from 'react-icons/vsc';
import { AiOutlineShoppingCart } from 'react-icons/ai';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-10 sm:p-14 text-center space-y-6 max-w-lg mx-auto shadow-xs">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3BA7F2] shadow-xs">
        <AiOutlineShoppingCart className="text-4xl text-[#3BA7F2]" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Your cart is empty
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto font-normal">
          Explore our wide range of top-rated courses and add something to your cart to kickstart your learning journey.
        </p>
      </div>

      <button
        onClick={() => navigate('/courses')}
        className="px-8 py-3.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-sm font-bold transition-all shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/25 inline-flex items-center gap-2 cursor-pointer active:scale-95"
      >
        <VscBook className="text-base" />
        <span>Explore Courses</span>
      </button>
    </div>
  );
};

export default EmptyCart;
