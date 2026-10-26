import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyCart from '../components/EmptyCart';
import { getUserEnrolledCourses } from '../../../services/operations/profileAPI';
import { VscTrash } from 'react-icons/vsc';

const CartPage = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [userEnrolledCourses, setUserEnrolledCourses] = useState([]);

  useEffect(() => {
    if (token) {
      getUserEnrolledCourses(token).then((courses) => {
        if (courses && Array.isArray(courses)) {
          setUserEnrolledCourses(courses);
        }
      });
    }
  }, [token]);

  const {
    cart,
    totalItems,
    subtotal,
    finalTotal,
    totalDiscount,
    removeItem,
    clear
  } = useCart(userEnrolledCourses);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/90 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">Your Cart</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
              Review your selected courses before proceeding to checkout
            </p>
          </div>

          {totalItems > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#3BA7F2] bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-xl">
                {totalItems} {totalItems === 1 ? 'Course' : 'Courses'} in cart
              </span>
              <button
                onClick={clear}
                className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <VscTrash /> Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* MAIN BODY */}
        {totalItems === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* CART ITEMS LIST */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((course) => (
                <CartItem
                  key={course._id || course.id}
                  course={course}
                  onRemove={removeItem}
                />
              ))}

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => navigate('/courses')}
                  className="text-xs text-[#3BA7F2] hover:underline font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                total={finalTotal}
                discount={totalDiscount}
                itemCount={totalItems}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
