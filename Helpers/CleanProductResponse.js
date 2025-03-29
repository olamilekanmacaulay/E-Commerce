const formatProductResponse = (product) => ({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stockQuantity: product.stockQuantity,
    images: product.images.map((image) => ({
        url: image.url,
        isMain: image.isMain,
    })),
    reviews: product.reviews,
    ratings: product.ratings,
    discountPercentage: product.discountPercentage,
});

module.exports = formatProductResponse;