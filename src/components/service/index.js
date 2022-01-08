import React from 'react';

const Service = ({title, position, contents}) => {
    return (
        <div className="service-item">
            <h3>{title}</h3>
            <h4>{position}</h4>
            <p>{contents.map(content => (
              <li>{ content }</li>
            ))}</p>
        </div>
    );
};

export default Service;