import React, { useMemo } from 'react';
import Sidebar from './Sidebar';
import './dashboard.css';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import MetaData from '../layout/MetaData';
import { useGetAllProductsQuery } from '../../Services/productApi.jsx';
import Loader from '../layout/loader/loader.jsx';
import { useGetAllOrdersAdminQuery } from '../../Services/orderApi.jsx';

ChartJS.register(...registerables);
ChartJS.defaults.color = '#FFF';
ChartJS.defaults.borderColor = '#FFF';


const Dashboard = () => {

  const {stock, productCount, isLoading: isGetAllProductQueryLoading} = useGetAllProductsQuery(undefined, {
    selectFromResult: ({data, isLoading}) => ({
      isLoading,
      productCount: data?.productCount || 0,
      stock: (() => {
        const products = data?.products || [];

        const outOfStock = products.reduce((count, item) => {
          return item.stock === 0 ? count + 1 : count;
        }, 0);

        return {
          outOfStock,
          Instock: products.length - outOfStock,
        }
      })(),
    })
  });


  const {totalAmount, ordersLength, isLoading: isGetAllOrdersLoading} = useGetAllOrdersAdminQuery(undefined, {
    selectFromResult: ({data, isLoading}) => ({
      isLoading,
      ordersLength: data?.orders?.length || 0,
      totalAmount: data?.orders?.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    })
  });


  const lineState = useMemo(() => ({
    labels: ['Initial Amount', 'Amount Earned'],
    datasets: [
      {
        label: 'TOTAL AMOUNT',
        backgroundColor: ['tomato'],
        hoverBackgroundColor: ['rgb(197, 72, 49)'],
        data: [0, totalAmount],
      },
    ],
  }), [totalAmount]);


  const doughnutState = useMemo(() => ({
    labels: ['Out of Stock', 'InStock'],
    datasets: [
      {
        backgroundColor: ['#00A6B4', '#6800B4'],
        hoverBackgroundColor: ['#4B5000', '#35014F'],
        data: [stock.outOfStock, stock.Instock],
      },
    ],
  }), [stock]);


  if (isGetAllOrdersLoading || isGetAllProductQueryLoading) {
    return <Loader/>
  }

  return (
    <>
      <div className="dashboard">

        <MetaData title="Dashboard - Admin Panel" />

        <Sidebar />

        <div className="dashboardContainer">
          <h3 className='note'>Note: You can only edit or delete Products and Reviews that you have created.</h3>
          <div className="dashboardSummary">
              <p className='dashboardSummaryElement'>
                Total Amount <br /> ₹{totalAmount}
              </p>
              <Link className='dashboardSummaryElement' to="/admin/products">
                <p>Product</p>
                <p>{productCount}</p>
              </Link>
              <Link className='dashboardSummaryElement' to="/admin/orders">
                <p>Orders</p>
                <p>{ordersLength}</p>
              </Link>
              <Link className='dashboardSummaryElement' to="/admin/users">
                <p>Users</p>
              </Link>
              <Link className='dashboardSummaryElement' to="/admin/reviews">
                <p>Reviews</p>
              </Link>
          </div>

          <div className='charts'>
              <div className="lineChart">
                  <Line data={lineState} />
              </div>
              <div className="doughnutChart">
                  <Doughnut data={doughnutState} />
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
