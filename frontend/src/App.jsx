import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. IMPORT THE CLOUD
import { OrderProvider } from './context/OrderContext';
import { InventoryProvider } from './context/InventoryContext'; 

// Import your pages
import POSScreen from "./pages/POSScreen/POSScreen"; 
import KitchenDisplay from "./pages/KDS/KitchenDisplay"; 
import BackOffice from "./pages/BackOffice/BackOffice";
import MenuManager from './pages/BackOffice/MenuManager';
import Attendance from './pages/BackOffice/Attendance';
import Inventory from "./pages/Inventory/Inventory";     
import Reservations from "./pages/Reservations/Reservations";

function App() {
  return (
    // 2. WRAP YOUR ENTIRE APP IN THE CLOUD
    <OrderProvider> 
      <InventoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<POSScreen />} />
            <Route path="/kds" element={<KitchenDisplay />} />
            <Route path="/admin" element={<BackOffice />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/backoffice" element={<MenuManager />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </Router>
      </InventoryProvider>
    </OrderProvider>
  );
}

export default App;