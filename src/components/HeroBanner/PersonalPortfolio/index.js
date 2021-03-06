import React from 'react';
import HeroBannerContainer from "../../../container/HeroBanner";
import bannerBg from '../../../assets/images/hero/slider-2.jpg'
import personalInfo from '../../../data/personalInfo'

const BannerPersonalPortfolio = () => {
    return (
        <HeroBannerContainer overlay={false}>
            <div className="main-slider-content">
                <h2>TL;DR,</h2>
                <h1>I'm {personalInfo.name}</h1>
                <h2>{personalInfo.designation}</h2>
                <a href={`${process.env.PUBLIC_URL + personalInfo.resumeURL}`}>Download Resume</a>
            </div>
        </HeroBannerContainer>
    );
};

export default BannerPersonalPortfolio;