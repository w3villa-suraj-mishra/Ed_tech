import { getDashboardPathForUser } from './authNavigation';

describe('getDashboardPathForUser', () => {
  test('redirects instructors to instructor dashboard', () => {
    expect(getDashboardPathForUser('Instructor')).toBe('/dashboard/instructor');
    expect(getDashboardPathForUser({ accountType: 'Instructor' })).toBe('/dashboard/instructor');
  });

  test('redirects students to global dashboard', () => {
    expect(getDashboardPathForUser('Student')).toBe('/dashboard/global');
    expect(getDashboardPathForUser({ accountType: 'Student' })).toBe('/dashboard/global');
  });
});
