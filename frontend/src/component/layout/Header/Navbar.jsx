import PlaceIcon from "@mui/icons-material/Place";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ErrorIcon from '@mui/icons-material/Error';
import './Navbar.css';
import './UserMenu.css';
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Loader from "../loader/loader";
import { useNavigate } from "react-router-dom";
import { switchAccount, logoutAll } from "../../../SliceThunks/userSliceThunks.jsx";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useLoadUserQuery, useLogoutMutation } from "../../../Services/userApi.jsx";
import { api } from "../../../Services/api.jsx";
import {Skeleton} from "./Skeleton.jsx";
import { useGetSearchProductResultQuery } from "../../../Services/productApi.jsx";
import { useGetCartItemsQuery } from "../../../Services/cartApi.jsx";

export const Navbar = () => {
    const SEARCH_DEBOUNCE_DELAY = 1000;
    const [searchTerm, setSearchTerm] = useState('');
    const {data: {products} = {}, isloading: loading, isFetching: fetching, isError: error} = useGetSearchProductResultQuery(searchTerm);
    /*const {searchResult, loading, error, searchEmpty} = useSelector((state) => {
        return state.searchResult;
    });*/
    const [debouncing, setDebouncing] = useState(false);
    const [searchResult, setSearchResult] = useState(products);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const suggestionBoxRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const [navLinksopen, SetNavLinksOpen] = useState(false);

    const authStatus = useSelector((state) => state.auth.status);
    useGetCartItemsQuery(undefined, {skip: authStatus === 'unauthenticated'});
    const {cartItems} = useSelector((state) => state.cart);
    const {data:user, isLoading, isFetching, error:loadUserError} = useLoadUserQuery(undefined, {skip: authStatus === 'unauthenticated'});
    const [logout] = useLogoutMutation();

    const handleOpenNavLinkBoxCLick = (e) => {
        e.preventDefault();
        SetNavLinksOpen(!navLinksopen);
    }

    // Search Debouncing Function Main
    const handleOnChangeKeywordFunc = async (e, ms) => {
        setDebouncing(true);

        // Clear previous timer
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setSearchResult([]);
        /*dispatch({
            type: 'SEARCH_PRODUCT_CLEAR',
        });*/

        // Clear the Previous search results when the input from user is updated
        if (e.target.value === '') {
            suggestionBoxRef.current.querySelector('.suggestionBox').style.height = '0';
            suggestionBoxRef.current.querySelector('.suggestionBox').style.visibility = 'hidden';
            return;
        }

        // Set a new timer
        searchTimeoutRef.current = setTimeout(async() => {
            suggestionBoxRef.current.querySelector('.suggestionBox').style.height = 'auto';
            suggestionBoxRef.current.querySelector('.suggestionBox').style.visibility = 'visible';
            setSearchTerm({keyword : e.target.value, currentPage : 1, price : [0, 200000], category : '', ratings : 0});
            setDebouncing(false);
        }, ms);         
    }


    // Navigate to Product page with search results
    const fullSearch = (e) => {
        e.preventDefault();

        // Clear previous timer
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Select the suggestion box and input field
        const sugBox = suggestionBoxRef.current.querySelector('.suggestionBox');
        const navbarInput = suggestionBoxRef.current.querySelector('.navBarSearchbox');

        // Hide the suggestion box
        sugBox.style.height = '0';
        sugBox.style.visibility = 'hidden';

        // Navigate to the products page with the search keyword
        navigate(`/products${navbarInput.value && '?keyword='}${navbarInput.value}`);
    }

    // Search Result on suggestion box
    const renderSearchResults = () => {       
        // Show <loader/> if loading        
        if (loading || fetching || debouncing) return <Loader style={{ height: '100%' }} />

        // If error show error, if no result found show the message
        if(!searchResult || searchResult.length === 0) {
            return (
                <div className="noItem">
                    {error && <ErrorIcon/>}
                    {`${error ? 'Failed to get data. Try again!' : 'No Items Found'}`}
                </div>
            )
        }

        // If there is any result, show it
        return searchResult.map((item) => (
            <a key={item._id} href={`/product/${item._id}`} className="suggestionItem">
                <div className="tumbnailPrev">
                    <img alt="thumbnail" src={item.images.length > 0 && item.images[0].url} />
                </div>
                <div className="descPrev">{item.name}</div>
                <div className="price">{`₹ ${item.price}`}</div>
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

    useEffect(() => {
        if (navLinksopen) {
            document.body.style.overflow = 'hidden';
            document.getElementById('root').style.overflow = 'hidden';
        }
        setSearchResult(products)

        // hide search box when clicked outside suggestion box
        const handleClickOutside = (event) => {
            if (suggestionBoxRef?.current && !suggestionBoxRef.current.contains(event.target)) {
                const suggestionBoxRefChild = suggestionBoxRef.current.querySelector('.suggestionBox');
                suggestionBoxRefChild.style.height = '0';
                suggestionBoxRefChild.style.visibility = 'hidden';;
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'unset';
            document.getElementById('root').style.overflow = 'unset';
        };
    }, [products, dispatch, navLinksopen]);

    return (
        <nav className="navBarCustom">
            <div onClick={handleOpenNavLinkBoxCLick} className='openCloseNavbutton'></div>
            {/* ---------------------------------------------- Company Logo -------------------------------------------------*/}
            <a href="/" className="companyLogoNav">ECOMMERCE</a>


            {/* ----------------------------------------------- Search Box -------------------------------------------------*/}
            <div className="navBarSearchboxWrap" ref={suggestionBoxRef}>
                <form className="navBarSearchboxForm" onSubmit={(e) => fullSearch(e)}>
                    <input type="text" className="navBarSearchbox" onChange={(e) => handleOnChangeKeywordFunc(e, SEARCH_DEBOUNCE_DELAY)}/>
                    <div className="searchIcon">
                        <button type="submit">
                            <SearchIcon/>
                        </button>
                    </div>
                </form>
                <div className="suggestionBox">
                    {renderSearchResults()}
                    <div className="seeAllResults"><button onClick={(e) => fullSearch(e)}>See All Results</button></div>
                </div>
            </div>


            {/* ---------------------------------------------- Navigation Links -------------------------------------------------*/}
            <div className={`nav-links ${!navLinksopen ? 'nav-links-hidden' : ''}`}> 

                <div className="nav-links-background-dim"></div>

                <div className="nav-links-main">


                    <div onClick={handleOpenNavLinkBoxCLick} className='openCloseNavbutton'></div>

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
                            {isLoading ? <Skeleton/> : 
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