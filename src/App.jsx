import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import {
    Navbar,
    Hero,
    Products,
    About,
    Gallery,
    Testimonials,
    Contact,
    Newsletter,
    Footer,
    Notification,
    FloatingCartButton,
    CartSidebar,
    CheckoutModal,
    OrderSuccess,
    ProductDetail
} from './components';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import { Login, Signup } from './pages';

// Admin imports
import { AdminProvider } from './admin/context/AdminContext';
import AdminLayout from './admin/components/AdminLayout';
import {
    Dashboard,
    Products as AdminProducts,
    Orders as AdminOrders,
    Users as AdminUsers,
    Blogs as AdminBlogs,
    Analytics as AdminAnalytics,
    Settings as AdminSettings,
    AdminLogin
} from './admin/pages';

// Home page with all sections
const HomePage = () => (
    <>
        <Navbar />
        <Hero />
        <Products />
        <About />
        <Gallery />
        <Testimonials />
        <Contact />
        <Newsletter />
        <Footer />
    </>
);

// Admin wrapper with layout
const AdminRoute = ({ children }) => (
    <AdminProvider>
        <AdminLayout>
            {children}
        </AdminLayout>
    </AdminProvider>
);

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <CartProvider>
                    <Routes>
                        {/* Customer Routes */}
                        <Route path="/" element={
                            <div className="min-h-screen bg-cream font-sans">
                                <HomePage />
                                <CartSidebar />
                                <CheckoutModal />
                                <Notification />
                                <FloatingCartButton />
                            </div>
                        } />
                        <Route path="/product/:id" element={
                            <div className="min-h-screen bg-cream font-sans">
                                <ProductDetail />
                                <CartSidebar />
                                <CheckoutModal />
                                <Notification />
                                <FloatingCartButton />
                            </div>
                        } />
                        <Route path="/order-success" element={
                            <div className="min-h-screen bg-cream font-sans">
                                <OrderSuccess />
                            </div>
                        } />

                        {/* Auth Routes - only accessible when NOT logged in */}
                        <Route path="/login" element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        } />
                        <Route path="/signup" element={
                            <GuestRoute>
                                <Signup />
                            </GuestRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={
                        <AdminProvider>
                            <AdminLogin />
                        </AdminProvider>
                    } />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                        <AdminRoute>
                            <AdminProducts />
                        </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <AdminRoute>
                            <AdminOrders />
                        </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    } />
                    <Route path="/admin/blogs" element={
                        <AdminRoute>
                            <AdminBlogs />
                        </AdminRoute>
                    } />
                    <Route path="/admin/analytics" element={
                        <AdminRoute>
                            <AdminAnalytics />
                        </AdminRoute>
                    } />
                    <Route path="/admin/settings" element={
                        <AdminRoute>
                            <AdminSettings />
                        </AdminRoute>
                    } />
                </Routes>
            </CartProvider>
        </ProductProvider>
    </AuthProvider>
    );
}

export default App;
