import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { useParams } from "react-router-dom"

import { getImgUrl } from '../../utils/getImgUrl';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';

const SingleProduct = () => {
    const { id } = useParams();
    const { data: product, isLoading, isError, error } = useFetchBookByIdQuery(id);

    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-lg mx-auto shadow-md p-5 mt-10">
                <div className="text-center">Đang tải...</div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="max-w-lg mx-auto shadow-md p-5 mt-10">
                <div className="text-red-600">
                    <p className="font-bold">Lỗi khi tải thông tin sản phẩm</p>
                    <p className="text-sm mt-2">
                        {error?.data?.message || error?.error || 'Lỗi không xác định'}
                    </p>
                    <p className="text-sm mt-2 text-gray-600">
                        Mã sản phẩm: {id}
                    </p>
                </div>
            </div>
        )
    }

    // Product not found
    if (!product) {
        return (
            <div className="max-w-lg mx-auto shadow-md p-5 mt-10">
                <div className="text-center">
                    <p className="text-lg font-semibold">Không tìm thấy sản phẩm</p>
                    <p className="text-sm text-gray-600 mt-2">ID: {id}</p>
                </div>
            </div>
        )
    }

    // Render product details
    return (
        <div className="max-w-lg shadow-md p-5 mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6">{product.title}</h1>

            <div className=''>
                <div>
                    <img
                        src={`${getImgUrl(product.coverImage)}`}
                        alt={product.title}
                        className="mb-8 w-full object-cover rounded"
                    />
                </div>

                <div className='mb-5'>
                    <p className="text-gray-700 mb-2">
                        <strong>Tác giả:</strong> {product.author || 'admin'}
                    </p>
                    <p className="text-gray-700 mb-4">
                        <strong>Ngày xuất bản:</strong> {new Date(product?.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-700 mb-4 capitalize">
                        <strong>Danh mục:</strong> {product?.category}
                    </p>
                    <p className="text-gray-700">
                        <strong>Mô tả:</strong> {product.description}
                    </p>
                </div>

                <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary px-6 space-x-1 flex items-center gap-1"
                >
                    <FiShoppingCart className="" />
                    <span>Thêm vào giỏ</span>
                </button>
            </div>
        </div>
    )
}

export default SingleProduct












































