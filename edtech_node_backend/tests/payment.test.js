const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');
const { User, Course, Enrollment, CourseProgress, Category } = require('../models');

describe('End-to-End Course Purchase Flow', () => {
  let testUser;
  let testCategory;
  let testCourse1;
  let testCourse2;

  beforeAll(async () => {
    // 1. Create test user
    testUser = await User.create({
      firstName: 'Student',
      lastName: 'Buyer',
      email: `buyer_${Date.now()}@example.com`,
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      accountType: 'Student'
    });

    // 2. Create test category & courses
    testCategory = await Category.create({
      name: `Category_${Date.now()}`,
      description: 'Test category'
    });

    testCourse1 = await Course.create({
      courseName: `Full-Stack Course 1 ${Date.now()}`,
      courseDescription: 'Comprehensive Web Development',
      instructorId: testUser.id,
      whatYouWillLearn: 'React, Node, Express, Postgres',
      price: 1999,
      categoryId: testCategory.id,
      status: 'Published'
    });

    testCourse2 = await Course.create({
      courseName: `Full-Stack Course 2 ${Date.now()}`,
      courseDescription: 'Comprehensive Python Development',
      instructorId: testUser.id,
      whatYouWillLearn: 'Python, Django, FastAPI',
      price: 2499,
      categoryId: testCategory.id,
      status: 'Published'
    });
  });

  afterAll(async () => {
    const courseIds = [testCourse1?.id, testCourse2?.id].filter(Boolean);
    if (courseIds.length > 0) {
      await CourseProgress.destroy({ where: { courseId: courseIds } }).catch(() => {});
      await Enrollment.destroy({ where: { courseId: courseIds } }).catch(() => {});
      await Course.destroy({ where: { id: courseIds } }).catch(() => {});
    }
    if (testCategory) {
      await Category.destroy({ where: { id: testCategory.id } }).catch(() => {});
    }
    if (testUser) {
      await User.destroy({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  test('1. createPaymentOrder should NOT throw "Course is not defined"', async () => {
    const req = {
      body: {
        courses: [testCourse1.id],
        plan: 'gold'
      },
      user: { id: testUser.id, email: testUser.email }
    };

    let statusCode = 200;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            return data;
          }
        };
      }
    };

    await createPaymentOrder(req, res);

    expect(statusCode).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.message || responseData.data).toBeDefined();

    // Verify enrollment and progress were created
    const enrollment = await Enrollment.findOne({
      where: { userId: testUser.id, courseId: testCourse1.id }
    });
    expect(enrollment).not.toBeNull();
    expect(enrollment.status).toBe('active');

    const progress = await CourseProgress.findOne({
      where: { userId: testUser.id, courseId: testCourse1.id }
    });
    expect(progress).not.toBeNull();
  });

  test('2. Free plan course purchase activates enrollment directly', async () => {
    const req = {
      body: {
        courses: [testCourse2.id],
        plan: 'free'
      },
      user: { id: testUser.id, email: testUser.email }
    };

    let statusCode = 200;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            return data;
          }
        };
      }
    };

    await createPaymentOrder(req, res);

    expect(statusCode).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.isFree).toBe(true);

    const enrollment = await Enrollment.findOne({
      where: { userId: testUser.id, courseId: testCourse2.id }
    });
    expect(enrollment).not.toBeNull();
    expect(enrollment.status).toBe('active');
    expect(enrollment.plan).toBe('free');
  });

  test('3. Re-purchasing same course with active Gold plan returns 400', async () => {
    const req = {
      body: {
        courses: [testCourse1.id],
        plan: 'gold'
      },
      user: { id: testUser.id, email: testUser.email }
    };

    let statusCode = 200;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            return data;
          }
        };
      }
    };

    await createPaymentOrder(req, res);

    expect(statusCode).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toContain('Gold Lifetime Access');
  });
});
