import React from 'react';

const QuickContact = ({phone, email, location, linkedIn}) => {
    return (
        <div className="contact-info">
            <h3>QUICK CONTACT</h3>
            <ul>
                <li>
                    <span>Email:</span>
                    <a href={`mailto:${email}`}>{email}</a>
                </li>
                <li>
                    <span>LinkedIn:</span>{linkedIn}
                </li>
                <li>
                    <span>Location:</span>{location}
                </li>
            </ul>
        </div>
    );
};

export default QuickContact;