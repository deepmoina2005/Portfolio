import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";

export default function draftshop() {
     // pagination
     const [currentPage, setCurrentPage] = useState(1); // for page
     const [perPage] = useState(7);
 
     // search
     const [searchQuery, setSearchQuery] = useState('');
 
     // fetch blog data
     const { alldata, loading } = useFetchData('/api/shops');
 
     // function to handle page change
     const paginate = (pageNumber) => {
         setCurrentPage(pageNumber);
     }
 
     // total number of blogs
     const allblog = alldata.length;
 
     // filter all data based on search query
     const filteredBlogs = searchQuery.trim() === '' 
         ? alldata 
         : alldata.filter(blog => 
             blog.title.toLowerCase().includes(searchQuery.toLowerCase())
         );
 
     // calculate index of the first and last blog displayed on the current page
     const indexOfFirstBlog = (currentPage - 1) * perPage;
     const indexOfLastBlog = currentPage * perPage;
 
     // Get current page's blogs
     const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
     const PublishedBlogs = currentBlogs.filter(blog => blog.status === 'draft');
 
     // pagination numbers
     const pageNumbers = [];
     for (let i = 1; i <= Math.ceil(filteredBlogs.length / perPage); i++) {
         pageNumbers.push(i);
     }
    return <>
       <div className="blogpage">
            <div className="titledashboard flex flex-sb">
                <div>
                    <h2>All Draft <span>Product</span></h2>
                    <h3>ADMIN PANEL</h3>
                </div>
                <div className="breadcrumb">
                    <SiBloglovin /><span>/</span> <span>Products</span>
                </div>
            </div>
            <div className="blogstable">
                <div className="flex gap-2 mb-2">
                    <h2>Search Blogs</h2>
                    <input 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        type="text" 
                        placeholder="Search by title..." 
                    />
                </div>
                <table className="table table-styling">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Edit / Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4}>
                                    <Dataloading />
                                </td>
                            </tr>
                        ) : (
                            PublishedBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center">No Product Found</td>
                                </tr>
                            ) : (
                                PublishedBlogs.map((blog, index) => (
                                    <tr key={blog._id}>
                                        <td>{indexOfFirstBlog + index + 1}</td>
                                        <td>
                                            <img src={blog.images[0]} width={100} alt="blog" />
                                        </td>
                                        <td>
                                            <h3>{blog.title}</h3>
                                        </td>
                                        <td>
                                            <div className="flex gap-2 flex-center">
                                                <Link href={`/shops/edit/${blog._id}`}>
                                                    <button><FaEdit /></button>
                                                </Link>
                                                <Link href={`/shops/delete/${blog._id}`}>
                                                    <button><RiDeleteBin6Fill /></button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
                {/* pagination */}
                {PublishedBlogs.length > 0 && (
                    <div className="blogpagination">
                        <button 
                            onClick={() => paginate(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {pageNumbers
                            .slice(Math.max(currentPage - 3, 0), Math.min(currentPage + 2, pageNumbers.length))
                            .map(number => (
                                <button 
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`${currentPage === number ? 'active' : ''}`}
                                >
                                    {number}
                                </button>
                            ))
                        }
                        <button 
                            onClick={() => paginate(currentPage + 1)} 
                            disabled={currentBlogs.length < perPage}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    </>
}