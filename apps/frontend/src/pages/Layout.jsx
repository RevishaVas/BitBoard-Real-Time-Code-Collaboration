import { useState,useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import NavBar from '../components/Header/Navbar';
const Layout = () => {

  const { user } = useSelector((state) => state.auth);


  const [loading, setLoading] = useState(true);


  const location = useLocation();

  useEffect(() => {
    setLoading(true); 
  }, [location]); 

  
  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false); 
    }, 500); 

    
    return () => clearTimeout(delay);
  }, [location]);

  return (
    <>
    <div className='w-full h-screen flex flex-col md:flex-row bg-[#1b1b1b] dark:bg-[#1b1b1b]'>
      <NavBar />
      
      <div className='flex-1 overflow-y-auto pt-16 sm:pt-0 sm:ml-64'>
        <div className='p-4 2xl:px-10 h-full'>
          <Outlet />
        </div>
      </div>
    </div>
    {/* <div className='w-full h-screen flex flex-col md:flex-row'>

    <div className='flex-1 overflow-y-auto'>
      <NavBar />

      <div className='p-4 pt-20 2xl:px-10 sm:ml-64 bg-[#f5f5f5] dark:bg-[#1b1b1b] h-screen'>
       <Outlet />
     
      </div>
    </div>
  </div> */}
    </>
  )

};

export default Layout;
