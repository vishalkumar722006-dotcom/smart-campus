import React from 'react';
import ChatBot from './components/ChatBot';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import Resources from './pages/Resources';
import ResourceDetails from './pages/ResourceDetails';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 130px)', paddingTop: '70px' }}>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/resources" element={<Layout><Resources /></Layout>} />
            <Route path="/resources/:id" element={<Layout><ResourceDetails /></Layout>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/dashboard/student" element={<ProtectedRoute roles={['student']}><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/faculty" element={<ProtectedRoute roles={['faculty']}><Layout><FacultyDashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute roles={['student', 'faculty']}><Layout><MyBookings /></Layout></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute roles={['student', 'faculty', 'admin']}><Layout><BookingDetails /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute roles={['student', 'faculty', 'admin']}><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;