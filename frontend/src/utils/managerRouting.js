export const normalizeManagerDepartment = (department) => String(department || '').trim().toLowerCase();

export const getManagerHomePath = (department) => {
  const normalizedDepartment = normalizeManagerDepartment(department);

  if (normalizedDepartment === 'listings') {
    return '/manager/listings';
  }

  if (normalizedDepartment === 'finance') {
    return '/finance/dashboard';
  }

  return '/manager';
};
