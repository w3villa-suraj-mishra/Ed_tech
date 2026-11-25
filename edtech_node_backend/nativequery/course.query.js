const sequelize = require('../config/database');
const { QueryTypes, Op } = require('sequelize');
const {
  Course,
  CourseCertificate,
  User,
  Section,
  SubSection,
  Enrollment,
  RatingAndReview,
  CourseComment,
  CourseProgress,
  CourseProgressVideo,
  Category,
  CoursePriceAudit
} = require('../models');

/**
 * Course Native & ORM Queries Layer
 * All course-related DB reads/writes isolated here.
 */

// 1. Dynamic Homepage Statistics (Native SQL)
const getHomePageStatsQuery = async () => {
  const [
    learnersCount,
    coursesCount,
    projectsCount,
    certificationsCount,
    allReviews,
    completedVideos
  ] = await Promise.all([
    User.count({ where: { accountType: 'Student' } }).catch(() => 0),
    Course.count({ where: { status: 'Published' } }).catch(() => 0),
    SubSection.count().catch(() => 0),
    CourseCertificate.count().catch(() => 0),
    RatingAndReview.findAll({ attributes: ['rating'], raw: true }).catch(() => []),
    CourseProgressVideo ? CourseProgressVideo.findAll({
      include: [{ model: SubSection, attributes: ['duration', 'timeDuration', 'durationSeconds'] }]
    }).catch(() => []) : []
  ]);

  let totalRating = 0;
  if (allReviews && allReviews.length > 0) {
    allReviews.forEach(r => totalRating += (parseFloat(r.rating) || 0));
  }
  const averageRating = allReviews && allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : "0.0";

  let totalLearnedSeconds = 0;
  if (completedVideos && completedVideos.length > 0) {
    completedVideos.forEach(cv => {
      const sub = cv.SubSection || cv.subSection;
      if (sub) {
        const dur = parseFloat(sub.durationSeconds || sub.timeDuration || sub.duration || 900);
        totalLearnedSeconds += !isNaN(dur) && dur > 0 ? dur : 900;
      } else {
        totalLearnedSeconds += 900;
      }
    });
  }
  const hoursLearned = totalLearnedSeconds > 0 ? Math.max(1, Math.round(totalLearnedSeconds / 3600)) : 0;

  return {
    learnersCount: Number(learnersCount || 0),
    coursesCount: Number(coursesCount || 0),
    projectsCount: Number(projectsCount || 0),
    certificationsCount: Number(certificationsCount || 0),
    hoursLearned,
    rating: parseFloat(averageRating),
    averageRating
  };
};

const findCertificateByCertIdQuery = async (certificateId) => {
  return await CourseCertificate.findOne({
    where: { certificateId },
    include: [
      { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
      { model: Course, as: 'course', attributes: ['courseName'] }
    ]
  });
};

const findCertificateQuery = async (userId, courseId) => {
  return await CourseCertificate.findOne({
    where: { userId, courseId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'image', 'email']
      }
    ]
  });
};

const createCertificateQuery = async ({ certificateId, userId, courseId, instructorId }) => {
  const certificate = await CourseCertificate.create({
    certificateId,
    userId,
    courseId,
    instructorId,
    completedAt: new Date(),
    issuedAt: new Date()
  });

  return await CourseCertificate.findByPk(certificate.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'image', 'email']
      }
    ]
  });
};

// 3. Course Progress & Lectures
const getUserCourseProgressQuery = async (userId, courseId) => {
  return await CourseProgress.findOne({
    where: { userId, courseId },
    include: [{ model: CourseProgressVideo, as: 'courseProgressVideos' }]
  });
};

// 4. Course Comments
const createCourseCommentQuery = async ({ courseId, userId, parentCommentId, text }) => {
  const newComment = await CourseComment.create({
    courseId,
    userId,
    parentCommentId: parentCommentId || null,
    text
  });

  return await CourseComment.findByPk(newComment.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'image', 'accountType']
      }
    ]
  });
};

const findCourseCommentByIdQuery = async (commentId) => {
  return await CourseComment.findByPk(commentId);
};

const findCourseCommentsQuery = async (courseId) => {
  return await CourseComment.findAll({
    where: { courseId, parentCommentId: null },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'image', 'accountType']
      },
      {
        model: CourseComment,
        as: 'replies',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'image', 'accountType']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const deleteCourseCommentQuery = async (commentId) => {
  await CourseComment.destroy({ where: { parentCommentId: commentId } });
  return await CourseComment.destroy({ where: { id: commentId } });
};

// 5. Category Helpers
const findCategoryByIdOrNameQuery = async (category) => {
  if (!category) {
    return await Category.findOne();
  }
  if (!isNaN(category)) {
    let cat = await Category.findByPk(Number(category));
    if (cat) return cat;
  }
  let cat = await Category.findOne({ where: { name: category } });
  if (cat) return cat;

  return await Category.findOne();
};

const createCourseQuery = async (courseData) => {
  return await Course.create(courseData);
};

const findCourseByIdQuery = async (courseId, options = {}) => {
  return await Course.findByPk(courseId, options);
};

const findCourseDetailsByIdQuery = async (courseId) => {
  return await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email', 'image']
      },
      {
        model: Category,
        as: 'category'
      },
      {
        model: Section,
        as: 'courseContent',
        include: [{ model: SubSection, as: 'subSections' }]
      },
      {
        model: RatingAndReview,
        as: 'ratingAndReviews',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'image']
          }
        ]
      }
    ]
  });
};

const findInstructorCoursesQuery = async (instructorId) => {
  return await Course.findAll({
    where: { instructorId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Section,
        as: 'courseContent',
        include: [{ model: SubSection, as: 'subSections' }]
      }
    ]
  });
};

const findAllPublishedCoursesQuery = async (options = {}) => {
  const { page, limit, category, search, sortBy } = options;

  const whereClause = { status: 'Published' };

  if (category && category !== 'all') {
    if (!isNaN(category)) {
      whereClause.categoryId = Number(category);
    } else {
      const cat = await Category.findOne({
        where: {
          name: { [Op.iLike || Op.like]: category }
        }
      });
      if (cat) {
        whereClause.categoryId = cat.id;
      }
    }
  }

  if (search) {
    const q = `%${search.trim()}%`;
    whereClause[Op.or] = [
      { courseName: { [Op.iLike || Op.like]: q } },
      { courseDescription: { [Op.iLike || Op.like]: q } }
    ];
  }

  let order = [['createdAt', 'DESC']];
  if (sortBy === 'price-low') order = [['price', 'ASC']];
  if (sortBy === 'price-high') order = [['price', 'DESC']];

  let pageNum = Math.max(1, parseInt(page, 10) || 1);
  let limitNum = limit === 'all' ? null : Math.min(100, Math.max(1, parseInt(limit, 10) || 12));

  let findOptions = {
    where: whereClause,
    include: [
      {
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'image']
      },
      {
        model: Category,
        as: 'category'
      },
      {
        model: RatingAndReview,
        as: 'ratingAndReviews'
      }
    ],
    order,
    distinct: true
  };

  if (limitNum) {
    findOptions.limit = limitNum;
    findOptions.offset = (pageNum - 1) * limitNum;
  }

  const { count: totalCourses, rows: courses } = await Course.findAndCountAll(findOptions);

  return {
    courses,
    totalCourses,
    totalPages: limitNum ? Math.ceil(totalCourses / limitNum) : 1,
    currentPage: pageNum,
    limit: limitNum || totalCourses
  };
};

const updateCourseQuery = async (courseId, updateData) => {
  const course = await Course.findByPk(courseId);
  if (!course) return null;
  await course.update(updateData);
  return await findCourseDetailsByIdQuery(courseId);
};

const updateCoursePricingQuery = async ({ courseId, price, isFree, changedById, changeReason }) => {
  const course = await Course.findByPk(courseId);
  if (!course) return null;

  const previousPrice = course.price;
  await course.update({ price, isFree });

  await CoursePriceAudit.create({
    courseId,
    previousPrice,
    newPrice: price,
    changedById,
    changeReason: changeReason || 'Price updated by instructor/admin'
  });

  return course;
};

const getCoursePriceAuditsQuery = async (courseId) => {
  return await CoursePriceAudit.findAll({
    where: { courseId },
    include: [
      {
        model: User,
        as: 'changedBy',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const deleteCourseAndRelationsQuery = async (courseId) => {
  const sections = await Section.findAll({ where: { courseId } });
  for (const section of sections) {
    await SubSection.destroy({ where: { sectionId: section.id } });
  }
  await Section.destroy({ where: { courseId } });
  await Enrollment.destroy({ where: { courseId } });
  await RatingAndReview.destroy({ where: { courseId } });
  await CourseProgress.destroy({ where: { courseId } });
  return await Course.destroy({ where: { id: courseId } });
};

const getCategoryPageDetailsQuery = async (categoryId) => {
  const selectedCategory = await Category.findByPk(categoryId, {
    include: [
      {
        model: Course,
        as: 'courses',
        where: { status: 'Published' },
        include: [{ model: RatingAndReview, as: 'ratingAndReviews' }]
      }
    ]
  });

  const differentCategories = await Category.findAll({
    where: { id: { [Op.ne]: categoryId } },
    include: [
      {
        model: Course,
        as: 'courses',
        where: { status: 'Published' },
        include: [{ model: RatingAndReview, as: 'ratingAndReviews' }]
      }
    ]
  });

  return { selectedCategory, differentCategories };
};

const createCategoryQuery = async ({ name, description }) => {
  return await Category.create({ name, description });
};

const upsertRatingAndReviewQuery = async ({ userId, courseId, rating, review }) => {
  const existingRating = await RatingAndReview.findOne({
    where: { userId, courseId }
  });

  if (existingRating) {
    await existingRating.update({ rating, review });
    return existingRating;
  } else {
    return await RatingAndReview.create({ userId, courseId, rating, review });
  }
};

const findAllRatingsAndReviewsQuery = async () => {
  return await RatingAndReview.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'image']
      },
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'courseName']
      }
    ]
  });
};

const getCategoriesCountQuery = async () => {
  return await Category.count();
};

const findAllCategoriesQuery = async (options = {}) => {
  const { page, limit, search } = options;
  const whereClause = {};

  if (search) {
    const { Op } = require('sequelize');
    whereClause.name = { [Op.iLike || Op.like]: `%${search}%` };
  }

  let findOptions = {
    where: whereClause,
    order: [['createdAt', 'DESC']]
  };

  let pageNum = Math.max(1, parseInt(page, 10) || 1);
  let limitNum = limit === 'all' ? null : Math.max(1, parseInt(limit, 10) || 10);

  if (limitNum) {
    findOptions.limit = limitNum;
    findOptions.offset = (pageNum - 1) * limitNum;
  }

  const { count: totalCategories, rows: categories } = await Category.findAndCountAll(findOptions);

  const categoryIds = categories.map(c => c.id);
  const countMap = {};

  if (categoryIds.length > 0) {
    const { Op } = require('sequelize');
    const courseCounts = await Course.findAll({
      attributes: [
        'categoryId',
        [Course.sequelize.fn('COUNT', Course.sequelize.col('id')), 'courseCount']
      ],
      where: {
        status: 'Published',
        categoryId: { [Op.in]: categoryIds }
      },
      group: ['categoryId'],
      raw: true
    });

    courseCounts.forEach(item => {
      if (item.categoryId) {
        countMap[item.categoryId] = parseInt(item.courseCount, 10);
      }
    });
  }

  const mappedCategories = categories.map(cat => {
    const cnt = countMap[cat.id] || 0;
    return {
      ...cat.toJSON(),
      coursesCount: cnt,
      courseCount: cnt
    };
  });

  const totalPages = limitNum ? Math.ceil(totalCategories / limitNum) : 1;

  return {
    categories: mappedCategories,
    totalCategories,
    totalPages,
    currentPage: pageNum || 1,
    limit: limitNum || totalCategories
  };
};

const updateSubSectionDurationQuery = async (subSectionId, duration) => {
  const subSection = await SubSection.findByPk(subSectionId);
  if (!subSection) return null;
  await subSection.update({ duration: Number(duration) || 0 });
  return subSection;
};

module.exports = {
  getHomePageStatsQuery,
  findCertificateByCertIdQuery,
  findCertificateQuery,
  createCertificateQuery,
  getUserCourseProgressQuery,
  createCourseCommentQuery,
  findCourseCommentByIdQuery,
  findCourseCommentsQuery,
  deleteCourseCommentQuery,
  findCategoryByIdOrNameQuery,
  createCourseQuery,
  findCourseByIdQuery,
  findCourseDetailsByIdQuery,
  findInstructorCoursesQuery,
  findAllPublishedCoursesQuery,
  updateCourseQuery,
  updateCoursePricingQuery,
  getCoursePriceAuditsQuery,
  deleteCourseAndRelationsQuery,
  getCategoryPageDetailsQuery,
  createCategoryQuery,
  upsertRatingAndReviewQuery,
  findAllRatingsAndReviewsQuery,
  findAllCategoriesQuery,
  getCategoriesCountQuery,
  updateSubSectionDurationQuery
};
