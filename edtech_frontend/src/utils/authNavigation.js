export function getDashboardPathForUser(userOrAccountType) {
  const accountType = typeof userOrAccountType === 'string'
    ? userOrAccountType
    : userOrAccountType?.accountType || userOrAccountType?.account_type || 'Student';

  return accountType === 'Instructor' ? '/dashboard/instructor' : '/dashboard/global';
}
