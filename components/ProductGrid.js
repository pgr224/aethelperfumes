import ProductCard from './ProductCard';

export default function ProductGrid({ products, limit }) {
    const displayProducts = limit ? products.slice(0, limit) : products;

    return (
        <div className="product-grid">
            {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
