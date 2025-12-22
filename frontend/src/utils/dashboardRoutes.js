/**
 * Centralized Dashboard Route Helper
 * Maps user roles to their appropriate dashboard routes
 */

export const DASHBOARD_ROUTES = {
  admin: '/admin/dashboard',
  reception: '/reception/dashboard',
  salesman: '/salesman/dashboard',
  service_engineer: '/engineer/dashboard',
  office_staff: '/office/dashboard',
  customer: '/customer' // Customers don't have dashboards in staff portal
}

/**
 * Get the dashboard route for a given role
 * @param {string} role - User role
 * @returns {string} Dashboard route path
 */
export function getDashboardRoute(role) {
  return DASHBOARD_ROUTES[role] || '/'
}

/**
 * Check if a route is a public route (no authentication required)
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function isPublicRoute(path) {
  const publicRoutes = [
    '/',
    '/products',
    '/services',
    '/contact',
    '/about',
    '/blog',
    '/login',
    '/enquiry'
  ]
  
  // Check exact matches
  if (publicRoutes.includes(path)) return true
  
  // Check patterns like /products/:id, /enquiry/:productId
  if (path.startsWith('/products/') || path.startsWith('/enquiry/')) return true
  
  return false
}

/**
 * Check if a route is an internal staff route
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function isStaffRoute(path) {
  const staffPrefixes = [
    '/admin',
    '/reception',
    '/salesman',
    '/engineer',
    '/office',
    '/employee',
    '/dashboard'
  ]
  
  return staffPrefixes.some(prefix => path.startsWith(prefix))
}

/**
 * Get appropriate redirect after login based on role and previous location
 * @param {string} role - User role
 * @param {string} from - Previous location
 * @returns {string} Redirect path
 */
export function getPostLoginRedirect(role, from = '/') {
  // If coming from a staff route, go there
  if (isStaffRoute(from)) {
    return from
  }
  
  // Otherwise, redirect to role's dashboard
  return getDashboardRoute(role)
}
