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
import { DataList } from '../../DataList.jsx';

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

  const deleteUserHandler = useCallback(async(e, userDetails) => {
    e.stopPropagation();
    try {
      SetDeleteButtonDisabled(true);
      await deleteTestUser(userDetails['User Id']).unwrap();
      SetDeleteButtonDisabled(false);
    } catch(error) {
      console.log(error);
      SetDeleteButtonDisabled(false);
    }
  }, [deleteTestUser]);

  const editUserHandler = useCallback((e, userDetails) => {
    e.stopPropagation();
    navigate(`/admin/user/${userDetails['User Id']}`);
  });

  const handleClickEvent = (e, testUserQuantity) => {
    e.stopPropagation();
    e.preventDefault();
    generateTestUser(testUserQuantity);
  };

  const handleTestNowButtonClick = useCallback((e, userDetails) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(switchAccount(userDetails['User Id']));
  }, [dispatch]);

  const rows = useMemo(() => {
    return Object.values(loadTestUsersData).filter((values) => (account._id !== values._id && account.createdBy !== values._id))
      .map((values) => ({
        'User Id': values._id,
        Role: values.role,
        Email: values.email,
        Name: values.name
      }))
  }, [loadTestUsersData, account]);

  const columnData = {
    heading: ['User Id', 'Role', 'Email', 'Name', 'Actions'],
    data: rows,
    columnLength: 6,
    gridCellTemplateColumn: '2fr 1fr 3fr 1fr 1fr 1fr',
    viewDetailsButton: false,
    ActionButtons: [<EditIcon/>, <DeleteIcon/>],
    ActionButtonsHandler: [editUserHandler, deleteUserHandler],
    CustomColumnsButton: [{'Test Live': 'Test now'}],
    CustomColumnsButtonClickHandler: [handleTestNowButtonClick]
  }

  if (loadTestUsersReqLoading || delTestUserReqLoading || generateTestUserReqLoading) {
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

          <DataList data={columnData} />
          
        </div>
      </div>
    </>
  );
};

export default UsersList;
