import React from 'react';

const BlogDetailsPreviewImage = ({img}) => {
    return (
        <div className="blog-image">
            <img src={require('../../assets/images/blog/' + img)} alt="Blog thumb"/>
        </div>
    );
};

export default BlogDetailsPreviewImage;