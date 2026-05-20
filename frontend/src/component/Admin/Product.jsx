import React, { useEffect, useState } from 'react';
import './Product.css';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import MetaData from '../layout/MetaData';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SideBar from './Sidebar';
import { replace, useNavigate, useParams } from 'react-router-dom';
import { useCreateNewProductMutation, useGetProductDetailsQuery, useUpdateProductMutation } from '../../Services/productApi';
import Loader from '../layout/loader/loader'
import { skipToken } from '@reduxjs/toolkit/query';
import { addNotification } from '../../SliceThunks/utils';

const UpdateProduct = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const params = useParams();
  const productId = params.id;

  const {data, isLoading:productDetailsLoading, isSuccess: productDetailsSuccess} = useGetProductDetailsQuery(productId ? productId : skipToken);
  const [updateProduct, {isLoading, isError: updateProductError, isSuccess: updateProductSuccess}] = useUpdateProductMutation();
  const [createProduct, {isLoading: createProductLoading, isError: createProductError, isSuccess: createProductSuccess}] = useCreateNewProductMutation();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [Stock, setStock] = useState(0);
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [imageStatus, setImageStatus] = useState(() => new Map());
  const [editImageBoxStateVisible, setEditImageBoxStateVisible] = useState(false);

  useEffect(() => {
    if (productDetailsSuccess) {
      setName(data.name);
      setPrice(data.price);
      setDescription(data.description);
      setCategory(data.category);
      setStock(data.stock);
      setOldImages(data.images);
    }
    data?.images?.forEach((item) => {markImageStatusAdded(item.public_id)});
    setImages(imagesPreview.map((item) => item.image_data));
  }, [imagesPreview, productDetailsSuccess]);


  const categories = [
    'All',
    'Laptop',
    'Footwear',
    'Bottom',
    'Tops',
    'Attire',
    'Camera',
    'SmartPhones',
    'Electronics',
  ];

  const markImageStatusAdded = (id) => {
    setImageStatus(prev => new Map(prev).set(id, true));
  }

  const markImageStatusDeleted = (e, id) => {
    setImageStatus(prev => new Map(prev).set(id, false));
  }

  useEffect(() => {
    // Reset state for create mode
    if (!productId) {
      setName('');
      setPrice(0);
      setDescription('');
      setCategory('');
      setStock(0);
      setImages([]);
      setOldImages([]);
      setImagesPreview([]);
      setImageStatus(new Map());
      setEditImageBoxStateVisible(false);
    }
  }, [productId]);

  
  const productSubmitHandler = async(e) => {
    e.preventDefault();
    const imagesToDelete = oldImages.filter((item) => !imageStatus.get(item.public_id));
    const myForm = new FormData();
    myForm.set('name', name);
    myForm.set('price', price);
    myForm.set('description', description);
    myForm.set('category', category);
    myForm.set('stock', Stock);
    myForm.set('delOldImages', JSON.stringify(imagesToDelete));
    myForm.append('images', JSON.stringify(images));

    try {
      if (productId) {
        await updateProduct({id: productId, productData: myForm}).unwrap();
      } else {
        await createProduct(myForm).unwrap()
      }
      setTimeout(() => {
        navigate('/admin/products', replace);
      }, [3000]);
    } catch (error) {
      console.log(error);
    }
    
  };

  const handleEditImagesToggle = (e) => {
    e.preventDefault();

    const wrap = document.querySelector('.imageEditBoxWrap');
    if (wrap) {
      wrap.offsetHeight;
    }
    setEditImageBoxStateVisible(!editImageBoxStateVisible);
  }

  const updateProductImagesChange = (e) => {
    const inputFiles = e.target.files;
    if (inputFiles.length + imagesPreview.length + oldImages.length > 15) {
      alert("Maximum allowed images for a product is 15. Please make sure the files you have selected are below 15 and try again")
      e.target.value = '';
      return;
    }
    const files = Array.from(inputFiles);

    files.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === FileReader.DONE) {
          setImagesPreview((old) => [...old, {image_data: reader.result, image_id: old.length + 1}]);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  };

  if (productDetailsLoading) {
    return <Loader/>
  }

  if (updateProductError || createProductError) {
    dispatch(addNotification({message: (updateProductError || createProductError), errorType: 'error'}));
  }

  return (
    <>
      <MetaData title={`${productId ? 'Update' : 'Create'} Product`} />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          <form
            className={`createProductForm ${editImageBoxStateVisible ? 'createProductFormVisible' : 'createProductFormHidden'}`}
            encType="multipart/form-data"
            onSubmit={productSubmitHandler}
          >

            <h2>{`${productId ? 'Update' : 'Create'} Product`}</h2>

            {(updateProductSuccess || createProductSuccess) && <div className='successMsg'><h4>Success</h4></div>}

            <h4>Note: Maximum allowed images for a product is 15.</h4>

            <div>
              <SpellcheckIcon />
              <input
                type="text"
                placeholder="Product Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <AttachMoneyIcon />
              <input
                type="number"
                placeholder="Price"
                required
                onChange={(e) => setPrice(e.target.value)}
                value={price}
              />
            </div>

            <div>
              <DescriptionIcon />

              <textarea
                placeholder="Product Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                cols="30"
                rows="1"
              ></textarea>
            </div>

            <div>
              <AccountTreeIcon />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Choose Category</option>
                {categories.map((cate) => (
                  <option key={cate} value={cate}>
                    {cate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <StorageIcon />
              <input
                type="number"
                placeholder="Stock"
                required
                onChange={(e) => setStock(e.target.value)}
                value={Stock}
              />
            </div>

            <button onClick={handleEditImagesToggle} className='editImagesButton'>
              Edit Images
            </button>

            <Button
              id="createProductBtn"
              type="submit"
              disabled={(isLoading || createProductLoading) ? true : false}
            >
              {(isLoading || createProductLoading) ? 'Please wait...' : `${productId ? 'Update' : 'Create'}`}
            </Button>
          </form>
          <div className={`imageEditBoxWrap ${editImageBoxStateVisible ? 'imageEditBoxVisible' : 'imageEditBoxHidden'}`}>
            <div className='imageEditBox'>
              <h3>Edit images</h3>
              <div className='imagesBox'>
                  {(oldImages.length > 0 || imagesPreview.length > 0) ? (
                    <>
                      {oldImages.map((image, index) => 
                        <div className='oldImages'>
                          {imageStatus.get(image.public_id) && <div className='imageDeleteRestoreWrap buttonRemove'>
                            <button onClick={(e) => markImageStatusDeleted(e, image.public_id)} id={image.public_id}>
                              Remove
                            </button>
                          </div>}
                          {!imageStatus.get(image.public_id) && <div className='imageDeleteRestoreWrap buttonRestore'>
                            <div className='cancelIcon'></div>
                            <button onClick={() => markImageStatusAdded(image.public_id)}  id={image.public_id}>
                              Restore
                            </button>
                          </div>}
                          <img className='productImage' key={index} src={image.url} alt="Old Product Preview" />
                        </div> 
                      )}
                      {imagesPreview.map((image, index) => 
                        <div id={image.image_id} className='newImages'>
                          <div className='imageDeleteRestoreWrap buttonRemove'>
                            <button onClick={(e) => setImagesPreview(imagesPreview.filter((obj) => obj.image_id !== parseInt(e.target.parentElement.parentElement.id)))}>
                              Remove
                            </button>
                          </div>
                          <img className='productImage' key={index} src={image.image_data} alt="new Product Preview" />
                        </div> )}
                    </>
                  ) :
                  "No images found"
                }
              </div>

              <input
                type="file"
                name="avatar"
                accept="image/*"
                id='imageInputButton'
                onChange={updateProductImagesChange}
                multiple
              />

              <label htmlFor='imageInputButton' className='imageInputButtonLabel'>Choose the files</label>
              
              <div className='imageBoxActionButtons'>
                <button onClick={() => setEditImageBoxStateVisible(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProduct;
