import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from "../../Context/StoreContext"; 
import './NutritionFilter.css';

const NutritionFilter = () => {
    const { food_list, setFilteredFoodList } = useContext(StoreContext);
    const [filters, setFilters] = useState({
        maxCalories: '',
        minProtein: '',
        maxCarbs: '',
        maxFat: ''
    });
    const [error, setError] = useState('');
    const [totalResults, setTotalResults] = useState(0);

    // Theme state and localStorage management
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const applyFilters = () => {
        let filtered = food_list;

        // Validation for negative values
        if (filters.maxCalories && filters.maxCalories < 0) {
            setError('Max calories cannot be negative');
            return;
        }
        if (filters.minProtein && filters.minProtein < 0) {
            setError('Min protein cannot be negative');
            return;
        }
        if (filters.maxCarbs && filters.maxCarbs < 0) {
            setError('Max carbs cannot be negative');
            return;
        }
        if (filters.maxFat && filters.maxFat < 0) {
            setError('Max fat cannot be negative');
            return;
        }

        // Filtering logic
        if (filters.maxCalories) {
            filtered = filtered.filter(item => item.calories <= filters.maxCalories);
        }
        if (filters.minProtein) {
            filtered = filtered.filter(item => item.protein >= filters.minProtein);
        }
        if (filters.maxCarbs) {
            filtered = filtered.filter(item => item.carbs <= filters.maxCarbs);
        }
        if (filters.maxFat) {
            filtered = filtered.filter(item => item.fat <= filters.maxFat);
        }

        setError('');
        setTotalResults(filtered.length);
        setFilteredFoodList(filtered);
    };

    return (
        <div className='nutrition-filter'>
            <h2>Nutrition-Based Filtering</h2>
            <div className='theme-toggle'>
                <button onClick={toggleTheme}>
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
            </div>
            <div className='filter-inputs'>
                <input
                    type='number'
                    name='maxCalories'
                    placeholder='Max Calories'
                    value={filters.maxCalories}
                    onChange={handleFilterChange}
                />
                <input
                    type='number'
                    name='minProtein'
                    placeholder='Min Protein (g)'
                    value={filters.minProtein}
                    onChange={handleFilterChange}
                />
                <input
                    type='number'
                    name='maxCarbs'
                    placeholder='Max Carbs (g)'
                    value={filters.maxCarbs}
                    onChange={handleFilterChange}
                />
                <input
                    type='number'
                    name='maxFat'
                    placeholder='Max Fat (g)'
                    value={filters.maxFat}
                    onChange={handleFilterChange}
                />
            </div>
            {error && <p className='error-message'>{error}</p>}
            <button onClick={applyFilters}>Apply Filters</button>
            <p className='result-count'>{totalResults} results found</p>
        </div>
    );
};

export default NutritionFilter;
