import "./SimilarProducts.css";
import Card from "../Product/Productcard/Productcard";
import products from "../../data/products.json";

function SimilarProducts({ currentProduct }) {
  // filter similar products by category
  const similarItems = products
    .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id);

  const displayItems = similarItems.slice(0, 4); // Show first 4

  // EMPTY STATE
  if (similarItems.length === 0) {
    return (
      <section className="similar-section container">
        <div className="similar-header"><h2>Similar Products</h2></div>
        <div className="empty-state-box">
          <h3>No product found.</h3>
          <p>We couldn't find any similar items right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="similar-section container">
      <div className="similar-header">
        <h2>Similar Products</h2>
      </div>

      <div className="similar-grid">
        {displayItems.map((item) => (
          <Card key={item.id} product={item} />
        ))}
      </div>

      {/* MORE PRODUCTS BUTTON */}
      {similarItems.length > 4 && (
        <div className="load-more-container">
           <button className="btn-load-more">More Products ++</button>
        </div>
      )}
    </section>
  );
}

export default SimilarProducts;