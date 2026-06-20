import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import Products from "./pages/Products";
import PayAndPlay from "./pages/PayAndPlay";
import Coaches from "./pages/Coaches";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import Gallery from "./pages/Gallery";
import Careers from "./pages/Careers";
import Events from "./pages/Events";
import Coaching from "./pages/Coaching";
import Blogs from "./pages/Blogs";
import Competitions from "./pages/Competitions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Safety from "./pages/Safety";
import ReportBugs from "./pages/ReportBugs";
import StudentLayout from "./components/StudentLayout";
import StudentPrograms from "./pages/student/StudentPrograms";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentPerformance from "./pages/student/StudentPerformance";
import StudentCoaches from "./pages/student/StudentCoaches";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentPurchases from "./pages/student/StudentPurchases";
import StudentPayAndPlay from "./pages/student/StudentPayAndPlay";
import StudentEvents from "./pages/student/StudentEvents";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/Members";
import AdminCourses from "./pages/admin/Courses";
import AdminBatches from "./pages/admin/Batches";
import AdminCoaches from "./pages/admin/CoachesManagement";
import AdminBanners from "./pages/admin/Banners";
import AdminEquipment from "./pages/admin/Equipment";
import AdminAttendance from "./pages/admin/Attendance";
import AdminPurchases from "./pages/admin/Purchases";
import AdminTransactions from "./pages/admin/Transactions";
import AdminPayAndPlayBookings from "./pages/admin/PayAndPlayBookings";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="programs" element={<Programs />} />
            <Route path="products" element={<Products />} />
            <Route path="pay-and-play" element={<PayAndPlay />} />
            <Route path="coaches" element={<Coaches />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="events" element={<Events />} />
            <Route path="careers" element={<Careers />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="coaching" element={<Coaching />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="competitions" element={<Competitions />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="safety" element={<Safety />} />
            <Route path="report-bugs" element={<ReportBugs />} />
          </Route>

          {/* Student Routes */}
          <Route element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/myschedule" element={<StudentSchedule />} />
            <Route path="/myprograms" element={<StudentPrograms />} />
            <Route path="/mycoaches" element={<StudentCoaches />} />
            <Route path="/myperformance" element={<StudentPerformance />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/myattendance" element={<StudentAttendance />} />
            <Route path="/mypurchases" element={<StudentPurchases />} />
            <Route path="/mypayandplay" element={<StudentPayAndPlay />} />
            <Route path="/myevents" element={<StudentEvents />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="coaches" element={<AdminCoaches />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="equipment" element={<AdminEquipment />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="purchases" element={<AdminPurchases />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="payandplay" element={<AdminPayAndPlayBookings />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="gallery" element={<AdminGallery />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
