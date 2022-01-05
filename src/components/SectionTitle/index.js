import React from 'react';

const SectionTitle = ({title,content,classes}) => {
    return (
        <div className={`section-title text-center mb-40 ${classes}`}>
            <h2 className="title">{title}</h2>
            <h4 className="sub-title">{content}</h4>
        </div>
    );
};

export default SectionTitle;