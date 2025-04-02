import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DataStatisticsView from '../views/DataStatisticsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
    // 用户管理路由
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: () => import('../views/UserDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: { requiresAuth: true }
    },
    // 教师管理路由
    {
      path: '/teachers',
      name: 'teachers',
      component: () => import('../views/TeachersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/teachers/:id',
      name: 'teacher-detail',
      component: () => import('../views/TeacherDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/teachers/:id/verification',
      name: 'teacher-verification',
      component: () => import('../views/TeacherVerificationView.vue'),
      meta: { requiresAuth: true }
    },
    // 内容管理路由
    {
      path: '/posts',
      name: 'posts',
      component: () => import('../views/PostsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true }
    },
    // 系统设置路由
    {
      path: '/system-settings',
      name: 'system-settings',
      component: () => import('../views/SystemSettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/data-statistics',
      name: 'data-statistics',
      component: DataStatisticsView,
      meta: { requiresAuth: true }
    },
  ],
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('admin_token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 如果页面需要登录但用户未登录，重定向到登录页
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // 如果用户已登录但尝试访问登录或注册页，重定向到首页
    next({ name: 'dashboard' })
  } else {
    // 其他情况正常导航
    next()
  }
})

export default router
