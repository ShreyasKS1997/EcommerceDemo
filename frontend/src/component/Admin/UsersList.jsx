import React, {  useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './UserDataGridList.css';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ThemeProvider } from '@mui/material';
import MetaData from '../layout/MetaData';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SideBar from './Sidebar';
import { switchAccount } from '../../SliceThunks/userSliceThunks';
import Loader from '../layout/loader/loader';
import { addNotification, selectActiveAccount } from '../../SliceThunks/utils.jsx';
import { useDeleteTestUserMutation, useGenerateTestUserMutation, useLoadTestUsersQuery, useLoadUserQuery } from '../../Services/userApi.jsx';
import { MuiTheme } from '../../MuiTheme.jsx';

const UsersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deleteButtonDisabled, SetDeleteButtonDisabled] = useState(false);
  const [testUserQuantity, setTestUserQuantity] = useState(5);
  const account = useSelector(selectActiveAccount);

  const [deleteTestUser, {isLoading:delTestUserReqLoading, error: deleteTestUserError}] = useDeleteTestUserMutation();
  const {data, isLoading:loadTestUsersReqLoading} = useLoadTestUsersQuery();
  const [generateTestUser, {isLoading:generateTestUserReqLoading, error:generateTestUserReqError}] = useGenerateTestUserMutation();

  const loadTestUsersData = data || [];

  const deleteUserHandler = useCallback(async(e, id) => {
    e.stopPropagation();
    try {
      SetDeleteButtonDisabled(true);
      await deleteTestUser(id).unwrap();
      SetDeleteButtonDisabled(false);
    } catch(error) {
      console.log(error);
      SetDeleteButtonDisabled(false);
    }
  }, [deleteTestUser]);

  const handleClickEvent = (e, testUserQuantity) => {
    e.stopPropagation();
    e.preventDefault();
    generateTestUser(testUserQuantity);
  };

  const handleTestNowButtonClick = useCallback((e, id) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(switchAccount(id));
  }, [dispatch]);

  const columns = useMemo(() => [
    { field: 'id', headerName: 'User ID', minWidth: 180, flex: 0.8 },

    {
      field: 'email',
      headerName: 'Email',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 150,
      flex: 0.5,
    },

    {
      field: 'role',
      headerName: 'Role',
      type: 'number',
      minWidth: 150,
      flex: 0.3,
      cellClassName: (params) => {
        return params.id === 'test_admin' ? 'greenColor' : 'redColor';
      },
    },

    {
      field: 'test_live',
      headerName: 'Test live',
      type: 'number',
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <button onClick={(e) => handleTestNowButtonClick(e, params.id)}>
              Test now
            </button>
          </>
        )
      },
    },

    {
      field: 'actions',
      flex: 0.3,
      headerName: 'Actions',
      minWidth: 150,
      type: 'actions',
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Button onClick={() => navigate(`/admin/user/${params.id}`)}>
              <EditIcon />
            </Button>
            <Button disabled={deleteButtonDisabled} onClick={(e) => deleteUserHandler(e, params.id)}>
              <DeleteIcon />
            </Button>
          </>
        );
      },
    },
  ], [navigate, deleteUserHandler, deleteButtonDisabled, handleTestNowButtonClick]
);

  const rows = useMemo(() => {
    return Object.values(loadTestUsersData).filter((values) => (account._id !== values._id && account.createdBy !== values._id))
      .map((values) => ({
        id: values._id,
        role: values.role,
        email: values.email,
        name: values.name
      }))
  }, [loadTestUsersData, account]);

  if (loadTestUsersReqLoading) {
    return <Loader/>
  }

  return (
    <>
      <MetaData title={`ALL USERS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <h1 id="productListHeading">ALL USERS</h1>

          <form onSubmit={(e) => handleClickEvent(e, testUserQuantity)} className='autoGenerateTestUsersButton'>
            <div className='inputBox'>
              <div className='inputDecrease' onClick={() => {testUserQuantity > 1 && setTestUserQuantity(testUserQuantity - 1)}}></div>
              <input type='number' min={1} max={5} value={testUserQuantity} id='testUserNumberInput' readOnly />
              <div className='inputIncrease' onClick={() => {testUserQuantity < 5 && setTestUserQuantity(testUserQuantity + 1)}}></div>
            </div>
            <button type='submit'>Auto generate test users</button>
          </form>

          <ThemeProvider theme={MuiTheme}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              className="productListTable"
              loading={loadTestUsersReqLoading || delTestUserReqLoading || generateTestUserReqLoading}
              autoHeight
            />
          </ThemeProvider>
        </div>
      </div>
    </>
  );
};

export default UsersList;
