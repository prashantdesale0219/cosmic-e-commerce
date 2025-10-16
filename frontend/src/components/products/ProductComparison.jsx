import React from 'react';
import './ProductComparison.css';

const ProductComparison = ({ products }) => {
  // Get all unique specification keys from all products
  const allSpecKeys = [...new Set(products.flatMap(product => Object.keys(product.specifications)))];

  return (
    <div className="product-comparison">
      <h2>Product Comparison</h2>
      
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Specifications</th>
              {products.map((product, index) => (
                <th key={index}>
                  <div className="product-header">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">
                      <span className="current-price">₹{product.discountPrice.toFixed(2)}</span>
                      <span className="original-price">₹{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSpecKeys.map((key, index) => (
              <tr key={index}>
                <td className="spec-name">{key}</td>
                {products.map((product, productIndex) => (
                  <td key={productIndex}>
                    {product.specifications[key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="actions-row">
              <td></td>
              {products.map((product, index) => (
                <td key={index}>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductComparison;