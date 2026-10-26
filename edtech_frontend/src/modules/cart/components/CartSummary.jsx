import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VscArrowRight, VscLock } from 'react-icons/vsc';

const CartSummary = ({ subtotal, total, discount, itemCount }) => {
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (itemCount > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 space-y-6 shadow-2xs sticky top-24">
      
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Order Summary</h3>
        <p className="text-xs text-gray-500 mt-0.5 font-normal">Review pricing before checkout</p>
      </div>

      <div className="space-y-3.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span>Discount Savings</span>
            <span>-₹{discount.toLocaleString()}</span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
          <span className="font-bold text-base text-[#0F172A]">Total Amount</span>
          <span className="font-black text-2xl text-[#0F172A]">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={handleCheckoutClick}
        disabled={itemCount === 0}
        className="w-full py-3.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span>Continue Checkout</span>
        <VscArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
        <VscLock className="text-emerald-500" />
        <span>256-Bit SSL Encrypted & Secured</span>
      </div>

    </div>
  );
};

export default CartSummary;
