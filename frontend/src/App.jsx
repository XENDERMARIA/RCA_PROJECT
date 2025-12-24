import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateRCA from './pages/CreateRCA';
import RCAList from './pages/RCAList';
import RCADetails from './pages/RCADetails';
import EditRCA from './pages/EditRCA';
import ProblemSolver from './pages/ProblemSolver';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/solve" element={<ProblemSolver />} />
        <Route path="/create" element={<CreateRCA />} />
        <Route path="/rcas" element={<RCAList />} />
        <Route path="/rca/:id" element={<RCADetails />} />
        <Route path="/rca/:id/edit" element={<EditRCA />} />
      </Routes>
    </Layout>
  );
}

export default App;
