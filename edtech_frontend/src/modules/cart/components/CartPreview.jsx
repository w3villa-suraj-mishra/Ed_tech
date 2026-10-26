import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../../../services/slices/cartSlice';
import { VscClose } from 'react-icons/vsc';

const CartPreview = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, totalItems } = useSelector((state) => state.cart);
  const previewRef = useRef(null);

  const total = cart.reduce((acc, course) => {
    const price = Number(course?.pricing?.finalPrice || course?.price || 0);
    return acc + price;
  }, 0);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={previewRef}
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white border border-gray-200/90 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 font-sans"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-base text-[#0F172A]">Cart</h3>
          <span className="bg-sky-50 text-[#3BA7F2] text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-100">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition cursor-pointer"
          aria-label="Close preview"
        >
          <VscClose className="text-xl" />
        </button>
      </div>

      {/* ITEMS LIST */}
      <div className="max-h-72 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="py-8 text-center text-gray-400 space-y-2">
            <div className="text-3xl">🛒</div>
            <p className="text-xs font-semibold">Your cart is empty</p>
          </div>
        ) : (
          cart.map((course) => {
            const courseId = course._id || course.id;
            const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);

            return (
              <div
                key={courseId}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-gray-200/70 hover:border-[#3BA7F2]/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {(course.thumbnail || course.image) && (
                    <img
                      src={course.thumbnail || course.image}
                      alt={course.courseName || course.title}
                      className="w-12 h-10 rounded-lg object-cover bg-gray-200 shrink-0 border border-gray-200"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-[#0F172A] truncate">
                      {course.courseName || course.title}
                    </h4>
                    <span className="text-xs font-extrabold text-[#3BA7F2]">
                      ₹{currentPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(courseId))}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  title="Remove"
                >
                  <VscClose className="text-base" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER & GO TO CART BUTTON */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="font-black text-base sm:text-lg text-[#0F172A]">
              ₹{total.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              if (onClose) onClose();
              navigate('/cart');
            }}
            className="w-full py-3 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
          >
            Go to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPreview;
