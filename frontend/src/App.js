import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// components
import { Restaurants } from './containers/Restaurants.jsx';
import { Foods } from './containers/Foods.jsx';
import { Orders } from './containers/Orders.jsx';

function App() {
  console.log('jsx element:',React.isValidElement(<Restaurants/>))
  console.log('jsx element:',React.isValidElement(Restaurants))
  return (
    <Router>
      <Routes>
        // 店舗一覧ページ
        <Route
          exact
          path="/restaurants"
          element={<Restaurants/>}
        />
        // フード一覧ページ
        <Route
          exact
          path="/foods"
          element={<Foods/>}
        />
        <Route
          exact
          path="/orders"
          element={<Orders/>}
         />
        <Route
          exact
          path="/restaurants/:restaurantsId/foods"
          element={<Foods/>}
        />
      </Routes>
    </Router>
  );
}

export default App;
