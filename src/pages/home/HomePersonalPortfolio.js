import React from 'react';

// File imported
import Header from "../../components/header/HeaderOne";
import SideHeader from "../../components/SideHeader";
import BannerPersonalPortfolio from "../../components/HeroBanner/PersonalPortfolio";
import PersonalPortfolio from "../../container/portfolio/PersonalPortfolio";
import PersonalPortfolioService from "../../container/service";
import PersonalPortfolioTeam from "../../container/team";
import Contact from "../../container/contact";
import Footer from "../../components/footer/FooterThree";

const HomePersonalPortfolio = () => {
    return (
        <div className={'main-wrapper p-0'}>
            <Header classes={'position-static'}/>
            <SideHeader mobile={true}/>
            <BannerPersonalPortfolio/>
            <PersonalPortfolio/>
            <PersonalPortfolioService/>
            <PersonalPortfolioTeam/>
            <Contact/>
            <Footer position={'static'}/>
        </div>
    );
};

export default HomePersonalPortfolio;
