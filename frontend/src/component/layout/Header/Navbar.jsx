import PlaceIcon from "@mui/icons-material/Place";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ErrorIcon from '@mui/icons-material/Error';
import './Navbar.css';
import './UserMenu.css';
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../loader/loader";
import { useNavigate } from "react-router-dom";
import { switchAccount, logoutAll } from "../../../SliceThunks/userSliceThunks.jsx";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useLoadUserQuery, useLogoutMutation } from "../../../Services/userApi.jsx";
import { api } from "../../../Services/api.jsx";
import {Skeleton} from "./Skeleton.jsx";
import { useGetSearchProductResultQuery } from "../../../Services/productApi.jsx";
import { useGetCartItemsQuery } from "../../../Services/cartApi.jsx";
import { useDebounce } from "./Debounce.jsx";

export const Navbar = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const debounceValue = useDebounce(searchTerm, 1000);
    const {data: {products} = {}, isloading: loading, isFetching: fetching, isError: error} = useGetSearchProductResultQuery({keyword: debounceValue});
    
    const [searchBoxVisible, setSearchBoxVisible] = useState(false);
    const [navLinksopen, SetNavLinksOpen] = useState(false);

    const authStatus = useSelector((state) => state.auth.status);

    useGetCartItemsQuery(undefined, {skip: authStatus === 'unauthenticated'});
    const {cartItems} = useSelector((state) => state.cart);
    const {data:user, isLoading} = useLoadUserQuery(undefined, {skip: authStatus === 'unauthenticated'});
    const [logout] = useLogoutMutation();

    const handleOpenNavLinkBoxCLick = (e) => {
        e.preventDefault();
        SetNavLinksOpen(!navLinksopen);
    }

    const handleOnChangeKeywordFunc = async (e) => {
        e.preventDefault();
        setSearchTerm(e.target.value);     

        if (e.target.value === '') {
            setSearchBoxVisible(false);
        } else {
            setSearchBoxVisible(true);
        }
    }

    const fullSearch = (e) => {
        e.preventDefault();

        setSearchBoxVisible(false);

        navigate(`/products${'?keyword='}${searchTerm}`);
    }

    // Search Result on suggestion box
    const renderSearchResults = () => {       

        // Show <loader/> if loading, fetching or debouncing        
        if (isLoading || debounceValue !== searchTerm || fetching) return <Loader style={{ height: '100%' }} />

        // If error, show error. if no result found show the message
        if(!products || products.length === 0) {
            return (
                <div className="noItem">
                    {`${error ? <><ErrorIcon/> Failed to get data. Try again!</> : 'No Items Found'}`}
                </div>
            )
        }


        // If there is any result, show it
        return products.map((item) => (
            <a key={item._id} href={`/product/${item._id}`} className="suggestionItem">
                <div className="tumbnailPrev">
                    <img alt="thumbnail" src={item.images.length > 0 && item.images[0].url} />
                </div>
                <div className="descPrev">{item.name}</div>
                <div className="navPrice">{`₹ ${item.price}`}</div>
            </a>
        ));
            
    }

    const exitTestAdminOrUserMode = (e) => {
        e.preventDefault();
        dispatch(switchAccount(user.createdBy));
    }

    const handleLogout = async(e) => {
        e.preventDefault();
        if (user?.role !== 'user') {
            dispatch(switchAccount(user.createdBy));
            return;
        }
        logout();
        dispatch(logoutAll());
        dispatch(api.util.resetApiState());
    }

    const handleOutsideSuggestionClick = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget )) {
            setSearchBoxVisible(false);
        }
    }

    const handleInputBoxClick = (e) => {
        e.preventDefault();
        if (searchTerm) {
            setSearchBoxVisible(true);
        }
    }

    useEffect(() => {
        // For small screen layout when all other layout should be blocked when nav-links are visible/opened
        if (navLinksopen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => document.body.style.overflow = '';
    }, [navLinksopen]);

    return (
        <nav className="navBarCustom">
            <div onClick={handleOpenNavLinkBoxCLick} className='openNavButton'></div>
            {/* ---------------------------------------------- Company Logo -------------------------------------------------*/}
            <a href="/" className="companyLogoNav">ECOMMERCE</a>


            {/* ----------------------------------------------- Search Box -------------------------------------------------*/}
            <div tabIndex={0} onBlur={ (e) => handleOutsideSuggestionClick(e)} className="navBarSearchboxWrap">
                <form className="navBarSearchboxForm" onSubmit={fullSearch}>
                    <input onFocus={handleInputBoxClick} type="text" className="navBarSearchbox" onChange={handleOnChangeKeywordFunc}/>
                    <div className="searchIcon">
                        <button type="submit">
                            <SearchIcon/>
                        </button>
                    </div>
                </form>
                <div className={`suggestionBox ${searchBoxVisible ? 'visible' : ''}`}>
                    {renderSearchResults()}
                    <div className="seeAllResults"><button onClick={fullSearch}>See All Results</button></div>
                </div>
            </div>


            {/* ---------------------------------------------- Navigation Links -------------------------------------------------*/}
            <div className={`nav-links ${!navLinksopen ? 'nav-links-hidden' : ''}`}> 
                <div className="nav-links-background-dim"></div>
                <div className="nav-links-main">
                    <div onClick={handleOpenNavLinkBoxCLick} className='closeNavButton'></div>
                    {user && user.role !== 'user' && <button className="exitTestAdminUser" onClick={(e) => exitTestAdminOrUserMode(e)}>{user.role === "test_admin" ? 'Exit test admin' : 'Exit test user'}</button>}
                    {/* ------------------------------- Location Section -------------------------------------- */}
                        <div className="nav-link-item LocationInfo">
                            {/* TODO: Create Selection of Location feature */}
                            <div className="nav-link-item-sub locationInfoSub">
                                <div className="locationSub">
                                    Location
                                    <PlaceIcon />
                                </div>
                                <div className="stateAreaPincode">Select your Location</div>
                            </div>
                            <div className="changeLocationBox">
                                <div className="locationBoxLabel" >Enter your location</div>
                                <input type="text" size="10" className="locationBoxInput"/>
                                <input type="button" value="Change" className="locationBoxSubmit"/>
                            </div>
                        </div>
                    {/* ---------------------------------- All Products Page Link ------------------------------------- */}
                    <a href="/products" className="nav-link-item">
                        <div className="nav-link-item-sub">Products</div>
                    </a>
                    {/* ---------------------------------- Accounts Section -------------------------------------------- */}
                    <div className="nav-link-item accountLoginSignup">
                        <a href={`${(authStatus === 'authenticated' && user) ? "/account" : "/login"}`} 
                            className="nav-link-item-acc nav-link-item-sub" >
                            <AccountCircleOutlinedIcon/>
                            {
                                isLoading ? <Skeleton/> : 
                                    <div>{`${(authStatus === 'authenticated' && user) ? 
                                        user.name : 
                                        "Login/Signup"}`}
                                    </div>
                            }
                        </a>   
                        {user && 
                            <div className="userMenuContainer">
                                {user.role === 'test_admin' && <a href='/admin/dashboard' className="userMenuContainerElement dashboardMenu">Dashboard</a>}
                                <a href='/orders' className="userMenuContainerElement ordersMenu">Orders</a>
                                <a href='/account' className="userMenuContainerElement profileMenu">Profile</a>
                                <a href='/cart' className="userMenuContainerElement cardMenu">Cart</a>
                                <a onClick={(e) => handleLogout(e)} className="userMenuContainerElement logoutMenu">Logout</a>
                            </div>
                        }
                    </div>
                    {/* ---------------------------------- Cart Section -------------------------------------------- */}
                    <div className="nav-link-item">
                        <a href="/cart" className="nav-link-item-sub cartInfo">
                            <div className="cartInfoSub">
                                {
                                cartItems && Object.keys(cartItems).length > 0 &&
                                    <div className="cartItems">{Object.keys(cartItems).length}</div>
                                }
                                <ShoppingCartOutlinedIcon/>
                            </div>                        
                            <div>Cart</div>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
        );
};