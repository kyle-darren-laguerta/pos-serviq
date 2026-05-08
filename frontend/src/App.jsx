import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. IMPORT THE CLOUD (The Provider we just made)
import { OrderProvider } from './context/OrderContext'; 

// Import your pages (Using your clean new folder structure!)
import POSScreen from "./pages/POSScreen/POSScreen"; 
import KitchenDisplay from "./pages/KDS/KitchenDisplay"; 
import BackOffice from "./pages/BackOffice/BackOffice";
import Inventory from "./pages/Inventory/Inventory";     
import Reservations from "./pages/Reservations/Reservations";

function App() {
  return (
    // 2. WRAP YOUR ENTIRE APP IN THE CLOUD
    <OrderProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<POSScreen />} />
          <Route path="/kds" element={<KitchenDisplay />} />
          <Route path="/admin" element={<BackOffice />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reservations" element={<Reservations />} />
        </Routes>
      </Router>
    </OrderProvider>
  );
}

export default App;