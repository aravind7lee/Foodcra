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
    const [selectedPredefined, setSelectedPredefined] = useState(null);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image && !selectedPredefined) {
            toast.error('Image not selected');
            return null;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        
        // If it's a predefined item, copy the image from assets to uploads
        if (selectedPredefined) {
            // Create a blob from the predefined image
            try {
                const response = await fetch(`/src/assets/${selectedPredefined.localImage}`);
                const blob = await response.blob();
                const file = new File([blob], selectedPredefined.localImage, { type: 'image/png' });
                formData.append("image", file);
            } catch (error) {
                // Fallback: use the filename directly
                formData.append("imageFilename", selectedPredefined.localImage);
            }
        } else {
            formData.append("image", image);
        }

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
                setSelectedPredefined(null);
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

    const loadPredefinedItem = async (item) => {
        setData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category
        });
        
        setSelectedPredefined(item);
        setImage(false); // Clear any uploaded image
        
        toast.success(`Loaded ${item.name} - Ready to add to menu!`);
        setShowPredefined(false);
    }

    const addPredefinedDirectly = async (item) => {
        try {
            const formData = new FormData();
            formData.append("name", item.name);
            formData.append("description", item.description);
            formData.append("price", Number(item.price));
            formData.append("category", item.category);
            formData.append("imageFilename", item.localImage);

            const response = await axios.post(`${url}/api/food/add`, formData);
            if (response.data.success) {
                toast.success(`${item.name} added to menu successfully!`);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error adding predefined item');
        }
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
                                    <div className="predefined-actions">
                                        <button 
                                            onClick={() => loadPredefinedItem(item)}
                                            className="load-btn"
                                        >
                                            Load to Form
                                        </button>
                                        <button 
                                            onClick={() => addPredefinedDirectly(item)}
                                            className="add-direct-btn"
                                        >
                                            Add Directly
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Upload image</p>
                    {selectedPredefined ? (
                        <div className="predefined-image-preview">
                            <p>Using predefined image: {selectedPredefined.localImage}</p>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setSelectedPredefined(null);
                                    setImage(false);
                                }}
                                className="clear-predefined"
                            >
                                Clear & Upload Custom
                            </button>
                        </div>
                    ) : (
                        <>
                            <input 
                                onChange={(e) => { 
                                    setImage(e.target.files[0]); 
                                    setSelectedPredefined(null);
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
                        </>
                    )}
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