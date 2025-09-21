import React from 'react'
import './Header.css'

const Header = () => {
    const scrollToMenu = () => {
        const menuSection = document.getElementById('explore-menu');
        if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <div className='header'>
            <div className='header-contents'>
                <h2>Craving Something Amazing?</h2>
                <p>Fresh flavors delivered fast. Premium ingredients, chef-crafted dishes, straight to your door in minutes.</p>
                <button onClick={scrollToMenu}>View Menu</button>
            </div>
        </div>
    )
}

export default Header
