import React from 'react';
import {Link} from 'react-router-dom'

const Blog = ({title, thumb, excerpt, comments, postDate, author}) => {
    return (
        <div className="blog-item">
            <div className="blog-image">
                <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>
                    <img src={require('../../assets/images/' + thumb)} alt={title}/>
                </Link>
            </div>

            <div className="blog-content">
                <h4 className="blog-title">
                    <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>{title}</Link>
                </h4>

                <ul className="blog-meta">
                    <li>{postDate}</li>
                    <li><Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>Comments ( {comments} )</Link></li>
                    <li>By <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>{author}</Link></li>
                </ul>

                <div className="blog-desc">
                    <p>{excerpt}</p>
                </div>

                <div className="read-more">
                    <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>READ MORE...</Link>
                </div>
            </div>

        </div>
    );
};

export default Blog;