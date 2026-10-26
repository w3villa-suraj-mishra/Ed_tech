import React from 'react'
import RatingStars from '../../Common/RatingStars'
import GetAvgRating from '../../../utils/avgRating'
import { Link } from 'react-router-dom'



const Course_Card = ({course, Height}) => {


    const avgReviewCount = Number(course.averageRating || course.rating) || GetAvgRating(course.ratingAndReviews);
    const reviewCount = Number(course.reviewsCount ?? course.reviewCount ?? course.ratingAndReviews?.length ?? 0);


    
  return (
    <>
      <Link to={`/courses/${course._id}`}>
        <div className="">
          <div className="rounded-lg">
            <img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full rounded-xl object-cover `}
            />
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl text-richblack-5">{course?.courseName}</p>
            <p className="text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-5">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} />
                <span className="text-richblack-400">
                  {reviewCount} Ratings
              </span>
            </div>
            <div className="flex items-center gap-3">
              {course?.pricing?.isOfferActive || (course?.originalPrice && Number(course?.originalPrice) > Number(course?.price)) ? (
                <>
                  <span className="text-sm text-richblack-400 line-through">
                    Rs. {course?.pricing?.originalPrice || course?.originalPrice}
                  </span>
                  <span className="text-xl font-bold text-yellow-50">
                    Rs. {course?.pricing?.finalPrice || course?.price}
                  </span>
                  {course?.pricing?.discountPercentage > 0 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      {course?.pricing?.discountPercentage}% OFF
                    </span>
                  )}
                </>
              ) : (
                <p className="text-xl font-bold text-richblack-5">Rs. {course?.price}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  )
}

export default Course_Card
