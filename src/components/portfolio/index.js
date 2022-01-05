import React from 'react';
import {Link} from 'react-router-dom'

const Portfolio = ({id, thumb, classes, title, category, variant}) => {
    const slug = title.toLowerCase().split(" ").join("-");

    return (
        <div className={`portfolio-item ${classes ? classes : ' '}`}>
            <Link
                to={{
                    search: `?id=${id}`,
                    pathname: `${process.env.PUBLIC_URL}/portfolio/${slug}`
                }}
                className={'d-block'}
            >
                {variant === 'column' ? (
                    <div className="portfolio-image">
                        <img src={require('../../assets/images/portfolio/' + thumb)} alt={title}/>
                    </div>

                ) : (
                    <div
                        className="portfolio-image"
                        style={{backgroundImage: `url(${require('../../assets/images/portfolio/' + thumb)})`}}
                    />
                )}
                <div className="portfolio-content">
                    <h4 className="title">{title}</h4>
                    <div className="category"><span>{category}</span></div>
                </div>
            </Link>
        </div>
    );
};

export default Portfolio;
