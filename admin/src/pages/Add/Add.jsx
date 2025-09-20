import React, { useState } from 'react';
import './Add.css';
import { assets, url, foodCategories, predefinedFoodItems } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad"
    });
    const [showPredefined, setShowPredefined] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Image not selected');
            return null;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("image", image);

        try {
            const response = await axios.post(`${url}/api/food/add`, formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: data.category
                });
                setImage(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error occurred during submission');
        }
    }

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    }

    const loadPredefinedItem = (item) => {
        setData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category
        });
        
        // Create a fake file object for the predefined image
        const fakeFile = new File([''], item.localImage, { type: 'image/png' });
        setImage(fakeFile);
        
        toast.success(`Loaded ${item.name} - Upload this to add to menu!`);
        setShowPredefined(false);
    }

    return (
        <div className='add'>
            <div className="predefined-section">
                <button 
                    className="predefined-toggle"
                    onClick={() => setShowPredefined(!showPredefined)}
                >
                    {showPredefined ? 'Hide' : 'Show'} Quick Add Items (food_33-40)
                </button>
                
                {showPredefined && (
                    <div className="predefined-items">
                        <h3>Quick Add Predefined Items</h3>
                        <div className="predefined-grid">
                            {predefinedFoodItems.map((item, index) => (
                                <div key={index} className="predefined-item">
                                    <h4>{item.name}</h4>
                                    <p>{item.category}</p>
                                    <p>₹{item.price}</p>
                                    <button 
                                        onClick={() => loadPredefinedItem(item)}
                                        className="load-btn"
                                    >
                                        Load Item
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Upload image</p>
                    <input 
                        onChange={(e) => { 
                            setImage(e.target.files[0]); 
                            e.target.value = '' 
                        }} 
                        type="file" 
                        accept="image/*" 
                        id="image" 
                        hidden 
                    />
                    <label htmlFor="image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Product name</p>
                    <input 
                        name='name' 
                        onChange={onChangeHandler} 
                        value={data.name} 
                        type="text" 
                        placeholder='Type here' 
                        required 
                    />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Product description</p>
                    <textarea 
                        name='description' 
                        onChange={onChangeHandler} 
                        value={data.description} 
                        type="text" 
                        rows={6} 
                        placeholder='Write content here' 
                        required 
                    />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Product category</p>
                        <select name='category' onChange={onChangeHandler} value={data.category}>
                            {foodCategories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className='add-price flex-col'>
                        <p>Product price</p>
                        <input 
                            name='price' 
                            onChange={onChangeHandler} 
                            value={data.price} 
                            type="number" 
                            placeholder='Enter price' 
                            required 
                        />
                    </div>
                </div>
                <button type='submit'>Add Product</button>
            </form>
        </div>
    );
}

export default Add;