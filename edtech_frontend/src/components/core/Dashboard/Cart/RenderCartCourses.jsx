import React from 'react'
import { useSelector } from 'react-redux'
import {GiNinjaStar} from "react-icons/gi"
import {RiDeleteBin6Line} from "react-icons/ri"
import { removeFromCart } from '../../../../services/slices/cartSlice'
import ReactStars from "react-rating-stars-component";
import { useDispatch } from 'react-redux'
import { FaStar } from "react-icons/fa";
export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  return (
    <div className="flex flex-1 flex-col">
      {cart.map((course, indx) => (
        <div
          key={course._id}
          className={`flex w-full flex-wrap items-start justify-between gap-6 ${
            indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"
          } ${indx !== 0 && "mt-6"} `}
        >
          <div className="flex flex-1 flex-col gap-4 xl:flex-row">
            <img
              src={course?.thumbnail}
              alt={course?.courseName}
              className="h-[148px] w-[220px] rounded-lg object-cover"
            />
            <div className="flex flex-col space-y-1">
              <p className="text-lg font-medium text-richblack-5">
                {course?.courseName}
              </p>
              <p className="text-sm text-richblack-300">
                {course?.category?.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-yellow-5">{course?.averageRating || course?.rating || 0}</span>
                <ReactStars
                  count={5}
                  value={course?.averageRating || course?.rating || 0}
                  size={20}
                  edit={false}
                  activeColor="#ffd700"
                  emptyIcon={<FaStar />}
                  fullIcon={<FaStar />}
                />
                <span className="text-richblack-400">
                  {course?.reviewsCount ?? course?.reviewCount ?? course?.ratingAndReviews?.length ?? 0} Ratings
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={() => dispatch(removeFromCart(course._id))}
              className="flex items-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 py-3 px-[12px] text-blue-200"
            >
              <RiDeleteBin6Line />
              <span>Remove</span>
            </button>
            <div className="text-right">
              {course?.pricing?.isOfferActive || (course?.originalPrice && Number(course?.originalPrice) > Number(course?.price)) ? (
                <div>
                  <span className="text-sm text-richblack-400 line-through block">
                    ₹ {course?.pricing?.originalPrice || course?.originalPrice}
                  </span>
                  <span className="text-3xl font-medium text-yellow-100">
                    ₹ {course?.pricing?.finalPrice || course?.price}
                  </span>
                </div>
              ) : (
                <p className="mb-6 text-3xl font-medium text-yellow-100">
                  ₹ {course?.price}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
