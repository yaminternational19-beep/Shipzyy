import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from './WishlistContext';
import { useCart } from '../cart/CartContext'; 
import { useAuth } from '../../context/AuthContext'; 
import "./wishlist.css";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { cart, addToCart, removeFromCart } = useCart();
  
  const { user } = useAuth();

  const requireLogin = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const goToProduct = (id) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/product/${id}`);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1 className="wishlist-title">
          <span>My Wishlist</span>
          {wishlist && wishlist.length > 0 && (
            <span className="wishlist-count">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
          )}
        </h1>

        {wishlist && wishlist.length > 0 ? (
          <div className="wishlist-list-wrapper">
            <div className="wishlist-list-header hidden-mobile">
              <div className="col-product">Product name</div>
              <div className="col-price">Unit price</div>
              <div className="col-stock">Stock status</div>
              <div className="col-action">Action</div>
            </div>

            <div className="wishlist-list-body">
              {wishlist.map((item, index) => {
                const cartItem = cart.find((c) => c.id === item.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={item.id}
                    className="wishlist-list-row wishlist-card-wrapper"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="col-product" onClick={() => goToProduct(item.id)} style={{ cursor: 'pointer' }}>
                      <div className="wish-img-box">
                        <img 
                          src={item?.image ? (item.image.startsWith('http') ? item.image : `/product/${item.image}`) : '/placeholder.jpg'}
                          alt={item.name} 
                        />
                      </div>
                      <span className="wish-item-name">{item.name}</span>
                    </div>

                    <div className="col-price">
                      {(item.originalPrice || item.oldPrice) && (
                         <span className="wish-old-price">₹{item.originalPrice || item.oldPrice}</span>
                      )}
                      <span className="wish-new-price">₹{item.price}</span>
                    </div>

                    <div className="col-stock">
                      <span className="stock-badge in-stock">In Stock</span>
                    </div>

                    <div className="col-action">
                       {quantity === 0 ? (
                         <button 
                           className="wish-add-cart-btn" 
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             if (requireLogin()) addToCart(item); 
                           }}
                         >
                           Add to cart
                         </button>
                       ) : (
                         <div className="qty-controls" onClick={(e) => e.stopPropagation()}>
                           <button 
                             className="qty-btn" 
                             onClick={() => { if (requireLogin()) removeFromCart(item.id); }}
                           >−</button>
                           <span className="qty-num">{quantity}</span>
                           <button 
                             className="qty-btn" 
                             onClick={() => { if (requireLogin()) addToCart(item); }}
                           >+</button>
                         </div>
                       )}
                       
                       <button 
                         className="wish-remove-btn" 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           toggleWishlist(item); 
                         }}
                         title="Remove from Wishlist"
                       >
                          ✕
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-wishlist-box">
            <div className="empty-heart">💖</div>
            <h3>Your wishlist is empty</h3>
            <p>Save your favourite products here and come back to them anytime.</p>
            <Link to="/shop" className="wishlist-browse-btn">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;