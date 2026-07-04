import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Syllabus from './pages/Syllabus';
import StudyLog from './pages/StudyLog';
import MockSetup from './pages/MockSetup';
import MockExam from './pages/MockExam';
import MockResults from './pages/MockResults';
import MockReview from './pages/MockReview';
import MockTestHistory from './pages/MockTestHistory';
import StudyHistory from './pages/StudyHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/studylog" element={<StudyLog />} />
        <Route path="/studylog/history" element={<StudyHistory />} />
        <Route path="/mocktest" element={<MockSetup />} />
        <Route path="/mocktest/history" element={<MockTestHistory />} />
        <Route path="/mocktest/exam" element={<MockExam />} />
        <Route path="/mocktest/results" element={<MockResults />} />
        <Route path="/mocktest/review" element={<MockReview />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        {/* Redirect root to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
