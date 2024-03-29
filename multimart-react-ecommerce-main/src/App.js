import {lazy, Suspense, useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Product = lazy(() => import("./pages/Product"));
const Login = lazy(() => import("./pages/Login"));
const Inscription = lazy(() => import("./pages/Inscription"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PurchasesManagement = lazy(() => import("./pages/PurchasesManagement"));
const UsersManagement = lazy(() => import("./pages/UsersManagement"));
const ProductsManagement = lazy(() => import("./pages/ProductsManagement"));
const AddProduct = lazy(() => import("./pages/AddProduct"));

function App() {
  const [triggerTotalDistinctProducts, setTriggerTotalDistinctProducts] = useState(0);
  const trigerTotalDistinctProducts = async () => {
    setTriggerTotalDistinctProducts((trigger) => trigger + 1);

  };
  return (
    <Suspense fallback={<Loader />}>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <NavBar trigger={triggerTotalDistinctProducts} />

        <Routes>
          <Route path="/" element={<Shop triggerTotalDistinctProducts={trigerTotalDistinctProducts} />} />
          <Route path="/shop/:id" element={<Product />} />
          <Route path="/cart" element={<Cart triggerTotalDistinctProducts={trigerTotalDistinctProducts} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/purchases" element={<PurchasesManagement />} />
          <Route path="/products" element={<ProductsManagement />} />
          <Route path="/AddProduct" element={<AddProduct />} />
          <Route path="/AddProduct/:id" element={<AddProduct />} />

        </Routes>
        <Footer />
      </Router>
    </Suspense>
  );
}

export default App;
